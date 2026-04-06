from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import asyncio
import os
import json
import datetime
import random
import asyncio
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, database, ml_engine

# Load environment variables
load_dotenv()

app = FastAPI(title="Smart City Analytics API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Full major Indian cities list (Top Metros & Tier-1)
INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", 
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", 
    "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", 
    "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Bareilly", "Hubballi", "Mysore"
]

WAQI_TOKEN = os.getenv("WAQI_TOKEN")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    # Recreate tables for v3
    models.Base.metadata.create_all(bind=database.engine)
    # Start the data simulation background task
    asyncio.create_task(simulate_city_data())

import httpx

async def fetch_real_aqi(client: httpx.AsyncClient, city: str):
    """Fetch live AQI from WAQI API asynchronously."""
    if not WAQI_TOKEN:
        return {"city": city, "aqi": None}
    try:
        url = f"https://api.waqi.info/feed/{city}/?token={WAQI_TOKEN}"
        resp = await client.get(url, timeout=10)
        res_json = resp.json()
        if res_json.get("status") == "ok":
            data = res_json["data"]
            return {
                "city": city,
                "aqi": data.get("aqi") if isinstance(data.get("aqi"), (int, float)) else None,
                "temp": data.get("iaqi", {}).get("t", {}).get("v"),
                "humidity": data.get("iaqi", {}).get("h", {}).get("v")
            }
    except Exception as e:
        print(f"Error fetching data for {city}: {e}")
    return {"city": city, "aqi": None, "temp": None, "humidity": None}

async def simulate_city_data():
    """Background task to fetch real-time city data across all nodes in parallel."""
    models.Base.metadata.create_all(bind=database.engine)
    
    async with httpx.AsyncClient() as client:
        while True:
            try:
                tasks = [fetch_real_aqi(client, city) for city in INDIAN_CITIES]
                all_city_results = await asyncio.gather(*tasks)
                
                db = database.SessionLocal()
                hour = datetime.datetime.now().hour
                
                for res in all_city_results:
                    city = res["city"]
                    aqi_val = res.get("aqi")
                    
                    if aqi_val is not None:
                        aqi = float(aqi_val)
                        temp = float(res["temp"]) if res.get("temp") is not None else 20 + random.uniform(-5, 5)
                        humidity = float(res["humidity"]) if res.get("humidity") is not None else 50 + random.uniform(-10, 10)
                    else:
                        # Simulation Fallback
                        city_bias = 50 if "Delhi" in city else 30 if "Mumbai" in city or "Kolkata" in city else 10
                        base_traffic = 20 + 60 * (1 if (8 <= hour <= 10 or 17 <= hour <= 19) else 0.2)
                        traffic_sim = max(0, min(100, base_traffic + random.uniform(-10, 10)))
                        temp = 25 + 10 * (1 if (10 <= hour <= 16) else 0) + random.uniform(-3, 3)
                        aqi = ml_engine.predict_aqi(hour, traffic_sim, temp) + city_bias
                        humidity = random.uniform(30, 80)

                    base_traffic = 20 + 60 * (1 if (8 <= hour <= 10 or 17 <= hour <= 19) else 0.2)
                    traffic = max(0, min(100, base_traffic + random.uniform(-10, 10)))
                    
                    new_data = models.CityData(
                        city_name=city,
                        aqi=round(aqi, 2),
                        traffic_density=round(traffic, 2),
                        temperature=round(temp, 2),
                        humidity=round(humidity, 2),
                        wind_speed=random.uniform(5, 25)
                    )
                    db.add(new_data)
                    
                    payload = {
                        "city": city,
                        "timestamp": datetime.datetime.now().isoformat(),
                        "aqi": new_data.aqi,
                        "traffic": new_data.traffic_density,
                        "temp": new_data.temperature,
                        "humidity": new_data.humidity,
                        "wind_speed": new_data.wind_speed,
                        "source": "REAL_API" if aqi_val is not None else "SIMULATED"
                    }
                    await manager.broadcast(json.dumps(payload))
                
                db.commit()
                db.close()
                print(f"[{datetime.datetime.now()}] Cycle complete.")
                
            except Exception as e:
                print(f"Critical error in simulation loop: {e}")
            
            await asyncio.sleep(120)

@app.get("/history")
def get_history(city_name: str = "Delhi", limit: int = 20, db: Session = Depends(get_db)):
    data = db.query(models.CityData).filter(models.CityData.city_name == city_name).order_by(models.CityData.timestamp.desc()).limit(limit).all()
    return [{"timestamp": d.timestamp, "aqi": d.aqi, "traffic": d.traffic_density, "temp": d.temperature, "city": d.city_name} for d in data]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
