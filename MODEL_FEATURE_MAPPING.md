# Random Forest Feature Mapping and Prediction-Time Audit

## Scope and source of truth

The exported `backend/models/best_model.joblib` is a Random Forest pipeline serialized with scikit-learn 1.6.1. Its metadata lists 32 predictors, and `GET /api/schema` reads accepted categories from the fitted encoder. Categorical choices in ML Demonstration Mode are loaded from that endpoint rather than copied into frontend constants. Numeric predictors were integer-valued in the source CSV and are validated as non-negative whole numbers. The actual source file is `dataset/fraud_oracle.csv/fraud_oracle.csv`; the target is `FraudFound_P` and is never submitted as a predictor.

The five project notebooks cover exploration, preprocessing, model training, evaluation, and prediction/export (`colab_ml_project/notebooks/01_...` through `05_...`, duplicated under `outputs/`). Export metadata records 15,420 source rows, a 12,336/3,084 train/test split, Random Forest selection, and threshold 0.50. The fitted preprocessing pipeline is stored with the estimator.

“Initial claim” means information ordinarily captured at first notice. “Requires investigation” flags data that may only be established after intake or case work. An unavailable value must not be guessed. Normal claim submission continues to use the existing heuristic flow; this model is invoked only in the separate demonstration workflow with a complete record.

## Complete feature table

| Model feature | Type and exact accepted values | Existing frontend field | Available at initial claim? | Requires investigation? | Handling |
|---|---|---|---|---|---|
| `Month` | Category: `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec` | None; form only has incident hour | Yes, if accident date is captured | No | Explicit demo selection using fitted category list; no normal-flow prediction |
| `WeekOfMonth` | Integer | None | Yes, if accident date is captured | No | Explicit demo integer; no normal-flow prediction |
| `DayOfWeek` | Category: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday` | None | Yes, if accident date is captured | No | Explicit demo selection |
| `Make` | Category: `Accura`, `BMW`, `Chevrolet`, `Dodge`, `Ferrari`, `Ford`, `Honda`, `Jaguar`, `Lexus`, `Mazda`, `Mecedes`, `Mercury`, `Nisson`, `Pontiac`, `Porche`, `Saab`, `Saturn`, `Toyota`, `VW` | `vehicleMake` | Usually, from vehicle record | No | Demo uses exact fitted spelling; no automatic brand aliases |
| `AccidentArea` | Category: `Rural`, `Urban` | City/state only | Sometimes; reporter or verified location source | No | Explicit demo selection; never infer from city/state string |
| `DayOfWeekClaimed` | Category: `0`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday` | None | Yes, if report date is captured; `0` is a trained category | No | Explicit demo selection, including exact `0` option |
| `MonthClaimed` | Category: `0`, `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec` | None | Yes, if report date is captured; `0` is a trained category | No | Explicit demo selection, including exact `0` option |
| `WeekOfMonthClaimed` | Integer | None | Yes, if report date is captured | No | Explicit demo integer |
| `Sex` | Category: `Female`, `Male` | `gender` | Usually, from policyholder record | No | Demo selection uses model labels, independent of form casing |
| `MaritalStatus` | Category: `Divorced`, `Married`, `Single`, `Widow` | `relationship` (not equivalent) | Usually, from policyholder record | No | Separate explicit demo selection; never map relationship to marital status |
| `Age` | Integer | `age` | Yes, if supplied/verified | No | Explicit demo integer |
| `Fault` | Category: `Policy Holder`, `Third Party` | None | Not reliably; fault can be unresolved at intake | **Yes / investigation-sensitive** | Separate marked investigation-stage demo input; no normal-flow prediction |
| `PolicyType` | Category: `Sedan - All Perils`, `Sedan - Collision`, `Sedan - Liability`, `Sport - All Perils`, `Sport - Collision`, `Sport - Liability`, `Utility - All Perils`, `Utility - Collision`, `Utility - Liability` | `policyCsl`, `collisionType` (not equivalent) | Yes, from authoritative policy record | No | Explicit demo selection; never infer from the form's CSL/collision fields |
| `VehicleCategory` | Category: `Sedan`, `Sport`, `Utility` | Make/model inputs only | Yes, from verified vehicle catalog | No | Explicit demo selection; do not infer from make/model text |
| `VehiclePrice` | Category: `less than 20000`, `20000 to 29000`, `30000 to 39000`, `40000 to 59000`, `60000 to 69000`, `more than 69000` | None | Potentially, from an authoritative valuation | No | Explicit demo selection; no price estimate from make/model |
| `PolicyNumber` | Integer | `policyNumber` (string) | Yes, from policy record | No | Numeric demo input; source dataset uses an integer identifier |
| `RepNumber` | Integer | None | Usually assigned after intake | **Yes / post-assignment** | Separate marked investigation-stage demo input |
| `Deductible` | Integer | `policyDeductible` | Yes, from policy record | No | Explicit demo integer |
| `DriverRating` | Integer | None | Potentially, from insurer policy system | No | Explicit demo integer from authoritative record only |
| `Days_Policy_Accident` | Category: `1 to 7`, `8 to 15`, `15 to 30`, `more than 30`, `none` | `monthsAsCustomer` (not equivalent) | Yes, if policy start and accident dates are available | No | Explicit demo category; no conversion from customer tenure |
| `Days_Policy_Claim` | Category: `8 to 15`, `15 to 30`, `more than 30`, `none` | None | Yes, if accident and report dates are available | No | Explicit demo category; use the model's exact accepted choices |
| `PastNumberOfClaims` | Category: `none`, `1`, `2 to 4`, `more than 4` | None | Yes, if verified insurer history is available | No | Explicit demo selection; do not assume no prior claims |
| `AgeOfVehicle` | Category: `new`, `2 years`, `3 years`, `4 years`, `5 years`, `6 years`, `7 years`, `more than 7` | `vehicleYear` (insufficient alone) | Yes, if vehicle year and incident date are known | No | Explicit demo selection; no current-year subtraction or inferred bin |
| `AgeOfPolicyHolder` | Category: `16 to 17`, `18 to 20`, `21 to 25`, `26 to 30`, `31 to 35`, `36 to 40`, `41 to 50`, `51 to 65`, `over 65` | `age` | Yes, if age is verified | No | Explicit demo selection; do not silently infer from `Age` |
| `PoliceReportFiled` | Category: `No`, `Yes` | `policeReportAvailable` | Yes, if known at report time | No | Explicit demo category; normal form value is not auto-mapped |
| `WitnessPresent` | Category: `No`, `Yes` | `witnesses` (count) | Usually, as reported | No | Explicit demo category; no count-to-category conversion in the ML path |
| `AgentType` | Category: `External`, `Internal` | None | Yes, from policy sales-channel record | No | Explicit demo selection |
| `NumberOfSuppliments` | Category: `none`, `1 to 2`, `3 to 5`, `more than 5` | None | Generally no at first notice | **Yes / claim handling stage** | Separate marked investigation-stage demo input; no normal-flow prediction |
| `AddressChange_Claim` | Category: `under 6 months`, `1 year`, `2 to 3 years`, `4 to 8 years`, `no change` | None | Potentially, with verified policy address history | No | Explicit demo selection; do not infer without source history |
| `NumberOfCars` | Category: `1 vehicle`, `2 vehicles`, `3 to 4`, `5 to 8`, `more than 8` | `numberOfVehicles` (incident vehicles, not policy cars) | Yes, from policy record | No | Explicit demo selection; never reuse incident vehicle count |
| `Year` | Integer | `vehicleYear` (vehicle model year, not accident year) | Yes, if accident date is known | No | Explicit demo integer; do not substitute vehicle model year |
| `BasePolicy` | Category: `All Perils`, `Collision`, `Liability` | `policyCsl`, `policyState` (not equivalent) | Yes, from authoritative policy record | No | Explicit demo selection; never map from CSL or state |

