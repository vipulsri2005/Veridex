# Trained vehicle model integration

## Current artifact and project state

The real exported artifacts are in `outputs/best_model.joblib` and `outputs/model_metadata.json`; a byte-for-byte copy is staged in `backend/models/`. Metadata identifies a Random Forest, target `FraudFound_P`, threshold `0.5`, and 32 ordered training columns. The project has a React/Vite frontend and static Nginx deployment, but had no API backend before this phase. A separate FastAPI service has now been scaffolded in `backend/`, including startup model loading, schema/category validation, prediction and optional server-side Gemini explanation. It is not yet wired to the existing frontend. There is no existing application authentication. The existing heuristic service and browser Gemini flow remain unchanged.

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

## Current integration state and blocker

Use a separate Python API and load the trusted Joblib pipeline once at startup. Accept vehicle claims only, create a dataframe with the exact metadata feature order, and return the classifier's prediction/probability using the saved threshold. Keep health claims on their existing non-ML path and clearly label them as unsupported by this model. Gemini should explain the returned model result only and never replace it; its key must move to a backend environment variable before that is considered secure.

The current environment does not have a runnable Python interpreter, so the Joblib artifact cannot be loaded here to verify its embedded preprocessing, dependency versions, predictions on held-out test records, or API behavior. The Colab metadata also does not record the exact Scikit-learn version. The new API code has not been executed, and the frontend is intentionally not connected to an unverified API. The complete 32-feature form/schema capture is also not implemented yet; the existing form supplies only a subset and some model fields are unavailable at claim submission. Before wiring this service into the live claim flow, validate the model load and actual held-out predictions in a compatible Python environment, collect/verify all required claim-time fields, and remove the existing browser-side Gemini key path in favor of server-only configuration. The model's recorded 3.78% recall should be clearly disclosed as a demonstration limitation.
