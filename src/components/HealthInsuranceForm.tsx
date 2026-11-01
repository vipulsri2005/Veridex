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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-indigo-50/70 rounded-xl border border-indigo-100">
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-load-high-risk-health"
            onClick={() => loadPreset(highRiskHealthSample)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200 transition-colors"
          >
            Load High-Risk Sample
          </button>
          <button
            type="button"
            id="btn-load-low-risk-health"
            onClick={() => loadPreset(lowRiskHealthSample)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 transition-colors"
          >
            Load Low-Risk Sample
          </button>
          <button
            type="button"
            id="btn-reset-health-form"
            onClick={resetForm}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* SECTION 1: Customer Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Customer Information</h3>
            <p className="text-xs text-slate-500">Patient identity, demographics, and family dependents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Customer ID */}
          <div>
            <label htmlFor="health-field-customerId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Customer ID <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-customerId"
              type="text"
              value={formData.customerId}
              onChange={(e) => handleChange('customerId', e.target.value)}
              onBlur={() => handleBlur('customerId')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.customerId && touched.customerId
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-age" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.age && touched.age
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-gender" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={() => handleBlur('gender')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label htmlFor="health-field-educationLevel" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Education Level <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-educationLevel"
              value={formData.educationLevel}
              onChange={(e) => handleChange('educationLevel', e.target.value)}
              onBlur={() => handleBlur('educationLevel')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
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
            <label htmlFor="health-field-employmentStatus" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Employment Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-employmentStatus"
              value={formData.employmentStatus}
              onChange={(e) => handleChange('employmentStatus', e.target.value)}
              onBlur={() => handleBlur('employmentStatus')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
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
            <label htmlFor="health-field-maritalStatus" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Marital Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-maritalStatus"
              value={formData.maritalStatus}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
              onBlur={() => handleBlur('maritalStatus')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          {/* Number of Dependents */}
          <div>
            <label htmlFor="health-field-numberOfDependents" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Number of Dependents <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-numberOfDependents"
              type="number"
              min="0"
              value={formData.numberOfDependents}
              onChange={(e) => handleChange('numberOfDependents', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('numberOfDependents')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.numberOfDependents && touched.numberOfDependents
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Policy Information</h3>
            <p className="text-xs text-slate-500">Plan coverage structure, effective timelines, and premium contributions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Insurance Type */}
          <div>
            <label htmlFor="health-field-insuranceType" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Insurance Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-insuranceType"
              value={formData.insuranceType}
              onChange={(e) => handleChange('insuranceType', e.target.value)}
              onBlur={() => handleBlur('insuranceType')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
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
            <label htmlFor="health-field-policyEffectiveDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Policy Effective Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-policyEffectiveDate"
              type="date"
              value={formData.policyEffectiveDate}
              onChange={(e) => handleChange('policyEffectiveDate', e.target.value)}
              onBlur={() => handleBlur('policyEffectiveDate')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.policyEffectiveDate && touched.policyEffectiveDate
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-policyExpiryDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Policy Expiry Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-policyExpiryDate"
              type="date"
              value={formData.policyExpiryDate}
              onChange={(e) => handleChange('policyExpiryDate', e.target.value)}
              onBlur={() => handleBlur('policyExpiryDate')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.policyExpiryDate && touched.policyExpiryDate
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-premiumAmount" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Premium Amount ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-premiumAmount"
              type="number"
              min="0"
              value={formData.premiumAmount}
              onChange={(e) => handleChange('premiumAmount', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('premiumAmount')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.premiumAmount && touched.premiumAmount
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-policyDuration" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Policy Duration (Months) <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-policyDuration"
              type="number"
              min="1"
              value={formData.policyDuration}
              onChange={(e) => handleChange('policyDuration', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('policyDuration')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.policyDuration && touched.policyDuration
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Claim Information</h3>
            <p className="text-xs text-slate-500">Medical loss incident, billing value, and risk segmentation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Claim Amount */}
          <div>
            <label htmlFor="health-field-claimAmount" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-lossDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Loss / Event Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-lossDate"
              type="date"
              value={formData.lossDate}
              onChange={(e) => handleChange('lossDate', e.target.value)}
              onBlur={() => handleBlur('lossDate')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.lossDate && touched.lossDate
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-claimDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Claim Filing Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="health-field-claimDate"
              type="date"
              value={formData.claimDate}
              onChange={(e) => handleChange('claimDate', e.target.value)}
              onBlur={() => handleBlur('claimDate')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.claimDate && touched.claimDate
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-400 text-rose-900'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100 text-slate-900'
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
            <label htmlFor="health-field-incidentType" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Incident / Procedure Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-incidentType"
              value={formData.incidentType}
              onChange={(e) => handleChange('incidentType', e.target.value)}
              onBlur={() => handleBlur('incidentType')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
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
            <label htmlFor="health-field-incidentSeverity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Incident Severity <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-incidentSeverity"
              value={formData.incidentSeverity}
              onChange={(e) => handleChange('incidentSeverity', e.target.value)}
              onBlur={() => handleBlur('incidentSeverity')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
            >
              <option value="Mild / Routine">Mild / Routine</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe / Acute">Severe / Acute</option>
              <option value="Critical / ICU">Critical / ICU</option>
            </select>
          </div>

          {/* Risk Segmentation */}
          <div>
            <label htmlFor="health-field-riskSegmentation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Risk Segmentation <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-riskSegmentation"
              value={formData.riskSegmentation}
              onChange={(e) => handleChange('riskSegmentation', e.target.value)}
              onBlur={() => handleBlur('riskSegmentation')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
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
            <label htmlFor="health-field-claimStatus" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Claim Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="health-field-claimStatus"
              value={formData.claimStatus}
              onChange={(e) => handleChange('claimStatus', e.target.value)}
              onBlur={() => handleBlur('claimStatus')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-slate-900 bg-white"
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
          className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all duration-150 flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-indigo-200"
        >
          <span>Analyze Claim</span>
        </button>
      </div>
    </form>
  );
};
