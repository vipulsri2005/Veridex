import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { ClaimData, PredictionResult } from '../types';
import { askGeminiCopilot } from '../services/gemini';
import { isGeminiConfigured } from '../services/geminiKey';

interface GeminiCopilotProps {
  claimData: ClaimData;
  result: PredictionResult;
  onOpenSettings: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const GeminiCopilot: React.FC<GeminiCopilotProps> = ({
  claimData,
  result,
  onOpenSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I'm your Gemini SIU Copilot for Claim ${result.claimReference}. Ask me any forensic question, request customized interrogation scripts, or ask for cross-referencing on suspicious telemetry.`,
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConfigured = isGeminiConfigured();

  const quickPrompts = [
    'What specific receipts should I demand?',
    'Could this vehicle damage be staged?',
    'Draft 3 interrogation questions for the claimant',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!isConfigured) {
      onOpenSettings();
      return;
    }

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      // Map previous messages to format expected by gemini
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      const reply = await askGeminiCopilot(claimData, result, userMsg.text, history);

      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Error reaching Gemini Copilot.';
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: `⚠️ ${errText}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header bar / accordion toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white hover:bg-indigo-50/90 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-[#171717] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Ask Gemini SIU Copilot
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                Live AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive forensic consultation on this claim
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-indigo-600">
          <span className="text-xs font-semibold hidden sm:inline-block">
            {isOpen ? 'Collapse Copilot' : 'Expand Copilot'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable chat body */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-indigo-100/70 space-y-4">
          {!isConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
              <span className="text-xs font-medium">
                Gemini API Key required to chat with the SIU Copilot.
              </span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-[#171717] font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                Configure Key
              </button>
            </div>
          )}

          {/* Messages list */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-[#171717] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-[#171717] rounded-br-xs'
                      : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-500 italic">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-[#171717] flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <span>Gemini is evaluating forensic patterns...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors border border-slate-200/60"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini about this claim, evidence requests, or fraud indicators..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[#171717] font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
