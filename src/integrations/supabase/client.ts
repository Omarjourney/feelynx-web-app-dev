// Guarded Supabase client that falls back to a stub in previews
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL as SUPABASE_URL_ENV } from '@/config';
import type { Database } from './types';

type Stub = {
  from: () => any;
  auth: {
    onAuthStateChange: (cb: (event: any, session: any) => void) => {
      data: { subscription: { unsubscribe: () => void } };
    };
    getSession: () => Promise<{ data: { session: any }; error: null }>;
    signUp: (args: any) => Promise<{ data: { user: any; session: any }; error: null }>;
    signInWithPassword: (args: any) => Promise<{ data: { user: any; session: any }; error: null }>;
    signOut: () => Promise<{ error: null }>;
  };
};

function createStub(): Stub {
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
  builder.then = (resolve: (v: unknown) => unknown, reject?: (r: unknown) => unknown) =>
    resolved.then(resolve, reject);
  builder.catch = (reject: (r: unknown) => unknown) => resolved.catch(reject);
  builder.finally = (cb: () => unknown) => resolved.finally(cb);
  return {
    from: () => builder,
    auth: {
      onAuthStateChange: (_cb) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async (_args: any) => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async (_args: any) => ({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
  };
}

const url = SUPABASE_URL_ENV;
const key = SUPABASE_ANON_KEY;

export const supabase: any =
  url && key
    ? createClient<Database>(url, key, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : createStub();
