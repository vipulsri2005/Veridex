# Model Audit and Improvement Report

**Audit scope:** saved Colab artifacts in `outputs/`, the five saved Colab notebooks, the original CSV at `dataset/fraud_oracle.csv/fraud_oracle.csv`, and the current vehicle claim form. No frontend, application, model, or deployment files were changed for this audit. The original CSV was independently checked for row/column count, target values, and empty cells. At the time of the initial audit Python was not runnable here; a later backend verification used Python 3.11.9 and successfully loaded the saved model and ran a genuine dataset-record prediction. No model improvement experiments were run.

## 1. Current model and artifact

- **Dataset:** `fraud_oracle.csv`, 15,420 records, 32 predictors plus `FraudFound_P`; both saved EDA output and local CSV check record 14,497 legitimate and 923 fraud claims (5.986% fraud). The CSV check found no empty cells; the saved EDA reports no duplicate rows.
- **Selected classifier:** Random Forest, 300 trees, `class_weight='balanced_subsample'`, `min_samples_leaf=2`, `random_state=42`.
- **Saved object:** `outputs/best_model.joblib` (49,315,643 bytes). Notebook 05 saves the full sklearn `Pipeline`, with `prep` and `model` steps, after fitting the selected pipeline on all 15,420 labeled rows. This includes the fitted preprocessing and classifier; inference should use the pipeline as one object, not recreate its transformations.
- **Preprocessing in the pipeline:** numeric median imputation with missing indicators; categorical most-frequent imputation and `OneHotEncoder(handle_unknown='ignore', min_frequency=2)`. Random Forest does not use numeric scaling. The saved notebook also shows the classifier and preprocessing pipeline construction.
- **Target and threshold:** `FraudFound_P`, with 0 legitimate and 1 fraud; classification threshold 0.50. The model’s `predict()` result uses that classifier's default threshold. `predict_proba()` is available in the notebook and was used for ROC-AUC and PR-AUC.
- **Export metadata discrepancy:** `05_Prediction_and_Model_Export.ipynb` refits the selected model with `final.fit(X, y)` on all 15,420 rows, but writes `training_records` as `len(df)-len(yte)` (12,336). That field describes the original split, not the rows used to fit the exported artifact. Preserve the file and correct this metadata in a future re-export.
- **Input columns in saved metadata, in saved order:**

  `Month`, `WeekOfMonth`, `DayOfWeek`, `Make`, `AccidentArea`, `DayOfWeekClaimed`, `MonthClaimed`, `WeekOfMonthClaimed`, `Sex`, `MaritalStatus`, `Age`, `Fault`, `PolicyType`, `VehicleCategory`, `VehiclePrice`, `PolicyNumber`, `RepNumber`, `Deductible`, `DriverRating`, `Days_Policy_Accident`, `Days_Policy_Claim`, `PastNumberOfClaims`, `AgeOfVehicle`, `AgeOfPolicyHolder`, `PoliceReportFiled`, `WitnessPresent`, `AgentType`, `NumberOfSuppliments`, `AddressChange_Claim`, `NumberOfCars`, `Year`, `BasePolicy`.

The EDA output reports these data types: numeric (`int64`): `WeekOfMonth`, `WeekOfMonthClaimed`, `Age`, `PolicyNumber`, `RepNumber`, `Deductible`, `DriverRating`, `Year`; categorical/object: all other listed predictors. Inference values must use the source dataset's category labels where known. Follow-up verification deserialized the artifact using scikit-learn 1.6.1, identified the Random Forest pipeline with fitted preprocessing and 32 metadata features, and obtained a real prediction. The model artifact SHA-256 matches the preserved source artifact in `outputs/`.

## 2. Actual held-out performance at threshold 0.50

The saved evaluation notebook reports 3,084 test rows, stratified from the 15,420-record dataset: 2,899 legitimate and 185 fraud claims. Metrics below are copied from `outputs/model_comparison.csv` and `outputs/model_metrics.json`; no new performance figures have been generated.

| Model | Accuracy | Fraud precision | Fraud recall | Fraud F1 | ROC-AUC | PR-AUC |
|---|---:|---:|---:|---:|---:|---:|
| Random Forest | 0.9413 | 0.7000 | 0.0378 | 0.0718 | 0.8592 | 0.2980 |
| Decision Tree | 0.8658 | 0.2173 | 0.4757 | 0.2983 | 0.6914 | 0.1964 |
| Logistic Regression | 0.6433 | 0.1319 | 0.8865 | 0.2297 | 0.8066 | 0.1559 |
| K-Nearest Neighbors | 0.9345 | 0.1304 | 0.0162 | 0.0288 | 0.6557 | 0.1138 |

