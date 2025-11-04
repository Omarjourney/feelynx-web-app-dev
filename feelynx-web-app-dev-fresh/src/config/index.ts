const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_UNSPLASH_RANDOM_BASE_URL',
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_VARS)[number];

type EnvLookup = {
  [K in RequiredEnvKey]: string;
};

// Allow common NEXT_PUBLIC_* fallbacks to avoid misconfiguration when migrating from Next.js
const FALLBACKS: Record<RequiredEnvKey, string[]> = {
  VITE_SUPABASE_URL: ['NEXT_PUBLIC_SUPABASE_URL'],
  VITE_SUPABASE_ANON_KEY: [
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  VITE_UNSPLASH_RANDOM_BASE_URL: [],
};

const getEnvVar = (key: RequiredEnvKey): string => {
  const value = import.meta.env[key];
  if (typeof value === 'string' && value.length > 0) return value;

  // Try fallbacks if primary is missing
  for (const alt of FALLBACKS[key] || []) {
    const v = (import.meta.env as any)[alt];
    if (typeof v === 'string' && v.length > 0) {
      console.warn(`Using fallback env var ${alt} for ${key}. Update to ${key} when possible.`);
      return v;
    }
  }

  // Provide safe defaults in hosted preview environments to avoid hard crashes
  if (key === 'VITE_UNSPLASH_RANDOM_BASE_URL') return 'https://source.unsplash.com/random/';
  // For Supabase, return empty string; features should handle missing config gracefully.
  console.warn(`Missing environment variable: ${key}. Using fallback.`);
  return '';
};

const normalizeBaseUrl = (value: string): string => (value.endsWith('/') ? value : `${value}/`);

const resolvedEnv = REQUIRED_ENV_VARS.reduce((acc, key) => {
  acc[key] = getEnvVar(key);
  return acc;
}, {} as EnvLookup);

const resolveBooleanFlag = (value: unknown, defaultValue: boolean) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['false', '0', 'off', 'no'].includes(normalized)) return false;
    if (['true', '1', 'on', 'yes'].includes(normalized)) return true;
    return defaultValue;
  }
  return Boolean(value);
};

export const SUPABASE_URL = resolvedEnv.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = resolvedEnv.VITE_SUPABASE_ANON_KEY;
export const UNSPLASH_RANDOM_BASE_URL = normalizeBaseUrl(resolvedEnv.VITE_UNSPLASH_RANDOM_BASE_URL);

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
  styleguide: true,
} as const;

const brandV2Env =
  (import.meta.env.VITE_BRAND_V2_WORDMARK as string | undefined) ??
  ((import.meta.env as any).NEXT_PUBLIC_BRAND_V2_WORDMARK as string | undefined);

export const BRAND = {
  v2Wordmark: resolveBooleanFlag(brandV2Env, true),
} as const;
