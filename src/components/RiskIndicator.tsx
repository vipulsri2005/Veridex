import React from 'react';
import { RiskLevel } from '../types';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface RiskIndicatorProps {
  riskLevel: RiskLevel;
  fraudProbability: number;
  showLabels?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  riskLevel,
  fraudProbability,
  showLabels = true,
}) => {
  const getTheme = () => {
    switch (riskLevel) {
      case 'HIGH':
        return {
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
          barColor: 'bg-rose-600',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          title: 'High Fraud Risk',
          meterClass: 'from-rose-500 to-red-600',
        };
      case 'MEDIUM':
        return {
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          barColor: 'bg-amber-500',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          title: 'Moderate Risk',
          meterClass: 'from-amber-400 to-orange-500',
        };
      case 'LOW':
      default:
        return {
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          barColor: 'bg-emerald-500',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
          title: 'Low Risk / Legitimate',
          meterClass: 'from-emerald-400 to-emerald-600',
        };
    }
  };

  const theme = getTheme();

  return (
    <div id="risk-indicator-widget" className="w-full">
      {/* Visual meter bar with marker */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-xs font-semibold text-slate-600">
          <span>Fraud Probability Score</span>
          <span className={`text-base font-bold ${theme.textColor}`}>
            {fraudProbability}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          {/* Risk Zones Gradient Background */}
          <div className="absolute inset-0 flex">
            <div className="w-[35%] bg-emerald-100/60" title="Low Risk Zone (0-34%)"></div>
            <div className="w-[30%] bg-amber-100/60" title="Medium Risk Zone (35-64%)"></div>
            <div className="w-[35%] bg-rose-100/60" title="High Risk Zone (65-100%)"></div>
          </div>

          {/* Active Fill Bar */}
          <div
            className={`relative h-full rounded-full bg-gradient-to-r ${theme.meterClass} transition-all duration-700 ease-out shadow-xs`}
            style={{ width: `${Math.max(4, Math.min(100, fraudProbability))}%` }}
          ></div>
        </div>

        {/* Legend Scale */}
        {showLabels && (
          <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Low (0–34%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Medium (35–64%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              High (65–100%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
