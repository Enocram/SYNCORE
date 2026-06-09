import { save, getAll, remove } from '../../db/repository.js';
import { getAIList } from '../ai/ai-registry.js';

export async function renderPromptVault(projectId) {
  const filters = projectId ? { projetoId: projectId } : {};
  const prompts = await getAll('promptVault', filters);
  const ias = await getAIList(projectId);
  return `
    <div class="prompt-vault">
      <button id="newPromptVaultBtn" class="neon-button small">+ Registrar Prompt</button>
      <div class="prompt-grid">
        ${prompts.map(p => `
          <div class="prompt-vault-card">
            <div class="prompt-header"><strong>${escapeHtml(p.titulo || 'Prompt')}</strong> - ${p.iaModeloId ? `IA ID: ${p.iaModeloId}` : 'IA não especificada'}</div>
            <div><strong>Prompt:</strong> ${escapeHtml(p.prompt)}</div>
            <div><strong>Resultado:</strong> ${escapeHtml(p.resultado || '—')}</div>
            <div>Avaliação: ${p.avaliacao || '—'} | Tags: ${p.tags || ''}</div>
            <button class="delete-prompt-vault" data-id="${p.id}">🗑️</button>
          </div>
        `).join('') || '<div class="empty">Nenhum prompt salvo.</div>'}
      </div>
      <div id="promptVaultForm" style="display:none;" class="glass-card">
        <h3>Novo Prompt</h3>
        <input type="text" id="pvTitle" placeholder="Título" class="neon-input">
        <select id="pvIaId" class="neon-select"><option value="">Selecione IA</option>${ias.map(ia => `<option value="${ia.id}">${ia.nome}</option>`).join('')}</select>
        <textarea id="pvPrompt" placeholder="Prompt utilizado" class="neon-input" rows="3"></textarea>
        <textarea id="pvResult" placeholder="Resultado obtido" class="neon-input" rows="2"></textarea>
        <input type="text" id="pvRating" placeholder="Avaliação (1-5)" class="neon-input">
        <input type="text" id="pvTags" placeholder="Tags separadas por vírgula" class="neon-input">
        <div class="form-actions"><button id="cancelPvBtn">Cancelar</button><button id="savePvBtn">Salvar</button></div>
      </div>
    </div>
  `;
}