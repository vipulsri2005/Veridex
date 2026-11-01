# Veridex Learning Roadmap

Follow this order and keep the repository open beside the guide. Read the named files, then explain the outcome aloud without looking. The code describes a browser prototype: there is no project backend, database, authentication, or trained ML model. “Backend working” below is therefore a deliberate architecture study of what is absent and what the external Gemini service does.

## 1. Basic project overview

- **Learn:** What Veridex does, the two claim lines, and the distinction between a rule-based demo score and an actual fraud verdict.
- **Why:** This is the first question in most evaluations; precise scope prevents overclaiming.
- **Open:** `README.md` for orientation, then `src/pages/Dashboard.tsx` and `src/services/prediction.ts` for implementation truth.
- **Focus:** `analyzeClaim`, `evaluateCarClaim`, `evaluateHealthClaim`.
- **You should be able to explain:** The app collects claim inputs, scores locally, and optionally attaches Gemini text; it is not a trained classifier.

## 2. Technologies used

- **Learn:** TypeScript, React, Vite, Tailwind, npm, browser APIs, Google GenAI SDK, Docker and Nginx basics.
- **Why:** Explain what each technology contributes and distinguish a package dependency from a feature actually used.
- **Open:** `package.json`, `vite.config.ts`, `tsconfig.json`, `src/index.css`, `Dockerfile`, `nginx.conf`.
- **Focus:** Scripts, dependencies, plugin setup, build/runtime stages.
- **You should be able to explain:** The app builds to static files; Express is declared but no app server is implemented.

## 3. Folder structure

- **Learn:** How source is divided into pages, components, services, utilities, types and data.
- **Why:** It makes it easier to find where a visible behavior lives.
- **Open:** `src/` and use the tree in `PROJECT_EXPLANATION.md`.
- **Focus:** Start from `src/main.tsx`, then follow imports from `src/App.tsx`.
- **You should be able to explain:** UI components render; services compute/call APIs; utility functions validate; types document compile-time contracts; demo data supplies initial form values.

## 4. Frontend working

- **Learn:** React components, props, state, controlled inputs, event handlers, conditional rendering, and SPA navigation.
- **Why:** The user’s journey and most application behavior are implemented in these modules.
- **Open:** `src/main.tsx`, `src/App.tsx`, `src/pages/Dashboard.tsx`, `src/pages/ClaimAnalysis.tsx`, `src/components/ClaimForm.tsx`.
- **Focus:** `currentPage`, `selectedInsuranceType`, `handleStartAnalysis`, form selector, conditional loading/form/result blocks.
- **You should be able to explain:** How a click changes state and how `ClaimAnalysis` selects which screen is visible.

## 5. Backend working (and absence)

- **Learn:** What a server/API process does, and how it differs from static hosting and Vite’s dev server.
- **Why:** Evaluators may assume a backend because the project uses an external AI API or lists Express.
- **Open:** Search `src/` for Express imports/routes; inspect `package.json`, `Dockerfile`, and `nginx.conf`.
- **Focus:** Docker’s builder stage and Nginx stage; no Node server command or API route exists.
- **You should be able to explain:** There is no Veridex backend. The browser computes scores and calls Gemini directly; Nginx only serves the built SPA.

## 6. Data processing

- **Learn:** Data types, discriminated unions, validation, numeric conversion, rules, score updates, and output mapping.
- **Why:** This is the core deterministic behavior and a likely technical viva topic.
- **Open:** `src/types.ts`, `src/utils/validation.ts`, `src/data/sampleData.ts`, `src/services/prediction.ts`.
- **Focus:** `ClaimData`, both validators, submit handler patterns, evaluator initial scores, each conditional rule, clamps and tier cutoffs.
- **You should be able to explain:** Which submitted fields affect the score, which only appear in summaries/prompts, and how factors are pushed into the result.

## 7. Gemini integration

- **Learn:** API keys, SDK initialization, prompt construction, JSON schema, inference, parsing, fallback, and LLM limitations.
- **Why:** Gemini is a prominent feature but is separate from the deterministic score.
- **Open:** `src/services/geminiKey.ts`, `src/services/gemini.ts`, `src/components/GeminiSettingsModal.tsx`, `src/components/GeminiCopilot.tsx`.
- **Focus:** `getGeminiApiKey`, `generateGeminiForensics`, `askGeminiCopilot`, `handleTestConnection`, `handleSend`.
- **You should be able to explain:** The browser sends claim context to `gemini-2.5-flash`; forensic JSON is optional; Gemini cannot update the tier; keys in localStorage/client bundles are exposed to the browser user.

## 8. Complete application workflow

