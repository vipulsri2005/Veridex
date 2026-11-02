# Trained vehicle model integration

## Current artifact and project state

The real exported artifacts are in `outputs/best_model.joblib` and `outputs/model_metadata.json`. Metadata identifies a Random Forest, target `FraudFound_P`, threshold `0.5`, and 32 ordered training columns. The project currently has a React/Vite frontend and static Nginx deployment, but no backend API, database, or application authentication. The present prediction service is client-side heuristic logic, and Gemini is currently called from the browser.

## Form mapping assessment

The current vehicle form overlaps with only a subset of the model schema. Exact source columns and current form values:

| Training feature | Form mapping | Handling |
|---|---|---|
| `Make` | `vehicleMake` | Direct category value; model may see categories absent from training. |
| `Age` | `age` | Direct numeric value. |
| `PolicyNumber` | `policyNumber` | Direct value; this is an identifier used by the exported model. |
| `Deductible` | `policyDeductible` | Direct numeric value. |
| `PoliceReportFiled` | `policeReportAvailable` | Normalize Yes/No spelling to dataset labels. |
| `WitnessPresent` | `witnesses` | Convert to Yes/No based on whether count is greater than zero. |

The other 26 model fields are not collected in the current form: `Month`, `WeekOfMonth`, `DayOfWeek`, `AccidentArea`, `DayOfWeekClaimed`, `MonthClaimed`, `WeekOfMonthClaimed`, `Sex`, `MaritalStatus`, `Fault`, `PolicyType`, `VehicleCategory`, `VehiclePrice`, `RepNumber`, `DriverRating`, `Days_Policy_Accident`, `Days_Policy_Claim`, `PastNumberOfClaims`, `AgeOfVehicle`, `AgeOfPolicyHolder`, `AgentType`, `NumberOfSuppliments`, `AddressChange_Claim`, `NumberOfCars`, `Year`, and `BasePolicy`.

No defensible transformations can be made for these absent fields from the existing form. The fitted pipeline is expected to handle missing values, but the model's behavior when most fields are missing must be validated against actual held-out records before use. `PolicyNumber` inclusion may also cause memorization and requires careful evaluation. Do not interpret predictions as reliable until those checks pass.

## Integration plan and blocker

Use a separate Python API and load the trusted Joblib pipeline once at startup. Accept vehicle claims only, create a dataframe with the exact metadata feature order, and return the classifier's prediction/probability using the saved threshold. Keep health claims on their existing non-ML path and clearly label them as unsupported by this model. Gemini should explain the returned model result only and never replace it; its key must move to a backend environment variable before that is considered secure.

The current environment does not have a runnable Python interpreter, so the Joblib artifact cannot be loaded here to verify its embedded preprocessing, dependency versions, predictions on held-out test records, or API behavior. The Colab metadata also does not record the exact Scikit-learn version. For that reason no prediction endpoint is wired into the website yet: doing so would risk claiming an unverified model integration. Before completing the integration, run the model-loading and held-out inference check in an environment with a compatible Python/Scikit-learn stack, then resolve the missing-feature policy and move Gemini server-side.
