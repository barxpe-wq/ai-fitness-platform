# ML v1

Minimalny pipeline ML dla syntetycznych check-inow. Model przewiduje wage klienta za 7 dni na podstawie historii.

## Start (macOS)

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m src.generate_data
python -m src.train
python -m src.evaluate
```

Notebook (opcjonalnie):

```bash
jupyter notebook
```

Otworz `notebooks/progress_model.ipynb` i uruchom komorki.

## Co przewiduje model

Model regresyjny przewiduje `weight_kg` za 7 dni (`target_weight_7d`) dla kazdego klienta.

## Jakie sa cechy

- last_weight
- last_waist
- rolling_mean_7
- rolling_mean_14
- delta_7
- dow_sin
- dow_cos
- adherence_score

## Jak powstaje artefakt

Skrypt `src/train.py` trenuje model, zapisuje go do `artifacts/model.pkl` i dodaje `artifacts/metadata.json` z metryka MAE. Skrypt `src/evaluate.py` generuje wykres `artifacts/pred_vs_true.png`.
