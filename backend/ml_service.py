"""Loads and runs the trusted, exported vehicle claim pipeline."""
from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(MODEL_DIR / "best_model.joblib")))
METADATA_PATH = Path(os.getenv("MODEL_METADATA_PATH", str(MODEL_DIR / "model_metadata.json")))
NUMERIC_FEATURES = {
    "WeekOfMonth", "WeekOfMonthClaimed", "Age", "PolicyNumber", "RepNumber",
    "Deductible", "DriverRating", "Year",
}


class ModelUnavailable(RuntimeError):
    pass


class ClaimFeatureError(ValueError):
    pass


class VehicleFraudModel:
    def __init__(self) -> None:
        self.pipeline: Any = None
        self.metadata: dict[str, Any] = {}
        self.features: list[str] = []
        self.categories: dict[str, set[str]] = {}

    def load(self) -> None:
        if not MODEL_PATH.is_file() or not METADATA_PATH.is_file():
            raise ModelUnavailable("Model artifact or metadata is missing")
        try:
            with METADATA_PATH.open(encoding="utf-8") as stream:
                metadata = json.load(stream)
            features = metadata.get("selected_features")
            if not isinstance(features, list) or len(features) != 32 or len(set(features)) != 32:
                raise ModelUnavailable("Model metadata has an invalid feature schema")
            pipeline = joblib.load(MODEL_PATH)
            if not callable(getattr(pipeline, "predict", None)):
                raise ModelUnavailable("Loaded artifact does not expose predict()")
            self.pipeline, self.metadata, self.features = pipeline, metadata, features
            self.categories = self._read_categories(pipeline)
        except ModelUnavailable:
            raise
        except Exception as exc:
            # Do not reveal filesystem details or deserialization internals to API clients.
            raise ModelUnavailable("The exported model could not be loaded") from exc

    @staticmethod
    def _read_categories(pipeline: Any) -> dict[str, set[str]]:
        """Read accepted categorical labels from the fitted encoder in the pipeline."""
        found: dict[str, set[str]] = {}
        prep = getattr(pipeline, "named_steps", {}).get("prep")
        if prep is None:
            return found
        for _, transformer, columns in getattr(prep, "transformers_", []):
            steps = getattr(transformer, "named_steps", {})
            encoder = steps.get("encode") or steps.get("onehot")
            if encoder is None or not hasattr(encoder, "categories_"):
                continue
            for column, values in zip(columns, encoder.categories_):
                found[str(column)] = {str(value) for value in values}
        return found

    def predict(self, features: dict[str, Any]) -> dict[str, Any]:
        if self.pipeline is None:
            raise ModelUnavailable("Model is not loaded")
        missing = [name for name in self.features if name not in features or features[name] is None]
        extra = sorted(set(features) - set(self.features))
        if missing or extra:
            details = []
            if missing:
                details.append("Missing required features: " + ", ".join(missing))
            if extra:
                details.append("Unknown features: " + ", ".join(extra))
            raise ClaimFeatureError("; ".join(details))

        row: dict[str, Any] = {}
        for name in self.features:
            value = features[name]
            if name in NUMERIC_FEATURES:
                if isinstance(value, bool):
                    raise ClaimFeatureError(f"{name} must be numeric")
                try:
                    number = float(value)
                except (TypeError, ValueError) as exc:
                    raise ClaimFeatureError(f"{name} must be numeric") from exc
                if not math.isfinite(number):
                    raise ClaimFeatureError(f"{name} must be a finite number")
                if not number.is_integer():
                    raise ClaimFeatureError(f"{name} must be an integer")
                row[name] = number
            else:
                if not isinstance(value, str) or not value.strip():
                    raise ClaimFeatureError(f"{name} must be a non-empty category")
                allowed = self.categories.get(name)
                if allowed and value not in allowed:
                    raise ClaimFeatureError(f"{name} must match a category used in model training")
                row[name] = value

        # The saved pipeline owns the fitted imputation/encoding and classifier.
        frame = pd.DataFrame([row], columns=self.features)
        try:
            predicted = int(self.pipeline.predict(frame)[0])
            probability: float | None = None
            if callable(getattr(self.pipeline, "predict_proba", None)):
                classes = list(self.pipeline.classes_)
                if 1 in classes:
                    probability = float(self.pipeline.predict_proba(frame)[0][classes.index(1)])
            return {
                "prediction": predicted,
                "prediction_label": "Fraudulent Claim" if predicted == 1 else "Legitimate Claim",
                "fraud_probability": probability,
                "classification_threshold": float(self.metadata.get("classification_threshold", 0.5)),
                "model_name": str(self.metadata.get("selected_model", "Exported classifier")),
            }
        except ClaimFeatureError:
            raise
        except Exception as exc:
            raise ModelUnavailable("Model inference failed") from exc

    def schema(self) -> list[dict[str, Any]]:
        if not self.features:
            raise ModelUnavailable("Model is not loaded")
        return [
            {"name": name, "kind": "number" if name in NUMERIC_FEATURES else "category",
             "categories": sorted(self.categories.get(name, set()))}
            for name in self.features
        ]


vehicle_model = VehicleFraudModel()
