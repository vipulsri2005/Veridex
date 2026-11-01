import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  X, 
  ShieldCheck,
  Cpu,
  Loader2
} from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey, clearGeminiApiKey } from '../services/geminiKey';
import { GoogleGenAI } from '@google/genai';

interface GeminiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isEnvKey, setIsEnvKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentKey = getGeminiApiKey();
      setApiKeyInput(currentKey);
      setIsSaved(currentKey.length > 0);

      const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
      const envKey = metaEnv?.VITE_GEMINI_API_KEY || metaEnv?.GEMINI_API_KEY;
      setIsEnvKey(Boolean(envKey && envKey.trim().length > 0));
      setTestStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKeyInput.trim()) {
      clearGeminiApiKey();
      setIsSaved(false);
      setTestStatus('idle');
      return;
    }

    saveGeminiApiKey(apiKeyInput.trim());
    setIsSaved(true);
    setTestStatus('idle');
  };

  const handleClear = () => {
    clearGeminiApiKey();
    setApiKeyInput('');
    setIsSaved(false);
    setTestStatus('idle');
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKeyInput.trim() || getGeminiApiKey();
    if (!keyToTest) {
      setErrorMessage('Please enter an API key to test.');
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      const ai = new GoogleGenAI({ apiKey: keyToTest });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Reply with the single word "VERIFIED" to confirm API connectivity.',
      });

      if (response.text && response.text.length > 0) {
        setTestStatus('success');
        // If test was successful and not saved yet, save it automatically
        saveGeminiApiKey(keyToTest);
        setIsSaved(true);
      } else {
        throw new Error('Empty response received from Gemini.');
      }
    } catch (err: unknown) {
      console.error('Gemini test failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to Google Gemini API.';
      setErrorMessage(msg);
      setTestStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl border border-[#d3d3d3] shadow-2xl shadow-black/50 max-w-lg w-full max-h-[calc(100dvh-2rem)] overflow-y-auto animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#f5f5f5] border-b border-[#e1e1e1] text-[#171717] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded text-[#777] hover:text-[#171717] hover:bg-[#f0efec] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Close Gemini configuration"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#9e563e]/10 border border-[#e1d7cb] flex items-center justify-center text-[#9e563e]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-sans tracking-tight">Gemini AI Configuration</h2>
              <span className="text-xs text-[#666] font-sans">Model: Google Gemini 2.5 Flash</span>
            </div>
          </div>
          <p className="text-xs text-[#666] leading-relaxed mt-3">
            Supercharge claim evaluations with forensic narrative generation, recognized fraud pattern classifications, and tactical SIU interrogation checklists.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSaved 
              ? 'bg-[#f0f6f0] border-emerald-500/20 text-[#386447]' 
              : 'bg-[#9e563e]/5 border-[#e1d7cb] text-[#2a2a2a]'
          }`}>
            {isSaved ? (
              <CheckCircle2 className="w-5 h-5 text-[#477a53] shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#9e563e] shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold">
                {isSaved ? 'Gemini AI Integration Active' : 'Heuristic Engine Only (Gemini Inactive)'}
              </p>
              <p className="text-[#666] mt-0.5 leading-relaxed">
                {isSaved 
                  ? 'All new claims will be analyzed with Gemini 2.5 Flash alongside deterministic heuristics.' 
                  : 'Add your Gemini API key below to unlock AI forensic breakdowns and live Copilot assistance.'}
              </p>
            </div>
          </div>

          {/* Key Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans font-bold text-[#666] uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777]">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setIsSaved(false);
                  setTestStatus('idle');
                }}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-4 py-2.5 rounded border border-[#d3d3d3] bg-white text-[#171717] placeholder:text-[#888] text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/70 font-sans"
              />
            </div>
            {isEnvKey && (
              <p className="text-[11px] text-[#777] italic">
                Environment key detected from configuration files.
              </p>
            )}
          </div>

          {/* Test Status feedback */}
          {testStatus === 'testing' && (
            <div className="flex items-center space-x-2 text-xs text-[#674333] bg-[#9e563e]/5 p-2.5 rounded border border-[#e1d7cb]">
              <Loader2 className="w-4 h-4 animate-spin text-[#9e563e]" />
              <span>Verifying API key connectivity with Google Gemini...</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="flex items-center space-x-2 text-xs text-[#386447] bg-[#f0f6f0] p-2.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-[#477a53] shrink-0" />
              <span>Connection verified successfully! Gemini 2.5 Flash is ready.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="flex items-start space-x-2 text-xs text-[#9c3c3c] bg-[#fbf1f0] p-2.5 rounded border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-[#a14a45] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Connection Failed:</span>
                <span className="text-[11px] text-[#9c3c3c]/80 break-all">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#e1e1e1]">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !apiKeyInput.trim()}
              className="px-4 py-2 rounded text-xs font-sans font-semibold text-[#444] bg-[#f5f5f5] hover:bg-[#eaeaea] border border-[#d3d3d3] disabled:opacity-50 transition-colors inline-flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded text-xs font-sans font-bold text-white bg-[#9e563e] hover:bg-[#84432f] transition-colors ml-auto shadow-lg shadow-amber-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Save Key
            </button>

            {isSaved && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded text-xs font-bold text-[#a14a45] hover:bg-rose-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                title="Remove API Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Help link */}
          <div className="pt-2 text-center">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-[#9e563e] hover:text-[#674333] font-sans font-semibold focus-visible:outline-none focus-visible:underline"
            >
              <span>Get a free Gemini API Key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
