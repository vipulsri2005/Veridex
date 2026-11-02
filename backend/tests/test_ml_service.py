from pathlib import Path

import pytest

from backend.ml_service import ClaimFeatureError, ModelUnavailable, VehicleFraudModel, vehicle_model


def test_trusted_model_and_fitted_preprocessor_load(loaded_actual_model):
    assert Path("backend/models/best_model.joblib").is_file()
    assert len(loaded_actual_model.features) == 32
    assert loaded_actual_model.pipeline.named_steps["prep"] is not None
    assert loaded_actual_model.pipeline.named_steps["model"] is not None


def test_actual_dataset_record_produces_repeatable_real_prediction(loaded_actual_model, actual_vehicle_claim):
    first = loaded_actual_model.predict(actual_vehicle_claim)
    second = loaded_actual_model.predict(actual_vehicle_claim)
    assert first == second
    assert first["prediction"] in (0, 1)
    assert first["model_name"] == "Random Forest"
    assert first["fraud_probability"] is None or 0 <= first["fraud_probability"] <= 1


def test_missing_required_feature_is_rejected(loaded_actual_model, actual_vehicle_claim):
    incomplete = dict(actual_vehicle_claim)
    incomplete.pop(loaded_actual_model.features[0])
    with pytest.raises(ClaimFeatureError, match="Missing required"):
        loaded_actual_model.predict(incomplete)


def test_extra_feature_is_rejected(loaded_actual_model, actual_vehicle_claim):
    payload = {**actual_vehicle_claim, "untrained_feature": 1}
    with pytest.raises(ClaimFeatureError, match="Unknown features"):
        loaded_actual_model.predict(payload)


def test_wrong_numeric_type_is_rejected(loaded_actual_model, actual_vehicle_claim):
    payload = dict(actual_vehicle_claim)
    payload["Age"] = "not-a-number"
    with pytest.raises(ClaimFeatureError, match="Age must be numeric"):
        loaded_actual_model.predict(payload)


def test_fractional_integer_feature_is_rejected(loaded_actual_model, actual_vehicle_claim):
    payload = dict(actual_vehicle_claim)
    payload["WeekOfMonth"] = 2.5
    with pytest.raises(ClaimFeatureError, match="WeekOfMonth must be an integer"):
        loaded_actual_model.predict(payload)


def test_unknown_category_is_rejected(loaded_actual_model, actual_vehicle_claim):
    payload = dict(actual_vehicle_claim)
    categorical = next(name for name in loaded_actual_model.features if name in loaded_actual_model.categories)
    payload[categorical] = "__not_a_training_category__"
    with pytest.raises(ClaimFeatureError, match="must match a category"):
        loaded_actual_model.predict(payload)


def test_missing_model_artifact_is_reported(monkeypatch, tmp_path):
    import backend.ml_service as service
    monkeypatch.setattr(service, "MODEL_PATH", tmp_path / "missing.joblib")
    monkeypatch.setattr(service, "METADATA_PATH", tmp_path / "missing.json")
    with pytest.raises(ModelUnavailable, match="missing"):
        VehicleFraudModel().load()
