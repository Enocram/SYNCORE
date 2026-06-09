// ============================================================
// PROFILE SERVICE – Busca e atualiza perfil do usuário
// ============================================================

import { supabase } from './supabase.js';
import { auth } from './auth.js';

export const profile = {
  async getProfile() {
    const user = await auth.getCurrentUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) console.error(error);
    return data;
  },
  
  async updateProfile(updates) {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    return data;
  },
  
  // Configurações do app (tema, sync automático etc.)
  async getSetting(key, defaultValue = null) {
    const user = await auth.getCurrentUser();
    if (!user) return defaultValue;
    const { data, error } = await supabase
      .from('settings')
      .select('valor')
      .eq('user_id', user.id)
      .eq('chave', key)
      .maybeSingle();
    if (error || !data) return defaultValue;
    return data.valor;
  },
  
  async setSetting(key, value) {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Não autenticado');
    const { error } = await supabase
      .from('settings')
      .upsert({ chave: key, user_id: user.id, valor: value }, { onConflict: 'chave, user_id' });
    if (error) throw error;
  }
};