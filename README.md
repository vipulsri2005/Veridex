# Insurance Fraud Detection System

AI-Powered Insurance Claim Risk Assessment Platform

---

## Project Overview

The **Insurance Fraud Detection System** is an AI/FinTech claim risk assessment platform designed to assist insurance carriers and claim examiners in identifying potentially fraudulent insurance claims. The application analyzes granular policyholder demographics, coverage limits, loss telemetry, and billing data to produce real-time anomaly scores, risk classifications (`LOW`, `MEDIUM`, `HIGH`), and recommended adjudication workflows.

The frontend operates completely independently in the browser without requiring a backend server, Python environment, or external database, utilizing an isolated mock prediction architecture.

---

## Features

- **Multi-Line Claim Risk Assessment**: Specialized assessment forms for both **Car Insurance** (22+ attributes covering collision types, police reporting, damage breakdown) and **Health Insurance** (18+ attributes covering procedure types, loss-to-inception proximity, and risk segmentation).
- **Persistent Insurance Type Selector**: Seamlessly switch between Car and Health insurance claims with persistent context.
- **Robust Frontend Validation**: Live, inline field validation preventing negative values, checking logical age and tenure bounds, enforcing required fields, and verifying chronological date consistency.
- **Intelligent Heuristic Prediction Engine**: Deterministic mock prediction service that evaluates realistic fraud markers (e.g., disproportionate claim-to-premium ratios, late-night incidents without police reports, short policy tenure).
- **One-Click Demo Presets**: Instant "Load High-Risk Sample" and "Load Low-Risk Sample" buttons on both forms for effortless testing and demonstration.
- **Interactive Risk Visualizer**: Visual probability gauge with dynamic color palettes for `HIGH` (Rose/Red), `MEDIUM` (Amber), and `LOW` (Emerald) risk tiers.
- **Detailed Factor Analysis**: Transparent breakdown of specific factors that influenced the score.
- **Adaptive Claim Summary**: Dynamic summary card displaying key user-entered attributes tailored to the selected line of insurance.
- **Modern FinTech Dashboard**: Clean typography, responsive card layouts, and simulated operational metrics.

---

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler / Tooling**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: CSS transitions & Motion

---

## Installation

To install all dependencies, run:

```bash
npm install
```

---

## Running the Application

To start the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Architecture

The system follows a strictly decoupled, service-oriented frontend architecture:

```text
Claim Form (UI)
      ↓
Prediction Service (`src/services/prediction.ts`)
      ↓
Mock Prediction Engine
      ↓
Result UI (`ResultCard` & `ClaimSummary`)
```

### Future Machine Learning Backend Integration

The prediction function `analyzeClaim(claimData)` is intentionally isolated from all UI components. To connect an external machine learning service (such as Scikit-Learn, PyTorch, or a FastAPI/Flask inference endpoint):

1. Open `src/services/prediction.ts`.
2. Replace the simulated heuristics in `analyzeClaim` with your HTTP API call:

```typescript
export async function analyzeClaim(claimData: ClaimData): Promise<PredictionResult> {
  const response = await fetch('https://api.insurance-fraud.internal/v1/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData),
  });

  if (!response.ok) {
    throw new Error(`Inference API error: ${response.statusText}`);
  }

  return await response.json();
}
```

3. No changes to the form controllers, validation rules, or result views are necessary.

---

## License

Apache-2.0