- **Learn:** Trace one high-risk sample and one no-key path from page launch through result.
- **Why:** End-to-end explanation shows how modules collaborate rather than only describing isolated files.
- **Open:** `src/App.tsx`, `src/components/CarInsuranceForm.tsx` or `HealthInsuranceForm.tsx`, `src/pages/ClaimAnalysis.tsx`, `src/services/prediction.ts`, `src/components/ResultCard.tsx`.
- **Focus:** Submit -> validation -> callback -> typed `ClaimData` -> service -> result state -> conditional result UI.
- **You should be able to explain:** What happens on invalid data, valid data, missing key, and Gemini failure.

## 9. System architecture

- **Learn:** Browser SPA, provider API, deployment/static hosting, and data flow diagrams.
- **Why:** Architecture diagrams are a common evaluation deliverable.
- **Open:** Mermaid diagrams in `PROJECT_EXPLANATION.md`, then verify each node against its source file.
- **Focus:** Browser state, localStorage key lookup, Gemini external request, no server/database.
- **You should be able to explain:** Why the diagrams intentionally omit a project backend/database and distinguish Gemini as an external service.

## 10. Error handling

- **Learn:** Validation messages, rejected Promises, try/catch/finally, null fallback, parse errors, and UI recovery.
- **Why:** Real API and input failures are part of the workflow.
- **Open:** `src/pages/ClaimAnalysis.tsx`, `src/services/prediction.ts`, `src/services/gemini.ts`, `src/components/GeminiCopilot.tsx`, `src/components/GeminiSettingsModal.tsx`.
- **Focus:** Form errors, analysis catch/finally, forensic warning/null return, Copilot chat error message, test status states.
- **You should be able to explain:** The baseline often survives a Gemini forensic failure; not every malformed response is deeply validated.

## 11. Security and privacy

- **Learn:** Secret management, localStorage risks, XSS, data minimization, consent, authentication, authorization, server validation, and audit logging.
- **Why:** Claim data can contain personal and health information; a prototype’s data path must be explained honestly.
- **Open:** `src/services/geminiKey.ts`, `src/services/gemini.ts`, `src/components/GeminiSettingsModal.tsx`, `vite.config.ts`, `.env.example`, `.gitignore`.
- **Focus:** Browser key lookup/save, fields included in prompts, Vite `define`, and which files are ignored.
- **You should be able to explain:** The current key is not secret from the browser; claim details are sent to Gemini when enabled; a secure version needs a protected backend and privacy controls.

## 12. Advanced technical concepts

- **Learn:** Calibration, precision/recall, false positives/negatives, bias, prompt injection, structured outputs, deterministic rules versus probabilistic generation, and model evaluation.
- **Why:** These questions distinguish a technically mature explanation from an AI marketing description.
- **Open:** `src/services/prediction.ts`, `src/services/gemini.ts`, `src/types.ts`, limitations section in `PROJECT_EXPLANATION.md`.
- **Focus:** Random `confidenceScore`, fixed point arithmetic, `temperature`, schema request versus actual validation, missing labeled-data evaluation.
- **You should be able to explain:** The displayed percentages are not calibrated probabilities; constrained JSON controls shape, not truth; Gemini inference is not training.

## Suggested study schedule

### Pass 1: Orientation

Read the two-minute explanation and the architecture diagram. Memorize the scope sentence: “client-side rule demo, optional browser-to-Gemini enrichment, no app backend/database/trained model.”

### Pass 2: Trace a real code path

Follow `Dashboard -> ClaimAnalysis -> ClaimForm -> CarInsuranceForm -> validateCarInsuranceClaim -> analyzeClaim -> evaluateCarClaim -> ResultCard`. Repeat the shorter trace for a health claim.

### Pass 3: Explain algorithms on paper

Write the starting score, every condition, point delta, clamp and cutoff for both evaluators without looking. Then explain why these numbers do not represent calibrated probabilities.

### Pass 4: Trace Gemini separately

Follow key resolution, prompt/schema creation, SDK request, response parsing, optional attachment, and failure fallback. Then trace the Copilot path separately.

### Pass 5: Practice oral defense

Answer the 100 questions in `VIVA_PREPARATION.md`. Mark answers where you accidentally claim a feature the code does not implement. Practice the two- and five-minute scripts from `PROJECT_EXPLANATION.md`.

## Self-check before the evaluation

- Can you draw the architecture without adding a nonexistent backend or DB?
- Can you state each evaluator's exact rules and cutoffs?
- Can you identify which form values are not used by local scoring?
- Can you explain why Gemini cannot change the shown tier?
- Can you identify the key-storage and prompt-data privacy limitations?
- Can you distinguish installed packages from packages imported by the app?
- Can you describe fallback behavior for invalid input, Gemini errors and no key?
