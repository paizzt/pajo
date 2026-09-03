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

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SENTIMU API", description="API untuk Sistem Analisis Sentimen")

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

@app.get("/")
def read_root():
    return {"message": "Welcome to SENTIMU Backend API"}

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

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(models.Review).count()
    
    pos = db.query(models.Review).filter(models.Review.sentiment_label == "POSITIF").count()
    neg = db.query(models.Review).filter(models.Review.sentiment_label == "NEGATIF").count()
    net = db.query(models.Review).filter(models.Review.sentiment_label == "NETRAL").count()

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
            "akurasi_model": "N/A"
        },
        "pie_data": pie_data,
        "trend_data": trend_data,
        "top_words": top_words
    }
