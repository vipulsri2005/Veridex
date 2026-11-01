import React from 'react';
import { RiskLevel } from '../types';

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
          textColor: 'text-[#a14a45]',
          barColor: 'bg-rose-500',
        };
      case 'MEDIUM':
        return {
          textColor: 'text-[#9e563e]',
          barColor: 'bg-amber-500',
        };
      case 'LOW':
      default:
        return {
          textColor: 'text-[#3f7450]',
          barColor: 'bg-teal-500',
        };
    }
  };

  const theme = getTheme();

  return (
    <div id="risk-indicator-widget" className="w-full font-sans">
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline text-xs text-[#666]">
          <span>Anomaly Probability Spectrum</span>
          <span className={`text-sm font-bold ${theme.textColor}`}>
            {fraudProbability}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-2.5 bg-white rounded overflow-hidden border border-[#e1e1e1]">
          {/* Risk Zones Subtle Background */}
          <div className="absolute inset-0 flex opacity-20">
            <div className="w-[35%] bg-teal-500"></div>
            <div className="w-[30%] bg-amber-500"></div>
            <div className="w-[35%] bg-rose-500"></div>
          </div>

          {/* Active Fill Bar */}
          <div
            className={`relative h-full rounded-sm ${theme.barColor} transition-all duration-500 ease-out`}
            style={{ width: `${Math.max(2, Math.min(100, fraudProbability))}%` }}
          ></div>
        </div>

        {/* Legend Scale */}
        {showLabels && (
          <div className="flex justify-between text-[10px] text-[#777] pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              LOW [0–34%]
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9e563e]"></span>
              MED [35–64%]
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              HIGH [65–100%]
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
