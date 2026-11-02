# Veridex ML API

Separate FastAPI service for the exported Random Forest vehicle pipeline. It loads the trusted `models/best_model.joblib` once at startup and uses its fitted preprocessing pipeline. The model only supports vehicle claims. Health and other product lines must not be sent to it.

## Local startup

Use Python 3.11 and a virtual environment. Install dependencies with `pip install -r requirements.txt`, copy `.env.example` to `.env`, and optionally set `GEMINI_API_KEY` and `CORS_ORIGINS`. Start from the repository root with `uvicorn backend.main:app --host 127.0.0.1 --port 8000`. The artifact is version-sensitive: the Colab export did not record its Scikit-learn/Joblib versions, so verify compatibility in the model's original Colab runtime before treating startup as successful.

`GET /health` reports service/model load state. `GET /api/schema` returns the exact fitted input categories. `POST /api/predict` accepts JSON containing `insurance_type: "vehicle"` and a `features` object with every exact feature in `models/model_metadata.json`. It rejects missing/extra fields, invalid numeric values, and categories that do not occur in the fitted one-hot encoder. The ML class and optional class-1 probability come directly from `predict()` and `predict_proba()`. Gemini, when configured server-side, receives a limited evidence set and explains the ML result; Gemini output cannot overwrite the ML fields. Without a key or if Gemini fails, the ML result is still returned.

`GET /api/demo-records?per_class=3` is for local academic demonstration only. It returns up to three complete genuine rows from each target class in the bundled original CSV, with the known dataset label kept separate from the model prediction. The response explicitly marks these as historical demonstration records. It returns 503 if the source dataset is unavailable. Do not use this endpoint as a new-claim data source.

The frontend has two distinct workflows: ordinary claim intake keeps its existing heuristic and Gemini behavior; the ML Demo page loads `/api/schema`, requires all 32 typed inputs, and submits them to `/api/predict`. It can load actual rows from `/api/demo-records`. Set `VITE_ML_API_BASE_URL` if FastAPI runs somewhere other than `http://localhost:8000`.

## Critical readiness limit

The current website form does not collect all 32 inputs. This API intentionally rejects incomplete records instead of filling unknown claim details. Do not connect it to the current form until a claim-time data source/form captures the complete supported schema and the mapping is reviewed. The existing classifier's held-out fraud recall was 3.78%; it is an academic demonstration signal, not a production fraud decision system. See `MODEL_AUDIT_AND_IMPROVEMENT_REPORT.md` at the repository root.

## API example shape

```json
{
  "insurance_type": "vehicle",
  "features": {
    "Month": "Jan",
    "WeekOfMonth": 2
  }
}
```

The example is intentionally incomplete and receives HTTP 422. Submit all 32 metadata features with dataset-compatible categories for a prediction. No endpoint trains or modifies the model.
