import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleHelp, Cpu, Database, LoaderCircle, Play, RotateCcw, Sparkles } from 'lucide-react';
import { GeminiSettingsModal } from '../components/GeminiSettingsModal';
import { explainModelPrediction } from '../services/gemini';
import { fetchHistoricalDemoRecords, fetchModelSchema, HistoricalDemoRecord, ModelFeatureSchema, ModelPrediction, predictVehicleClaim, toModelFeatureRecord, validateModelFeatures } from '../services/mlApi';
import { isGeminiConfigured } from '../services/geminiKey';

interface ModelDemoProps {
  onBackToDashboard: () => void;
}

const sections = [
  {
    title: 'Incident timing',
    investigation: false,
    description: 'Timing recorded for the accident and claim report.',
    features: ['Month', 'WeekOfMonth', 'DayOfWeek', 'DayOfWeekClaimed', 'MonthClaimed', 'WeekOfMonthClaimed', 'Year'],
  },
  {
    title: 'Policyholder',
    investigation: false,
    description: 'Demographic values as represented in the source dataset.',
    features: ['Sex', 'MaritalStatus', 'Age', 'AgeOfPolicyHolder'],
  },
  {
    title: 'Vehicle and policy',
    investigation: false,
    description: 'Use values from verified policy or vehicle records; do not infer from unrelated form fields.',
    features: ['Make', 'AccidentArea', 'PolicyType', 'VehicleCategory', 'VehiclePrice', 'PolicyNumber', 'Deductible', 'DriverRating', 'AgeOfVehicle', 'NumberOfCars', 'BasePolicy', 'AgentType'],
  },
  {
    title: 'Claim history and evidence',
    investigation: false,
    description: 'Use verified claim history and the evidence available at the chosen review stage.',
    features: ['Days_Policy_Accident', 'Days_Policy_Claim', 'PastNumberOfClaims', 'AddressChange_Claim', 'PoliceReportFiled', 'WitnessPresent'],
  },
  {
    title: 'Investigation-stage fields',
    description: 'These values may not exist at initial claim submission. Enter only values confirmed in the case record.',
    features: ['Fault', 'RepNumber', 'NumberOfSuppliments'],
    investigation: true,
  },
];

const featureDescriptions: Record<string, string> = {
  Month: 'Accident month', WeekOfMonth: 'Accident week of month', DayOfWeek: 'Accident weekday', Make: 'Dataset vehicle make',
  AccidentArea: 'Accident location area classification', DayOfWeekClaimed: 'Claim report weekday', MonthClaimed: 'Claim report month',
  WeekOfMonthClaimed: 'Claim report week of month', Sex: 'Policyholder sex category', MaritalStatus: 'Policyholder marital status',
  Age: 'Policyholder age in years', Fault: 'Fault category recorded for the incident', PolicyType: 'Policy and coverage type',
  VehicleCategory: 'Dataset vehicle category', VehiclePrice: 'Vehicle price band', PolicyNumber: 'Numeric policy identifier used by the training data',
  RepNumber: 'Internal representative number', Deductible: 'Policy deductible', DriverRating: 'Insurer driver rating',
  Days_Policy_Accident: 'Time between policy start and accident, using the dataset category', Days_Policy_Claim: 'Time between accident and claim, using the dataset category',
  PastNumberOfClaims: 'Verified prior claim count band', AgeOfVehicle: 'Vehicle age band', AgeOfPolicyHolder: 'Policyholder age band',
  PoliceReportFiled: 'Police report status', WitnessPresent: 'Whether a witness was recorded', AgentType: 'Policy agent type',
  NumberOfSuppliments: 'Supplement count band (source spelling preserved)', AddressChange_Claim: 'Address-change interval relative to claim',
  NumberOfCars: 'Number of insured cars on policy', Year: 'Accident year', BasePolicy: 'Base coverage category',
};

const humanize = (name: string) => name.replaceAll('_', ' ');

