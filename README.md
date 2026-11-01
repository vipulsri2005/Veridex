# Veridex 🛡️

### AI-Powered Insurance Claim Risk Assessment & Forensic Intelligence Platform

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8e75ff?logo=google&logoColor=white)](https://aistudio.google.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## 📌 Overview

**Veridex** is an enterprise-grade AI/FinTech claim risk assessment and forensic investigation platform designed to assist insurance carriers, claims adjusters, and Special Investigations Units (SIU) in identifying potentially fraudulent claims. 

By unifying **granular policyholder telemetry**, **coverage thresholds**, and **deterministic heuristic rules** with **Google Gemini 2.5 Flash** generative reasoning, Veridex delivers instant risk scoring, recognized fraud pattern classifications, and tactical interrogation checklists.

---

## ✨ Key Features

- **Multi-Line Insurance Support**:
  - 🚗 **Car Insurance**: Evaluates 22+ risk inspection vectors including collision mechanics, police report availability, incident timing, injury-to-property damage ratios, and policyholder tenure.
  - 🏥 **Health Insurance**: Analyzes 18+ policy variables including inception-to-loss proximity, procedure code severity vs. billed amounts, policy duration, and risk segmentation watchlists.
- **Dual-Engine Hybrid Scoring**:
  - **Deterministic Rule Engine**: Instant baseline risk tiering (`LOW`, `MEDIUM`, `HIGH`) and probability percentage (5% to 96%) that functions with zero external dependencies.
  - **Google Gemini 2.5 Flash Forensics**: Synthesizes natural-language executive briefings, flags factual telemetry discrepancies, and classifies claims into recognized industry fraud schemes.
- **SIU Examiner Interrogation Checklist**:
  - Automatically generates customized interview questions and document demands for claims adjusters with one-click clipboard copying.
- **Interactive Gemini SIU Copilot**:
  - An embedded conversational AI drawer allowing investigators to ask real-time questions (e.g., *"What medical records should I demand for this diagnosis?"* or *"Could this bumper damage be staged?"*).
- **In-App API Key Configuration**:
  - Configure your Gemini API key via environment variables (`VITE_GEMINI_API_KEY`) or directly through a secure in-app modal with live connection verification.
- **One-Click Demo Presets**:
  - Preloaded "High-Risk" and "Low-Risk" claim profiles on both vehicle and medical forms for instant demonstration.
- **Enterprise-Ready Deployment**:
  - Containerized deployments via **Docker** (`Dockerfile` + multi-stage Nginx).

---

## 🏗️ System Architecture

```text
       Claim Submission (Vehicle or Health Telemetry)
                             │
                             ▼
            Live Inline Validation & Normalization
                             │
                             ▼
              Deterministic Heuristic Engine
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       [No API Key]                  [API Key Active]
     Instant Baseline              Google Gemini 2.5 Flash
      Heuristic Flags                 Forensic Reasoning
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    Adjudication Dossier
           ┌─────────────────────────────────────┐
           │ • Risk Tier (LOW / MEDIUM / HIGH)   │
           │ • Anomaly Probability Percentage    │
           │ • Gemini Forensic Executive Briefing│
           │ • Recognized Modus Operandi Pattern │
           │ • Tactical SIU Interrogation Tasks  │
           │ • Interactive AI Copilot Chat       │
           └─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+ recommended
- **npm** or **bun** / **pnpm**

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/vipulsri2005/Veridex.git
cd Veridex
npm install
```

### 3. Configure Gemini AI (Optional)
Veridex runs standalone out of the box using client heuristics. To enable deep Gemini AI forensics, either:
- Create a `.env` file from `.env.example`:
  ```bash
  VITE_GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
  ```
- Or enter your key in the web app by clicking **"Enable Gemini AI"** in the top navigation bar.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

Veridex includes a production-ready, multi-stage Docker build utilizing an ultra-lightweight Nginx alpine image:

```bash
# Build the Docker image
docker build -t veridex .

# Run container on port 3000
docker run -d -p 3000:80 veridex
```

Access the application at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Directory Structure

```text
Veridex/
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # UI & Form components
│   │   ├── CarInsuranceForm.tsx      # 22-vector vehicle claim form
│   │   ├── HealthInsuranceForm.tsx   # 18-vector medical claim form
│   │   ├── ClaimForm.tsx             # Master form tab switcher
│   │   ├── ResultCard.tsx            # Main adjudication dossier & AI findings
│   │   ├── GeminiCopilot.tsx         # Interactive examiner chat assistant
│   │   ├── GeminiSettingsModal.tsx   # In-app API key manager & connection tester
│   │   ├── RiskIndicator.tsx         # Visual SVG probability gauge
│   │   ├── ClaimSummary.tsx          # Dynamic entered attributes review
│   │   ├── Navbar.tsx                # Brand header & Gemini status indicator
│   │   └── LoadingState.tsx          # Multistage analysis loader
│   ├── pages/
│   │   ├── Dashboard.tsx             # FinTech analytics overview & entry points
│   │   ├── ClaimAnalysis.tsx         # Analysis controller workflow
│   │   └── About.tsx                 # System methodology & documentation
│   ├── services/
│   │   ├── prediction.ts             # Hybrid heuristic + AI prediction service
│   │   ├── gemini.ts                 # Gemini 2.5 Flash SDK inference & copilot
│   │   └── geminiKey.ts              # API key resolution & event dispatching
│   ├── utils/
│   │   └── validation.ts             # Live inline validation logic
│   ├── data/
│   │   └── sampleData.ts             # Demo presets (high-risk & low-risk)
│   ├── types.ts                      # TypeScript schemas & analytical interfaces
│   ├── App.tsx                       # Root application shell
│   └── main.tsx                      # Entry point
├── Dockerfile              # Multi-stage container definition
├── nginx.conf              # SPA routing & caching configuration
├── vercel.json             # Vercel SPA rewrite configuration
└── vite.config.ts          # Vite bundler & Tailwind v4 plugin config
```

---

## 🛡️ License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.
