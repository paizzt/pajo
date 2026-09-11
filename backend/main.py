from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google_play_scraper import Sort, reviews
import datetime
import os
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
    dataset_name: Optional[str] = "Dataset Default"
    reviews: List[ReviewItem]

class AnalyzeRequest(BaseModel):
    text: str


class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SavedResultCreate(BaseModel):
    title: str
    description: Optional[str] = None
    dataset_name: Optional[str] = None
    report_data: Optional[str] = None

class SettingItem(BaseModel):
    key: str
    value: str

class SettingsUpdateRequest(BaseModel):
    settings: List[SettingItem]

class TrainRequest(BaseModel):
    c: float = 1.0
    kernel: str = 'linear'
    max_features: int = 1500
    ngram_range: str = '(1,3)'
    dataset_id: Optional[int] = None

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
        confidence = "N/A"
        predicted = "N/A"
        if ml_model.is_trained:
            try:
                pred = ml_model.predict(r.content)
                confidence = f"{pred['confidence']}"
                predicted = pred['sentiment']
            except:
                pass
                
        formatted.append({
            "id": r.id,
            "text": r.content,
            "rating": r.score,
            "date": r.date.split("T")[0] if "T" in r.date else r.date,
            "actual": r.sentiment_label,
            "predicted": predicted,
            "confidence": confidence,
            "username": r.username
        })
    return {"data": formatted, "total": len(formatted)}

