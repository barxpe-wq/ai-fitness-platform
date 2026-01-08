from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import ModelNotFoundError, predict
from .schemas import PredictRequest, PredictResponse

app = FastAPI(title="ai-fitness-ml-api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict-weight", response_model=PredictResponse)
def predict_weight(payload: PredictRequest):
    try:
        prediction = predict(payload.features)
    except ModelNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail="Prediction failed") from exc

    return PredictResponse(predicted_weight_kg=prediction)
