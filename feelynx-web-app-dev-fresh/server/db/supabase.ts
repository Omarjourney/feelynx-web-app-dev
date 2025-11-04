import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const createStubBuilder = () => {
  const resolved = Promise.resolve({ data: null, error: null });
  const builder: any = {
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    select: () => builder,
    eq: () => builder,
    or: () => builder,
    order: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  };
  builder.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
    resolved.then(resolve, reject);
  builder.catch = (reject: (reason: unknown) => unknown) => resolved.catch(reject);
  builder.finally = (callback: () => unknown) => resolved.finally(callback);
  return builder;
};

const createStubSupabase = () => ({
  from: () => createStubBuilder(),
});

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase environment variables are not set');
}

export const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : (createStubSupabase() as any);
