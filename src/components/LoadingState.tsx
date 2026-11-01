import React from 'react';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { isGeminiConfigured } from '../services/geminiKey';

interface LoadingStateProps {
  insuranceType: 'car' | 'health';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ insuranceType }) => {
  const isGeminiActive = isGeminiConfigured();

  return (
    <div
      id="loading-state-container"
      className="bg-white rounded-xl border border-[#e1e1e1] shadow-xl shadow-black/20 p-8 sm:p-10 text-center max-w-lg mx-auto my-8 animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-[#9e563e]/10 animate-ping opacity-60"></div>
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#e1e1e1] border-t-amber-400 animate-spin"></div>
        {/* Center icon */}
        <div className="relative z-10 w-12 h-12 rounded-lg bg-[#9e563e]/10 border border-[#e1d7cb] text-[#9e563e] flex items-center justify-center">
          {isGeminiActive ? (
            <Sparkles className="w-6 h-6 animate-pulse" />
          ) : (
            <Cpu className="w-6 h-6 animate-pulse" />
          )}
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold font-sans text-[#171717] mb-2">
        {isGeminiActive ? 'Forensic analysis in progress' : 'Analyzing claim'}
      </h3>
      <p className="text-sm text-[#666] mb-6">
        Reviewing {insuranceType === 'car' ? 'vehicle' : 'health'} claim details and preparing a risk assessment.
      </p>

      {/* Progress step bar */}
      <div className="w-full bg-white rounded-full h-2 mb-4 overflow-hidden border border-[#e1e1e1]" aria-label="Analysis in progress">
        <div
          className="bg-[#9e563e] h-full w-1/3 rounded-full animate-pulse"
        ></div>
      </div>

      <div className="flex items-center justify-center space-x-2 text-xs font-sans text-[#674333] bg-[#9e563e]/5 py-2.5 px-3 rounded border border-[#e1d7cb]">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#9e563e]" />
        <span>{isGeminiActive ? 'Applying claim checks and optional AI review…' : 'Applying claim checks…'}</span>
      </div>
    </div>
  );
};
