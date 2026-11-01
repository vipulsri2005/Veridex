import React, { useState, useEffect } from 'react';
import { ShieldAlert, BarChart3, FileSearch, Info, Menu, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { isGeminiConfigured } from '../services/geminiKey';
import { GeminiSettingsModal } from './GeminiSettingsModal';

interface NavbarProps {
  currentPage: 'dashboard' | 'claim-analysis' | 'about';
  onNavigate: (page: 'dashboard' | 'claim-analysis' | 'about') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(isGeminiConfigured());

  useEffect(() => {
    const updateKeyStatus = () => {
      setHasGeminiKey(isGeminiConfigured());
    };

    window.addEventListener('gemini_key_updated', updateKeyStatus);
    return () => window.removeEventListener('gemini_key_updated', updateKeyStatus);
  }, []);

  const navItems: { id: 'dashboard' | 'claim-analysis' | 'about'; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'claim-analysis', label: 'Claim Analysis', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleNav = (page: 'dashboard' | 'claim-analysis' | 'about') => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <button
              id="nav-brand-logo"
              onClick={() => handleNav('dashboard')}
              className="flex items-center space-x-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 -ml-1 transition-opacity hover:opacity-90"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                    Veridex
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                    AI SIU
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                  Fraud Risk & Forensic Intelligence
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Gemini AI Status / Settings Trigger */}
              <div className="pl-3 ml-2 border-l border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGeminiModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs border ${
                    hasGeminiKey
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                      : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
                  }`}
                  title="Configure Google Gemini 2.5 Flash API Key"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${hasGeminiKey ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
                  <span>{hasGeminiKey ? 'Gemini 2.5 Active' : 'Enable Gemini AI'}</span>
                </button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGeminiModalOpen(true)}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
                title="Configure Gemini AI"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                id="nav-mobile-toggle"
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGeminiModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Gemini AI Configuration</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                  {hasGeminiKey ? 'Active' : 'Setup'}
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Gemini Settings Modal */}
      <GeminiSettingsModal
        isOpen={geminiModalOpen}
        onClose={() => setGeminiModalOpen(false)}
      />
    </>
  );
};
