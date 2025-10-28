const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_UNSPLASH_RANDOM_BASE_URL',
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_VARS)[number];

type EnvLookup = {
  [K in RequiredEnvKey]: string;
};

const getEnvVar = (key: RequiredEnvKey): string => {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.length === 0) {
    // Provide safe defaults in hosted preview environments to avoid hard crashes
    if (key === 'VITE_UNSPLASH_RANDOM_BASE_URL') return 'https://source.unsplash.com/random/';
    // For Supabase, return empty string; features should handle missing config gracefully.
    console.warn(`Missing environment variable: ${key}. Using fallback.`);
    return '';
  }
  return value;
};

const normalizeBaseUrl = (value: string): string => (value.endsWith('/') ? value : `${value}/`);

const resolvedEnv = REQUIRED_ENV_VARS.reduce((acc, key) => {
  acc[key] = getEnvVar(key);
  return acc;
}, {} as EnvLookup);

export const SUPABASE_URL = resolvedEnv.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = resolvedEnv.VITE_SUPABASE_ANON_KEY;
export const UNSPLASH_RANDOM_BASE_URL = normalizeBaseUrl(
  resolvedEnv.VITE_UNSPLASH_RANDOM_BASE_URL,
);

// Feature flags to progressively enable new sections without risking regressions
export const FEATURES = {
  live: true,
  calls: true,
  content: true,
  groups: true,
  patterns: true,
  remote: true,
  companions: true,
  contests: true,
  shop: true,
  settings: true,
} as const;
