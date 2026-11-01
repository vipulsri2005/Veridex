import React from 'react';
import { InsuranceType, CarInsuranceClaim, HealthInsuranceClaim } from '../types';
import { CarInsuranceForm } from './CarInsuranceForm';
import { HealthInsuranceForm } from './HealthInsuranceForm';
import { Car, HeartPulse, CheckCircle2 } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Claim Analysis
          </h2>
          <p className="text-sm text-slate-600">
            Submit policy and incident documentation into the intelligent fraud risk engine.
            The evaluation executes comprehensive cross-factor analysis to flag anomalies.
          </p>
        </div>

        {/* Insurance Type Selector (remains visible while completing form) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Select Insurance Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Insurance Type">
            {/* Car Insurance Option */}
            <button
              id="type-selector-car"
              type="button"
              role="radio"
              aria-checked={insuranceType === 'car'}
              onClick={() => onSelectType('car')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                insuranceType === 'car'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    insuranceType === 'car'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 block leading-tight">
                    Car Insurance
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Vehicle collision, theft, and property damage
                  </span>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {insuranceType === 'car' ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
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
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                insuranceType === 'health'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    insuranceType === 'health'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 block leading-tight">
                    Health Insurance
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Hospitalization, outpatient, and surgical claims
                  </span>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {insuranceType === 'health' ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                )}
              </div>
            </button>
          </div>
        </div>
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
