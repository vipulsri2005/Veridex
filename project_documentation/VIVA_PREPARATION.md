# Veridex Viva Preparation

Answers are written for a spoken response: lead with the direct answer, then add the implementation detail. Keep the project’s limits explicit. This project is a browser demo with fixed heuristics and optional Gemini inference; it is not a deployed insurer platform or a trained fraud model.

## 1. Basic project questions

1. **Explain your project in two minutes.** Veridex is a React and TypeScript web demo for vehicle and health insurance claim review. It validates entered details, applies local threshold rules, and optionally calls Gemini 2.5 Flash for a structured narrative and investigation checklist. The displayed tier remains the local rule result. There is no database, custom backend, authentication, or trained ML model, so its scores are illustrative.
2. **Why did you choose this project?** It combines a practical domain problem with frontend engineering, data validation, rule-based reasoning, and an optional generative-AI integration that can be examined separately.
3. **What problem does it solve?** It demonstrates how selected claim attributes can be organized and checked consistently to help a reviewer notice possible risk indicators.
4. **Who is the intended user?** The interface is designed around claims adjusters or SIU reviewers, but the current implementation is a demo rather than a production workflow.
5. **What are the two supported insurance types?** Automobile and health insurance, selected in `ClaimForm.tsx` and represented by separate TypeScript claim interfaces.
6. **What is the main input?** A typed object containing customer, policy, incident, and claim details for the selected coverage line.
7. **What is the main output?** A `PredictionResult` with risk tier, percentage-style score, recommendation, rule factors, reference, timestamp, and summary, plus optional Gemini fields.
8. **What is the project’s main benefit?** It makes the implemented rules inspectable and presents them together with an optional natural-language explanation.
9. **Is the result a final fraud verdict?** No. It is a demo risk signal. A human reviewer and verified evidence are necessary; HIGH is not proof and LOW is not proof of legitimacy.
10. **What is the project’s current maturity?** A client-side prototype suitable for demonstrating a workflow, not a secure production claims system.

## 2. Architecture questions

11. **Explain the architecture.** `main.tsx` mounts `App`; `App` selects Dashboard, ClaimAnalysis, or About; forms validate locally; `prediction.ts` scores locally; `gemini.ts` optionally calls Google; ResultCard displays the output.
12. **Is it client-server architecture?** The UI is a client SPA and it calls a remote Gemini service when enabled. There is no custom Veridex backend in this repository.
13. **Where does navigation state live?** In `App.tsx` React state. It does not synchronize the selected page with the browser URL.
14. **How are the car and health forms selected?** `ClaimForm` switches component based on `insuranceType`; the submitted data is wrapped in a discriminated `ClaimData` union.
15. **What is a SPA?** A single-page application loads one HTML shell and changes rendered content in JavaScript. This app uses React state for page changes and has Nginx/Vercel fallbacks to `index.html`.
16. **What is the role of Vite?** It serves the development app and bundles the React/TypeScript source for production.
17. **What does Docker do here?** It builds static assets in a Node stage, then copies those assets to Nginx. It does not launch an Express API.
18. **What happens on a fresh browser reload?** The app returns to its initial dashboard page. Claim/result React state is lost; the Gemini key can remain in localStorage.

## 3. Programming and code questions

19. **Why TypeScript?** It checks relationships between data structures during development, such as which fields belong to car versus health claims. It does not validate untrusted runtime data automatically.
20. **What is a React component?** A reusable function that returns UI for its props/state. Examples include `ClaimForm`, `ResultCard`, and `GeminiSettingsModal`.
21. **What is a prop?** Input passed from a parent component. For example, ClaimAnalysis passes submit callbacks and the selected type into ClaimForm.
22. **What is React state?** Component-managed values that trigger rendering when changed. Forms use it for values/errors; ClaimAnalysis uses it for loading/result state.
23. **What does `useState` do?** It stores a value and gives a setter that schedules a re-render when called.
24. **What does `useEffect` do in this app?** It performs side effects after render, such as syncing key status, scrolling chat messages, or initializing the settings modal from stored configuration.
25. **What does `async/await` mean?** It lets Promise-based work be written in sequential-looking form without blocking browser rendering while a network call is pending.
26. **Why use `try/catch/finally`?** Catch handles rejected operations; finally ensures loading state is cleared even after failure.
27. **What is a discriminated union?** A TypeScript union distinguished by a shared literal field. Here `type: 'car'|'health'` determines the matching data shape.
28. **What does `JSON.stringify` do?** It converts JavaScript data into JSON text; this project embeds selected claim objects into Gemini prompt text.

## 4. Frontend questions

