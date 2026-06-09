// ============================================================
// SUPABASE CLIENT – Conecta ao projeto Supabase
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Substitua pelos seus valores do projeto Supabase (Dashboard > Settings > API)
const SUPABASE_URL = 'https://jlhreshosbzbitqeplys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsaHJlc2hvc2J6Yml0cWVwbHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzI0NjMsImV4cCI6MjA5NjIwODQ2M30.svsr_T9_Fhjed0iafU8gSL8jk-m7tA2b5K9JWl3sHVE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true
});

// Monitora mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Auth] Evento:', event, session?.user?.email);
  if (event === 'SIGNED_IN') {
    window.dispatchEvent(new CustomEvent('authChange', { detail: { user: session.user } }));
  } else if (event === 'SIGNED_OUT') {
    window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null } }));
  }
});