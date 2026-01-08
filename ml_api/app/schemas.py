from __future__ import annotations

from pydantic import BaseModel, Field


class FeaturePayload(BaseModel):
    last_weight: float = Field(..., ge=0)
    last_waist: float = Field(..., ge=0)
    rolling_mean_7: float = Field(..., ge=0)
    rolling_mean_14: float = Field(..., ge=0)
    delta_7: float
    day_of_week: int = Field(..., ge=0, le=6)


class PredictRequest(BaseModel):
    features: FeaturePayload


class PredictResponse(BaseModel):
    predicted_weight_kg: float
