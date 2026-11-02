from pathlib import Path

import pandas as pd
import pytest

from backend.ml_service import vehicle_model

ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = ROOT / "dataset" / "fraud_oracle.csv" / "fraud_oracle.csv"


@pytest.fixture(scope="session", autouse=True)
def loaded_actual_model():
    vehicle_model.load()
    return vehicle_model


@pytest.fixture(scope="session")
def actual_vehicle_claim(loaded_actual_model):
    if not DATASET_PATH.is_file():
        pytest.skip("Original Kaggle CSV is not available in this checkout")
    row = pd.read_csv(DATASET_PATH).iloc[0].drop(labels=["FraudFound_P"])
    # This is an actual source record, not a synthetic example.
    return {name: row[name].item() if hasattr(row[name], "item") else row[name]
            for name in loaded_actual_model.features}