### Confusion matrices

Rows are actual (`legitimate`, `fraud`); columns are predicted (`legitimate`, `fraud`). These counts follow from the saved class supports and the recorded precision/recall values, whose displayed metrics are rounded:

| Model | TN | FP | FN | TP | Interpretation |
|---|---:|---:|---:|---:|---|
| Random Forest | 2,896 | 3 | 178 | 7 | Very few false alarms, but misses 178 of 185 fraud claims. |
| Decision Tree | 2,582 | 317 | 97 | 88 | Catches more fraud than RF, with substantially more false alarms. |
| Logistic Regression | 1,820 | 1,079 | 21 | 164 | Catches most fraud, but flags many legitimate claims. |
| KNN | 2,879 | 20 | 182 | 3 | Misses nearly all fraud at the default threshold. |

The table uses the 185 fraud and 2,899 legitimate support printed in the notebook classification reports. Counts are arithmetically reconstructed from the report and rounded metrics; they should be confirmed by rerunning the saved confusion-matrix cell against the saved test bundle before quoting as a primary output.

## 3. Why fraud recall is low

The recorded class distribution is imbalanced: fraud is 5.986% of the full dataset and 185/3,084 of the test split. A classifier can reach high accuracy by predicting the majority class. The Random Forest threshold of 0.50 produces only seven positive predictions among the 185 actual fraud cases.

The RF already uses `balanced_subsample`, so the low recall cannot be explained by a complete absence of class weighting. Plausible causes supported by the recorded setup include:

1. **Threshold choice:** the notebook uses the default 0.50 decision threshold. Its ROC-AUC of 0.8592 and PR-AUC of 0.2980 indicate ranking signal, while recall at 0.50 is only 0.0378. Lower thresholds may trade precision for recall, but no validation threshold sweep was recorded.
2. **Imbalance and training objective:** class weighting changes tree split costs but does not guarantee useful recall at the default probability threshold.
3. **Possible overfit:** RF training accuracy is 0.999514 versus 0.941310 on test, a gap of about 5.82 percentage points. KNN also has 1.0 training accuracy and weak test performance. This warrants regularization and validation checks.
4. **Identifier risk:** `PolicyNumber` remains among the 32 predictors. The preprocessing code removes names containing `policy_number`, with an underscore, but the dataset column is `PolicyNumber`; consequently this filter does not remove it. PolicyNumber has 15,420 unique values in the saved EDA output and behaves like an identifier. It may promote memorization or spurious patterns. This is a leakage/memorization risk to investigate, not proof that the held-out scores are invalid.
5. **No validation-based selection:** the notebooks report one stratified 80/20 train/test split. The recorded evaluation does not include a separate validation split or cross-validation for threshold/model selection.

The ROC and precision-recall curves were generated and saved in the Colab evaluation notebook, but raw curve points and threshold-specific results were not saved as files. No alternative threshold, SMOTE, or reweighted-model experiment has been executed. The original dataset is available locally, but those experiments were outside the backend verification run and cannot be reported as tested.

## 4. Training/test methodology and leakage audit

- The training and evaluation notebooks use an 80/20 stratified split with random state 42 and use the same split for the four algorithms.
- Preprocessing is within sklearn pipelines, so imputers and encoders are fit with each model on the training data before the test set is scored.
- Training metrics are not used as final test metrics.
- The saved model is refit on the complete dataset after evaluation for export. That is a standard final-fit pattern, provided model selection and all tuning remain based on training/validation data and the held-out test is not repeatedly used for decisions.
- However, the workflow selected by test-set PR-AUC and then refit on all rows; thus the test set has influenced model selection. Treat the published test metrics as comparison results, not a pristine final estimate after selection. Future experiments need a validation split (or nested/cross-validation) and a single untouched final test set.
- `PolicyNumber` is a likely high-cardinality identifier. Remove it in a future training experiment and compare. Do not change the existing artifact in place.
- The EDA reports no missing values for the source dataset. At web inference many fields would be absent; the model's imputer would substitute training medians/modes, but this is not equivalent to a representative feature set and may produce out-of-distribution behavior.

## 5. Vehicle form feature mapping audit

