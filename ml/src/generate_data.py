from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import List

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "checkins.csv"


@dataclass
class ClientProfile:
    client_id: str
    start_weight: float
    weight_trend: float
    start_waist: float
    waist_trend: float


def build_clients(rng: np.random.Generator, count: int) -> List[ClientProfile]:
    clients: List[ClientProfile] = []
    for idx in range(count):
        start_weight = rng.normal(82, 12)
        weight_trend = rng.normal(-0.03, 0.02)
        start_waist = rng.normal(90, 10)
        waist_trend = rng.normal(-0.02, 0.015)
        clients.append(
            ClientProfile(
                client_id=f"client_{idx + 1:03d}",
                start_weight=start_weight,
                weight_trend=weight_trend,
                start_waist=start_waist,
                waist_trend=waist_trend,
            )
        )
    return clients


def generate_checkins(
    client: ClientProfile, start_date: datetime, weeks: int, rng: np.random.Generator
) -> pd.DataFrame:
    rows = []
    total_days = weeks * 7
    for day_offset in range(total_days):
        current_date = start_date + timedelta(days=day_offset)
        noise = rng.normal(0, 0.4)
        weight = client.start_weight + client.weight_trend * day_offset + noise
        waist_noise = rng.normal(0, 0.3)
        waist = client.start_waist + client.waist_trend * day_offset + waist_noise
        adherence = np.clip(rng.normal(0.75, 0.1), 0.3, 1.0)
        note = "" if rng.random() > 0.15 else "Zmeczenie po treningu"
        rows.append(
            {
                "client_id": client.client_id,
                "date": current_date.date().isoformat(),
                "weight_kg": round(weight, 2),
                "waist_cm": round(waist, 2),
                "notes": note,
                "adherence_score": round(float(adherence), 2),
            }
        )
    return pd.DataFrame(rows)


def main() -> None:
    rng = np.random.default_rng(42)
    clients = build_clients(rng, count=50)
    start_date = datetime(2024, 1, 1)
    frames = [generate_checkins(client, start_date, weeks=12, rng=rng) for client in clients]
    df = pd.concat(frames, ignore_index=True)

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)
    print(f"Saved synthetic data to {DATA_PATH}")


if __name__ == "__main__":
    main()
