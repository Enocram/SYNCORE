// ============================================================
// PAGE: SYNC STATUS – Exibe status da sincronização com a nuvem
// ============================================================

import { syncStatus, syncFull } from '../../services/sync-engine.js';
import { auth } from '../../services/auth.js';

export async function render() {
  const user = await auth.getCurrentUser();
  const isLogged = !!user;
  
  return `
    <div class="sync-status-container">
      <h1 class="page-title">☁️ STATUS DA NUVEM</h1>
      <div class="glass-card" style="max-width: 500px; margin: 0 auto;">
        <p><strong>Estado da sincronização:</strong> <span id="syncState">${syncStatus.state}</span></p>
        <p><strong>Última sincronização:</strong> <span id="lastSyncTime">${syncStatus.lastSync || 'nunca'}</span></p>
        <p><strong>Operações pendentes:</strong> <span id="pendingOps">${syncStatus.pendingOps || 0}</span></p>
        <p><strong>Conexão com internet:</strong> ${navigator.onLine ? '🟢 Online' : '🔴 Offline'}</p>
        <p><strong>Usuário logado:</strong> ${isLogged ? '✅ Sim' : '❌ Não'}</p>
        <div class="form-actions" style="margin-top: 20px;">
          <button id="forceSyncBtn" class="neon-button">🔄 Sincronizar agora</button>
        </div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const btn = document.getElementById('forceSyncBtn');
  if (btn) {
    btn.addEventListener('click', async () => {
      await syncFull();
      // Atualiza a página para mostrar novos valores
      window.location.reload();
    });
  }
  
  // Atualiza os indicadores em tempo real via eventos
  const updateUI = () => {
    const stateEl = document.getElementById('syncState');
    const lastEl = document.getElementById('lastSyncTime');
    const pendingEl = document.getElementById('pendingOps');
    if (stateEl) stateEl.innerText = syncStatus.state;
    if (lastEl) lastEl.innerText = syncStatus.lastSync || 'nunca';
    if (pendingEl) pendingEl.innerText = syncStatus.pendingOps || 0;
  };
  
  window.addEventListener('syncStatus', updateUI);
  updateUI();
}