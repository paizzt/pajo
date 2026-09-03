from sqlalchemy import Column, Integer, String
from database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String, index=True)
    review_id = Column(String, unique=True, index=True)
    username = Column(String)
    content = Column(String)
    score = Column(Integer)
    date = Column(String)
    thumbs_up = Column(Integer)
    sentiment_label = Column(String, nullable=True) # POSITIF, NEGATIF, NETRAL
