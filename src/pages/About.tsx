import React from 'react';
import { ShieldCheck, FileText, Cpu, BarChart3, AlertCircle, Sparkles, Monitor, ArrowDown } from 'lucide-react';

const stages = [
  { title:'Claim information', text:'The user enters vehicle or health claim, policy, and incident details.', icon:FileText },
  { title:'Local risk checks', text:'Input is evaluated by the application’s deterministic heuristic rules.', icon:Cpu },
  { title:'Result and context', text:'The interface presents a risk score, risk band, and contributing factors. Gemini may add narrative context when configured.', icon:BarChart3 },
];

export const About: React.FC = () => <div id="about-page" className="max-w-5xl mx-auto py-8 sm:py-14 space-y-16 sm:space-y-20 animate-in fade-in-50 duration-300">
  <header>
    <p className="eyebrow"><span>01</span> / SYSTEM SPECIFICATION</p>
    <h1 className="display-title mt-6 max-w-4xl">How Veridex <em>works.</em></h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#555]">A browser-based insurance claim review interface that combines transparent heuristic scoring with optional Gemini-generated analysis.</p>
  </header>

  <section className="spec-panel">
    <div className="eyebrow"><ShieldCheck className="w-4 h-4"/> SYSTEM OVERVIEW</div>
    <blockquote className="mt-6 border-l-2 border-[#9e563e] pl-5 py-1 font-serif italic text-xl sm:text-2xl leading-relaxed text-[#272727]">“Veridex supports insurance teams as they review potential fraud indicators in vehicle and health claims.”</blockquote>
    <p className="mt-6 max-w-3xl leading-7 text-[#555]">The baseline score is computed in the browser from the submitted claim fields using deterministic rules. If a Gemini API key is configured, the application can request additional narrative analysis. That optional response supplements the baseline and does not alter its score.</p>
  </section>

  <section>
    <p className="eyebrow"><span>02</span> / ASSESSMENT FLOW</p>
    <h2 className="font-serif text-3xl mt-4">From claim details to review</h2>
    <div className="mt-7 grid md:grid-cols-3 border-y border-[#e1e1e1]">
      {stages.map((stage,i)=><article key={stage.title} className="py-7 md:px-7 first:md:pl-0 border-b md:border-b-0 md:border-r last:border-0 border-[#e1e1e1]">
        <div className="flex items-center justify-between text-[#9e563e]"><span className="font-mono text-xs">0{i+1}</span><stage.icon className="w-5 h-5"/></div>
        <h3 className="font-serif text-xl mt-6">{stage.title}</h3><p className="mt-2 text-sm leading-6 text-[#666]">{stage.text}</p>
      </article>)}
    </div>
  </section>

  <section>
    <p className="eyebrow"><span>03</span> / IMPLEMENTATION</p>
    <h2 className="font-serif text-3xl mt-4">A lightweight client application</h2>
    <div className="mt-7 grid md:grid-cols-2 gap-5">
      <article className="feature-card"><div className="eyebrow"><Monitor className="w-4 h-4"/> APPLICATION</div><p className="mt-5 leading-7 text-[#555]">The interface is built with React, TypeScript, and Vite, styled with Tailwind CSS. Claim details are evaluated in the browser by the local prediction service.</p></article>
      <article className="feature-card"><div className="eyebrow"><Sparkles className="w-4 h-4"/> OPTIONAL AI</div><p className="mt-5 leading-7 text-[#555]">When enabled, the app calls Google Gemini 2.5 Flash from the client for supplemental analysis. The API key is configured in the Gemini settings.</p></article>
    </div>
  </section>

  <section className="border border-[#e1d7cb] bg-[#f5f1eb] p-6 sm:p-8">
    <div className="flex gap-4"><AlertCircle className="w-5 h-5 text-[#9e563e] shrink-0 mt-0.5"/><div><h2 className="font-serif text-xl">Scope and limitations</h2><p className="mt-2 text-sm leading-6 text-[#5d5650]">This project provides a heuristic demonstration, not a trained fraud-detection model or production adjudication service. It has no custom application backend or database. Results are decision-support signals and should be reviewed by a qualified investigator.</p></div></div>
  </section>
  <div className="text-right"><span className="eyebrow">END OF SPECIFICATION <ArrowDown className="w-3 h-3 rotate-[-90deg]"/></span></div>
</div>;
