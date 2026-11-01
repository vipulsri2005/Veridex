import React, { useState } from 'react';
import { CarInsuranceClaim, ValidationErrors } from '../types';
import { validateCarInsuranceClaim } from '../utils/validation';
import { highRiskCarSample, lowRiskCarSample, initialCarClaim } from '../data/sampleData';
import { 
  User, 
  ShieldCheck, 
  AlertOctagon, 
  Car, 
  DollarSign, 
  Sparkles, 
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';

interface CarInsuranceFormProps {
  onSubmit: (data: CarInsuranceClaim) => void;
  isSubmitting?: boolean;
}

export const CarInsuranceForm: React.FC<CarInsuranceFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<CarInsuranceClaim>(initialCarClaim);
  const [errors, setErrors] = useState<ValidationErrors<CarInsuranceClaim>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CarInsuranceClaim, boolean>>>({});

  const handleChange = (field: keyof CarInsuranceClaim, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Revalidate field if already touched
    if (touched[field]) {
      const errs = validateCarInsuranceClaim(updated);
      setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    }
  };

  const handleBlur = (field: keyof CarInsuranceClaim) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateCarInsuranceClaim(formData);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to show all errors
    const allTouched: Partial<Record<keyof CarInsuranceClaim, boolean>> = {};
    (Object.keys(formData) as (keyof CarInsuranceClaim)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const validationErrors = validateCarInsuranceClaim(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`car-field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const loadPreset = (preset: CarInsuranceClaim) => {
    setFormData(preset);
    setErrors({});
    setTouched({});
  };

  const resetForm = () => {
    setFormData({
      age: '',
      gender: 'MALE',
      education: 'Bachelor',
      occupation: 'Tech-support',
      hobbies: 'reading',
      relationship: 'husband',
      monthsAsCustomer: '',
      policyNumber: '',
      policyState: 'OH',
      policyCsl: '250/500',
      policyDeductible: 1000,
      annualPremium: '',
      umbrellaLimit: 0,
      incidentType: 'Single Vehicle Collision',
      collisionType: 'Front Collision',
      incidentSeverity: 'Minor Damage',
      incidentState: 'OH',
      incidentCity: '',
      incidentHour: 12,
      numberOfVehicles: 1,
      propertyDamage: 'NO',
      bodilyInjuries: 0,
      witnesses: 0,
      policeReportAvailable: 'YES',
      authoritiesContacted: 'Police',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: 2021,
      totalClaimAmount: '',
      injuryClaim: 0,
      propertyClaim: 0,
      vehicleClaim: 0,
    });
    setErrors({});
    setTouched({});
  };

  return (
    <form id="car-insurance-form" onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Preset Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f5f5f5] rounded border border-[#e1e1e1] font-sans text-xs">
        <div className="flex items-center space-x-2 text-[#666]">
          <Sparkles className="w-3.5 h-3.5 text-[#9e563e]" />
          <span>TELEMETRY PRESETS:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-load-high-risk-car"
            onClick={() => loadPreset(highRiskCarSample)}
            className="px-2.5 py-1 text-xs rounded bg-rose-950/30 text-[#a14a45] hover:bg-rose-950/60 border border-rose-900/40 transition-colors"
          >
            Load High-Risk Sample
          </button>
          <button
            type="button"
            id="btn-load-low-risk-car"
            onClick={() => loadPreset(lowRiskCarSample)}
            className="px-2.5 py-1 text-xs rounded bg-emerald-950/30 text-[#477a53] hover:bg-emerald-950/60 border border-emerald-900/40 transition-colors"
          >
            Load Low-Risk Sample
          </button>
          <button
            type="button"
            id="btn-reset-car-form"
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
            <p className="text-[11px] font-sans text-[#777]">Policyholder background and tenure characteristics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Age */}
          <div>
            <label htmlFor="car-field-age" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-age"
              type="number"
              min="18"
              max="105"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('age')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.age && touched.age
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 38"
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
            <label htmlFor="car-field-gender" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-gender"
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

          {/* Education */}
          <div>
            <label htmlFor="car-field-education" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Education <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-education"
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              onBlur={() => handleBlur('education')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="High School">High School</option>
              <option value="Associate">Associate Degree</option>
              <option value="Bachelor">Bachelor Degree</option>
              <option value="Master">Master Degree</option>
              <option value="PhD">PhD / Doctorate</option>
              <option value="JD">JD (Law)</option>
              <option value="MD">MD (Medicine)</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label htmlFor="car-field-occupation" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Occupation <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-occupation"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              onBlur={() => handleBlur('occupation')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Tech-support">Tech-support</option>
              <option value="Craft-repair">Craft-repair</option>
              <option value="Other-service">Other-service</option>
              <option value="Sales">Sales</option>
              <option value="Exec-managerial">Exec-managerial</option>
              <option value="Prof-specialty">Prof-specialty</option>
              <option value="Armed-Forces">Armed-Forces</option>
              <option value="Machine-op-inspct">Machine-op-inspect</option>
              <option value="Adm-clerical">Adm-clerical</option>
              <option value="Farming-fishing">Farming-fishing</option>
              <option value="Transport-moving">Transport-moving</option>
              <option value="Protective-serv">Protective-serv</option>
            </select>
          </div>

          {/* Hobbies */}
          <div>
            <label htmlFor="car-field-hobbies" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Hobbies <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-hobbies"
              value={formData.hobbies}
              onChange={(e) => handleChange('hobbies', e.target.value)}
              onBlur={() => handleBlur('hobbies')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="reading">Reading</option>
              <option value="exercise">Exercise / Fitness</option>
              <option value="paintball">Paintball</option>
              <option value="chess">Chess</option>
              <option value="cross-fit">Cross-fit</option>
              <option value="hiking">Hiking</option>
              <option value="golf">Golf</option>
              <option value="skydiving">Skydiving</option>
              <option value="yachting">Yachting</option>
              <option value="camping">Camping</option>
              <option value="kayaking">Kayaking</option>
              <option value="video-games">Video Games</option>
            </select>
          </div>

          {/* Relationship */}
          <div>
            <label htmlFor="car-field-relationship" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Relationship <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-relationship"
              value={formData.relationship}
              onChange={(e) => handleChange('relationship', e.target.value)}
              onBlur={() => handleBlur('relationship')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="husband">Husband</option>
              <option value="wife">Wife</option>
              <option value="own-child">Own Child</option>
              <option value="unmarried">Unmarried</option>
              <option value="not-in-family">Not in family</option>
              <option value="other-relative">Other relative</option>
            </select>
          </div>

          {/* Months as Customer */}
          <div>
            <label htmlFor="car-field-monthsAsCustomer" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Months as Customer <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-monthsAsCustomer"
              type="number"
              min="0"
              value={formData.monthsAsCustomer}
              onChange={(e) => handleChange('monthsAsCustomer', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('monthsAsCustomer')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.monthsAsCustomer && touched.monthsAsCustomer
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 48"
            />
            {errors.monthsAsCustomer && touched.monthsAsCustomer && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.monthsAsCustomer}
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
            <p className="text-[11px] font-sans text-[#777]">Coverage terms, deductibles, and premium limits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Policy Number */}
          <div>
            <label htmlFor="car-field-policyNumber" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-policyNumber"
              type="text"
              value={formData.policyNumber}
              onChange={(e) => handleChange('policyNumber', e.target.value)}
              onBlur={() => handleBlur('policyNumber')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.policyNumber && touched.policyNumber
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="POL-894102"
            />
            {errors.policyNumber && touched.policyNumber && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.policyNumber}
              </p>
            )}
          </div>

          {/* Policy State */}
          <div>
            <label htmlFor="car-field-policyState" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy State <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-policyState"
              value={formData.policyState}
              onChange={(e) => handleChange('policyState', e.target.value)}
              onBlur={() => handleBlur('policyState')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="OH">Ohio (OH)</option>
              <option value="IN">Indiana (IN)</option>
              <option value="IL">Illinois (IL)</option>
              <option value="NY">New York (NY)</option>
              <option value="PA">Pennsylvania (PA)</option>
              <option value="TX">Texas (TX)</option>
              <option value="CA">California (CA)</option>
            </select>
          </div>

          {/* Policy CSL */}
          <div>
            <label htmlFor="car-field-policyCsl" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy CSL <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-policyCsl"
              value={formData.policyCsl}
              onChange={(e) => handleChange('policyCsl', e.target.value)}
              onBlur={() => handleBlur('policyCsl')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="100/300">100/300 ($100k / $300k)</option>
              <option value="250/500">250/500 ($250k / $500k)</option>
              <option value="500/1000">500/1000 ($500k / $1,000k)</option>
            </select>
          </div>

          {/* Policy Deductible */}
          <div>
            <label htmlFor="car-field-policyDeductible" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Policy Deductible ($) <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-policyDeductible"
              value={formData.policyDeductible}
              onChange={(e) => handleChange('policyDeductible', Number(e.target.value))}
              onBlur={() => handleBlur('policyDeductible')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={2000}>$2,000</option>
            </select>
          </div>

          {/* Annual Premium */}
          <div>
            <label htmlFor="car-field-annualPremium" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Annual Premium ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-annualPremium"
              type="number"
              min="0"
              value={formData.annualPremium}
              onChange={(e) => handleChange('annualPremium', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('annualPremium')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.annualPremium && touched.annualPremium
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 1425"
            />
            {errors.annualPremium && touched.annualPremium && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.annualPremium}
              </p>
            )}
          </div>

          {/* Umbrella Limit */}
          <div>
            <label htmlFor="car-field-umbrellaLimit" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Umbrella Limit ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-umbrellaLimit"
              type="number"
              min="0"
              value={formData.umbrellaLimit}
              onChange={(e) => handleChange('umbrellaLimit', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('umbrellaLimit')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.umbrellaLimit && touched.umbrellaLimit
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 0"
            />
            {errors.umbrellaLimit && touched.umbrellaLimit && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.umbrellaLimit}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Incident Information */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#1b1e25]">
          <div className="w-7 h-7 rounded border border-[#d3d3d3] bg-[#f5f5f5] text-[#444] flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans text-[#171717]">Incident Information</h3>
            <p className="text-[11px] font-sans text-[#777]">Circumstances, time, authorities, and loss severity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Incident Type */}
          <div>
            <label htmlFor="car-field-incidentType" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-incidentType"
              value={formData.incidentType}
              onChange={(e) => handleChange('incidentType', e.target.value)}
              onBlur={() => handleBlur('incidentType')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Single Vehicle Collision">Single Vehicle Collision</option>
              <option value="Multi-vehicle Collision">Multi-vehicle Collision</option>
              <option value="Vehicle Theft">Vehicle Theft</option>
              <option value="Parked Car">Parked Car</option>
            </select>
          </div>

          {/* Collision Type */}
          <div>
            <label htmlFor="car-field-collisionType" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Collision Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-collisionType"
              value={formData.collisionType}
              onChange={(e) => handleChange('collisionType', e.target.value)}
              onBlur={() => handleBlur('collisionType')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Front Collision">Front Collision</option>
              <option value="Rear Collision">Rear Collision</option>
              <option value="Side Collision">Side Collision</option>
              <option value="None">None (Theft/Parked)</option>
            </select>
          </div>

          {/* Incident Severity */}
          <div>
            <label htmlFor="car-field-incidentSeverity" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident Severity <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-incidentSeverity"
              value={formData.incidentSeverity}
              onChange={(e) => handleChange('incidentSeverity', e.target.value)}
              onBlur={() => handleBlur('incidentSeverity')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Minor Damage">Minor Damage</option>
              <option value="Major Damage">Major Damage</option>
              <option value="Total Loss">Total Loss</option>
              <option value="Trivial Damage">Trivial Damage</option>
            </select>
          </div>

          {/* Incident State */}
          <div>
            <label htmlFor="car-field-incidentState" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident State <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-incidentState"
              value={formData.incidentState}
              onChange={(e) => handleChange('incidentState', e.target.value)}
              onBlur={() => handleBlur('incidentState')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="OH">Ohio (OH)</option>
              <option value="IN">Indiana (IN)</option>
              <option value="IL">Illinois (IL)</option>
              <option value="NY">New York (NY)</option>
              <option value="PA">Pennsylvania (PA)</option>
              <option value="WV">West Virginia (WV)</option>
              <option value="VA">Virginia (VA)</option>
            </select>
          </div>

          {/* Incident City */}
          <div>
            <label htmlFor="car-field-incidentCity" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident City <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-incidentCity"
              type="text"
              value={formData.incidentCity}
              onChange={(e) => handleChange('incidentCity', e.target.value)}
              onBlur={() => handleBlur('incidentCity')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.incidentCity && touched.incidentCity
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. Columbus"
            />
            {errors.incidentCity && touched.incidentCity && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.incidentCity}
              </p>
            )}
          </div>

          {/* Incident Hour */}
          <div>
            <label htmlFor="car-field-incidentHour" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Incident Hour (0–23) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-incidentHour"
              type="number"
              min="0"
              max="23"
              value={formData.incidentHour}
              onChange={(e) => handleChange('incidentHour', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('incidentHour')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.incidentHour && touched.incidentHour
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 14"
            />
            {errors.incidentHour && touched.incidentHour && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.incidentHour}
              </p>
            )}
          </div>

          {/* Number of Vehicles */}
          <div>
            <label htmlFor="car-field-numberOfVehicles" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Number of Vehicles <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-numberOfVehicles"
              type="number"
              min="1"
              value={formData.numberOfVehicles}
              onChange={(e) => handleChange('numberOfVehicles', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('numberOfVehicles')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.numberOfVehicles && touched.numberOfVehicles
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="1"
            />
            {errors.numberOfVehicles && touched.numberOfVehicles && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.numberOfVehicles}
              </p>
            )}
          </div>

          {/* Property Damage */}
          <div>
            <label htmlFor="car-field-propertyDamage" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Property Damage <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-propertyDamage"
              value={formData.propertyDamage}
              onChange={(e) => handleChange('propertyDamage', e.target.value)}
              onBlur={() => handleBlur('propertyDamage')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>

          {/* Bodily Injuries */}
          <div>
            <label htmlFor="car-field-bodilyInjuries" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Bodily Injuries <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-bodilyInjuries"
              type="number"
              min="0"
              value={formData.bodilyInjuries}
              onChange={(e) => handleChange('bodilyInjuries', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('bodilyInjuries')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.bodilyInjuries && touched.bodilyInjuries
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="0"
            />
            {errors.bodilyInjuries && touched.bodilyInjuries && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.bodilyInjuries}
              </p>
            )}
          </div>

          {/* Witnesses */}
          <div>
            <label htmlFor="car-field-witnesses" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Witnesses <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-witnesses"
              type="number"
              min="0"
              value={formData.witnesses}
              onChange={(e) => handleChange('witnesses', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('witnesses')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.witnesses && touched.witnesses
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="0"
            />
            {errors.witnesses && touched.witnesses && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.witnesses}
              </p>
            )}
          </div>

          {/* Police Report Available */}
          <div>
            <label htmlFor="car-field-policeReportAvailable" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Police Report Available <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-policeReportAvailable"
              value={formData.policeReportAvailable}
              onChange={(e) => handleChange('policeReportAvailable', e.target.value)}
              onBlur={() => handleBlur('policeReportAvailable')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </div>

          {/* Authorities Contacted */}
          <div>
            <label htmlFor="car-field-authoritiesContacted" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Authorities Contacted <span className="text-rose-500">*</span>
            </label>
            <select
              id="car-field-authoritiesContacted"
              value={formData.authoritiesContacted}
              onChange={(e) => handleChange('authoritiesContacted', e.target.value)}
              onBlur={() => handleBlur('authoritiesContacted')}
              className="w-full px-3 py-2 rounded border border-[#e1e1e1] text-xs sm:text-sm font-sans focus:border-[#9e563e] text-[#171717] bg-white focus:outline-none"
            >
              <option value="Police">Police</option>
              <option value="Fire">Fire</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Other">Other</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Vehicle Information */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#1b1e25]">
          <div className="w-7 h-7 rounded border border-[#d3d3d3] bg-[#f5f5f5] text-[#444] flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans text-[#171717]">Vehicle Information</h3>
            <p className="text-[11px] font-sans text-[#777]">Insured automobile specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Vehicle Make */}
          <div>
            <label htmlFor="car-field-vehicleMake" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Vehicle Make <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-vehicleMake"
              type="text"
              value={formData.vehicleMake}
              onChange={(e) => handleChange('vehicleMake', e.target.value)}
              onBlur={() => handleBlur('vehicleMake')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.vehicleMake && touched.vehicleMake
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. Toyota"
            />
            {errors.vehicleMake && touched.vehicleMake && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.vehicleMake}
              </p>
            )}
          </div>

          {/* Vehicle Model */}
          <div>
            <label htmlFor="car-field-vehicleModel" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Vehicle Model <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-vehicleModel"
              type="text"
              value={formData.vehicleModel}
              onChange={(e) => handleChange('vehicleModel', e.target.value)}
              onBlur={() => handleBlur('vehicleModel')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.vehicleModel && touched.vehicleModel
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. Camry"
            />
            {errors.vehicleModel && touched.vehicleModel && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.vehicleModel}
              </p>
            )}
          </div>

          {/* Vehicle Year */}
          <div>
            <label htmlFor="car-field-vehicleYear" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Vehicle Year <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-vehicleYear"
              type="number"
              min="1980"
              max={new Date().getFullYear() + 1}
              value={formData.vehicleYear}
              onChange={(e) => handleChange('vehicleYear', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('vehicleYear')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.vehicleYear && touched.vehicleYear
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 2021"
            />
            {errors.vehicleYear && touched.vehicleYear && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.vehicleYear}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: Claim Information */}
      <div className="bg-white rounded-md border border-[#e1e1e1] p-6">
        <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#1b1e25]">
          <div className="w-7 h-7 rounded border border-[#d3d3d3] bg-[#f5f5f5] text-[#444] flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-sans text-[#171717]">Claim Information</h3>
            <p className="text-[11px] font-sans text-[#777]">Claim sub-totals across injuries, property, and vehicle repairs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Claim Amount */}
          <div>
            <label htmlFor="car-field-totalClaimAmount" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Total Claim Amount ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-totalClaimAmount"
              type="number"
              min="1"
              value={formData.totalClaimAmount}
              onChange={(e) => handleChange('totalClaimAmount', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('totalClaimAmount')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 ${
                errors.totalClaimAmount && touched.totalClaimAmount
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="e.g. 4800"
            />
            {errors.totalClaimAmount && touched.totalClaimAmount && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.totalClaimAmount}
              </p>
            )}
          </div>

          {/* Injury Claim */}
          <div>
            <label htmlFor="car-field-injuryClaim" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Injury Claim ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-injuryClaim"
              type="number"
              min="0"
              value={formData.injuryClaim}
              onChange={(e) => handleChange('injuryClaim', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('injuryClaim')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.injuryClaim && touched.injuryClaim
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="0"
            />
            {errors.injuryClaim && touched.injuryClaim && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.injuryClaim}
              </p>
            )}
          </div>

          {/* Property Claim */}
          <div>
            <label htmlFor="car-field-propertyClaim" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Property Claim ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-propertyClaim"
              type="number"
              min="0"
              value={formData.propertyClaim}
              onChange={(e) => handleChange('propertyClaim', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('propertyClaim')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.propertyClaim && touched.propertyClaim
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="0"
            />
            {errors.propertyClaim && touched.propertyClaim && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.propertyClaim}
              </p>
            )}
          </div>

          {/* Vehicle Claim */}
          <div>
            <label htmlFor="car-field-vehicleClaim" className="block text-[11px] font-sans uppercase tracking-wider text-[#666] mb-1">
              Vehicle Claim ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="car-field-vehicleClaim"
              type="number"
              min="0"
              value={formData.vehicleClaim}
              onChange={(e) => handleChange('vehicleClaim', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('vehicleClaim')}
              className={`w-full px-3 py-2 rounded border text-xs sm:text-sm font-sans transition-colors focus:outline-none ${
                errors.vehicleClaim && touched.vehicleClaim
                  ? 'border-rose-800 bg-[#fbf1f0] focus:border-rose-600 text-rose-300'
                  : 'border-[#e1e1e1] focus:border-[#9e563e] bg-white text-[#171717]'
              }`}
              placeholder="0"
            />
            {errors.vehicleClaim && touched.vehicleClaim && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.vehicleClaim}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          id="btn-analyze-car-claim"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 rounded bg-[#9e563e] hover:bg-[#84432f] disabled:opacity-50 text-white font-sans font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
        >
          <span>RUN VEHICLE ANOMALY ANALYSIS</span>
        </button>
      </div>
    </form>
  );
};
