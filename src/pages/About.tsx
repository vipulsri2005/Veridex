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
    <p className="mt-6 max-w-2xl text-lg leading-8 text-[#555]">Veridex keeps normal claim intake separate from an academic Random Forest demonstration that runs through a local Python API.</p>
  </header>

  <section className="spec-panel">
    <div className="eyebrow"><ShieldCheck className="w-4 h-4"/> SYSTEM OVERVIEW</div>
    <blockquote className="mt-6 border-l-2 border-[#9e563e] pl-5 py-1 font-serif italic text-xl sm:text-2xl leading-relaxed text-[#272727]">“Veridex supports insurance teams as they review potential fraud indicators in vehicle and health claims.”</blockquote>
    <p className="mt-6 max-w-3xl leading-7 text-[#555]">Normal claim submission uses the existing browser-based heuristic and Gemini flow. The separate ML Demo requires all 32 model features and calls the trained vehicle Random Forest through FastAPI. Gemini may explain that fixed ML output, but cannot replace its class or probability.</p>
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
    <div className="mt-7 grid md:grid-cols-3 gap-5">
      <article className="feature-card"><div className="eyebrow"><Monitor className="w-4 h-4"/> APPLICATION</div><p className="mt-5 leading-7 text-[#555]">The interface is built with React, TypeScript, and Vite. Normal claim assessments stay in the browser and do not create a Random Forest result from incomplete inputs.</p></article>
      <article className="feature-card"><div className="eyebrow"><Cpu className="w-4 h-4"/> ML DEMONSTRATION</div><p className="mt-5 leading-7 text-[#555]">A local FastAPI service loads the preserved Random Forest pipeline. The demo requires 32 exact, validated fields and can use complete historical rows from the source CSV.</p></article>
      <article className="feature-card"><div className="eyebrow"><Sparkles className="w-4 h-4"/> OPTIONAL AI</div><p className="mt-5 leading-7 text-[#555]">Gemini 2.5 Flash can add context to the normal heuristic assessment or explain the actual ML result. Its narrative never sets or changes a score.</p></article>
    </div>
  </section>

  <section className="border border-[#e1d7cb] bg-[#f5f1eb] p-6 sm:p-8">
    <div className="flex gap-4"><AlertCircle className="w-5 h-5 text-[#9e563e] shrink-0 mt-0.5"/><div><h2 className="font-serif text-xl">Scope and limitations</h2><p className="mt-2 text-sm leading-6 text-[#5d5650]">The saved model is an academic demonstration with 3.78% fraud recall at its recorded threshold, includes investigation-stage predictors, and supports vehicle claims only. It is not an operational fraud gate. Historical rows are demonstration data, not new claims; all outputs require human review.</p></div></div>
  </section>
  <div className="text-right"><span className="eyebrow">END OF SPECIFICATION <ArrowDown className="w-3 h-3 rotate-[-90deg]"/></span></div>
</div>;
