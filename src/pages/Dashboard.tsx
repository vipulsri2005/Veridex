import React from 'react';
import { Car, HeartPulse, ArrowRight, ShieldCheck, Sparkles, FileSearch, ClipboardCheck } from 'lucide-react';
import { InsuranceType } from '../types';

interface DashboardProps { onStartAnalysis: (type: InsuranceType) => void; onNavigateToAbout: () => void; }

export const Dashboard: React.FC<DashboardProps> = ({ onStartAnalysis, onNavigateToAbout }) => (
  <div id="dashboard-page" className="space-y-20 sm:space-y-28 animate-in fade-in-50 duration-200">
    <section className="grid lg:grid-cols-[1.15fr_.85fr] gap-12 lg:gap-20 items-end pt-10 sm:pt-16">
      <div>
        <p className="eyebrow"><span>01</span> / CLAIM INTELLIGENCE</p>
        <h1 className="display-title mt-6 max-w-3xl">A clearer view of <em>claim risk.</em></h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#555]">Veridex helps insurance teams review vehicle and health claims through transparent, consistent risk checks—with optional Gemini assistance for added context.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button id="hero-analyze-car-btn" onClick={() => onStartAnalysis('car')} className="btn-primary">Analyze a claim <ArrowRight className="w-4 h-4" /></button>
          <button onClick={onNavigateToAbout} className="btn-secondary">Explore the system</button>
        </div>
      </div>
      <div className="editorial-note">
        <span className="eyebrow"><ShieldCheck className="w-4 h-4" /> A practical review workspace</span>
        <p className="mt-5 text-xl leading-8 text-[#272727] font-serif">“Bring claim details together, understand the signals, and keep the final decision with the investigator.”</p>
        <div className="mt-6 border-t border-[#e1e1e1] pt-4 text-sm text-[#666]">Rule-based risk assessment <span className="mx-2 text-[#bbb]">·</span> Optional Gemini 2.5 Flash</div>
      </div>
    </section>

    <section id="capabilities" className="border-t border-[#dcdcdc] pt-8">
      <p className="eyebrow"><span>02</span> / CAPABILITIES</p>
      <div className="mt-7 grid md:grid-cols-2 gap-5">
        <article className="feature-card">
          <div className="flex items-center justify-between"><span className="eyebrow">LINE 01 / VEHICLE</span><Car className="w-5 h-5 text-[#9e563e]" /></div>
          <h2 className="font-serif text-2xl mt-8">Automobile claims</h2>
          <p className="mt-3 leading-7 text-[#5b5b5b]">Review claim size against premium, incident timing and reporting, customer tenure, damage, injury, and supporting evidence.</p>
          <button id="btn-dashboard-analyze-car" onClick={() => onStartAnalysis('car')} className="text-link mt-7">Review a vehicle claim <ArrowRight className="w-4 h-4" /></button>
        </article>
        <article className="feature-card">
          <div className="flex items-center justify-between"><span className="eyebrow">LINE 02 / HEALTH</span><HeartPulse className="w-5 h-5 text-[#9e563e]" /></div>
          <h2 className="font-serif text-2xl mt-8">Health claims</h2>
          <p className="mt-3 leading-7 text-[#5b5b5b]">Review timing after policy start, claim size relative to premium, risk segment, and procedure severity.</p>
          <button id="btn-dashboard-analyze-health" onClick={() => onStartAnalysis('health')} className="text-link mt-7">Review a health claim <ArrowRight className="w-4 h-4" /></button>
        </article>
      </div>
    </section>

    <section className="border-t border-[#dcdcdc] pt-8">
      <p className="eyebrow"><span>03</span> / REVIEW FLOW</p>
      <div className="mt-7 grid sm:grid-cols-3 gap-0 border-y border-[#e1e1e1]">
        {[{icon:<FileSearch/>,title:'Enter claim details',copy:'Choose a coverage line and provide the relevant policy and incident information.'},{icon:<Sparkles/>,title:'Review risk signals',copy:'A deterministic heuristic baseline evaluates the submitted details. Gemini can add narrative context when configured.'},{icon:<ClipboardCheck/>,title:'Assess the result',copy:'Review the risk band, contributing factors, claim summary, and any available recommendations.'}].map((step,i)=><article key={step.title} className="py-7 sm:px-7 first:sm:pl-0 border-b sm:border-b-0 sm:border-r last:border-0 border-[#e1e1e1]"><div className="flex items-center gap-3 text-[#9e563e]"><span className="font-mono text-xs">0{i+1}</span>{React.cloneElement(step.icon,{className:'w-4 h-4'})}</div><h3 className="mt-5 font-serif text-xl">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#666]">{step.copy}</p></article>)}
      </div>
    </section>
    <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#f0efec] p-6 sm:p-8">
      <div><p className="eyebrow">04 / SYSTEM INFORMATION</p><p className="mt-3 text-[#555]">See how the scoring and optional AI assistance work.</p></div>
      <button onClick={onNavigateToAbout} className="btn-secondary shrink-0">Read system specification <ArrowRight className="w-4 h-4" /></button>
    </section>
  </div>
);
