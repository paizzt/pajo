from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google_play_scraper import Sort, reviews
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

import models
from database import engine, SessionLocal
from ml_pipeline import ml_model

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PAJO API", description="API untuk Sistem Analisis Sentimen")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ScrapeRequest(BaseModel):
    app_id: str
    count: int = 1000
    lang: str = "id"
    country: str = "id"

class ReviewItem(BaseModel):
    id: str
    username: str
    content: str
    score: int
    date: str
    thumbs_up: int

class SaveReviewsRequest(BaseModel):
    app_id: str
    reviews: List[ReviewItem]

class AnalyzeRequest(BaseModel):
    text: str

class TrainRequest(BaseModel):
    c: float = 1.0
    kernel: str = 'linear'
    max_features: int = 1500
    ngram_range: str = '(1,3)'

@app.get("/")
def read_root():
    return {"message": "Welcome to PAJO Backend API"}

from urllib.parse import urlparse, parse_qs

@app.post("/api/scrape")
def scrape_playstore(req: ScrapeRequest):
    try:
        clean_app_id = req.app_id.strip()
        
        if "play.google.com" in clean_app_id:
            parsed_url = urlparse(clean_app_id)
            query_params = parse_qs(parsed_url.query)
            if "id" in query_params:
                clean_app_id = query_params["id"][0]

        result, continuation_token = reviews(
            clean_app_id,
            lang=req.lang,
            country=req.country,
            sort=Sort.NEWEST,
            count=req.count
        )
        
        formatted_reviews = []
        for r in result:
            formatted_reviews.append({
                "id": r.get("reviewId"),
                "username": r.get("userName"),
                "content": r.get("content"),
                "score": r.get("score"),
                "date": r.get("at").isoformat() if isinstance(r.get("at"), datetime.datetime) else str(r.get("at")),
                "thumbs_up": r.get("thumbsUpCount")
            })
            
        return {
            "status": "success", 
            "app_id": clean_app_id,
            "total_extracted": len(formatted_reviews),
            "data": formatted_reviews
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reviews/save")
def save_reviews(req: SaveReviewsRequest, db: Session = Depends(get_db)):
    saved_count = 0
    for r in req.reviews:
        # Check if exists
        existing = db.query(models.Review).filter(models.Review.review_id == r.id).first()
        if not existing:
            # Temporary logic for sentiment: 4-5 is POSITIF, 3 is NETRAL, 1-2 is NEGATIF
            sentiment = "NETRAL"
            if r.score >= 4: sentiment = "POSITIF"
            elif r.score <= 2: sentiment = "NEGATIF"

            db_review = models.Review(
                app_id=req.app_id,
                review_id=r.id,
                username=r.username,
                content=r.content,
                score=r.score,
                date=r.date,
                thumbs_up=r.thumbs_up,
                sentiment_label=sentiment
            )
            db.add(db_review)
            saved_count += 1
    
    db.commit()
    return {"message": f"{saved_count} reviews saved successfully."}

@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db), limit: int = 100):
    all_reviews = db.query(models.Review).order_by(models.Review.id.desc()).limit(limit).all()
    # Format to match frontend expectations
    formatted = []
    for r in all_reviews:
        formatted.append({
            "id": r.id,
            "text": r.content,
            "rating": r.score,
            "date": r.date.split("T")[0] if "T" in r.date else r.date,
            "sentiment": r.sentiment_label,
            "confidence": "N/A", # Will be updated when ML is integrated
            "username": r.username
        })
    return {"data": formatted, "total": len(formatted)}

@app.post("/api/analyze")
def analyze_text(req: AnalyzeRequest):
    try:
        if not req.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        result = ml_model.predict(req.text)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/features")
