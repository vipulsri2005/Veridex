import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { isGeminiConfigured } from '../services/geminiKey';

interface LoadingStateProps {
  insuranceType: 'car' | 'health';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ insuranceType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isGeminiActive = isGeminiConfigured();

  const steps = [
    'Parsing insurance claim telemetry...',
    insuranceType === 'car'
      ? 'Evaluating vehicle collision severity and policy limits...'
      : 'Cross-verifying procedure costs and policy inception dates...',
    isGeminiActive
      ? 'Invoking Gemini 2.5 Flash for forensic reasoning & pattern matching...'
      : 'Synthesizing heuristic risk assessment & anomaly probability...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      id="loading-state-container"
      className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-60"></div>
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        {/* Center icon */}
        <div className="relative z-10 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
          {isGeminiActive ? (
            <Sparkles className="w-6 h-6 animate-pulse text-indigo-100" />
          ) : (
            <Cpu className="w-6 h-6 animate-pulse" />
          )}
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        {isGeminiActive ? 'AI Forensic Analysis in Progress...' : 'Analyzing claim...'}
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        {isGeminiActive
          ? 'Running hybrid heuristic scoring and Gemini 2.5 Flash forensic intelligence.'
          : 'Executing fraud risk prediction model on submitted claim attributes.'}
      </p>

      {/* Progress step bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-xs font-medium text-indigo-700 bg-indigo-50 py-2 px-3 rounded-lg border border-indigo-100">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>{steps[currentStep]}</span>
      </div>
    </div>
  );
};
