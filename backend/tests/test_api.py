import os

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.ml_service import vehicle_model


def test_health_and_vehicle_prediction_use_actual_dataset_record(actual_vehicle_claim, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    with TestClient(app) as client:
        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["model_loaded"] is True

        response = client.post("/api/predict", json={"insurance_type": "vehicle", "features": actual_vehicle_claim})
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert result["prediction"] in (0, 1)
        assert result["prediction_label"] in ("Legitimate Claim", "Fraudulent Claim")
        assert result["gemini_explanation"] is None
        assert result["gemini_status"] == "not_configured"


def test_demo_records_are_genuine_complete_historical_rows(loaded_actual_model):
    with TestClient(app) as client:
        response = client.get("/api/demo-records?per_class=1")

    assert response.status_code == 200
    payload = response.json()
    assert payload["demonstration_only"] is True
    assert payload["source"] == "fraud_oracle.csv"
    assert {record["actual_label"] for record in payload["records"]} == {0, 1}
    assert all(len(record["features"]) == 32 for record in payload["records"])


def test_demo_record_limit_is_validated():
    with TestClient(app) as client:
        response = client.get("/api/demo-records?per_class=11")
    assert response.status_code == 422


def test_api_rejects_incomplete_input(actual_vehicle_claim):
    incomplete = dict(actual_vehicle_claim)
    incomplete.pop(next(iter(incomplete)))
    with TestClient(app) as client:
        response = client.post("/api/predict", json={"insurance_type": "vehicle", "features": incomplete})
    assert response.status_code == 422


def test_api_rejects_unsupported_insurance_type(actual_vehicle_claim):
    with TestClient(app) as client:
        response = client.post("/api/predict", json={"insurance_type": "health", "features": actual_vehicle_claim})
    assert response.status_code == 422


def test_api_rejects_extra_top_level_fields(actual_vehicle_claim):
    with TestClient(app) as client:
        response = client.post("/api/predict", json={"insurance_type": "vehicle", "features": actual_vehicle_claim, "extra": True})
    assert response.status_code == 422


@pytest.mark.parametrize(
    ("explanation", "expected_status"),
    [(None, "unavailable"), ("Reviewer context only.", "available")],
)
def test_gemini_never_replaces_ml_result(
    actual_vehicle_claim, monkeypatch, explanation, expected_status
):
    import backend.main as api

    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(api, "_gemini_explain", lambda *_: explanation)
    expected = vehicle_model.predict(actual_vehicle_claim)

    with TestClient(app) as client:
        response = client.post(
            "/api/predict",
            json={"insurance_type": "vehicle", "features": actual_vehicle_claim},
        )

    assert response.status_code == 200
    result = response.json()
    assert result["prediction"] == expected["prediction"]
    assert result["fraud_probability"] == pytest.approx(expected["fraud_probability"], abs=1e-12)
    assert result["gemini_status"] == expected_status
    assert result["gemini_explanation"] == explanation
