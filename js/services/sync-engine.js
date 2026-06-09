// ============================================================
// SYNC ENGINE – Sincroniza IndexedDB ↔ Supabase
// Offline-first, fila de operações, eventos de rede
// ============================================================

import { supabase } from './supabase.js';
import { auth } from './auth.js';
import * as storage from '../storage.js'; // acesso ao IndexedDB
import { conflict } from './conflict-engine.js';
import { backup } from './backup-engine.js';

let syncInterval = null;
let isOnline = navigator.onLine;

// Estado atual do sync
export const syncStatus = {
  state: 'offline', // offline, online, syncing, error, synced
  lastSync: null,
  pendingOps: 0
};

// Eventos
const emitStatus = () => window.dispatchEvent(new CustomEvent('syncStatus', { detail: syncStatus }));

// Monitora conexão de rede
window.addEventListener('online', () => {
  isOnline = true;
  syncStatus.state = 'online';
  emitStatus();
  syncFull();
});
window.addEventListener('offline', () => {
  isOnline = false;
  syncStatus.state = 'offline';
  emitStatus();
  if (syncInterval) clearInterval(syncInterval);
});

// Sincronização completa (pull + push)
export async function syncFull() {
  if (!isOnline) return;
  if (!(await auth.isAuthenticated())) return;
  
  syncStatus.state = 'syncing';
  emitStatus();
  
  try {
    // 1. Puxar dados do Supabase para o IndexedDB
    await pullFromCloud();
    // 2. Enviar alterações locais para a nuvem
    await pushToCloud();
    // 3. Atualizar timestamp
    syncStatus.lastSync = new Date().toISOString();
    syncStatus.state = 'synced';
    emitStatus();
  } catch (err) {
    console.error('[Sync] Erro', err);
    syncStatus.state = 'error';
    emitStatus();
  }
}

// Puxar dados (exemplo para projetos)
async function pullFromCloud() {
  const user = await auth.getCurrentUser();
  if (!user) return;
  
  const { data: cloudProjects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);
  if (error) throw error;
  
  for (const proj of cloudProjects) {
    // Converte snake_case do Supabase para camelCase do IndexedDB
    const localProject = {
      id: proj.id,
      nome: proj.nome,
      descricaoCurta: proj.descricao_curta,
      resumoCompleto: proj.resumo_completo,
      categoria: proj.categoria,
      tipo: proj.tipo,
      dataInicio: proj.data_inicio,
      status: proj.status,
      prioridade: proj.prioridade,
      progresso: proj.progresso,
      iaPrincipal: proj.ia_principal,
      iasEnvolvidas: proj.ias_envolvidas,
      proximaAcao: proj.proxima_acao,
      observacoes: proj.observacoes,
      ultimaAtualizacao: proj.updated_at,
      createdAt: proj.created_at,
      arquivado: proj.arquivado,
      favorito: proj.favorito,
      projectUrl: proj.project_url
    };
    const local = await storage.getProject(proj.id);
    const resolution = conflict.resolve(proj, local);
    if (resolution === 'cloud' || resolution === 'merge') {
      await storage.saveProject(localProject);
    }
  }
}

// Enviar alterações locais (usando fila de pendências)
async function pushToCloud() {
  const user = await auth.getCurrentUser();
  if (!user) return;
  
  const localProjects = await storage.getAllProjects();
  for (const proj of localProjects) {
    // Converte camelCase do IndexedDB para snake_case do Supabase
    const cloudProject = {
      id: proj.id,
      user_id: user.id,
      nome: proj.nome,
      descricao_curta: proj.descricaoCurta,
      resumo_completo: proj.resumoCompleto,
      categoria: proj.categoria,
      tipo: proj.tipo,
      data_inicio: proj.dataInicio,
      status: proj.status,
      prioridade: proj.prioridade,
      progresso: proj.progresso,
      ia_principal: proj.iaPrincipal,
      ias_envolvidas: proj.iasEnvolvidas,
      proxima_acao: proj.proximaAcao,
      observacoes: proj.observacoes,
      updated_at: proj.ultimaAtualizacao,
      created_at: proj.createdAt,
      arquivado: proj.arquivado,
      favorito: proj.favorito,
      project_url: proj.projectUrl
    };
    
    const { data: cloud } = await supabase
      .from('projects')
      .select('updated_at')
      .eq('id', proj.id)
      .maybeSingle();
    
    const needPush = conflict.shouldPush(proj, cloud);
    if (needPush) {
      const { error } = await supabase
        .from('projects')
        .upsert(cloudProject, { onConflict: 'id' });
      if (error) throw error;
    }
  }
}

// Sincronização automática periódica (a cada 30 segundos quando online)
export function startAutoSync(intervalMs = 30000) {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    if (isOnline && syncStatus.state !== 'syncing') {
      syncFull();
    }
  }, intervalMs);
}

export function stopAutoSync() {
  if (syncInterval) clearInterval(syncInterval);
}