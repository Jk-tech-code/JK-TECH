/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://hhyfwrqrqypldmwlsuvl.supabase.co').replace(/\/rest\/v1\/?$/, '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeWZ3cnFycXlwbGRtd2xzdXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjkzODUsImV4cCI6MjA5MzIwNTM4NX0.KspFWxR3DmxE76UQEdrEK1UBV0dfPCVzWX7_2Fg6bmU').trim();

const isUrlValid = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const finalUrl = isUrlValid(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Go to Settings -> Environment Variables and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Pass a custom fetch to avoid Supabase trying to polyfill or set window.fetch
// which might be read-only in some iframe environments.
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init)
  }
});
