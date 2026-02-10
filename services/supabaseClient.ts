import { createClient } from '@supabase/supabase-js';

// No Vite, process.env é injetado via define no vite.config.ts
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseUrl !== 'undefined' && 
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'undefined'
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl as string, supabaseAnonKey as string) 
  : null;

if (!isSupabaseConfigured) {
  console.log('Aviso: Supabase não configurado. Usando armazenamento local temporário.');
}