export const ModelDemo: React.FC<ModelDemoProps> = ({ onBackToDashboard }) => {
  const [schema, setSchema] = useState<ModelFeatureSchema[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [records, setRecords] = useState<HistoricalDemoRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState('');
  const [recordOrigin, setRecordOrigin] = useState<HistoricalDemoRecord | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(isGeminiConfigured());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchModelSchema(controller.signal)
      .then(setSchema)
      .catch((error: Error) => setSchemaError(error.message))
      .finally(() => setSchemaLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const update = () => setGeminiConfigured(isGeminiConfigured());
    window.addEventListener('gemini_key_updated', update);
    return () => window.removeEventListener('gemini_key_updated', update);
  }, []);

  const isRecordUnchanged = useMemo(() => {
    if (!recordOrigin) return false;
    return schema.every((feature) => values[feature.name] === String(recordOrigin.features[feature.name]));
  }, [recordOrigin, schema, values]);

  const loadHistoricalRecords = async () => {
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const response = await fetchHistoricalDemoRecords();
      setRecords(response.records);
      if (!response.records.length) setRecordsError('The source dataset contains no complete demonstration rows.');
    } catch (error) {
      setRecordsError(error instanceof Error ? error.message : 'Historical records could not be loaded.');
    } finally {
      setRecordsLoading(false);
    }
  };

  const loadSelectedRecord = () => {
    const record = records.find((item) => item.record_id === selectedRecord);
    if (!record) return;
    setValues(Object.fromEntries(schema.map((feature) => [feature.name, String(record.features[feature.name])] )));
    setRecordOrigin(record);
    setErrors({});
    setPrediction(null);
    setGeminiExplanation(null);
    setRequestError(null);
  };

  const changeFeature = (featureName: string, value: string) => {
    setValues((current) => ({ ...current, [featureName]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[featureName];
      return next;
    });
    setPrediction(null);
    setGeminiExplanation(null);
    setRequestError(null);
  };

  const resetForm = () => {
    setValues({});
    setErrors({});
    setPrediction(null);
    setGeminiExplanation(null);
    setRequestError(null);
    setRecordOrigin(null);
    setSelectedRecord('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setRequestError(null);
    setPrediction(null);
    setGeminiExplanation(null);
    const validation = validateModelFeatures(schema, values);
    setErrors(validation);
    if (Object.keys(validation).length) {
      const firstInvalid = schema.find((feature) => validation[feature.name]);
      document.getElementById(`model-feature-${firstInvalid?.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const features = toModelFeatureRecord(schema, values);
    setIsSubmitting(true);
    try {
      const result = await predictVehicleClaim(features);
      setPrediction(result);
      if (result.gemini_explanation) {
        setGeminiExplanation(result.gemini_explanation);
      } else if (geminiConfigured) {
        setGeminiLoading(true);
        const explanation = await explainModelPrediction(result, features);
        setGeminiExplanation(explanation);
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'The model service could not complete this prediction.');
    } finally {
      setIsSubmitting(false);
      setGeminiLoading(false);
    }
  };

  return (
    <div id="ml-demonstration-page" className="max-w-5xl mx-auto py-2 space-y-6 animate-in fade-in-50 duration-200">
      <header className="pt-5">
        <p className="eyebrow"><span>02</span> / MODEL LAB</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#111] mt-4">Random Forest demonstration.</h1>
        <p className="mt-3 max-w-3xl text-[#666] leading-7">A separate academic workflow that sends a complete, explicitly entered 32-feature record to the trained vehicle model. It does not create or submit a new insurance claim.</p>
      </header>

      <div role="note" className="rounded border border-amber-300 bg-[#fff8e8] p-4 flex gap-3 text-sm text-[#5e4a23]">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
        <div><strong className="block">Academic demonstration only</strong><span>The saved model has low fraud recall (3.78% at its recorded threshold) and must not determine claim outcomes. Three inputs below may only be known after initial intake. Use verified records, never guesses.</span></div>
      </div>

      <section className="bg-white rounded border border-[#e1e1e1] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="eyebrow"><Database className="w-4 h-4" /> HISTORICAL DATASET</div>
            <h2 className="font-serif text-2xl mt-2">Test a genuine training record</h2>
            <p className="text-sm leading-6 text-[#666] mt-2 max-w-2xl">Loads a small, balanced sample from the original CSV when available. These are historical rows, not new claims. The actual dataset label is shown separately from the model prediction.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button type="button" onClick={loadHistoricalRecords} disabled={recordsLoading} className="btn-secondary disabled:opacity-60">
              {recordsLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Load historical records
            </button>
            <select aria-label="Historical dataset record" value={selectedRecord} onChange={(event) => setSelectedRecord(event.target.value)} className="min-h-11 min-w-56 rounded border border-[#d5d5d5] bg-white px-3 text-sm text-[#222]">
              <option value="">Choose a record</option>
              {records.map((record) => <option key={record.record_id} value={record.record_id}>Row {record.record_number} · actual {record.actual_label === 1 ? 'fraud' : 'non-fraud'}</option>)}
            </select>
            <button type="button" onClick={loadSelectedRecord} disabled={!selectedRecord} className="btn-primary disabled:opacity-50">Load record</button>
          </div>
        </div>
        {recordsError && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{recordsError}</p>}
        {recordOrigin && <p className="mt-3 text-xs text-[#666]">{isRecordUnchanged ? `Loaded genuine historical row ${recordOrigin.record_number}.` : `Historical row ${recordOrigin.record_number} has been edited; this is now a modified demonstration input.`}</p>}
      </section>

      {schemaLoading && <div role="status" className="rounded border border-[#e1e1e1] bg-white p-5 text-sm text-[#555] flex items-center gap-2"><LoaderCircle className="w-4 h-4 animate-spin text-[#9e563e]" />Loading the model feature schema…</div>}
      {schemaError && <div role="alert" className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{schemaError} Check that the FastAPI service is running, then reload this page.</div>}

      {!schemaLoading && !schemaError && (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ddd] pb-3">
            <div><p className="eyebrow"><span>32</span> / REQUIRED INPUTS</p><h2 className="font-serif text-2xl mt-1">Complete the model record</h2></div>
            <button type="button" onClick={resetForm} className="btn-secondary"><RotateCcw className="w-4 h-4" />Clear fields</button>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="bg-white rounded border border-[#e1e1e1] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#e1e1e1] pb-3 mb-4">
                <div><h3 className="font-sans font-bold text-[#171717]">{section.title}</h3><p className="mt-1 text-xs text-[#777] leading-5">{section.description}</p></div>
                {section.investigation && <span className="self-start rounded border border-amber-300 bg-[#fff8e8] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">Investigation stage</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.features.map((name) => {
                  const feature = schema.find((item) => item.name === name);
                  if (!feature) return null;
                  const investigation = ['Fault', 'RepNumber', 'NumberOfSuppliments'].includes(name);
                  return (
                    <div key={name}>
                      <label htmlFor={`model-feature-${name}`} className="block text-[11px] uppercase tracking-wider text-[#666] mb-1">
                        {humanize(name)} <span className="text-rose-600">*</span>
                        {investigation && <span className="ml-1 text-amber-700">· investigation</span>}
                      </label>
                      {feature.kind === 'category' ? (
                        <select id={`model-feature-${name}`} value={values[name] ?? ''} onChange={(event) => changeFeature(name, event.target.value)} aria-invalid={Boolean(errors[name])} className={`w-full min-h-10 px-3 rounded border bg-white text-sm text-[#171717] focus:outline-none focus:border-[#9e563e] ${errors[name] ? 'border-rose-500' : 'border-[#d5d5d5]'}`}>
                          <option value="">Choose exact training category</option>
                          {feature.categories.map((category) => <option value={category} key={category}>{category}</option>)}
                        </select>
                      ) : (
                        <input id={`model-feature-${name}`} type="number" min="0" step="1" inputMode="numeric" value={values[name] ?? ''} onChange={(event) => changeFeature(name, event.target.value)} aria-invalid={Boolean(errors[name])} placeholder="Whole number" className={`w-full min-h-10 px-3 rounded border bg-white text-sm text-[#171717] placeholder:text-[#aaa] focus:outline-none focus:border-[#9e563e] ${errors[name] ? 'border-rose-500' : 'border-[#d5d5d5]'}`} />
                      )}
                      <p className="mt-1 text-[10px] leading-4 text-[#888]">{featureDescriptions[name]} <span className="font-mono">({name})</span></p>
                      {errors[name] && <p role="alert" className="mt-1 text-[11px] text-rose-700">{errors[name]}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {requestError && <div role="alert" className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{requestError}</div>}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#777]">Every field is required. Categories come directly from the fitted training encoder.</p>
            <button type="submit" disabled={isSubmitting || !schema.length} className="btn-primary min-w-48 disabled:opacity-60">
              {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isSubmitting ? 'Running Random Forest…' : 'Run actual ML prediction'}
            </button>
          </div>
        </form>
      )}

      {prediction && (
        <section aria-live="polite" className={`rounded border p-5 sm:p-6 ${prediction.prediction === 1 ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {prediction.prediction === 1 ? <AlertTriangle className="w-6 h-6 text-rose-700 mt-1" /> : <CheckCircle2 className="w-6 h-6 text-emerald-700 mt-1" />}
              <div><p className="eyebrow"><Cpu className="w-4 h-4" /> ACTUAL BACKEND MODEL OUTPUT</p><h2 className="font-serif text-3xl mt-2 text-[#171717]">{prediction.prediction_label}</h2><p className="mt-2 text-sm text-[#555]">{prediction.model_name} · class {prediction.prediction} · threshold {prediction.classification_threshold}</p></div>
            </div>
            <div className="rounded border border-white/80 bg-white px-4 py-3 min-w-44">
              <p className="text-[10px] uppercase tracking-wider text-[#777]">Fraud probability</p>
              <p className="text-3xl font-semibold text-[#171717]">{prediction.fraud_probability === null ? 'Not available' : `${(prediction.fraud_probability * 100).toFixed(2)}%`}</p>
            </div>
          </div>
          {recordOrigin && <p className="mt-4 text-xs font-semibold text-[#555]">Historical demonstration row {recordOrigin.record_number} · known dataset label: {recordOrigin.actual_label === 1 ? 'FraudFound_P = 1' : 'FraudFound_P = 0'}{!isRecordUnchanged && ' · inputs modified'}</p>}
          <p className="mt-4 text-xs text-[#666]">This is the classifier's output, not a fraud finding or adjudication. The probability is returned by the trained model; Gemini does not calculate or alter it.</p>
          <div className="mt-5 rounded border border-white bg-white p-4">
            <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-sm text-[#222] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#9e563e]" />Gemini explanation</h3>{geminiLoading && <span role="status" className="text-xs text-[#777] flex items-center gap-2"><LoaderCircle className="w-3.5 h-3.5 animate-spin" />Generating</span>}</div>
            {geminiExplanation ? <p className="mt-2 text-sm leading-6 text-[#555]">{geminiExplanation}</p> : geminiLoading ? null : <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><p className="text-sm leading-6 text-[#777]">{geminiConfigured ? 'Gemini could not provide an explanation. The model prediction above is still available.' : 'Gemini is not configured. The model prediction above is still available.'}</p><button type="button" onClick={() => setSettingsOpen(true)} className="text-link shrink-0">Configure Gemini <CircleHelp className="w-4 h-4" /></button></div>}
          </div>
        </section>
      )}

      <GeminiSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <button type="button" onClick={onBackToDashboard} className="text-link text-sm">Return to overview</button>
    </div>
  );
};
