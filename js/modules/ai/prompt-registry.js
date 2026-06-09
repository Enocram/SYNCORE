// ============================================================
// PROMPT REGISTRY – Armazena prompts utilizados por IA em projetos
// ============================================================

import { getAll, save, remove, get } from '../../db/repository.js';

export async function getPrompts(projectId = null, iaId = null) {
  let filters = {};
  if (projectId) filters.projetoId = projectId;
  if (iaId) filters.iaModeloId = iaId;
  return await getAll('prompts', filters, 'data', 'desc');
}

export async function savePrompt(promptData) {
  if (!promptData.prompt) throw new Error('Prompt é obrigatório');
  if (!promptData.projetoId) throw new Error('Projeto é obrigatório');
  if (!promptData.iaModeloId) throw new Error('IA é obrigatória');
  
  promptData.data = promptData.data || new Date().toISOString();
  return await save('prompts', promptData);
}

export async function deletePrompt(id) {
  return await remove('prompts', id);
}

// Renderiza lista de prompts em HTML
export async function renderPromptList(projectId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const prompts = await getPrompts(projectId);
  if (prompts.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhum prompt registrado ainda.</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="prompt-timeline">
      ${prompts.map(p => `
        <div class="prompt-card">
          <div class="prompt-header">
            <strong>🤖 IA ID: ${p.iaModeloId}</strong>
            <small>${new Date(p.data).toLocaleString()}</small>
          </div>
          <div class="prompt-text"><strong>Prompt:</strong> ${escapeHtml(p.prompt)}</div>
          <div class="prompt-result"><strong>Resultado:</strong> ${escapeHtml(p.resultado || '—')}</div>
          <button class="delete-prompt-btn neon-button small" data-id="${p.id}">🗑️ Excluir</button>
        </div>
      `).join('')}
    </div>
  `;
  
  // Event listeners para exclusão
  document.querySelectorAll('.delete-prompt-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Excluir este prompt?')) {
        await deletePrompt(id);
        renderPromptList(projectId, containerId);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}