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
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const normalizeBaseUrl = (value: string): string =>
  value.endsWith('/') ? value : `${value}/`;

const resolvedEnv = REQUIRED_ENV_VARS.reduce((acc, key) => {
  acc[key] = getEnvVar(key);
  return acc;
}, {} as EnvLookup);

export const SUPABASE_URL = resolvedEnv.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = resolvedEnv.VITE_SUPABASE_ANON_KEY;
export const UNSPLASH_RANDOM_BASE_URL = normalizeBaseUrl(
  resolvedEnv.VITE_UNSPLASH_RANDOM_BASE_URL,
);