The website form schema is in `src/types.ts` and `src/components/CarInsuranceForm.tsx`. “Present” means a field is collected by the current form; exact category compatibility still requires checking against source labels. Post-investigation fields should not be used for first-notice-of-loss predictions even if the dataset contains them.

| Dataset feature | Dataset type | Existing form field | Status / additional input | Available at initial claim? |
|---|---|---|---|---|
| Month | category | None; `incidentHour` only | Requires incident date | Yes, if date is collected |
| WeekOfMonth | integer | None | Derive from incident date | Yes, if date is collected |
| DayOfWeek | category | None | Derive from incident date | Yes, if date is collected |
| Make | category | `vehicleMake` | Direct; normalize to dataset categories | Yes |
| AccidentArea | category | `incidentCity`, `incidentState` | Not safely derivable; collect Urban/Rural or trusted geocoding | Potentially |
| DayOfWeekClaimed | category | None | Derive from claim-reported date | Yes, if claim date is captured |
| MonthClaimed | category | None | Derive from claim-reported date | Yes, if claim date is captured |
| WeekOfMonthClaimed | integer | None | Derive from claim-reported date | Yes, if claim date is captured |
| Sex | category | `gender` | Direct with Male/Female normalization | Yes |
| MaritalStatus | category | `relationship` | Not equivalent; require marital status input | Yes |
| Age | integer | `age` | Direct numeric | Yes |
| Fault | category | None | Do not infer from `authoritiesContacted`; reported/confirmed fault may be investigative | Often only after investigation; exclude if not known at intake |
| PolicyType | category | `policyCsl` / `collisionType` | No exact mapping; collect actual policy type from policy record | Yes via policy system |
| VehicleCategory | category | `vehicleMake`, `vehicleModel` | Not safely inferred without verified vehicle classification | Yes via trusted vehicle catalog |
| VehiclePrice | category | None | Require authoritative valuation/price band; make/model alone is insufficient | Potentially via valuation service |
| PolicyNumber | integer | `policyNumber` | Direct but sensitive, high-cardinality identifier; strong leakage/memorization concern | Yes |
| RepNumber | integer | None | Internal representative/adjuster assignment; source/system field needed | Usually assigned after intake; exclude initially |
| Deductible | integer | `policyDeductible` | Direct numeric | Yes |
| DriverRating | integer | None | Requires authoritative insurer rating record; do not guess | Maybe via policy system |
| Days_Policy_Accident | category | `monthsAsCustomer` is not equivalent | Require policy effective date and incident date; do not approximate from tenure | Yes if policy/date data are available |
| Days_Policy_Claim | category | None | Require incident date and claim-reported date | Yes after claim date is recorded |
| PastNumberOfClaims | category | None | Query verified claim history or collect with validation | Yes via insurer history; may otherwise be unavailable |
| AgeOfVehicle | category | `vehicleYear` | Derive only from vehicle age at incident and verified dataset bins; current-year subtraction is not adequate | Yes with incident date; categories need validation |
| AgeOfPolicyHolder | category | `age` | Can derive only with exact verified training bins; EDA says 9 categories but bin labels are not fully recorded | Yes after bin verification |
| PoliceReportFiled | category | `policeReportAvailable` | Direct Yes/No after label normalization | Yes, if known at report time |
| WitnessPresent | category | `witnesses` | Safe boolean derivation: count > 0 → Yes, else No | Yes, as reported |
| AgentType | category | None | Requires policy sales-channel record | Yes via policy system |
| NumberOfSuppliments | category | None | Supplementary documents accumulate during claim handling | Generally post-submission; exclude at initial prediction |
| AddressChange_Claim | category | None | Requires verified address history and claim-relative timing | Potentially via policy system; not collected |
| NumberOfCars | category | `numberOfVehicles` is incident vehicles, not insured policy cars | Require policy vehicle count | Yes via policy system |
| Year | integer | `vehicleYear` is vehicle model year, not accident year | Require incident date; do not substitute vehicle year | Yes, if date is captured |
| BasePolicy | category | `policyCsl` / `policyState` | No exact mapping; retrieve actual coverage base from policy record | Yes via policy system |

### Categorization

