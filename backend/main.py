from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Literal

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from .ml_service import ClaimFeatureError, ModelUnavailable, vehicle_model

load_dotenv()
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("veridex.api")
DATASET_PATH = Path(__file__).resolve().parents[1] / "dataset" / "fraud_oracle.csv" / "fraud_oracle.csv"


@asynccontextmanager
async def lifespan(_: FastAPI):
    vehicle_model.load()
    logger.info("Vehicle claim model loaded")
    yield


app = FastAPI(title="Veridex Vehicle Claim Inference", version="1.0.0", lifespan=lifespan)
origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if item.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"])


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    insurance_type: Literal["vehicle"]
    features: dict[str, Any] = Field(..., min_length=32, max_length=32)


class PredictionResponse(BaseModel):
    success: bool = True
    prediction: int
    prediction_label: str
    fraud_probability: float | None
    classification_threshold: float
    model_name: str
    gemini_explanation: str | None = None
    gemini_status: Literal["available", "not_configured", "unavailable"]


@app.middleware("http")
async def enforce_body_limit(request: Request, call_next):
    if request.method == "POST":
        length = request.headers.get("content-length")
        if length and int(length) > 32_768:
            return await _json_error(413, "Request body is too large")
    return await call_next(request)


async def _json_error(status: int, message: str):
    from starlette.responses import JSONResponse
    return JSONResponse(status_code=status, content={"detail": message})


def _gemini_explain(payload: dict[str, Any], result: dict[str, Any]) -> str | None:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=key)
        # Avoid sending direct identifiers to the external model.
        evidence = {k: v for k, v in payload.items() if k not in {"PolicyNumber", "RepNumber"}}
        prompt = (
            "Explain this fixed machine-learning result for a claims reviewer in plain language. "
            "Do not change its class or probability, and do not assert fraud as a fact. "
            "State that this is a model signal requiring human review. Use only the supplied result and evidence.\n"
            f"ML RESULT: {result}\nCLAIM FEATURES: {evidence}"
        )
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        return (response.text or "").strip() or None
    except Exception:
        logger.warning("Gemini explanation request failed")
        return None


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": vehicle_model.pipeline is not None}


@app.get("/api/schema")
def schema():
    try:
        return {"insurance_type": "vehicle", "features": vehicle_model.schema()}
    except ModelUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/demo-records")
def demo_records(per_class: int = Query(default=3, ge=1, le=10)):
    """Return real, labeled rows from the bundled source dataset for academic demos only."""
    if not DATASET_PATH.is_file():
        raise HTTPException(status_code=503, detail="Historical demonstration dataset is unavailable")
    if not vehicle_model.features:
        raise HTTPException(status_code=503, detail="Model schema is unavailable")

    try:
        frame = pd.read_csv(DATASET_PATH)
        target = "FraudFound_P"
        if target not in frame.columns:
            raise ValueError("Dataset target column is missing")
        selected = []
        for label in (0, 1):
            rows = frame.loc[frame[target].astype(int) == label, vehicle_model.features].dropna().head(per_class)
            for index, row in rows.iterrows():
                features = {
                    name: value.item() if hasattr(value, "item") else value
                    for name, value in row.to_dict().items()
                }
                selected.append({
                    "record_id": f"historical-row-{int(index) + 1}",
                    "record_number": int(index) + 1,
                    "actual_label": label,
                    "features": features,
                })
        return {
            "source": "fraud_oracle.csv",
            "demonstration_only": True,
            "records": selected,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Could not read historical demonstration records")
        raise HTTPException(status_code=503, detail="Historical demonstration records could not be loaded") from exc


@app.post("/api/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    if request.insurance_type != "vehicle":
        raise HTTPException(status_code=422, detail="The trained model only supports vehicle claims")
    try:
        result = vehicle_model.predict(request.features)
    except ClaimFeatureError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ModelUnavailable as exc:
        logger.error("Vehicle model inference unavailable")
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    explanation = await asyncio.to_thread(_gemini_explain, request.features, result)
    return PredictionResponse(
        **result,
        gemini_explanation=explanation,
        gemini_status="available" if explanation else ("not_configured" if not os.getenv("GEMINI_API_KEY") else "unavailable"),
    )
