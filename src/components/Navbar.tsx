import React, { useState, useEffect } from 'react';
import { ShieldCheck, BarChart2, Search, Info, Menu, X, Cpu } from 'lucide-react';
import { isGeminiConfigured } from '../services/geminiKey';
import { GeminiSettingsModal } from './GeminiSettingsModal';

interface NavbarProps { currentPage: 'dashboard' | 'claim-analysis' | 'about'; onNavigate: (page: 'dashboard' | 'claim-analysis' | 'about') => void; }

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(isGeminiConfigured());
  useEffect(() => { const update = () => setHasGeminiKey(isGeminiConfigured()); window.addEventListener('gemini_key_updated', update); return () => window.removeEventListener('gemini_key_updated', update); }, []);
  const navItems: {id:'dashboard'|'claim-analysis'|'about';label:string;icon:React.ReactNode}[] = [
    {id:'dashboard',label:'Overview',icon:<BarChart2 className="w-4 h-4"/>}, {id:'claim-analysis',label:'Claim analysis',icon:<Search className="w-4 h-4"/>}, {id:'about',label:'System spec',icon:<Info className="w-4 h-4"/>},
  ];
  const go = (page:'dashboard'|'claim-analysis'|'about') => { onNavigate(page); setMobileMenuOpen(false); };
  return <>
    <header className="sticky top-0 z-40 border-b border-[#e1e1e1] bg-[#f8f9fa]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="h-[4.5rem] flex items-center justify-between">
          <button id="nav-brand-logo" onClick={()=>go('dashboard')} className="flex items-center gap-3 text-left">
            <span className="w-9 h-9 border border-[#d6d6d6] rounded-sm flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-[#9e563e]"/></span>
            <span><span className="block text-sm font-bold tracking-[.13em] text-[#171717]">VERIDEX</span><span className="block text-[10px] tracking-[.13em] text-[#888]">CLAIM INTELLIGENCE</span></span>
          </button>
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map(item=>{const active=currentPage===item.id;return <button key={item.id} id={`nav-link-${item.id}`} onClick={()=>go(item.id)} className={`px-3 py-2 rounded-sm inline-flex items-center gap-2 text-sm transition-colors ${active?'text-[#8d4934] bg-[#f0efec]':'text-[#555] hover:bg-white hover:text-[#171717]'}`}>{item.icon}{item.label}</button>})}
            <span className="h-6 w-px bg-[#ddd] mx-3"/>
            <button type="button" onClick={()=>setGeminiModalOpen(true)} className={`inline-flex items-center gap-2 px-3 py-2 border rounded-sm text-xs transition-colors ${hasGeminiKey?'border-[#c8dacb] bg-[#eef5ef] text-[#3e6847]':'border-[#ddd] bg-white text-[#666] hover:border-[#aaa]'}`} title="Configure Google Gemini 2.5 Flash API Key"><Cpu className="w-3.5 h-3.5"/><span>Gemini {hasGeminiKey?'active':'settings'}</span><span className={`w-1.5 h-1.5 rounded-full ${hasGeminiKey?'bg-emerald-500':'bg-[#bbb]'}`}/></button>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <button type="button" onClick={()=>setGeminiModalOpen(true)} className="p-2 border border-[#ddd] bg-white rounded-sm" title="Configure Gemini AI"><Cpu className="w-4 h-4 text-[#9e563e]"/></button>
            <button id="nav-mobile-toggle" type="button" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#555]" aria-expanded={mobileMenuOpen} aria-label="Toggle navigation menu">{mobileMenuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
          </div>
        </div>
      </div>
      {mobileMenuOpen&&<div className="md:hidden border-t border-[#e1e1e1] bg-white px-5 py-3 space-y-1">{navItems.map(item=><button key={item.id} id={`mobile-nav-link-${item.id}`} onClick={()=>go(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 text-left text-sm ${currentPage===item.id?'text-[#8d4934] bg-[#f5f1eb]':'text-[#555]'}`}>{item.icon}{item.label}</button>)}<button type="button" onClick={()=>{setMobileMenuOpen(false);setGeminiModalOpen(true)}} className="w-full flex items-center gap-3 px-3 py-3 text-left text-sm text-[#555]"><Cpu className="w-4 h-4"/>Gemini settings <span className="ml-auto text-xs">{hasGeminiKey?'ACTIVE':'SETUP'}</span></button></div>}
    </header>
    <GeminiSettingsModal isOpen={geminiModalOpen} onClose={()=>setGeminiModalOpen(false)}/>
  </>;
};
