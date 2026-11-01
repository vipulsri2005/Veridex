// Utility to manage Gemini API Key configuration
const STORAGE_KEY = 'insurance_fraud_gemini_api_key';

export function getGeminiApiKey(): string {
  // 1. Check browser local storage
  const userKey = localStorage.getItem(STORAGE_KEY);
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }

  // 2. Check Vite environment variables (VITE_GEMINI_API_KEY or GEMINI_API_KEY)
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
  const envViteKey = metaEnv?.VITE_GEMINI_API_KEY;
  if (envViteKey && typeof envViteKey === 'string' && envViteKey.trim().length > 0) {
    return envViteKey.trim();
  }

  // 3. Check define fallback
  const envProcessKey = metaEnv?.GEMINI_API_KEY;
  if (envProcessKey && typeof envProcessKey === 'string' && envProcessKey.trim().length > 0) {
    return envProcessKey.trim();
  }

  return '';
}

export function saveGeminiApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  // Dispatch custom event to notify components
  window.dispatchEvent(new Event('gemini_key_updated'));
}

export function clearGeminiApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('gemini_key_updated'));
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey().length > 0;
}
