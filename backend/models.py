from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reviews = relationship("Review", back_populates="dataset", cascade="all, delete")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    app_id = Column(String, index=True)
    review_id = Column(String, index=True) # Removed unique=True to allow same review in different datasets if needed, or keep it if globally unique. Wait, play store review IDs are globally unique, but users might upload duplicates across datasets. Removing unique constraint is safer.
    username = Column(String)
    content = Column(String)
    score = Column(Integer)
    date = Column(String)
    thumbs_up = Column(Integer)
    sentiment_label = Column(String, nullable=True) # POSITIF, NEGATIF, NETRAL

    dataset = relationship("Dataset", back_populates="reviews")

class SavedResult(Base):
    __tablename__ = "saved_results"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    accuracy = Column(Float)
    metrics_json = Column(String)
    dataset_name = Column(String) # Store name of dataset used

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    message = Column(String)
    type = Column(String, default="info") # info, success, warning, error
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)
