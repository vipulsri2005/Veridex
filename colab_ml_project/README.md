# Insurance Fraud Claim Detection · Google Colab ML Project

A reproducible academic training pipeline for the Kaggle Vehicle Insurance Claim Fraud Detection dataset. Target: `FraudFound_P` (0 legitimate, 1 fraud). Notebooks inspect actual dimensions and labels at runtime; they contain no fabricated data, scores, or pretrained weights.

## Notebook order

1. `01_Dataset_Exploration.ipynb` — schema, data quality, class balance, numeric and categorical distributions, correlations and fraud-share charts.
2. `02_Data_Preprocessing.ipynb` — missing-value processing, identifier review, stratified 80/20 split, random state 42, Drive artifacts.
3. `03_Model_Training.ipynb` — Logistic Regression, Decision Tree, Random Forest and KNN.
4. `04_Model_Evaluation.ipynb` — test metrics, classification reports, confusion matrices, metric charts, ROC and precision-recall curves; selection by PR-AUC.
5. `05_Prediction_and_Model_Export.ipynb` — held-out examples, final fit, metadata, model serialization and reload prediction.

## Run in Google Colab

Upload these notebooks to Colab and run in numerical order. Cells install dependencies and mount Drive. Place the original Kaggle CSV at `MyDrive/insurance_fraud_ml/data/`; the exploration/preprocessing/training notebooks offer CSV upload if it is absent. Each notebook loads the source data itself or reads saved artifacts; no Python variables must persist across runtimes. Drive stores splits, model bundles, reports and exports.

Dataset source: [Kaggle Vehicle Insurance Claim Fraud Detection](https://www.kaggle.com/datasets/shivamb/vehicle-claim-fraud-detection). Keep the original CSV unchanged and review its license before redistributing it. Notebooks verify target values rather than assuming record counts.

## Method and limitations

Preprocessing is contained in sklearn pipelines and fit only on training data. The stratified 80/20 split uses `random_state=42`. Numeric features use median imputation; categories use most-frequent imputation and one-hot encoding. Scaling is used for Logistic Regression/KNN. Name-matched identifiers are removed and printed for review. Class weights are used where available; no resampling touches the test set. Metrics include accuracy, precision, recall, F1, ROC-AUC and PR-AUC. Selection by PR-AUC recognizes class imbalance; the default 0.5 threshold is not production-tuned. Offline evaluation is not live accuracy. This phase does not deploy a service or integrate the website.

Notebook 05 exports `best_model.joblib`, `model_metadata.json`, `model_comparison.csv`, `model_metrics.json`, and feature importance when supported. See `requirements.txt` for libraries.
