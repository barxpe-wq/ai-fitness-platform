# ML API

FastAPI service for inference using the model from Etap 7.

## Setup (macOS)

```bash
cd ml_api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Test

```bash
curl http://localhost:8000/health
```

```bash
curl -X POST http://localhost:8000/predict-weight \
  -H "Content-Type: application/json" \
  -d '{"features":{"last_weight":82.4,"last_waist":84.1,"rolling_mean_7":82.6,"rolling_mean_14":83.1,"delta_7":-0.2,"day_of_week":2}}'
```
