import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import datetime
import os

MODEL_PATH = "aqi_model.pkl"

def generate_synthetic_data(samples=1000):
    """Generates synthetic city data for training."""
    np.random.seed(42)
    
    # Hour of day (0-23)
    hour = np.random.randint(0, 24, samples)
    # Traffic density (higher during rush hours 8-10, 17-19)
    traffic = 20 + 60 * np.exp(-((hour - 9)**2) / 4) + 60 * np.exp(-((hour - 18)**2) / 4) + np.random.normal(0, 5, samples)
    traffic = np.clip(traffic, 0, 100)
    
    # Temperature (sine wave over the day)
    temp = 20 + 10 * np.sin((hour - 6) * np.pi / 12) + np.random.normal(0, 2, samples)
    
    # AQI (influenced by traffic and temp)
    aqi = 30 + 0.8 * traffic + 0.5 * temp + np.random.normal(0, 10, samples)
    aqi = np.clip(aqi, 0, 500)
    
    df = pd.DataFrame({
        'hour': hour,
        'traffic_density': traffic,
        'temperature': temp,
        'aqi': aqi
    })
    return df

def train_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    
    X = df[['hour', 'traffic_density', 'temperature']]
    y = df['aqi']
    
    print("Training Random Forest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    import joblib
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

def predict_aqi(hour, traffic, temp):
    if not os.path.exists(MODEL_PATH):
        train_model()
    
    import joblib
    model = joblib.load(MODEL_PATH)
    prediction = model.predict([[hour, traffic, temp]])
    return float(prediction[0])

if __name__ == "__main__":
    train_model()
