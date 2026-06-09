// ============================================================
// PAGE: CONFIGURAÇÕES
// Ajustes de tema, notificações, reset de storage
// ============================================================

import { localStorageAPI, getConfig, setConfig } from '../../storage.js';

export async function render() {
  const temaAtual = await getConfig('tema') || 'neon-dark';
  return `
    <div class="page-configuracoes">
      <h1 class="page-title">⚙️ CONFIGURAÇÕES</h1>
      
      <div class="card">
        <h3 style="color: var(--neon-purple)">🎨 Tema Visual</h3>
        <select id="temaSelect" class="neon-button" style="background:#000; margin-top:0.5rem;">
          <option value="neon-dark" ${temaAtual === 'neon-dark' ? 'selected' : ''}>Neon Dark (Padrão)</option>
          <option value="neon-light" ${temaAtual === 'neon-light' ? 'selected' : ''}>Neon Light (Beta)</option>
        </select>
      </div>
      
      <div class="card">
        <h3 style="color: var(--neon-green)">💾 Dados Locais</h3>
        <button id="clearLocalData" class="neon-button">Limpar Preferências Locais</button>
        <p style="font-size:0.7rem; margin-top:0.5rem;">Remove configurações salvas (mantém projetos)</p>
      </div>
      
      <div class="card">
        <h3 style="color: var(--neon-blue)">📡 Sobre o Sistema</h3>
        <p>SYS - SYNCORE<br>Versão Foundation 1.0<br>Arquitetura PWA offline ready<br>© 2026 - Módulos preparados</p>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const temaSelect = document.getElementById('temaSelect');
  const clearBtn = document.getElementById('clearLocalData');
  
  if (temaSelect) {
    temaSelect.addEventListener('change', async (e) => {
      const novoTema = e.target.value;
      await setConfig('tema', novoTema);
      alert(`Tema alterado para ${novoTema}. Reinicie o app para efeito total.`);
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Limpar todas as configurações locais? Isso não afeta projetos salvos no IndexedDB.')) {
        localStorage.clear();
        alert('Preferências limpas. A página será recarregada.');
        window.location.reload();
      }
    });
  }
}