29. **How does the form keep values?** Inputs are controlled: their `value` comes from React state and `onChange` updates that state.
30. **When does validation occur?** On blur, after a field is touched and changed, and for all fields on submit.
31. **What happens if a form is invalid?** The validator returns messages; the form shows errors and scrolls/focuses the first field with the corresponding ID.
32. **Why are sample presets included?** They let a presenter quickly populate example records for demonstration. They are not real claims or a training dataset.
33. **How is loading shown?** ClaimAnalysis renders LoadingState while its async submit handler awaits analyzeClaim.
34. **How are results displayed?** ResultCard shows the baseline tier, percentage, recommendation, rule factors and claim summary; Gemini output is conditional.
35. **What does RiskIndicator show?** A probability-style bar and threshold labels: low 0–34, medium 35–64, high 65–100.
36. **How does the Gemini Copilot work in the UI?** It keeps a local message list, appends the user's question, calls the Copilot service, then appends a reply or an error message.
37. **What styling framework is used?** Tailwind CSS v4 utility classes, imported through `src/index.css` and enabled by the Vite plugin.

## 5. Backend questions

38. **What backend framework is implemented?** None for claim processing. Express appears in package metadata but there are no app Express routes or server startup in source.
39. **Why does the app work without a backend?** Heuristic scoring runs entirely in browser JavaScript; Gemini is an optional direct provider call.
40. **Is Vite the backend?** No. Vite provides development/build tooling and its dev server serves assets; it does not implement claim business APIs here.
41. **Is Nginx a backend?** It serves static files and performs SPA fallback. It does not calculate claim scores or store claims.
42. **Where should a production backend fit?** Between browser and Gemini/database, so it can authenticate users, validate input, protect keys, apply rate limits, and audit permitted actions.
43. **Does Express dependency mean an Express API exists?** No. A package being installed does not prove it is used; no Express import or route was found in application source.
44. **What is the main consequence of no server validation?** A user can bypass browser checks or alter submitted values; there is no trusted server boundary enforcing policy.

## 6. API questions

45. **What is an API?** A defined way for software systems to exchange requests and responses. The app uses Google's Gemini API through its SDK.
46. **Does Veridex expose a REST API?** No project-owned endpoint appears in this repository.
47. **What is a request and response?** A request asks a service to do work; a response carries the outcome. Gemini generation requests contain model/input/config and return generated content.
48. **What is JSON?** A text format for objects and arrays, used to serialize claim details and request constrained structured output.
49. **What API authentication is used?** A Gemini API key is passed when constructing `GoogleGenAI`; there is no end-user authentication.
50. **What does the settings connection test do?** It sends a short prompt to Gemini 2.5 Flash. A nonempty response is treated as success and the key is saved.
51. **What are HTTP methods?** Verbs such as GET and POST used by web APIs. The application source calls the SDK; it does not implement HTTP routes or explicitly construct the Gemini HTTP method.
52. **What happens if the Gemini API returns an unusable response?** Forensic generation catches failures or returns null when required fields are absent, and baseline scoring continues.

## 7. Gemini and generative AI questions

53. **What is Gemini?** Google's family of generative AI models exposed through products and APIs. This project requests Gemini 2.5 Flash.
54. **What is generative AI?** AI that generates new content, here a text narrative, pattern label, and suggested investigation checklist.
55. **What is an LLM?** A large language model predicts likely token sequences from context. Its fluent response can still be wrong.
56. **Which model string does the app use?** `gemini-2.5-flash` in `src/services/gemini.ts`.
57. **How is the forensic prompt structured?** It includes an examiner role, serialized claim data, baseline tier/percentage/rule flags, requested checks, and an output schema.
58. **Why request JSON schema output?** It encourages a predictable object shape that the UI can render by named fields.
59. **What response fields are expected?** Executive summary, fraud pattern, inconsistencies, SIU checklist, and recommended action.
60. **How does the app parse output?** It calls `JSON.parse(response.text || '{}')`, checks the summary and pattern, defaults optional arrays/action, and adds the model name.
61. **Does Gemini change the risk score?** No. It is attached after the heuristic baseline is calculated.
62. **What is prompt engineering?** Designing model instructions and context to guide output; the project uses role framing, facts, criteria, and schema.
63. **What is temperature?** A generation parameter that influences output variation. Forensic JSON uses 0.2 and Copilot uses 0.4; neither guarantees correctness.
64. **Are you training Gemini?** No. The project makes inference calls to an existing hosted model. It contains no training data pipeline or weight updates.
65. **What are Gemini's fraud-detection limitations?** It may infer unsupported narratives, can be affected by prompt injection, has no insurer database verification here, and does not establish fraud. A human must verify claims against evidence.

## 8. Database questions

66. **Which database is used?** None is configured or called by the source.
67. **Where is claim data stored?** Temporarily in React component state during the active browser session.
68. **Is localStorage a database?** It is a browser key/value persistence API, not a shared application database. Here it stores the Gemini key.
69. **Are claim references unique?** They are random-looking client values, not database-enforced unique identifiers; collisions are theoretically possible.
70. **How would a database be added?** Add an authenticated server API, schema/migrations, access controls, encryption and retention rules; the browser should not connect directly to a privileged database.

