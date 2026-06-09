// ============================================================
// BACKUP ENGINE – Exporta/importa dados do usuário via Supabase
// ============================================================

import { supabase } from './supabase.js';
import { auth } from './auth.js';
import * as storage from '../storage.js';

export const backup = {
  // Exporta todos os dados do usuário da nuvem
  async exportToJSON() {
    const user = await auth.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');
    
    const tables = ['projects', 'project_ai', 'project_prompts', 'project_notes', 'project_roadmaps', 'project_decisions', 'project_research'];
    const backupData = {};
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      backupData[table] = data;
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pcc_backup_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  // Importa dados a partir de um arquivo JSON e faz upload para nuvem
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const user = await auth.getCurrentUser();
          if (!user) throw new Error('Não autenticado');
          
          for (const [table, records] of Object.entries(data)) {
            for (const record of records) {
              record.user_id = user.id;
              await supabase.from(table).upsert(record, { onConflict: 'id' });
            }
          }
          resolve(true);
        } catch (err) { reject(err); }
      };
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsText(file);
    });
  },
  
  // Backup completo (download + push para nuvem? já exporta)
  async fullBackup() {
    await this.exportToJSON();
  }
};