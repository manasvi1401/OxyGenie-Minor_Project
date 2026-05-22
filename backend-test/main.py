from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

from recommender import PlantRecommender
from disease_detection import router as disease_router
from disease_detection_image import router as disease_image_router  # NEW


app = FastAPI(title="Plant Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# ENGINE
# -------------------------------
try:
    engine = PlantRecommender()
    print("PlantRecommender initialized with", len(engine.df), "plants.")
except Exception as e:
    engine = None
    print("Initialization Error:", e)


# -------------------------------
# MODELS
# -------------------------------
class RecommendRequest(BaseModel):
    season: Optional[List[str]] = None
    region: Optional[str] = None
    categories: Optional[List[str]] = None
    indoor_outdoor: Optional[str] = None
    top_k: Optional[int] = None


# -------------------------------
# ENDPOINTS
# -------------------------------
@app.get("/")
def home():
    return {"message": "Plant Recommendation API running"}


@app.post("/recommend")
def recommend(req: RecommendRequest):
    if engine is None:
        raise HTTPException(status_code=500, detail="Engine not initialized")

    user_data = req.dict()
    top = req.top_k if req.top_k and req.top_k > 0 else None
    results = engine.recommend(user_data, top_k=top)
    return {"count": len(results), "results": results}


@app.get("/plants/{plant_id}")
def get_plant(plant_id: int):
    if engine is None:
        raise HTTPException(status_code=500, detail="Engine not initialized")

    if plant_id < 0 or plant_id >= len(engine.df):
        raise HTTPException(status_code=404, detail="Plant not found")

    row = engine.df.iloc[plant_id]
    plant = row.to_dict()
    plant = {k: (None if pd.isna(v) else v) for k, v in plant.items()}
    plant["plant_id"] = plant_id
    return {"plant": plant}


app.include_router(
    disease_router,
    prefix="/disease",
    tags=["Plant Disease Detection"],
)

app.include_router(  # NEW
    disease_image_router,
    prefix="/disease",
    tags=["Plant Disease Detection (Image)"],
)
