import React, { useState } from 'react';
import { PredictionResult, RiskLevel, ClaimData } from '../types';
import { RiskIndicator } from './RiskIndicator';
import { ClaimSummary } from './ClaimSummary';
import { GeminiCopilot } from './GeminiCopilot';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  Lightbulb, 
  SlidersHorizontal,
  Sparkles,
  ClipboardCheck,
  Copy,
  Check,
  FileQuestion,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ResultCardProps {
  result: PredictionResult;
  claimData?: ClaimData | null;
  onAnalyzeAnother: () => void;
  onBackToDashboard: () => void;
  onOpenGeminiSettings?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  claimData,
  onAnalyzeAnother,
  onBackToDashboard,
  onOpenGeminiSettings,
}) => {
  const { riskLevel, fraudProbability, prediction, recommendation, riskFactors, geminiAnalysis } = result;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getHeaderTheme = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bannerBg: 'bg-rose-50 border-rose-200',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          iconBg: 'bg-rose-600 text-white shadow-rose-200',
          titleColor: 'text-rose-950',
          descColor: 'text-rose-700',
          icon: <AlertTriangle className="w-8 h-8" />,
          actionBorder: 'border-rose-200 bg-rose-50/60',
          actionText: 'text-rose-900',
        };
      case 'MEDIUM':
        return {
          bannerBg: 'bg-amber-50 border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          iconBg: 'bg-amber-500 text-white shadow-amber-200',
          titleColor: 'text-amber-950',
          descColor: 'text-amber-700',
          icon: <AlertCircle className="w-8 h-8" />,
          actionBorder: 'border-amber-200 bg-amber-50/60',
          actionText: 'text-amber-900',
        };
      case 'LOW':
      default:
        return {
          bannerBg: 'bg-emerald-50 border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          iconBg: 'bg-emerald-600 text-white shadow-emerald-200',
          titleColor: 'text-emerald-950',
          descColor: 'text-emerald-700',
          icon: <CheckCircle2 className="w-8 h-8" />,
          actionBorder: 'border-emerald-200 bg-emerald-50/60',
          actionText: 'text-emerald-900',
        };
    }
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const theme = getHeaderTheme(riskLevel);

  return (
    <div id="prediction-result-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 duration-300">
      {/* Primary Result Banner */}
      <div className={`rounded-2xl border ${theme.bannerBg} p-6 sm:p-8 shadow-xs`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
                  Risk Level: {riskLevel}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Confidence: {result.confidenceScore}%
                </span>
                {geminiAnalysis && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    Gemini 2.5 Flash Verified
                  </span>
                )}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.titleColor}`}>
                {prediction}
              </h2>
            </div>
          </div>

          <div className="sm:text-right bg-white/80 backdrop-blur-xs px-5 py-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Fraud Probability
            </span>
            <span className={`text-3xl sm:text-4xl font-extrabold ${theme.titleColor}`}>
              {fraudProbability}%
            </span>
          </div>
        </div>

        {/* Visual Risk Indicator / Progress Meter */}
        <div className="pt-6">
          <RiskIndicator riskLevel={riskLevel} fraudProbability={fraudProbability} />
        </div>
      </div>

      {/* Recommended Action Card */}
      <div className={`rounded-xl border ${theme.actionBorder} p-5 sm:p-6 shadow-2xs`}>
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
              Adjudication Recommendation
            </h3>
            <p className={`text-base font-medium ${theme.actionText}`}>
              "{recommendation}"
            </p>
          </div>
        </div>
      </div>

      {/* GEMINI AI FORENSIC INTELLIGENCE (When Active) */}
      {geminiAnalysis ? (
        <div className="bg-gradient-to-b from-white via-indigo-50/20 to-white rounded-2xl border border-indigo-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Gemini AI Forensic Investigation
                </h3>
                <span className="text-xs text-slate-500">
                  Model: {geminiAnalysis.modelUsed}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <FileQuestion className="w-3.5 h-3.5 text-purple-600" />
              <span>Pattern: {geminiAnalysis.fraudPattern}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block mb-1">
              Forensic Executive Summary
            </span>
            <p className="text-sm text-indigo-950 leading-relaxed font-medium">
              "{geminiAnalysis.executiveSummary}"
            </p>
          </div>

          {/* Inconsistencies Discovered */}
          {geminiAnalysis.inconsistencies && geminiAnalysis.inconsistencies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Factual Inconsistencies & Telemetry Disparities
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {geminiAnalysis.inconsistencies.map((inc, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tactical SIU Interrogation Checklist */}
          {geminiAnalysis.siuChecklist && geminiAnalysis.siuChecklist.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                  <span>SIU Examiner Interrogation Checklist</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Click copy to paste into claim notes
                </span>
              </div>

              <div className="space-y-2">
                {geminiAnalysis.siuChecklist.map((question, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors shadow-2xs group"
                  >
                    <div className="flex items-start space-x-2.5 text-xs text-slate-800">
                      <span className="font-bold text-indigo-600 shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{question}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyQuestion(question, i)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                      title="Copy question"
                    >
                      {copiedIndex === i ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Prompt Card when Gemini is not configured */
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Unlock Deep AI Forensics with Gemini 2.5 Flash
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Connect your free Google Gemini API key to automatically generate forensic narratives, identify known fraud patterns, and receive customized SIU interview questions.
              </p>
            </div>
          </div>
          {onOpenGeminiSettings && (
            <button
              type="button"
              onClick={onOpenGeminiSettings}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors shrink-0"
            >
              Configure Gemini API
            </button>
          )}
        </div>
      )}

      {/* Key Heuristic Risk Flags / Insights */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Heuristic Risk Factor Analysis
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {riskFactors.length} rules evaluated
            </span>
          </div>

          <div className="space-y-3">
            {riskFactors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 block">
                    {factor.title}
                  </span>
                  <p className="text-xs text-slate-600">
                    {factor.description}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md shrink-0 uppercase ${
                    factor.impact === 'HIGH'
                      ? 'bg-rose-100 text-rose-700'
                      : factor.impact === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {factor.impact} Impact
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Gemini SIU Copilot Chat Drawer */}
      {claimData && (
        <GeminiCopilot
          claimData={claimData}
          result={result}
          onOpenSettings={onOpenGeminiSettings || (() => {})}
        />
      )}

      {/* Claim Summary Card */}
      <ClaimSummary result={result} />

      {/* Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          id="btn-back-dashboard"
          type="button"
          onClick={onBackToDashboard}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          id="btn-analyze-another"
          type="button"
          onClick={onAnalyzeAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Analyze Another Claim</span>
        </button>
      </div>
    </div>
  );
};
