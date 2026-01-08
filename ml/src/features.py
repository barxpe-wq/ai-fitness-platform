from __future__ import annotations

from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]


def build_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    data = df.copy()
    data["date"] = pd.to_datetime(data["date"])
    data = data.sort_values(["client_id", "date"]).reset_index(drop=True)

    data["last_weight"] = data["weight_kg"]
    data["last_waist"] = data["waist_cm"]

    data["rolling_mean_7"] = (
        data.groupby("client_id")["weight_kg"].transform(lambda s: s.rolling(7).mean())
    )
    data["rolling_mean_14"] = (
        data.groupby("client_id")["weight_kg"].transform(lambda s: s.rolling(14).mean())
    )

    data["delta_7"] = (
        data.groupby("client_id")["weight_kg"].transform(lambda s: s - s.shift(7))
    )

    day_of_week = data["date"].dt.dayofweek
    data["dow_sin"] = np.sin(2 * np.pi * day_of_week / 7)
    data["dow_cos"] = np.cos(2 * np.pi * day_of_week / 7)

    data["target_weight_7d"] = (
        data.groupby("client_id")["weight_kg"].transform(lambda s: s.shift(-7))
    )

    data = data.dropna(subset=["target_weight_7d", "rolling_mean_7", "rolling_mean_14", "delta_7"])

    feature_columns = [
        "last_weight",
        "last_waist",
        "rolling_mean_7",
        "rolling_mean_14",
        "delta_7",
        "dow_sin",
        "dow_cos",
        "adherence_score",
    ]

    data = data.dropna(subset=feature_columns)

    X = data[feature_columns].astype(float)
    y = data["target_weight_7d"].astype(float)

    return X, y, feature_columns
