import React from 'react';
import { PredictionResult } from '../types';
import { FileText, Shield, DollarSign, Activity, User, Calendar } from 'lucide-react';

interface ClaimSummaryProps {
  result: PredictionResult;
}

export const ClaimSummary: React.FC<ClaimSummaryProps> = ({ result }) => {
  const { claimSummary, claimReference, timestamp } = result;

  return (
    <div id="claim-summary-card" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Claim Summary</h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-slate-500 block">Ref: {claimReference}</span>
          <span className="text-[11px] text-slate-400">
            {new Date(timestamp).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Insurance Type</span>
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">
            {claimSummary.insuranceTypeDisplay}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Claim Amount</span>
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">
            {claimSummary.claimAmountDisplay}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Incident Type</span>
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate" title={claimSummary.incidentType}>
            {claimSummary.incidentType}
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <User className="w-3.5 h-3.5 text-purple-500" />
            <span>Customer Age</span>
          </div>
          <span className="text-sm font-bold text-slate-900 block">
            {claimSummary.customerAge} yrs
          </span>
        </div>
      </div>

      {/* Secondary Adaptive Key/Value Breakdown */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Detailed Claim Attributes
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
          {Object.entries(claimSummary.additionalDetails).map(([key, value]) => (
            <div key={key} className="flex flex-col py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">{key}</span>
              <span className="text-slate-800 font-semibold truncate" title={String(value)}>
                {String(value) || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
