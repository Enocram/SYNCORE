// ============================================================
// AUTH SERVICE – Google, GitHub, sessão persistente
// ============================================================

import { supabase } from './supabase.js';

export const auth = {
  // Login com Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    });
    if (error) throw error;
    return data;
  },

  // Login com GitHub
  async signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Limpa cache local (opcional)
    localStorage.removeItem('pcc-sync-last');
    window.location.hash = 'login';
  },

  // Obtém o usuário atual (sessão persistente)
  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  },

  // Verifica se está autenticado
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  // Atualiza o perfil do usuário (após login)
  async upsertProfile(user) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (error) console.error('Erro ao salvar perfil', error);
    return data;
  }
};