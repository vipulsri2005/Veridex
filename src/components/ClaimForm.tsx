import React from 'react';
import { InsuranceType, CarInsuranceClaim, HealthInsuranceClaim } from '../types';
import { CarInsuranceForm } from './CarInsuranceForm';
import { HealthInsuranceForm } from './HealthInsuranceForm';
import { Car, HeartPulse, Check, CircleHelp } from 'lucide-react';

interface ClaimFormProps {
  insuranceType: InsuranceType;
  onSelectType: (type: InsuranceType) => void;
  onSubmitCarClaim: (data: CarInsuranceClaim) => void;
  onSubmitHealthClaim: (data: HealthInsuranceClaim) => void;
  isSubmitting?: boolean;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({
  insuranceType,
  onSelectType,
  onSubmitCarClaim,
  onSubmitHealthClaim,
  isSubmitting = false,
}) => {
  return (
    <div id="claim-form-wrapper" className="space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-3 mb-5">
          <div className="text-xs font-sans text-[#444] uppercase tracking-wider">
            Claim Analysis // Intake
          </div>
          <span className="text-[11px] font-sans text-[#777]">
            SCHEMA: VERIDEX-INGEST-V1
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold font-sans text-[#171717] mb-1">
            Claim Risk Inspection Intake
          </h2>
          <p className="text-xs text-[#666] font-sans leading-relaxed">
            Add the policy and incident details for this claim. Required fields are marked with an asterisk.
          </p>
        </div>

        {/* Insurance Type Selector */}
        <div>
          <label className="block text-[11px] font-sans uppercase tracking-wider text-[#777] mb-2">
            Target Coverage Line
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Insurance Type">
            {/* Car Insurance Option */}
            <button
              id="type-selector-car"
              type="button"
              role="radio"
              aria-checked={insuranceType === 'car'}
              onClick={() => onSelectType('car')}
              className={`flex items-center justify-between p-3.5 rounded border transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                insuranceType === 'car'
                  ? 'border-[#9e563e] bg-[#9e563e]/5'
                  : 'border-[#e1e1e1] hover:border-[#d3d3d3] bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded border flex items-center justify-center shrink-0 ${
                    insuranceType === 'car'
                      ? 'bg-[#9e563e]/10 border-[#d7b3a6] text-[#9e563e]'
                      : 'bg-[#f5f5f5] border-[#e1e1e1] text-[#777]'
                  }`}
                >
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold font-sans text-[#171717] block">
                    Car Insurance
                  </span>
                  <span className="text-[11px] font-sans text-[#777] block">
                    Incident, policy, and damage details
                  </span>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {insuranceType === 'car' && (
                  <div className="w-5 h-5 rounded bg-white border border-[#d3d3d3] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#9e563e]" />
                  </div>
                )}
              </div>
            </button>

            {/* Health Insurance Option */}
            <button
              id="type-selector-health"
              type="button"
              role="radio"
              aria-checked={insuranceType === 'health'}
              onClick={() => onSelectType('health')}
              className={`flex items-center justify-between p-3.5 rounded border transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                insuranceType === 'health'
                  ? 'border-[#9e563e] bg-[#9e563e]/5'
                  : 'border-[#e1e1e1] hover:border-[#d3d3d3] bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded border flex items-center justify-center shrink-0 ${
                    insuranceType === 'health'
                      ? 'bg-[#9e563e]/10 border-[#d7b3a6] text-[#9e563e]'
                      : 'bg-[#f5f5f5] border-[#e1e1e1] text-[#777]'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold font-sans text-[#171717] block">
                    Health Insurance
                  </span>
                  <span className="text-[11px] font-sans text-[#777] block">
                    Policy timing, risk segment, and procedure details
                  </span>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {insuranceType === 'health' && (
                  <div className="w-5 h-5 rounded bg-white border border-[#d3d3d3] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#9e563e]" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] font-sans text-[#777]">
          <CircleHelp className="w-3.5 h-3.5 text-[#9e563e]" />
          Use a sample preset below to explore the form with example claim data.
        </p>
      </div>

      {/* Selected Type Form Render */}
      <div id="active-claim-form-container">
        {insuranceType === 'car' ? (
          <CarInsuranceForm onSubmit={onSubmitCarClaim} isSubmitting={isSubmitting} />
        ) : (
          <HealthInsuranceForm onSubmit={onSubmitHealthClaim} isSubmitting={isSubmitting} />
        )}
      </div>
    </div>
  );
};
