# Model and Frontend Integration Test Report

**Run date:** 2026-11-02  
**Status:** Local frontend integration with the existing Random Forest model is implemented and verified. Nothing was deployed, and the model was not retrained or replaced.

## Implemented workflows

- **Normal Claim Submission** retains the existing intake and assessment flow. A notice explains that the Random Forest is not used there because the form does not contain the complete model schema and includes no model prediction for an incomplete claim.
- **ML Demonstration Mode** is available as a separate navigation item and dashboard action. It loads the model schema from FastAPI, collects all 32 features in grouped sections, marks investigation-stage features, validates the full record, and submits it to `POST /api/predict`.
- **Historical demonstration records** are loaded from the original local CSV by `GET /api/demo-records`. They are visibly identified as historical examples; the dataset label and model prediction are shown separately. No values are fabricated or silently supplied.
- The actual Random Forest result and probability remain authoritative. Gemini receives the result for explanation only and is instructed not to replace the class/probability or state that a claim is definitively fraudulent. The result remains visible if Gemini is unavailable.

See [MODEL_FEATURE_MAPPING.md](MODEL_FEATURE_MAPPING.md) for the 32-row feature audit and category details.

## Python environment and dependencies

- Python **3.11.9** was verified and the backend virtual environment is `backend/.venv`.
- The Python launcher/alias is not reliably available in the current Codex shell, so commands used the virtual environment's explicit interpreter: `backend/.venv/Scripts/python.exe`.
- `backend/requirements.txt` was installed in the venv; `pip check` reported **No broken requirements found**.
- `scikit-learn==1.6.1` is pinned to match the serialized estimator's runtime compatibility. The earlier unconstrained install resolved a newer release that could not deserialize the artifact.

## Existing model verification

- Loaded `backend/models/best_model.joblib` with the fitted preprocessing pipeline and metadata. Classifier: **Random Forest**, 32 inputs, decision threshold **0.50**.
- Model artifact size: **49,315,643 bytes**. SHA-256: `8d32f201b93fc5788607af118db33a2d0e80bdfd4e1d07c251727fa01f722764`, matching `outputs/best_model.joblib`.
- Actual inference on a genuine source-dataset record (target withheld from features): prediction `0` (**Legitimate Claim**), fraud probability `0.05772150463714166`.
- The audited held-out results remain the existing results: **94.13% accuracy and 3.78% fraud recall**. The workflow surfaces this low-recall limitation; this task did not retrain the estimator or change its threshold.

## Test results

### Backend suite

Command: `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` from the repository root.

**Result: 16 passed, 1 warning** in 5.74 seconds. The warning is Starlette's deprecation notice for using `httpx` through `TestClient`.

The tests cover model loading and inference, endpoint behavior, required/invalid features, unsupported insurance types, historical demo records, and Gemini behavior that preserves the ML prediction.

### Frontend checks

- `npm run lint` — **passed** (`tsc --noEmit`).
- `npm run build` — **passed**; Vite transformed 1,702 modules. It emits a bundle-size advisory for the 772.69 kB minified JavaScript chunk.

### Frontend-to-backend HTTP integration

Command: `npm run test:ml-integration` against the locally running FastAPI server.

**Result: passed.** The integration script imports the frontend API client and used actual HTTP requests against the backend. It verified:

- Runtime schema has 32 unique model features.
- Client-side missing-input validation reports all 32 omissions.
- Six complete genuine historical records (including both target classes) were retrieved and submitted for actual model inference.
- Invalid categorical and fractional numeric inputs are rejected; backend missing-input validation is rejected.
- Simulated backend outage is handled as an error, and the configured frontend origin passes CORS preflight.
- A genuine example produced actual prediction `0` with fraud probability `0.05772150463714166`.

The backend suite additionally covers model output consistency and Gemini fallback/authority behavior. The Gemini prompt/output contract was tested, but a live Gemini generation was **not** exercised because an API key was not configured for this run.

## Limitations and remaining items

- A browser-driven visual/UI submission was not verified in this environment; the local browser surface could not reach the loopback development servers. The TypeScript integration script did verify frontend API-client to live-backend communication over HTTP.
- Gemini's live service response remains unverified without a configured API key. Gemini failure leaves the actual ML result visible.
- The Random Forest is vehicle-only, has low fraud recall at its existing threshold, and uses investigation-sensitive features (`Fault`, `RepNumber`, `NumberOfSuppliments`). It is shown only in an academic demonstration workflow and should not be treated as a production claim decision.
- The Vite bundle-size advisory and Starlette/httpx deprecation warning remain; neither failed the requested checks.

## Files changed for this task

Frontend integration, schema/data demo endpoint, mapping/report documentation, tests, and the scikit-learn compatibility pin were changed. The model artifact was left byte-for-byte unchanged. No deployment was performed.