## 9. Security questions

71. **How is the API key protected?** In the current code it is not protected from the browser user: it is stored in localStorage or embedded as a build-time client value.
72. **Why is localStorage risky for secrets?** Any same-origin script running in the page can read it; an XSS vulnerability could expose it.
73. **How would you secure it?** Keep provider credentials on a server, authenticate requests, restrict usage, add quotas/rate limits, and store the key in deployment secret management.
74. **What sensitive information is sent to Gemini?** The forensic call sends selected demographics, policy/incident/vehicle/financial details; Copilot sends the full claim data object and baseline context.
75. **Is there a privacy/consent feature?** None was found in the application source. A real implementation needs explicit disclosure and data minimization/retention controls.
76. **Is there authentication?** No login, session, role, or authorization mechanism is implemented.
77. **Can client-side validation be trusted for security?** No. It improves user experience but can be bypassed; trusted validation belongs on the server too.
78. **Does JSON schema prevent hallucination?** No. It constrains format, not factual truth. Outputs still need verification.

## 10. Practical implementation questions

79. **What happens after clicking Analyze?** The form validates; on success ClaimAnalysis sets loading, creates `{type,data}`, calls analyzeClaim, then shows the result.
80. **How does scoring choose the algorithm?** It checks the `ClaimData.type` discriminator.
81. **What is a vehicle example risk rule?** Claim-to-annual-premium ratio above 50 adds 26 points and a HIGH-impact factor.
82. **What is a health example risk rule?** A loss within 14 days of policy inception adds 30 points and a HIGH-impact factor.
83. **What if there is no Gemini key?** Local scoring runs and returns after an 800 ms demo delay.
84. **What if forensic Gemini fails?** `generateGeminiForensics` catches and returns null; user sees baseline results without AI enrichment.
85. **What if Copilot fails?** GeminiCopilot catches the error and adds it as an assistant message in the conversation.
86. **How are risk factors created?** Each rule directly pushes a title, explanation, and impact into a list when its condition matches.
87. **How are time and reference generated?** Timestamp uses `new Date().toISOString()` and reference combines line prefix, current year, and `Math.random` number.
88. **How does the result claim summary get its data?** The evaluator maps selected input fields to `claimSummary`; ClaimSummary renders the returned object.

## 11. Limitations and future improvement questions

89. **What is the biggest limitation?** The scoring rules and displayed percent have not been calibrated or evaluated against labeled real claims.
90. **Why can’t you call this a machine-learning detector?** There is no trained predictive model, dataset, or inference artifact for the score; it is explicit if/else logic.
91. **Why are capability counts not real metrics?** They describe static supported lines/vector counts; the app has no telemetry database or live operational statistics.
92. **What does the confidence number mean?** It is randomly generated in code, so it is only demo decoration and should not be interpreted as statistical confidence.
93. **What would you build first for production?** A protected backend to keep the Gemini key secret and enforce identity, authorization, validation, rate limits, and privacy policy.
94. **How would you improve the score?** Define measurable labels, collect lawful representative data, establish transparent baseline evaluation, test bias/calibration, then validate rules or train/evaluate a model.
95. **What should be done with AI responses?** Validate the returned structure, show uncertainty and source context, avoid unsupported conclusions, and require a reviewer to check evidence.

## 12. Difficult technical questions

96. **Why does “probability” not mean calibrated probability here?** The code sums hand-picked points then clamps/maps the number to a 0–100-style display. There is no statistical model estimating frequency conditioned on data, nor calibration study.
97. **What is the fallback guarantee?** For expected Gemini forensic exceptions, the service returns the previously computed baseline; this does not cover every possible UI/runtime failure, but it avoids making AI a prerequisite for that path.
98. **What if a zero premium is entered?** The validators permit zero because they reject only negative premium values. Scoring uses `Number(premium) || 1`, so zero becomes denominator 1 and may inflate the ratio. This is a code-level edge case, not a documented rule intention.
99. **Is response schema validation complete?** No. The SDK receives a schema request, but after parsing, code mostly checks that summary and pattern are truthy; TypeScript casting does not validate runtime types.
100. **How do you explain the AI/rules boundary?** Rules own the displayed tier and score. Gemini receives that baseline and produces optional explanatory fields. Its response is not fused into or recalibrated against the risk score.

## Final oral checklist

- Start by saying “browser-based prototype” and “decision support demo.”
- Describe the validator, two local scoring functions, and optional Gemini path separately.
- Say the AI request originates in the browser and that the key is not securely hidden.
- Do not claim a database, backend, authentication, trained ML, live statistics, or production-grade security.
- Explain that the score is a hand-authored points total, not a calibrated probability.
- End with human review, privacy, and secure server-side integration as future work.
