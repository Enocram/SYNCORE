// ============================================================
// PAGE: PROFILE – Exibe dados do usuário e ações de logout
// ============================================================

import { auth } from '../../services/auth.js';
import { profile } from '../../services/profile-service.js';
import { syncStatus, syncFull, startAutoSync, stopAutoSync } from '../../services/sync-engine.js';

let currentUser = null;

export async function render() {
  currentUser = await auth.getCurrentUser();
  if (!currentUser) {
    window.location.hash = 'login';
    return '<div class="loading">Redirecionando para login...</div>';
  }
  
  const perfil = await profile.getProfile();
  const autoSync = await profile.getSetting('auto_sync', true);
  
  // Fallback seguro para nome e email
  const userName = perfil?.full_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Usuário';
  const userEmail = currentUser?.email || 'email não informado';
  const userAvatar = perfil?.avatar_url || currentUser?.user_metadata?.avatar_url || 'https://via.placeholder.com/80';
  const userProvider = perfil?.provider || currentUser?.app_metadata?.provider || '?';
  const lastAccess = currentUser?.last_sign_in_at ? new Date(currentUser.last_sign_in_at).toLocaleString() : 'desconhecido';
  
  return `
    <div class="profile-container">
      <h1 class="page-title">👤 PERFIL</h1>
      <div class="card" style="max-width: 500px; margin: 0 auto;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${userAvatar}" style="width: 80px; height: 80px; border-radius: 50%;" onerror="this.src='https://via.placeholder.com/80'">
          <div>
            <h3>${escapeHtml(userName)}</h3>
            <p>${escapeHtml(userEmail)}</p>
            <p>Provedor: ${escapeHtml(userProvider)}</p>
          </div>
        </div>
        <hr>
        <p><strong>Último acesso:</strong> ${lastAccess}</p>
        <p><strong>Status da nuvem:</strong> <span id="cloudStatus">${syncStatus.state}</span></p>
        <p><strong>Última sincronização:</strong> <span id="lastSync">${syncStatus.lastSync || 'nunca'}</span></p>
        <div class="form-row">
          <label><input type="checkbox" id="autoSyncCheck" ${autoSync ? 'checked' : ''}> Sincronização automática</label>
        </div>
        <div class="form-actions">
          <button id="manualSyncBtn" class="neon-button">🔄 Sincronizar agora</button>
          <button id="logoutBtn" class="neon-button" style="background: #900;">🚪 Sair</button>
        </div>
        <div class="form-actions">
          <button id="exportBackupBtn" class="neon-button small">📥 Exportar backup</button>
          <label class="neon-button small" style="display: inline-block; cursor: pointer;">📤 Importar backup
            <input type="file" id="importBackupFile" accept=".json" style="display: none;">
          </label>
        </div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const syncBtn = document.getElementById('manualSyncBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const autoSyncCheck = document.getElementById('autoSyncCheck');
  const exportBtn = document.getElementById('exportBackupBtn');
  const importFile = document.getElementById('importBackupFile');
  
  if (syncBtn) syncBtn.onclick = async () => { await syncFull(); window.location.reload(); };
  if (logoutBtn) logoutBtn.onclick = async () => { await auth.signOut(); window.location.hash = 'login'; };
  if (autoSyncCheck) autoSyncCheck.onchange = async (e) => {
    const val = e.target.checked;
    await profile.setSetting('auto_sync', val);
    if (val) startAutoSync();
    else stopAutoSync();
  };
  if (exportBtn) exportBtn.onclick = async () => {
    const { backup } = await import('../../services/backup-engine.js');
    await backup.exportToJSON();
  };
  if (importFile) importFile.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { backup } = await import('../../services/backup-engine.js');
      await backup.importFromFile(file);
      alert('Backup importado. Sincronize para enviar à nuvem.');
      window.location.reload();
    }
  };
  
  // Atualiza indicadores visuais via eventos
  window.addEventListener('syncStatus', (e) => {
    const cloudSpan = document.getElementById('cloudStatus');
    const lastSpan = document.getElementById('lastSync');
    if (cloudSpan) cloudSpan.innerText = e.detail.state;
    if (lastSpan) lastSpan.innerText = e.detail.lastSync || 'nunca';
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}