import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Cpu, 
  BarChart, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Code2,
  Lock,
  Layers
} from 'lucide-react';

export const About: React.FC = () => {
  const processSteps = [
    {
      step: '01',
      title: 'Claim Information',
      description: 'The user submits granular customer demographics, policy coverage limits, and incident telemetry.',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
    },
    {
      step: '02',
      title: 'Data Processing',
      description: 'Input vectors are validated, normalized, and formatted into standardized analytical schemas.',
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
    },
    {
      step: '03',
      title: 'Fraud Risk Analysis',
      description: 'The scoring engine evaluates anomaly signals, discrepancy thresholds, and suspicious patterns.',
      icon: <BarChart className="w-6 h-6 text-indigo-600" />,
    },
    {
      step: '04',
      title: 'Risk Assessment',
      description: 'Outputs standardized risk tier (LOW/MEDIUM/HIGH), fraud probability, and recommended adjudication actions.',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
    },
  ];

  return (
    <div id="about-page" className="max-w-4xl mx-auto py-4 space-y-10 animate-in fade-in-50 duration-300">
      {/* What is this system? Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System Overview</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          What is this system?
        </h2>

        <blockquote className="border-l-4 border-indigo-600 pl-5 py-2 my-4 bg-slate-50 rounded-r-xl text-base sm:text-lg text-slate-700 font-medium italic">
          "Veridex is an AI/FinTech intelligence platform designed to assist insurance carriers and SIU investigators in detecting and adjudicating potentially fraudulent claims."
        </blockquote>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-4">
          Fraudulent claims cost the insurance industry tens of billions of dollars annually, inflating policy premiums for legitimate customers. 
          This platform provides an intuitive, high-velocity workbench where claims adjusters and fraud investigation teams can rapidly assess the risk profile of both automobile and health insurance claims.
        </p>
      </div>

      {/* How it works Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          How it works
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          The application processes claims through a four-stage assessment pipeline:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {processSteps.map((item, idx) => (
            <div
              key={item.step}
              className="relative bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-extrabold text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-md">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-lg bg-white shadow-2xs border border-slate-100">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {idx < processSteps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Standalone / Mock Disclaimer Box */}
      <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-6 sm:p-8">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-950 mb-1">
              Demonstration Environment Notice
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed mb-3">
              The current prediction functionality runs entirely in the browser using <strong>simulated and heuristic demo analysis</strong>.
              The application is <strong>not currently connected to a live machine-learning model or database</strong>.
            </p>
            <p className="text-xs text-amber-700">
              All statistics, predictions, and risk scores are generated on the client-side for demonstration and architectural evaluation purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture & ML Backend Integration Readiness */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Decoupled Architecture & Future ML Integration
          </h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          The prediction service is intentionally isolated in <code className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-xs text-indigo-700">src/services/prediction.ts</code> with a clean contract. 
          When integrating a real machine-learning backend (e.g. Scikit-learn, XGBoost, or PyTorch inference microservice), no changes are required to the user interface or form controllers:
        </p>

        {/* Visual Architecture Flow */}
        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
          <div className="text-slate-400">// Prediction pipeline flow:</div>
          <div className="text-indigo-400">Claim Form (UI)</div>
          <div className="pl-4 text-slate-500">↓ submits ClaimData</div>
          <div className="text-emerald-400">analyzeClaim(claimData) [Service Boundary]</div>
          <div className="pl-4 text-slate-500">↓ current: Mock Prediction Engine (isolated heuristics)</div>
          <div className="pl-4 text-slate-500">↓ future:  fetch('https://api.insurance-fraud.internal/predict', ...)</div>
          <div className="text-amber-400">Standardized PredictionResult Object</div>
          <div className="pl-4 text-slate-500">↓ rendered in</div>
          <div className="text-indigo-400">ResultCard Component</div>
        </div>
      </div>
    </div>
  );
};
