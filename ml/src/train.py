from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Dict

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

from .generate_data import main as generate_data
from .features import build_features

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "checkins.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"


def train_model() -> Dict[str, float]:
    if not DATA_PATH.exists():
        generate_data()

    df = pd.read_csv(DATA_PATH)
    X, y, feature_columns = build_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = ARTIFACTS_DIR / "model.pkl"
    joblib.dump(model, model_path)

    metadata = {
        "created_at": datetime.utcnow().isoformat(),
        "target": "target_weight_7d",
        "features": feature_columns,
        "metrics": {"mae": mae}
    }
    metadata_path = ARTIFACTS_DIR / "metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2))

    print(f"Model saved to {model_path}")
    print(f"Metadata saved to {metadata_path}")
    print(f"MAE: {mae:.4f}")

    return metadata["metrics"]


def main() -> None:
    train_model()


if __name__ == "__main__":
    main()
