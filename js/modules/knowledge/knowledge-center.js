// ============================================================
// KNOWLEDGE CENTER – Orquestrador dos módulos de conhecimento
// ============================================================

import { getAllProjects } from '../../storage.js';
import { renderResearchHub } from './research-hub.js';
import { renderPromptVault } from './prompt-vault.js';
import { renderDecisionLog } from './decision-log.js';
import { renderGlobalSearch } from './knowledge-search.js';
import { renderNotesSection } from './notes-section.js'; // vamos criar simplificado inline

let currentProjectId = null;

export async function render() {
  const projects = await getAllProjects({ arquivado: false }, 'nome', 'asc');
  return `
    <div class="knowledge-container">
      <h1 class="page-title">🧠 CENTRO DE CONHECIMENTO</h1>
      <div class="project-selector">
        <label>Projeto:</label>
        <select id="knowledgeProjectSelect" class="neon-select">
          <option value="">-- Todos os projetos / Global --</option>
          ${projects.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('')}
        </select>
      </div>
      <div class="knowledge-tabs">
        <button class="tab-btn active" data-tab="research">📚 Research Hub</button>
        <button class="tab-btn" data-tab="prompts">🤖 Prompt Vault</button>
        <button class="tab-btn" data-tab="decisions">📝 Decision Log</button>
        <button class="tab-btn" data-tab="notes">📓 Notes</button>
        <button class="tab-btn" data-tab="search">🔍 Busca Global</button>
      </div>
      <div id="knowledgeContent" class="knowledge-content"></div>
    </div>
  `;
}

export async function afterRender() {
  const select = document.getElementById('knowledgeProjectSelect');
  const tabs = document.querySelectorAll('.tab-btn');
  
  async function loadTab(tabId, projectId) {
    const container = document.getElementById('knowledgeContent');
    if (!container) return;
    if (tabId === 'research') container.innerHTML = await renderResearchHub(projectId);
    else if (tabId === 'prompts') container.innerHTML = await renderPromptVault(projectId);
    else if (tabId === 'decisions') container.innerHTML = await renderDecisionLog(projectId);
    else if (tabId === 'notes') container.innerHTML = await renderNotes(projectId);
    else if (tabId === 'search') container.innerHTML = await renderGlobalSearch(projectId);
    
    // Disparar after-render específico
    if (tabId === 'research') attachResearchEvents(projectId);
    else if (tabId === 'prompts') attachPromptEvents(projectId);
    else if (tabId === 'decisions') attachDecisionEvents(projectId);
    else if (tabId === 'notes') attachNotesEvents(projectId);
    else if (tabId === 'search') attachSearchEvents();
  }
  
  function attachResearchEvents(pid) { /* será implementado no research-hub */ }
  function attachPromptEvents(pid) {}
  function attachDecisionEvents(pid) {}
  function attachNotesEvents(pid) {}
  function attachSearchEvents() {}
  
  select.addEventListener('change', async (e) => {
    currentProjectId = e.target.value || null;
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'research';
    await loadTab(activeTab, currentProjectId);
  });
  
  tabs.forEach(tab => {
    tab.addEventListener('click', async (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      await loadTab(tabId, currentProjectId);
    });
  });
  
  // Carrega aba inicial
  await loadTab('research', currentProjectId);
}

// Notas simplificadas inline
async function renderNotes(projectId) {
  // Buscar notas (store notes)
  const { getAll } = await import('../../storage.js');
  const notes = await getAll('notes', projectId ? { projetoId: projectId } : {});
  return `
    <div class="notes-section">
      <button id="newNoteBtn" class="neon-button small">+ Nova Nota</button>
      <div id="notesList">
        ${notes.map(n => `
          <div class="note-card" data-id="${n.id}">
            <div class="note-header"><strong>${escapeHtml(n.titulo || 'Sem título')}</strong> <small>${new Date(n.createdAt).toLocaleString()}</small></div>
            <p>${escapeHtml(n.conteudo || '')}</p>
            <button class="delete-note" data-id="${n.id}">🗑️ Excluir</button>
          </div>
        `).join('') || '<div class="empty">Nenhuma nota ainda.</div>'}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}