export interface ModelFeatureSchema {
  name: string;
  kind: 'number' | 'category';
  categories: string[];
}

export interface HistoricalDemoRecord {
  record_id: string;
  record_number: number;
  actual_label: 0 | 1;
  features: Record<string, string | number>;
}

export interface HistoricalDemoResponse {
  source: string;
  demonstration_only: true;
  records: HistoricalDemoRecord[];
}

export interface ModelPrediction {
  success: true;
  prediction: 0 | 1;
  prediction_label: 'Legitimate Claim' | 'Fraudulent Claim';
  fraud_probability: number | null;
  classification_threshold: number;
  model_name: string;
  gemini_explanation: string | null;
  gemini_status: 'available' | 'not_configured' | 'unavailable';
}

const configuredApiBase = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_ML_API_BASE_URL;
const API_BASE = (configuredApiBase || 'http://localhost:8000').replace(/\/$/, '');

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.detail === 'string'
      ? payload.detail
      : Array.isArray(payload.detail)
        ? payload.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(' ')
        : 'The model service could not complete this request.';
    throw new Error(detail);
  }
  return payload as T;
}

export async function fetchModelSchema(signal?: AbortSignal): Promise<ModelFeatureSchema[]> {
  const response = await fetch(`${API_BASE}/api/schema`, { signal });
  const payload = await readResponse<{ insurance_type: string; features: ModelFeatureSchema[] }>(response);
  if (payload.insurance_type !== 'vehicle' || payload.features.length !== 32) {
    throw new Error('The model service returned an unexpected feature schema.');
  }
  return payload.features;
}

export async function fetchHistoricalDemoRecords(signal?: AbortSignal): Promise<HistoricalDemoResponse> {
  const response = await fetch(`${API_BASE}/api/demo-records?per_class=3`, { signal });
  return readResponse<HistoricalDemoResponse>(response);
}

export async function predictVehicleClaim(
  features: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<ModelPrediction> {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ insurance_type: 'vehicle', features }),
    signal,
  });
  return readResponse<ModelPrediction>(response);
}

export function validateModelFeatures(
  schema: ModelFeatureSchema[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const feature of schema) {
    const value = values[feature.name]?.trim() ?? '';
    if (!value) {
      errors[feature.name] = 'Required';
      continue;
    }
    if (feature.kind === 'number') {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue) || numericValue < 0) {
        errors[feature.name] = 'Enter a non-negative whole number';
      }
    } else if (!feature.categories.includes(value)) {
      errors[feature.name] = 'Choose one of the exact categories used to train the model';
    }
  }
  return errors;
}

export function toModelFeatureRecord(
  schema: ModelFeatureSchema[],
  values: Record<string, string>,
): Record<string, string | number> {
  return Object.fromEntries(schema.map((feature) => [
    feature.name,
    feature.kind === 'number' ? Number(values[feature.name]) : values[feature.name],
  ]));
}
