import React from 'react';
import { 
  Car, 
  HeartPulse, 
  ArrowRight, 
  FileCheck2, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  BrainCircuit,
  Lock,
  Layers
} from 'lucide-react';
import { InsuranceType } from '../types';

interface DashboardProps {
  onStartAnalysis: (type: InsuranceType) => void;
  onNavigateToAbout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartAnalysis,
  onNavigateToAbout,
}) => {
  // Clear simulated / demo statistics
  const stats = [
    {
      id: 'stat-claims-analyzed',
      label: 'Claims Analyzed',
      value: '18,420',
      subtext: '+12.4% this month',
      icon: <FileCheck2 className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
    },
    {
      id: 'stat-fraud-detected',
      label: 'Fraud Cases Detected',
      value: '1,845',
      subtext: '10.01% anomaly detection',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50',
    },
    {
      id: 'stat-avg-risk',
      label: 'Average Risk Score',
      value: '24.8%',
      subtext: 'Baseline risk across claims',
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
    },
    {
      id: 'stat-straight-through',
      label: 'Automated Clearance',
      value: '84.2%',
      subtext: 'Straight-through low-risk',
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div id="dashboard-page" className="space-y-10 animate-in fade-in-50 duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b15_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-semibold mb-5 backdrop-blur-xs">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Risk Assessment Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Insurance Fraud Detection System
          </h1>

          <p className="text-lg sm:text-xl font-medium text-indigo-200 mb-4">
            AI-Powered Insurance Claim Risk Assessment
          </p>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Analyze insurance claim information and identify potentially fraudulent claims using intelligent risk assessment.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              id="hero-analyze-car-btn"
              onClick={() => onStartAnalysis('car')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-700/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Car className="w-4 h-4" />
              <span>Analyze Car Claim</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              id="hero-analyze-health-btn"
              onClick={() => onStartAnalysis('health')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Analyze Health Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Statistics Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Operational Risk Overview
            </h2>
          </div>
          <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
            Simulated Demonstration Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${item.bg}`}>
                  {item.icon}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {item.value}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {item.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Large Insurance Cards Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Claim Risk Evaluators
          </h2>
          <p className="text-xs text-slate-500">
            Select a specialized line of coverage to initialize fraud scoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 🚗 Car Insurance */}
          <div
            id="card-car-insurance"
            className="group relative bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Car className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  Vehicle Line
                </span>
                <span className="text-xs text-slate-400">22 Inspection Vectors</span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                🚗 Car Insurance
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Analyze vehicle insurance claims for potential fraud.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Collision & Impact Analysis</span>
                  <span className="font-semibold text-slate-700">Multi-vehicle / Single</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Police & Witness Verification</span>
                  <span className="font-semibold text-slate-700">Official cross-check</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Claim-to-Premium Ratio</span>
                  <span className="font-semibold text-slate-700">Disproportion detector</span>
                </div>
              </div>
            </div>

            <button
              id="btn-dashboard-analyze-car"
              type="button"
              onClick={() => onStartAnalysis('car')}
              className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>Analyze Car Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: 🏥 Health Insurance */}
          <div
            id="card-health-insurance"
            className="group relative bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <HeartPulse className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  Clinical Line
                </span>
                <span className="text-xs text-slate-400">18 Policy Variables</span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                🏥 Health Insurance
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Analyze health insurance claims for potential fraud.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Policy Inception vs. Loss Proximity</span>
                  <span className="font-semibold text-slate-700">Pre-existing flag</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Billing vs. Severity Classification</span>
                  <span className="font-semibold text-slate-700">Cost anomaly audit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Risk Segmentation Category</span>
                  <span className="font-semibold text-slate-700">Watchlist weighting</span>
                </div>
              </div>
            </div>

            <button
              id="btn-dashboard-analyze-health"
              type="button"
              onClick={() => onStartAnalysis('health')}
              className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>Analyze Health Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Highlights & Decoupled Service Banner */}
      <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center border border-slate-200 shadow-2xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Decoupled ML Prediction Architecture
            </h4>
            <p className="text-xs text-slate-600">
              The frontend prediction service operates independently with simulated heuristics and is ready for live ML backend integration.
            </p>
          </div>
        </div>

        <button
          id="btn-learn-architecture"
          type="button"
          onClick={onNavigateToAbout}
          className="shrink-0 px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-indigo-700 border border-slate-300 shadow-2xs transition-colors"
        >
          Learn How It Works
        </button>
      </div>
    </div>
  );
};
