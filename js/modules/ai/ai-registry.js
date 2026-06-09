// ============================================================
// AI REGISTRY – Cadastro de IAs, funções, níveis de participação
// ============================================================

import { getAll, save, remove, get } from '../../db/repository.js';

export async function getAIList(projectId = null) {
  const filters = projectId ? { projetoId: projectId } : {};
  return await getAll('aiModels', filters);
}

export async function getAIById(id) {
  return await get('aiModels', id);
}

export async function saveAI(aiData) {
  // Validação básica
  if (!aiData.nome) throw new Error('Nome da IA é obrigatório');
  if (!aiData.modelo) throw new Error('Modelo é obrigatório');
  if (!aiData.funcao) throw new Error('Função é obrigatória');
  
  aiData.dataInclusao = aiData.dataInclusao || new Date().toISOString();
  aiData.nivelParticipacao = aiData.nivelParticipacao || 'baixo';
  
  return await save('aiModels', aiData);
}

export async function deleteAI(id) {
  return await remove('aiModels', id);
}

// Funções disponíveis (lista estática)
export const FUNCOES_IA = [
  'Pesquisa', 'Planejamento', 'Arquitetura', 'Design',
  'Frontend', 'Backend', 'Documentação', 'Auditoria', 'Refatoração'
];

// Níveis de participação
export const NIVEL_PARTICIPACAO = ['baixo', 'médio', 'alto', 'crítico'];

// Renderiza o formulário de cadastro (HTML)
export function renderAIForm(projectId, aiData = null) {
  const isEdit = !!aiData;
  return `
    <div class="ai-form glass-card">
      <h3>${isEdit ? '✏️ Editar IA' : '➕ Nova IA'}</h3>
      <input type="hidden" id="aiId" value="${aiData?.id || ''}">
      <input type="hidden" id="aiProjetoId" value="${projectId}">
      <div class="form-group">
        <label>Nome da IA *</label>
        <input type="text" id="aiNome" value="${escapeHtml(aiData?.nome || '')}" required>
      </div>
      <div class="form-group">
        <label>Modelo *</label>
        <input type="text" id="aiModelo" value="${escapeHtml(aiData?.modelo || '')}" required>
      </div>
      <div class="form-group">
        <label>Fornecedor</label>
        <input type="text" id="aiFornecedor" value="${escapeHtml(aiData?.fornecedor || '')}">
      </div>
      <div class="form-group">
        <label>Função *</label>
        <select id="aiFuncao" required>
          <option value="">Selecione</option>
          ${FUNCOES_IA.map(f => `<option value="${f}" ${aiData?.funcao === f ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Nível de Participação</label>
        <select id="aiNivel">
          ${NIVEL_PARTICIPACAO.map(n => `<option value="${n}" ${aiData?.nivelParticipacao === n ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Observações</label>
        <textarea id="aiObservacoes" rows="2">${escapeHtml(aiData?.observacoes || '')}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="neon-button cancel-ai">Cancelar</button>
        <button type="button" class="neon-button save-ai">${isEdit ? 'Atualizar' : 'Salvar'}</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}