// ============================================================
// PROJECT DETAILS COMPONENT – Com preview panel
// ============================================================

import { getProject, deleteProject, archiveProject, toggleFavorite, duplicateProject } from '../../storage.js';
import { renderProjectPreview } from './project-preview.js';

export async function renderProjectDetails(containerId, projectId, onBackCallback, onEditCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const project = await getProject(projectId);
  if (!project) {
    container.innerHTML = '<div class="card">Projeto não encontrado.</div>';
    return;
  }
  
  // Estrutura de duas colunas (responsiva)
  container.innerHTML = `
    <div class="details-two-columns">
      <!-- Coluna Esquerda: Dados do Projeto -->
      <div class="details-left">
        <div class="details-container">
          <div class="details-header">
            <h2>${escapeHtml(project.nome)}</h2>
            <div class="details-actions">
              <button id="detailsFavBtn" class="icon-btn large">${project.favorito ? '⭐' : '☆'}</button>
              <button id="detailsArchiveBtn" class="icon-btn large">${project.arquivado ? '📤' : '📦'}</button>
              <button id="detailsDuplicateBtn" class="icon-btn large">📋</button>
              <button id="detailsDeleteBtn" class="icon-btn large danger">🗑️</button>
            </div>
          </div>
          <div class="details-grid">
            <div class="detail-item"><strong>Descrição Curta:</strong> ${escapeHtml(project.descricaoCurta || '-')}</div>
            <div class="detail-item full"><strong>Resumo Completo:</strong><br>${escapeHtml(project.resumoCompleto || '-')}</div>
            <div class="detail-item"><strong>Categoria:</strong> ${project.categoria || '-'}</div>
            <div class="detail-item"><strong>Tipo:</strong> ${project.tipo || '-'}</div>
            <div class="detail-item"><strong>Data Início:</strong> ${project.dataInicio ? new Date(project.dataInicio).toLocaleDateString() : '-'}</div>
            <div class="detail-item"><strong>Status:</strong> <span class="status-badge ${project.status}">${getStatusText(project.status)}</span></div>
            <div class="detail-item"><strong>Prioridade:</strong> <span class="priority-badge ${project.prioridade}">${getPriorityText(project.prioridade)}</span></div>
            <div class="detail-item"><strong>Progresso:</strong> ${project.progresso || 0}% <div class="progress-bar"><div style="width:${project.progresso || 0}%"></div></div></div>
            <div class="detail-item"><strong>IA Principal:</strong> ${escapeHtml(project.iaPrincipal || '-')}</div>
            <div class="detail-item"><strong>IAs Envolvidas:</strong> ${escapeHtml(project.iasEnvolvidas || '-')}</div>
            <div class="detail-item full"><strong>Próxima Ação:</strong><br>${escapeHtml(project.proximaAcao || '-')}</div>
            <div class="detail-item full"><strong>Observações:</strong><br>${escapeHtml(project.observacoes || '-')}</div>
            <div class="detail-item"><strong>Criado em:</strong> ${new Date(project.createdAt).toLocaleString()}</div>
            <div class="detail-item"><strong>Última atualização:</strong> ${new Date(project.ultimaAtualizacao).toLocaleString()}</div>
          </div>
          <div class="details-footer">
            <button id="detailsBackBtn" class="neon-button">← Voltar para lista</button>
            <button id="detailsEditBtn" class="neon-button neon-green">✏️ Editar Projeto</button>
          </div>
        </div>
      </div>

      <!-- Coluna Direita: Preview do Projeto -->
      <div class="details-right">
        <div id="previewPanelContainer" class="preview-container"></div>
      </div>
    </div>
  `;
  
  // Eventos dos botões (favoritar, arquivar, etc.)
  document.getElementById('detailsFavBtn')?.addEventListener('click', async () => {
    await toggleFavorite(projectId);
    renderProjectDetails(containerId, projectId, onBackCallback, onEditCallback);
  });
  document.getElementById('detailsArchiveBtn')?.addEventListener('click', async () => {
    await archiveProject(projectId, !project.arquivado);
    renderProjectDetails(containerId, projectId, onBackCallback, onEditCallback);
  });
  document.getElementById('detailsDuplicateBtn')?.addEventListener('click', async () => {
    await duplicateProject(projectId);
    if (onBackCallback) onBackCallback();
  });
  document.getElementById('detailsDeleteBtn')?.addEventListener('click', async () => {
    if (confirm('Excluir permanentemente este projeto?')) {
      await deleteProject(projectId);
      if (onBackCallback) onBackCallback();
    }
  });
  document.getElementById('detailsBackBtn')?.addEventListener('click', () => {
    if (onBackCallback) onBackCallback();
  });
  document.getElementById('detailsEditBtn')?.addEventListener('click', () => {
    if (onEditCallback) onEditCallback(projectId);
  });
  
  // Inicializa o preview panel
  renderProjectPreview('previewPanelContainer', project.projectUrl);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function getStatusText(s) { const map = { 'ativo':'Ativo','pausado':'Pausado','concluido':'Concluído','planejamento':'Planejamento' }; return map[s]||s; }
function getPriorityText(p) { const map = { 'baixa':'Baixa','media':'Média','alta':'Alta','critica':'Crítica' }; return map[p]||p; }