@app.post("/api/analyze")
def analyze_text(req: AnalyzeRequest):
    try:
        if not req.text.strip():
            raise HTTPException(status_code=400, detail="Teks tidak boleh kosong")
        result = ml_model.predict(req.text)
        return {"status": "success", "data": result}
    except Exception as e:
        if "belum dilatih" in str(e).lower() or "not trained" in str(e).lower():
            raise HTTPException(status_code=400, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/features")
def get_features(limit: int = 50):
    try:
        features = ml_model.get_top_features(n=limit)
        return {"status": "success", "data": features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def background_train_wrapper(texts, labels, C, kernel, ngram_range, max_features, db_factory):
    import json
    try:
        metrics = ml_model.train(texts, labels, C, kernel, ngram_range, max_features)
        
        # Save Notification
        db = db_factory()
        try:
            notif = models.Notification(
                title="Model Selesai Dilatih",
                message=f"Model SVM berhasil dilatih dengan akurasi {metrics['accuracy']}%.",
                type="success"
            )
            db.add(notif)
            db.commit()
        finally:
            db.close()
    except Exception as e:
        db = db_factory()
        try:
            notif = models.Notification(
                title="Pelatihan Gagal",
                message=f"Error: {str(e)}",
                type="error"
            )
            db.add(notif)
            db.commit()
        finally:
            db.close()

@app.post("/api/model/train")
def train_model(req: TrainRequest, background_tasks: BackgroundTasks):
    try:
        if ml_model.is_training:
            raise HTTPException(status_code=400, detail="Pelatihan model sedang berlangsung")
            
        # Fetch all labeled reviews using a manual session so we can close it early
        db = SessionLocal()
        try:
            query = db.query(models.Review)
            if req.dataset_id:
                query = query.filter(models.Review.dataset_id == req.dataset_id)
            all_reviews = query.all()
            
            if len(all_reviews) < 10:
                raise HTTPException(status_code=400, detail="Data tidak cukup untuk melatih model (minimal 10 ulasan)")
                
            texts = [r.content for r in all_reviews]
            labels = [r.sentiment_label for r in all_reviews]
        finally:
            db.close()
        
        # Parse ngram_range
        n_tuple = (1,1)
        if req.ngram_range == '(1,2)': n_tuple = (1,2)
        elif req.ngram_range == '(1,3)': n_tuple = (1,3)
        elif req.ngram_range == '(2,2)': n_tuple = (2,2)
        
        # Dispatch background task
        background_tasks.add_task(
            background_train_wrapper,
            texts=texts, 
            labels=labels, 
            C=req.c, 
            kernel=req.kernel, 
            ngram_range=n_tuple,
            max_features=req.max_features,
            db_factory=SessionLocal
        )
        return {"status": "processing", "message": "Proses training dimulai di latar belakang..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/train-progress")
def get_train_progress():
    return {
        "is_training": ml_model.is_training,
        "progress": ml_model.training_progress,
        "status_message": ml_model.training_status
    }

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

@app.get("/api/model/confusion_details")
def get_confusion_details(actual: str, predicted: str, db: Session = Depends(get_db)):
    if not ml_model.is_trained:
        return {"data": []}
    
    # Get all reviews with this actual sentiment
    reviews = db.query(models.Review).filter(models.Review.sentiment_label == actual).all()
    results = []
    for r in reviews:
        try:
            pred = ml_model.predict(r.content)
            if pred["sentiment"] == predicted:
                results.append({
                    "id": r.id,
                    "username": r.username,
                    "content": r.content,
                    "confidence": f"{pred['confidence']}%"
                })
        except:
            pass
            
    return {"data": results}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(time: str = 'all', sentiment: str = 'all', db: Session = Depends(get_db)):
    base_query = db.query(models.Review)
    
    # Time filtering
    if time != 'all':
        now = datetime.datetime.now()
        if time == 'today':
            date_filter = now.strftime('%Y-%m-%d')
            base_query = base_query.filter(models.Review.date.like(f"{date_filter}%"))
        elif time == 'week':
            week_ago = now - datetime.timedelta(days=7)
            base_query = base_query.filter(models.Review.date >= week_ago.strftime('%Y-%m-%d'))
        elif time == 'month':
            month_filter = now.strftime('%Y-%m')
            base_query = base_query.filter(models.Review.date.like(f"{month_filter}%"))

    # Count sentiments from base query (before sentiment filter)
    pos = base_query.filter(models.Review.sentiment_label == "POSITIF").count()
    neg = base_query.filter(models.Review.sentiment_label == "NEGATIF").count()
    net = base_query.filter(models.Review.sentiment_label == "NETRAL").count()
            
    # Apply sentiment filter for total count
    if sentiment != 'all':
        total = base_query.filter(models.Review.sentiment_label == sentiment).count()
    else:
        total = pos + neg + net

    pie_data = [
        {"name": "Positif", "value": pos, "color": "#10b981"},
        {"name": "Negatif", "value": neg, "color": "#ef4444"},
        {"name": "Netral", "value": net, "color": "#64748b"}
    ]

    # Fetch all dates and sentiments for the time filter
    all_filtered = base_query.all()
    trend_dict = {}
    for r in all_filtered:
        d = str(r.date).split("T")[0]
        if d not in trend_dict:
            trend_dict[d] = {"name": d, "Positif": 0, "Negatif": 0, "Netral": 0}
        
        sent = r.sentiment_label
        if sent == "POSITIF": trend_dict[d]["Positif"] += 1
        elif sent == "NEGATIF": trend_dict[d]["Negatif"] += 1
        else: trend_dict[d]["Netral"] += 1
        
    trend_data = list(trend_dict.values())
    trend_data.sort(key=lambda x: x["name"])
    
    if len(trend_data) > 14:
        trend_data = trend_data[-14:]
    
    top_words = []
    if ml_model.is_trained:
        features = ml_model.get_top_features(5)
        top_words = [{"name": f["word"], "count": f["tfidf"]} for f in features]
    
    if not top_words:
        top_words = [{"name": "Belum ada model", "count": 0}]

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


# ================= NEW ENDPOINTS =================

@app.get("/api/datasets")
def get_datasets(db: Session = Depends(get_db)):
    datasets = db.query(models.Dataset).order_by(models.Dataset.created_at.desc()).all()
    res = []
    for d in datasets:
        count = db.query(models.Review).filter(models.Review.dataset_id == d.id).count()
        res.append({
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "created_at": d.created_at,
            "review_count": count
        })
    return {"status": "success", "data": res}

@app.post("/api/datasets")
def create_dataset(req: DatasetCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Dataset).filter(models.Dataset.name == req.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dataset dengan nama ini sudah ada")
    
    ds = models.Dataset(name=req.name, description=req.description)
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return {"status": "success", "data": ds}

@app.delete("/api/datasets/{id}")
def delete_dataset(id: int, db: Session = Depends(get_db)):
    ds = db.query(models.Dataset).filter(models.Dataset.id == id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset tidak ditemukan")
    db.delete(ds)
    db.commit()
    return {"status": "success"}

@app.get("/api/results")
def get_saved_results(db: Session = Depends(get_db)):
    results = db.query(models.SavedResult).order_by(models.SavedResult.created_at.desc()).all()
    return {"status": "success", "data": results}

@app.post("/api/results")
def save_result(req: SavedResultCreate, db: Session = Depends(get_db)):
    import json
    if not ml_model.is_trained:
        raise HTTPException(status_code=400, detail="Belum ada model yang dilatih saat ini.")
        
    sr = models.SavedResult(
        title=req.title,
        description=req.description,
        dataset_name=req.dataset_name,
        accuracy=ml_model.metrics.get('accuracy', 0),
        metrics_json=json.dumps(ml_model.metrics),
        report_data=req.report_data
    )
    db.add(sr)
    db.commit()
    db.refresh(sr)
    return {"status": "success", "data": sr}

@app.delete("/api/reset")
def reset_system(db: Session = Depends(get_db)):
    try:
        # Delete all reviews and datasets
        db.query(models.Review).delete()
        db.query(models.Dataset).delete()
        db.commit()
        
        # Reset ML Model
        ml_model.is_trained = False
        ml_model.metrics = None
        ml_model.model = None
        ml_model.vectorizer = None
        if os.path.exists(ml_model.model_path):
            os.remove(ml_model.model_path)
        if os.path.exists(ml_model.vectorizer_path):
            os.remove(ml_model.vectorizer_path)
            
        return {"status": "success", "message": "Sistem berhasil di-reset ke 0"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/results/{id}")
def update_saved_result(id: int, req: SavedResultCreate, db: Session = Depends(get_db)):
    sr = db.query(models.SavedResult).filter(models.SavedResult.id == id).first()
    if not sr:
        raise HTTPException(status_code=404, detail="Hasil tidak ditemukan")
    sr.title = req.title
    sr.description = req.description
    db.commit()
    return {"status": "success"}

@app.delete("/api/results/{id}")
def delete_saved_result(id: int, db: Session = Depends(get_db)):
    sr = db.query(models.SavedResult).filter(models.SavedResult.id == id).first()
    if not sr:
        raise HTTPException(status_code=404, detail="Hasil tidak ditemukan")
    db.delete(sr)
    db.commit()
    return {"status": "success"}

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifs = db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(20).all()
    return {"status": "success", "data": notifs}

@app.put("/api/notifications/read")
def read_notifications(db: Session = Depends(get_db)):
    db.query(models.Notification).update({models.Notification.is_read: True})
    db.commit()
    return {"status": "success"}

@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Setting).all()
    default_settings = {
        "confidence_threshold": "60",
        "custom_stopwords": "dan, atau, di, ke, dari, yang, untuk, dengan, ini, itu, aplikasi, apk, app, muamalat, bank, din",
        "auto_clean": "true"
    }
    
    result = default_settings.copy()
    for s in settings:
        result[s.key] = s.value
        
    return {"status": "success", "data": result}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(time: str = 'all', sentiment: str = 'all', db: Session = Depends(get_db)):
    base_query = db.query(models.Review)
    
    # Time filtering
    if time != 'all':
        now = datetime.datetime.now()
        if time == 'today':
            date_filter = now.strftime('%Y-%m-%d')
            base_query = base_query.filter(models.Review.date.like(f"{date_filter}%"))
        elif time == 'week':
            week_ago = now - datetime.timedelta(days=7)
            base_query = base_query.filter(models.Review.date >= week_ago.strftime('%Y-%m-%d'))
        elif time == 'month':
            month_filter = now.strftime('%Y-%m')
            base_query = base_query.filter(models.Review.date.like(f"{month_filter}%"))

    # Count sentiments from base query (before sentiment filter)
    pos = base_query.filter(models.Review.sentiment_label == "POSITIF").count()
    neg = base_query.filter(models.Review.sentiment_label == "NEGATIF").count()
    net = base_query.filter(models.Review.sentiment_label == "NETRAL").count()
            
    # Apply sentiment filter for total count
    if sentiment != 'all':
        total = base_query.filter(models.Review.sentiment_label == sentiment).count()
    else:
        total = pos + neg + net

    pie_data = [
        {"name": "Positif", "value": pos, "color": "#10b981"},
        {"name": "Negatif", "value": neg, "color": "#ef4444"},
        {"name": "Netral", "value": net, "color": "#64748b"}
    ]

    # Fetch all dates and sentiments for the time filter
    all_filtered = base_query.all()
    trend_dict = {}
    for r in all_filtered:
        d = str(r.date).split("T")[0]
        if d not in trend_dict:
            trend_dict[d] = {"name": d, "Positif": 0, "Negatif": 0, "Netral": 0}
        
        sent = r.sentiment_label
        if sent == "POSITIF": trend_dict[d]["Positif"] += 1
        elif sent == "NEGATIF": trend_dict[d]["Negatif"] += 1
        else: trend_dict[d]["Netral"] += 1
        
    trend_data = list(trend_dict.values())
    trend_data.sort(key=lambda x: x["name"])
    
    if len(trend_data) > 14:
        trend_data = trend_data[-14:]
    
    top_words = []
    if ml_model.is_trained:
        features = ml_model.get_top_features(5)
        top_words = [{"name": f["word"], "count": f["tfidf"]} for f in features]
    
    if not top_words:
        top_words = [{"name": "Belum ada model", "count": 0}]

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
    

# ================= NEW ENDPOINTS =================

@app.get("/api/datasets")
def get_datasets(db: Session = Depends(get_db)):
    datasets = db.query(models.Dataset).order_by(models.Dataset.created_at.desc()).all()
    res = []
    for d in datasets:
        count = db.query(models.Review).filter(models.Review.dataset_id == d.id).count()
        res.append({
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "created_at": d.created_at,
            "review_count": count
        })
    return {"status": "success", "data": res}

@app.post("/api/datasets")
def create_dataset(req: DatasetCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Dataset).filter(models.Dataset.name == req.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dataset dengan nama ini sudah ada")
    
    ds = models.Dataset(name=req.name, description=req.description)
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return {"status": "success", "data": ds}

@app.delete("/api/datasets/{id}")
def delete_dataset(id: int, db: Session = Depends(get_db)):
    ds = db.query(models.Dataset).filter(models.Dataset.id == id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset tidak ditemukan")
    db.delete(ds)
    db.commit()
    return {"status": "success"}

@app.get("/api/results")
def get_saved_results(db: Session = Depends(get_db)):
    results = db.query(models.SavedResult).order_by(models.SavedResult.created_at.desc()).all()
    return {"status": "success", "data": results}

@app.post("/api/results")
def save_result(req: SavedResultCreate, db: Session = Depends(get_db)):
    import json
    if not ml_model.is_trained:
        raise HTTPException(status_code=400, detail="Belum ada model yang dilatih saat ini.")
        
    sr = models.SavedResult(
        title=req.title,
        description=req.description,
        dataset_name=req.dataset_name,
        accuracy=ml_model.metrics.get('accuracy', 0),
        metrics_json=json.dumps(ml_model.metrics),
        report_data=req.report_data
    )
    db.add(sr)
    db.commit()
    db.refresh(sr)
    return {"status": "success", "data": sr}

@app.delete("/api/reset")
def reset_system(db: Session = Depends(get_db)):
    try:
        # Delete all reviews and datasets
        db.query(models.Review).delete()
        db.query(models.Dataset).delete()
        db.commit()
        
        # Reset ML Model
        ml_model.is_trained = False
        ml_model.metrics = None
        ml_model.model = None
        ml_model.vectorizer = None
        if os.path.exists(ml_model.model_path):
            os.remove(ml_model.model_path)
        if os.path.exists(ml_model.vectorizer_path):
            os.remove(ml_model.vectorizer_path)
            
        return {"status": "success", "message": "Sistem berhasil di-reset ke 0"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/results/{id}")
def update_saved_result(id: int, req: SavedResultCreate, db: Session = Depends(get_db)):
    sr = db.query(models.SavedResult).filter(models.SavedResult.id == id).first()
    if not sr:
        raise HTTPException(status_code=404, detail="Hasil tidak ditemukan")
    sr.title = req.title
    sr.description = req.description
    db.commit()
    return {"status": "success"}

@app.delete("/api/results/{id}")
def delete_saved_result(id: int, db: Session = Depends(get_db)):
    sr = db.query(models.SavedResult).filter(models.SavedResult.id == id).first()
    if not sr:
        raise HTTPException(status_code=404, detail="Hasil tidak ditemukan")
    db.delete(sr)
    db.commit()
    return {"status": "success"}

@app.get("/api/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifs = db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(20).all()
    return {"status": "success", "data": notifs}

@app.put("/api/notifications/read")
def read_notifications(db: Session = Depends(get_db)):
    db.query(models.Notification).update({models.Notification.is_read: True})
    db.commit()
    return {"status": "success"}

@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Setting).all()
    default_settings = {
        "confidence_threshold": "60",
        "custom_stopwords": "dan, atau, di, ke, dari, yang, untuk, dengan, ini, itu, aplikasi, apk, app, muamalat, bank, din",
        "auto_clean": "true"
    }
    for s in settings:
        default_settings[s.key] = s.value
    return {"status": "success", "data": default_settings}

@app.post("/api/settings")
def save_settings(req: SettingsUpdateRequest, db: Session = Depends(get_db)):
    for item in req.settings:
        existing = db.query(models.Setting).filter(models.Setting.key == item.key).first()
        if existing:
            existing.value = item.value
        else:
            new_setting = models.Setting(key=item.key, value=item.value)
            db.add(new_setting)
    db.commit()
    import ml_pipeline
    ml_pipeline.clear_stopwords_cache()
    return {"status": "success", "message": "Pengaturan berhasil disimpan"}
