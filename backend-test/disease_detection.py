from fastapi import APIRouter
from pydantic import BaseModel
from ml_disease_model import diagnose_symptoms  

router = APIRouter()

class SymptomInput(BaseModel):
    symptoms: str

@router.post("/detect-disease-text")
def predict_disease_ml(data: SymptomInput):
    return diagnose_symptoms(data.symptoms)