- **Direct or safely derivable:** `Make`, `Sex`, `Age`, `PolicyNumber`, `Deductible`, `PoliceReportFiled`, `WitnessPresent` (7 features, with normalization for categorical labels).
- **Derivable if the corresponding date is collected:** `Month`, `WeekOfMonth`, `DayOfWeek`, `DayOfWeekClaimed`, `MonthClaimed`, `WeekOfMonthClaimed`, `Year`, `Days_Policy_Accident`, `Days_Policy_Claim` (9 features).
- **Require additional user/policy-system data or verified transformations:** `AccidentArea`, `MaritalStatus`, `PolicyType`, `VehicleCategory`, `VehiclePrice`, `DriverRating`, `PastNumberOfClaims`, `AgeOfVehicle`, `AgeOfPolicyHolder`, `AgentType`, `AddressChange_Claim`, `NumberOfCars`, `BasePolicy` (13 features).
- **Investigation-sensitive/post-submission:** `Fault`, `RepNumber`, `NumberOfSuppliments` (3 features; RepNumber may be known after assignment but is not a claimant intake feature). These should be excluded from initial prediction or retrained without them.

Counts sum to the model’s 32 features. Several features could move categories if an insurer's claim process supplies them at first notice. Do not silently pass guessed constants or assume imputation makes a missing-feature prediction reliable.

## 6. Improvement experiments and current status

The saved artifacts provide a genuine baseline comparison, but no improvement experiment is recorded. In particular, there are no validation threshold sweeps, no validation confusion matrices at alternate thresholds, no PR/ROC raw points, no SMOTE pipeline run, and no ablation without identifiers/post-investigation fields. The follow-up backend verification confirmed local Python and model inference, but did not run these experiments. The held-out examples and metrics in the Colab outputs are genuine; they do not substitute for those experiments.

Recommended controlled experiment plan for Colab, preserving `outputs/best_model.joblib` and all original output files:

1. Reload original CSV; use an outer stratified train/test split once and hold the test set untouched.
2. Split the outer training partition again into train/validation, or use stratified cross-validation. Do all threshold selection and model/feature choices only within this training/validation data.
3. Compare original four pipelines with: (a) RF without `PolicyNumber`, `RepNumber`, and post-investigation features; (b) balanced RF and Logistic Regression with threshold swept on validation; (c) class-weight variants; (d) SMOTE inside an imbalanced-learn pipeline applied only after the training split and before the estimator. Preserve untouched validation/test distributions.
4. Plot validation precision-recall and ROC curves; table threshold, TP, FP, FN, TN, precision, recall, F1, PR-AUC, and false-positive rate. Select threshold based on the intended review capacity and cost of missed fraud vs unnecessary investigation.
5. Freeze chosen pipeline and threshold, then evaluate once on untouched outer test. Compare with the currently saved baseline on the same rows. Save improved artifacts under new filenames and keep all current files unchanged.

## 7. Recommendation and next steps

1. **Do not integrate the saved Random Forest as an operational fraud gate.** Its current threshold misses 178 of 185 held-out fraud cases. High accuracy is majority-class dominated.
2. **Vehicle claims only.** This dataset/model does not support health claims. Keep health on a separate, clearly identified assessment path until a compatible labeled dataset/model is trained.
3. **Retrain/validate before integration.** Investigate identifier and post-investigation leakage, run validation-only threshold and imbalance experiments, then report final held-out trade-offs. Preserve the existing model and metrics as the baseline.
4. **Feature strategy:** ideally join authoritative policy/claim records at first notice to supply stable, non-investigative attributes. Add only genuinely obtainable claim-time fields to the form. Retrain on the same feature set the website can reliably provide; do not rely on median/mode imputation for 25 missing predictors.
5. **Exclude post-investigation predictors** from initial claim triage or explicitly build a separate later-stage model with an appropriate prediction-time definition.
6. **Backend architecture after model approval:** separate Python inference service loads one trusted fitted pipeline at startup, validates the exact feature schema, returns actual class/probability and model provenance; reject unsupported insurance types. Gemini may summarize the model result and evidence but must not change its class or probability. Move Gemini secrets server-side before presenting the integration as secure.
7. **Before operational use:** execute the controlled Colab experiment plan; record exact Python, Scikit-learn, and Joblib training versions plus feature schema and threshold; evaluate on an untouched held-out set; and resolve the website feature mapping and prediction-time leakage concerns.

### Audit limitations

`outputs/model_metadata.json`, metrics, CSV comparison, executed notebook outputs, and the source CSV were inspected. Follow-up verification loaded the model with the matching scikit-learn version and made a genuine dataset-record prediction; the separate integration report records the exact output and API tests. No new model, threshold, SMOTE, or validation result is claimed. The project’s existing frontend and deployment files remain unchanged.
