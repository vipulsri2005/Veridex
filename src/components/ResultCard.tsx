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
  SlidersHorizontal,
  Cpu,
  ClipboardCheck,
  Copy,
  Check,
  FileText
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
          bannerBg: 'bg-[#fbf1f0] border-[#e7cdca]',
          badgeBg: 'bg-white text-[#a14a45] border-[#e7cdca]',
          iconColor: 'text-[#a14a45]',
          titleColor: 'text-[#702f2b]',
          icon: <AlertTriangle className="w-6 h-6 text-[#a14a45]" />,
        };
      case 'MEDIUM':
        return {
          bannerBg: 'bg-[#f8f3eb] border-[#e5d8c1]',
          badgeBg: 'bg-white text-[#8b602c] border-[#e5d8c1]',
          iconColor: 'text-[#9e563e]',
          titleColor: 'text-[#70522a]',
          icon: <AlertCircle className="w-6 h-6 text-[#9e563e]" />,
        };
      case 'LOW':
      default:
        return {
          bannerBg: 'bg-[#f0f6f0] border-[#c8dacb]',
          badgeBg: 'bg-white text-[#3f7450] border-[#c8dacb]',
          iconColor: 'text-[#3f7450]',
          titleColor: 'text-[#345d3e]',
          icon: <CheckCircle2 className="w-6 h-6 text-[#3f7450]" />,
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
    <div id="prediction-result-view" className="space-y-4 max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      {/* Primary Result Banner */}
      <div className={`rounded border ${theme.bannerBg} p-5 sm:p-6`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e1e1e1]/60">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded border border-[#d3d3d3]/60 bg-[#f5f5f5] flex items-center justify-center shrink-0">
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans uppercase font-bold border ${theme.badgeBg}`}>
                  LEVEL: {riskLevel}
                </span>
                <span className="text-[11px] text-[#777] font-sans">
                  CONFIDENCE: {result.confidenceScore}%
                </span>
                {geminiAnalysis && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans bg-white text-[#444] border border-[#d3d3d3]">
                    <Cpu className="w-3 h-3 text-[#9e563e]" />
                    GEMINI-2.5-FLASH
                  </span>
                )}
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold font-sans tracking-tight ${theme.titleColor}`}>
                {prediction}
              </h2>
            </div>
          </div>

          <div className="sm:text-right bg-white px-4 py-2.5 rounded border border-[#e1e1e1]">
            <span className="text-[10px] font-sans font-semibold text-[#777] uppercase tracking-wider block">
              Anomaly Probability
            </span>
            <span className="text-3xl font-sans font-bold text-[#171717]">
              {fraudProbability}%
            </span>
          </div>
        </div>

        {/* Visual Risk Indicator */}
        <div className="pt-4">
          <RiskIndicator riskLevel={riskLevel} fraudProbability={fraudProbability} />
        </div>
      </div>

      {/* Adjudication Recommendation */}
      <div className="rounded border border-[#e1e1e1] bg-white p-4 text-xs font-sans">
        <div className="text-[10px] text-[#777] uppercase tracking-wider mb-1">
          Recommended Adjudication Directive
        </div>
        <p className="text-[#2a2a2a] font-medium leading-relaxed">
          "{recommendation}"
        </p>
      </div>

      {/* GEMINI AI FORENSIC INTELLIGENCE (When Active) */}
      {geminiAnalysis ? (
        <div className="bg-white rounded border border-[#e1e1e1] p-5 space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e1e1e1]">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#9e563e]" />
              <h3 className="text-xs font-bold text-[#2a2a2a] uppercase tracking-wider">
                Gemini Forensic Analysis // Investigation Output
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#9e563e]/10 text-[#9e563e] border border-[#d7b3a6]">
              <FileText className="w-3 h-3 text-[#9e563e]" />
              <span>PATTERN: {geminiAnalysis.fraudPattern}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-[#f5f5f5] rounded border border-[#191b22] p-3 text-xs">
            <span className="text-[10px] font-bold text-[#777] uppercase tracking-wider block mb-1">
              Forensic Narrative Summary
            </span>
            <p className="text-[#444] leading-relaxed">
              "{geminiAnalysis.executiveSummary}"
            </p>
          </div>

          {/* Inconsistencies Discovered */}
          {geminiAnalysis.inconsistencies && geminiAnalysis.inconsistencies.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-[#777] uppercase tracking-wider">
                Factual Disparities & Telemetry Anomalies
              </div>
              <div className="space-y-1">
                {geminiAnalysis.inconsistencies.map((inc, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-2 text-xs text-[#444] bg-[#f5f5f5] p-2.5 rounded border border-[#e1e1e1]"
                  >
                    <span className="text-[#9e563e] font-bold shrink-0">{'>'}</span>
                    <span className="leading-relaxed">{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tactical SIU Interrogation Checklist */}
          {geminiAnalysis.siuChecklist && geminiAnalysis.siuChecklist.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#666] font-bold uppercase tracking-wider text-[10px]">
                  <ClipboardCheck className="w-3.5 h-3.5 text-[#444]" />
                  <span>SIU Examiner Interrogation Directives</span>
                </div>
                <span className="text-[10px] text-[#777]">
                  Click icon to copy
                </span>
              </div>

              <div className="space-y-1.5">
                {geminiAnalysis.siuChecklist.map((question, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-2.5 rounded bg-[#f5f5f5] border border-[#e1e1e1] hover:border-[#d3d3d3] transition-colors"
                  >
                    <div className="flex items-start space-x-2 text-xs text-[#444]">
                      <span className="text-[#777] shrink-0 font-sans">[{i + 1}]</span>
                      <span className="leading-relaxed">{question}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyQuestion(question, i)}
                      className="p-1 rounded text-[#777] hover:text-[#2a2a2a] hover:bg-[#1a1c22] transition-colors shrink-0"
                      title="Copy question"
                    >
                      {copiedIndex === i ? (
                        <Check className="w-3.5 h-3.5 text-[#477a53]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
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
        <div className="bg-white rounded border border-[#e1e1e1] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans text-xs">
          <div>
            <span className="font-bold text-[#2a2a2a] block mb-0.5">
              Gemini AI Forensic Engine Offline
            </span>
            <span className="text-[#777] text-[11px] leading-relaxed">
              Configure your Gemini API key to generate automated forensic narratives, pattern classifications, and SIU checklists.
            </span>
          </div>
          {onOpenGeminiSettings && (
            <button
              type="button"
              onClick={onOpenGeminiSettings}
              className="px-3 py-1.5 rounded bg-[#f5f5f5] hover:bg-[#20232c] text-[#444] hover:text-[#171717] border border-[#d3d3d3] transition-colors shrink-0"
            >
              Configure Engine
            </button>
          )}
        </div>
      )}

      {/* Heuristic Factor Analysis */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="bg-white rounded border border-[#e1e1e1] p-5 font-sans space-y-3">
          <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-2 text-xs">
            <div className="flex items-center space-x-2 text-[#666]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">Heuristic Trigger Signals</span>
            </div>
            <span className="text-[11px] text-[#777]">
              {riskFactors.length} rules evaluated
            </span>
          </div>

          <div className="space-y-1.5">
            {riskFactors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded bg-[#f5f5f5] border border-[#e1e1e1]"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#2a2a2a] block">
                    {factor.title}
                  </span>
                  <p className="text-[11px] text-[#777] leading-relaxed">
                    {factor.description}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-sans font-bold rounded shrink-0 uppercase border ${
                    factor.impact === 'HIGH'
                      ? 'bg-rose-950/30 text-[#a14a45] border-rose-900/40'
                      : factor.impact === 'MEDIUM'
                      ? 'bg-[#f5f1eb] text-[#9e563e] border-amber-900/40'
                      : 'bg-teal-950/30 text-[#3f7450] border-[#c8dacb]'
                  }`}
                >
                  {factor.impact}
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

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 font-sans text-xs">
        <button
          id="btn-back-dashboard"
          type="button"
          onClick={onBackToDashboard}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded border border-[#e1e1e1] text-[#444] bg-white hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>

        <button
          id="btn-analyze-another"
          type="button"
          onClick={onAnalyzeAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded bg-[#9e563e] hover:bg-[#84432f] text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c0e]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Inspect Another Claim</span>
        </button>
      </div>
    </div>
  );
};
