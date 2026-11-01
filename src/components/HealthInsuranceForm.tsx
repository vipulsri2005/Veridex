import React, { useState } from 'react';
import { HealthInsuranceClaim, ValidationErrors } from '../types';
import { validateHealthInsuranceClaim } from '../utils/validation';
import { highRiskHealthSample, lowRiskHealthSample, initialHealthClaim } from '../data/sampleData';
import { 
  User, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Sparkles, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface HealthInsuranceFormProps {
  onSubmit: (data: HealthInsuranceClaim) => void;
  isSubmitting?: boolean;
}

export const HealthInsuranceForm: React.FC<HealthInsuranceFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<HealthInsuranceClaim>(initialHealthClaim);
  const [errors, setErrors] = useState<ValidationErrors<HealthInsuranceClaim>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof HealthInsuranceClaim, boolean>>>({});

  const handleChange = (field: keyof HealthInsuranceClaim, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      const errs = validateHealthInsuranceClaim(updated);
      setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    }
  };

  const handleBlur = (field: keyof HealthInsuranceClaim) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateHealthInsuranceClaim(formData);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Partial<Record<keyof HealthInsuranceClaim, boolean>> = {};
    (Object.keys(formData) as (keyof HealthInsuranceClaim)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const validationErrors = validateHealthInsuranceClaim(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`health-field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const loadPreset = (preset: HealthInsuranceClaim) => {
    setFormData(preset);
    setErrors({});
    setTouched({});
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      age: '',
      gender: 'MALE',
      educationLevel: 'Bachelor',
      employmentStatus: 'Employed',
      maritalStatus: 'Married',
      numberOfDependents: 0,
      insuranceType: 'Comprehensive Health Plan',
      policyEffectiveDate: '',
      policyExpiryDate: '',
      premiumAmount: '',
      policyDuration: 12,
      claimAmount: '',
      claimDate: '',
      lossDate: '',
      incidentType: 'Inpatient Hospitalization',
      incidentSeverity: 'Moderate',
      riskSegmentation: 'Standard Risk Group',
      claimStatus: 'Pending Review',
    });
    setErrors({});
    setTouched({});
  };

  return (
    <form id="health-insurance-form" onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Preset Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f5f5f5] rounded border border-[#e1e1e1] font-sans text-xs">
        <div className="flex items-center space-x-2 text-[#666]">
          <Sparkles className="w-3.5 h-3.5 text-[#3f7450]" />
          <span>TELEMETRY PRESETS:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-load-high-risk-health"
            onClick={() => loadPreset(highRiskHealthSample)}
            className="px-2.5 py-1 text-xs rounded bg-rose-950/30 text-[#a14a45] hover:bg-rose-950/60 border border-rose-900/40 transition-colors"
          >
            Load High-Risk Sample
          </button>
          <button
            type="button"
            id="btn-load-low-risk-health"
            onClick={() => loadPreset(lowRiskHealthSample)}
            className="px-2.5 py-1 text-xs rounded bg-emerald-950/30 text-[#477a53] hover:bg-emerald-950/60 border border-emerald-900/40 transition-colors"
          >
            Load Low-Risk Sample
          </button>
          <button
            type="button"
            id="btn-reset-health-form"
            onClick={resetForm}
            className="px-2.5 py-1 text-xs rounded bg-[#f5f5f5] text-[#666] hover:text-[#2a2a2a] border border-[#e1e1e1] transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* SECTION 1: Customer Information */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#1b1e25]">
          <div className="w-7 h-7 rounded border border-[#d3d3d3] bg-[#f5f5f5] text-[#444] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans text-[#171717]">Customer Information</h3>
            <p className="text-[11px] font-sans text-[#777]">Patient identity, demographics, and family dependents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Customer ID */}
          <div>
            <label htmlFor="health-field-customerId" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Customer ID <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-customerId"
              type="text"
              value={formData.customerId}
              onChange={(e) => handleChange('customerId', e.target.value)}
              onBlur={() => handleBlur('customerId')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.customerId && touched.customerId
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. CUST-88192"
            />
            {errors.customerId && touched.customerId && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.customerId}
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label htmlFor="health-field-age" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-age"
              type="number"
              min="0"
              max="115"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('age')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.age && touched.age
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 41"
            />
            {errors.age && touched.age && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.age}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="health-field-gender" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={() => handleBlur('gender')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label htmlFor="health-field-educationLevel" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Education Level <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-educationLevel"
              value={formData.educationLevel}
              onChange={(e) => handleChange('educationLevel', e.target.value)}
              onBlur={() => handleBlur('educationLevel')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="High School">High School</option>
              <option value="Associate">Associate Degree</option>
              <option value="Bachelor">Bachelor Degree</option>
              <option value="Master">Master Degree</option>
              <option value="Doctorate">Doctorate / PhD</option>
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <label htmlFor="health-field-employmentStatus" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Employment Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-employmentStatus"
              value={formData.employmentStatus}
              onChange={(e) => handleChange('employmentStatus', e.target.value)}
              onBlur={() => handleBlur('employmentStatus')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Retired">Retired</option>
              <option value="Student">Student</option>
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label htmlFor="health-field-maritalStatus" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Marital Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-maritalStatus"
              value={formData.maritalStatus}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
              onBlur={() => handleBlur('maritalStatus')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          {/* Number of Dependents */}
          <div>
            <label htmlFor="health-field-numberOfDependents" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Number of Dependents <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-numberOfDependents"
              type="number"
              min="0"
              value={formData.numberOfDependents}
              onChange={(e) => handleChange('numberOfDependents', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('numberOfDependents')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.numberOfDependents && touched.numberOfDependents
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="0"
            />
            {errors.numberOfDependents && touched.numberOfDependents && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.numberOfDependents}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Policy Information */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#1b1e25]">
          <div className="w-7 h-7 rounded border border-[#d3d3d3] bg-[#f5f5f5] text-[#444] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans text-[#171717]">Policy Information</h3>
            <p className="text-[11px] font-sans text-[#777]">Plan coverage structure, effective timelines, and premium contributions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Insurance Type */}
          <div>
            <label htmlFor="health-field-insuranceType" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Insurance Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-insuranceType"
              value={formData.insuranceType}
              onChange={(e) => handleChange('insuranceType', e.target.value)}
              onBlur={() => handleBlur('insuranceType')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Comprehensive Health Plan">Comprehensive Health Plan</option>
              <option value="HMO (Health Maintenance Org)">HMO (Health Maintenance Org)</option>
              <option value="PPO (Preferred Provider Org)">PPO (Preferred Provider Org)</option>
              <option value="High-Deductible Health Plan (HDHP)">High-Deductible Health Plan (HDHP)</option>
              <option value="Critical Illness Cover">Critical Illness Cover</option>
            </select>
          </div>

          {/* Policy Effective Date */}
          <div>
            <label htmlFor="health-field-policyEffectiveDate" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy Effective Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-policyEffectiveDate"
              type="date"
              value={formData.policyEffectiveDate}
              onChange={(e) => handleChange('policyEffectiveDate', e.target.value)}
              onBlur={() => handleBlur('policyEffectiveDate')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.policyEffectiveDate && touched.policyEffectiveDate
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
            />
            {errors.policyEffectiveDate && touched.policyEffectiveDate && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.policyEffectiveDate}
              </p>
            )}
          </div>

          {/* Policy Expiry Date */}
          <div>
            <label htmlFor="health-field-policyExpiryDate" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy Expiry Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-policyExpiryDate"
              type="date"
              value={formData.policyExpiryDate}
              onChange={(e) => handleChange('policyExpiryDate', e.target.value)}
              onBlur={() => handleBlur('policyExpiryDate')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.policyExpiryDate && touched.policyExpiryDate
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
            />
            {errors.policyExpiryDate && touched.policyExpiryDate && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.policyExpiryDate}
              </p>
            )}
          </div>

          {/* Premium Amount */}
          <div>
            <label htmlFor="health-field-premiumAmount" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Premium Amount ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-premiumAmount"
              type="number"
              min="0"
              value={formData.premiumAmount}
              onChange={(e) => handleChange('premiumAmount', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('premiumAmount')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.premiumAmount && touched.premiumAmount
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 4800"
            />
            {errors.premiumAmount && touched.premiumAmount && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.premiumAmount}
              </p>
            )}
          </div>

          {/* Policy Duration */}
          <div>
            <label htmlFor="health-field-policyDuration" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy Duration (Months) <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-policyDuration"
              type="number"
              min="1"
              value={formData.policyDuration}
              onChange={(e) => handleChange('policyDuration', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('policyDuration')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.policyDuration && touched.policyDuration
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="12"
            />
            {errors.policyDuration && touched.policyDuration && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.policyDuration}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Claim Information */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#1b1e25]">
          <div className="w-7 h-7 rounded border border-[#d3d3d3] bg-[#f5f5f5] text-[#444] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans text-[#171717]">Claim Information</h3>
            <p className="text-[11px] font-sans text-[#777]">Medical loss incident, billing value, and risk segmentation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Claim Amount */}
          <div>
            <label htmlFor="health-field-claimAmount" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Claim Amount ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-claimAmount"
              type="number"
              min="1"
              value={formData.claimAmount}
              onChange={(e) => handleChange('claimAmount', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('claimAmount')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 ${
                errors.claimAmount && touched.claimAmount
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 2400"
            />
            {errors.claimAmount && touched.claimAmount && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.claimAmount}
              </p>
            )}
          </div>

          {/* Loss Date */}
          <div>
            <label htmlFor="health-field-lossDate" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Loss / Event Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-lossDate"
              type="date"
              value={formData.lossDate}
              onChange={(e) => handleChange('lossDate', e.target.value)}
              onBlur={() => handleBlur('lossDate')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.lossDate && touched.lossDate
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
            />
            {errors.lossDate && touched.lossDate && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.lossDate}
              </p>
            )}
          </div>

          {/* Claim Filing Date */}
          <div>
            <label htmlFor="health-field-claimDate" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Claim Filing Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-claimDate"
              type="date"
              value={formData.claimDate}
              onChange={(e) => handleChange('claimDate', e.target.value)}
              onBlur={() => handleBlur('claimDate')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.claimDate && touched.claimDate
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
            />
            {errors.claimDate && touched.claimDate && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.claimDate}
              </p>
            )}
          </div>

          {/* Incident Type */}
          <div>
            <label htmlFor="health-field-incidentType" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident / Procedure Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-incidentType"
              value={formData.incidentType}
              onChange={(e) => handleChange('incidentType', e.target.value)}
              onBlur={() => handleBlur('incidentType')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Inpatient Hospitalization">Inpatient Hospitalization</option>
              <option value="Emergency Surgery">Emergency Surgery</option>
              <option value="Outpatient Treatment">Outpatient Treatment</option>
              <option value="Prescription Drug Claim">Prescription Drug Claim</option>
              <option value="Diagnostic Radiology">Diagnostic Radiology</option>
              <option value="Dental/Optical Procedure">Dental / Optical Procedure</option>
            </select>
          </div>

          {/* Incident Severity */}
          <div>
            <label htmlFor="health-field-incidentSeverity" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident Severity <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-incidentSeverity"
              value={formData.incidentSeverity}
              onChange={(e) => handleChange('incidentSeverity', e.target.value)}
              onBlur={() => handleBlur('incidentSeverity')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Mild / Routine">Mild / Routine</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe / Acute">Severe / Acute</option>
              <option value="Critical / ICU">Critical / ICU</option>
            </select>
          </div>

          {/* Risk Segmentation */}
          <div>
            <label htmlFor="health-field-riskSegmentation" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Risk Segmentation <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-riskSegmentation"
              value={formData.riskSegmentation}
              onChange={(e) => handleChange('riskSegmentation', e.target.value)}
              onBlur={() => handleBlur('riskSegmentation')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Standard Risk Group">Standard Risk Group</option>
              <option value="Low Risk Preferred">Low Risk Preferred</option>
              <option value="Tier-1 High Utilization">Tier-1 High Utilization</option>
              <option value="Tier-2 Chronic Condition">Tier-2 Chronic Condition</option>
              <option value="New Policyholder Watchlist">New Policyholder Watchlist</option>
            </select>
          </div>

          {/* Claim Status */}
          <div>
            <label htmlFor="health-field-claimStatus" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Claim Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-claimStatus"
              value={formData.claimStatus}
              onChange={(e) => handleChange('claimStatus', e.target.value)}
              onBlur={() => handleBlur('claimStatus')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Submitted">Submitted</option>
              <option value="Pre-authorized">Pre-authorized</option>
              <option value="Under Audit">Under Audit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          id="btn-analyze-health-claim"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 rounded bg-zinc-100 hover:bg-white disabled:opacity-50 text-white font-sans font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
        >
          <span>RUN CLINICAL ANOMALY ANALYSIS</span>
        </button>
      </div>
    </form>
  );
};
