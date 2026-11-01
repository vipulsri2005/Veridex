import React from 'react';
import { PredictionResult } from '../types';
import { FileText, Shield, DollarSign, Activity, User } from 'lucide-react';

interface ClaimSummaryProps {
  result: PredictionResult;
}

export const ClaimSummary: React.FC<ClaimSummaryProps> = ({ result }) => {
  const { claimSummary, claimReference, timestamp } = result;

  return (
    <div id="claim-summary-card" className="bg-white rounded border border-[#e1e1e1] p-5 font-sans">
      <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#666]" />
          <h3 className="text-xs font-bold text-[#2a2a2a] uppercase tracking-wider">
            Claim Telemetry Record
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-[#666] block">REF: {claimReference}</span>
          <span className="text-[10px] text-[#888]">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-[#f5f5f5] rounded border border-[#e1e1e1] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-[#777] mb-1">
            <Shield className="w-3 h-3 text-[#666]" />
            <span>Coverage Line</span>
          </div>
          <span className="text-xs font-bold text-[#2a2a2a] block truncate">
            {claimSummary.insuranceTypeDisplay}
          </span>
        </div>

        <div className="bg-[#f5f5f5] rounded border border-[#e1e1e1] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-[#777] mb-1">
            <DollarSign className="w-3 h-3 text-[#477a53]" />
            <span>Claim Amount</span>
          </div>
          <span className="text-xs font-bold text-[#2a2a2a] block truncate">
            {claimSummary.claimAmountDisplay}
          </span>
        </div>

        <div className="bg-[#f5f5f5] rounded border border-[#e1e1e1] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-[#777] mb-1">
            <Activity className="w-3 h-3 text-[#3f7450]" />
            <span>Incident Type</span>
          </div>
          <span className="text-xs font-bold text-[#2a2a2a] block truncate" title={claimSummary.incidentType}>
            {claimSummary.incidentType}
          </span>
        </div>

        <div className="bg-[#f5f5f5] rounded border border-[#e1e1e1] p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-[#777] mb-1">
            <User className="w-3 h-3 text-[#9e563e]" />
            <span>Customer Age</span>
          </div>
          <span className="text-xs font-bold text-[#2a2a2a] block">
            {claimSummary.customerAge} yrs
          </span>
        </div>
      </div>

      {/* Secondary Adaptive Key/Value Breakdown */}
      <div className="border-t border-[#e1e1e1] pt-3">
        <h4 className="text-[10px] font-semibold text-[#777] uppercase tracking-wider mb-2">
          Recorded Vector Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
          {Object.entries(claimSummary.additionalDetails).map(([key, value]) => (
            <div key={key} className="flex flex-col py-1 border-b border-[#14161c]">
              <span className="text-[10px] text-[#777]">{key}:</span>
              <span className="text-[#444] font-medium truncate" title={String(value)}>
                {String(value) || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
