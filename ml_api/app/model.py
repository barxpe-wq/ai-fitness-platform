from __future__ import annotations

from pathlib import Path
from typing import List

import joblib
import numpy as np

from .schemas import FeaturePayload

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR.parent / "ml" / "artifacts" / "model.pkl"


class ModelNotFoundError(RuntimeError):
    pass


def load_model():
    if not MODEL_PATH.exists():
        raise ModelNotFoundError("model not found, run Etap 7 first")
    return joblib.load(MODEL_PATH)


_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_model()
    return _model


def predict(payload: FeaturePayload) -> float:
    model = get_model()
    features = _to_feature_vector(payload)
    prediction = model.predict(features)
    return float(prediction[0])


def _to_feature_vector(payload: FeaturePayload) -> np.ndarray:
    dow = payload.day_of_week
    dow_sin = np.sin(2 * np.pi * dow / 7)
    dow_cos = np.cos(2 * np.pi * dow / 7)

    values: List[float] = [
        payload.last_weight,
        payload.last_waist,
        payload.rolling_mean_7,
        payload.rolling_mean_14,
        payload.delta_7,
        dow_sin,
        dow_cos,
        0.75,
    ]

    return np.array([values], dtype=float)
