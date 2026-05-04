/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://hhyfwrqrqypldmwlsuvl.supabase.co')
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/$/, '')
  .trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeWZ3cnFycXlwbGRtd2xzdXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjkzODUsImV4cCI6MjA5MzIwNTM4NX0.KspFWxR3DmxE76UQEdrEK1UBV0dfPCVzWX7_2Fg6bmU').trim();

const isUrlValid = (url: string) => {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !parsed.hostname.includes('placeholder');
  } catch {
    return false;
  }
};

const finalUrl = isUrlValid(supabaseUrl) ? supabaseUrl : 'https://hhyfwrqrqypldmwlsuvl.supabase.co';
const finalKey = supabaseAnonKey && supabaseAnonKey !== 'placeholder' ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeWZ3cnFycXlwbGRtd2xzdXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MjkzODUsImV4cCI6MjA5MzIwNTM4NX0.KspFWxR3DmxE76UQEdrEK1UBV0dfPCVzWX7_2Fg6bmU';

const isUsingFallback = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || finalUrl.includes('hhyfwrqrqypldmwlsuvl');

if (isUsingFallback) {
  console.info('Supabase: Using internal fallback credentials.');
}

// Pass a custom fetch to avoid Supabase trying to polyfill or set window.fetch
// which might be read-only in some iframe environments.
export const supabase = createClient(finalUrl, finalKey, {
  global: {
    fetch: (url, options) => fetch(url, options)
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
