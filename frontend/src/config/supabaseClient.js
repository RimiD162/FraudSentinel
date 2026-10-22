/**
 * Supabase Client Initialization for FraudSentinel.
 * Configured using VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 * Never expose service_role secret keys or DB credentials in client-side code!
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawKey &&
    !rawUrl.includes('your-project') &&
    !rawKey.includes('your-supabase-publishable')
);

const clientUrl = isSupabaseConfigured ? rawUrl : (rawUrl || 'https://placeholder.supabase.co');
const clientKey = isSupabaseConfigured ? rawKey : (rawKey || 'placeholder-key');

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fraudsentinel_auth_session',
  },
});
