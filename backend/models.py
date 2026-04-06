from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class CityData(Base):
    __tablename__ = "city_data"
    
    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    aqi = Column(Float)
    traffic_density = Column(Float) # 0 to 100
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    target_time = Column(DateTime)
    predicted_aqi = Column(Float)
    confidence = Column(Float)
