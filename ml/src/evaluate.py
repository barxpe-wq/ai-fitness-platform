from __future__ import annotations

from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

from .features import build_features

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "checkins.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "model.pkl"


def evaluate_model() -> float:
    if not DATA_PATH.exists():
        raise FileNotFoundError("Data not found. Run generate_data first.")
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model not found. Run train first.")

    df = pd.read_csv(DATA_PATH)
    X, y, _ = build_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = joblib.load(MODEL_PATH)
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    plot_path = ARTIFACTS_DIR / "pred_vs_true.png"

    plt.figure(figsize=(6, 6))
    plt.scatter(y_test, predictions, alpha=0.4)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], "r--")
    plt.xlabel("True weight")
    plt.ylabel("Predicted weight")
    plt.title("Predicted vs True")
    plt.tight_layout()
    plt.savefig(plot_path)
    plt.close()

    print(f"MAE: {mae:.4f}")
    print(f"Plot saved to {plot_path}")

    return mae


def main() -> None:
    evaluate_model()


if __name__ == "__main__":
    main()