The API schema is the runtime source for exact category validation. The table records the observed categories from the fitted encoder; the UI does not accept categories outside that fitted set.

## Workflow behavior

- **Normal Claim Submission:** retains the existing vehicle/health intake form and heuristic/Gemini assessment. A visible note explains that it does not generate a Random Forest score because the full model schema is not present in the form.
- **ML Demonstration Mode:** separate navigation entry. It loads the fitted feature schema, requires all 32 values, marks `Fault`, `RepNumber`, and `NumberOfSuppliments` as investigation-stage fields, and posts only complete, validated records to `/api/predict`.
- **Historical examples:** `/api/demo-records` returns complete, genuine rows from the local source CSV, balanced across the target labels and clearly tagged as historical demonstration data. The actual target label is displayed separately from the model prediction. Changing a loaded value marks the example as modified.
- **Gemini:** can explain the returned ML class/probability using the existing frontend Gemini key configuration, or use the optional backend key. The prompt fixes the model output and prohibits Gemini from changing the class/probability or asserting fraud as fact. The ML result remains visible if Gemini is unconfigured or fails.

## Model limitation

This workflow is an academic demonstration, not an operational fraud gate. The audited model has 3.78% fraud recall at threshold 0.50, and it contains investigation-sensitive predictors. The demo makes those constraints visible and keeps them out of normal claim submission.
