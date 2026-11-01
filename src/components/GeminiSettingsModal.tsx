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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Gemini AI Configuration</h2>
              <span className="text-xs text-indigo-200">Model: Google Gemini 2.5 Flash</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Supercharge claim evaluations with forensic narrative generation, recognized fraud pattern classifications, and tactical SIU interrogation checklists.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isSaved 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            {isSaved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold">
                {isSaved ? 'Gemini AI Integration Active' : 'Heuristic Engine Only (Gemini Inactive)'}
              </p>
              <p className="text-slate-600 mt-0.5">
                {isSaved 
                  ? 'All new claims will be analyzed with Gemini 2.5 Flash alongside deterministic heuristics.' 
                  : 'Add your Gemini API key below to unlock AI forensic breakdowns and live Copilot assistance.'}
              </p>
            </div>
          </div>

          {/* Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            {isEnvKey && (
              <p className="text-[11px] text-slate-500 italic">
                Environment key detected from configuration files.
              </p>
            )}
          </div>

          {/* Test Status feedback */}
          {testStatus === 'testing' && (
            <div className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Verifying API key connectivity with Google Gemini...</span>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Connection verified successfully! Gemini 2.5 Flash is ready.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="flex items-start space-x-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Connection Failed:</span>
                <span className="text-[11px] break-all">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !apiKeyInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors inline-flex items-center space-x-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ml-auto shadow-xs"
            >
              Save Key
            </button>

            {isSaved && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
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
              className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
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