def get_features(limit: int = 50):
    try:
        features = ml_model.get_top_features(n=limit)
        return {"status": "success", "data": features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/model/train")
def train_model(req: TrainRequest, db: Session = Depends(get_db)):
    try:
        # Fetch all labeled reviews
        all_reviews = db.query(models.Review).all()
        if len(all_reviews) < 10:
            raise HTTPException(status_code=400, detail="Not enough data to train model (need at least 10 reviews)")
            
        texts = [r.content for r in all_reviews]
        labels = [r.sentiment_label for r in all_reviews]
        
        # Parse ngram_range
        # "(1,3)" -> (1,3)
        n_tuple = (1,1)
        if req.ngram_range == '(1,2)': n_tuple = (1,2)
        elif req.ngram_range == '(1,3)': n_tuple = (1,3)
        elif req.ngram_range == '(2,2)': n_tuple = (2,2)
        
        metrics = ml_model.train(
            texts=texts, 
            labels=labels, 
            C=req.c, 
            kernel=req.kernel, 
            ngram_range=n_tuple,
            max_features=req.max_features
        )
        return {"status": "success", "message": "Model trained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/metrics")
def get_metrics():
    try:
        if not ml_model.is_trained:
            return {"status": "error", "detail": "Model is not trained yet"}
        return {"status": "success", "data": ml_model.metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/status")
def get_model_status():
    try:
        is_trained = ml_model.is_trained
        
        # Get file modified date if exists
        last_training = "Never"
        if os.path.exists(ml_model.model_path):
            mtime = os.path.getmtime(ml_model.model_path)
            last_training = datetime.datetime.fromtimestamp(mtime).strftime('%d %B %Y %H:%M')
            
        algo = "SVM"
        kernel = "linear"
        c_param = 1.0
        if is_trained and ml_model.model:
            kernel = ml_model.model.kernel
            c_param = ml_model.model.C
            algo = f"SVM ({kernel.capitalize()})"
            
        features = "TF-IDF"
        max_f = 1500
        ngram = "(1,1)"
        if is_trained and ml_model.vectorizer:
            max_f = ml_model.vectorizer.max_features
            ngram = str(ml_model.vectorizer.ngram_range).replace(' ', '')
            if ml_model.vectorizer.ngram_range[1] > 1:
                features = "TF-IDF + N-Grams"
                
        return {
            "status": "success", 
            "data": {
                "is_trained": is_trained,
                "last_training": last_training,
                "algorithm": algo,
                "feature_extraction": features,
                "kernel": kernel,
                "c_param": c_param,
                "max_features": max_f,
                "ngram_range": ngram
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/stats")
def get_dashboard_stats(time: str = 'all', sentiment: str = 'all', db: Session = Depends(get_db)):
    query = db.query(models.Review)
    
    # Time filtering
    if time != 'all':
        now = datetime.datetime.now()
        if time == 'today':
            date_filter = now.strftime('%Y-%m-%d')
            query = query.filter(models.Review.date.like(f"{date_filter}%"))
        elif time == 'week':
            week_ago = now - datetime.timedelta(days=7)
            query = query.filter(models.Review.date >= week_ago.strftime('%Y-%m-%d'))
        elif time == 'month':
            month_filter = now.strftime('%Y-%m')
            query = query.filter(models.Review.date.like(f"{month_filter}%"))
            
    # Sentiment filtering
    if sentiment != 'all':
        query = query.filter(models.Review.sentiment_label == sentiment)
        
    total = query.count()
    
    pos_query = query.filter(models.Review.sentiment_label == "POSITIF")
    neg_query = query.filter(models.Review.sentiment_label == "NEGATIF")
    net_query = query.filter(models.Review.sentiment_label == "NETRAL")
    
    pos = pos_query.count()
    neg = neg_query.count()
    net = net_query.count()

    pie_data = [
        {"name": "Positif", "value": pos, "color": "#10b981"},
        {"name": "Negatif", "value": neg, "color": "#ef4444"},
        {"name": "Netral", "value": net, "color": "#64748b"}
    ]

    # Dummy trend for now since we need group by month
    trend_data = [
        {"name": "Bulan Ini", "Positif": pos, "Negatif": neg, "Netral": net}
    ]
    
    top_words = [
        {"name": "aplikasi", "count": 100},
        {"name": "bagus", "count": 80},
        {"name": "error", "count": 50},
        {"name": "login", "count": 40},
    ]

    return {
        "stats": {
            "total_ulasan": total,
            "positif": pos,
            "negatif": neg,
            "netral": net,
            "akurasi_model": f"{ml_model.metrics['accuracy']}%" if ml_model.is_trained and ml_model.metrics else "N/A"
        },
        "pie_data": pie_data,
        "trend_data": trend_data,
        "top_words": top_words
    }
