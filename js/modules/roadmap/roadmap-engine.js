// ============================================================
// ROADMAP ENGINE – Página de gerenciamento (corrigida)
// ============================================================

import { getAllProjects } from '../../storage.js';
import { loadRoadmap, updateStage, addCustomStage, deleteCustomStage, applyTemplate } from './roadmap-manager.js';
import { getMetrics } from './roadmap-metrics.js';
import { getAlerts } from './roadmap-alerts.js';

let currentProjectId = null;

export async function render() {
  const projects = await getAllProjects({ arquivado: false }, 'nome', 'asc');
  return `
    <div class="roadmap-container">
      <h1 class="page-title">🗺️ SMART ROADMAP ENGINE</h1>
      <div class="project-selector">
        <label>Projeto:</label>
        <select id="roadmapProjectSelect" class="neon-select">
          <option value="">-- Selecione um projeto --</option>
          ${projects.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('')}
        </select>
        <button id="refreshRoadmapBtn" class="neon-button">🔄 Carregar Roadmap</button>
      </div>
      <div id="roadmapContent" class="roadmap-content">
        <div class="loading">Selecione um projeto para visualizar o roadmap</div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const select = document.getElementById('roadmapProjectSelect');
  const loadBtn = document.getElementById('refreshRoadmapBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
      currentProjectId = select.value;
      if (currentProjectId) {
        await loadRoadmapUI(currentProjectId);
      } else {
        const content = document.getElementById('roadmapContent');
        if (content) content.innerHTML = '<div class="loading">Selecione um projeto</div>';
      }
    });
  }
}

async function loadRoadmapUI(projectId) {
  const container = document.getElementById('roadmapContent');
  if (!container) return;

  try {
    const roadmap = await loadRoadmap(projectId);
    const alerts = await getAlerts();
    const allProjects = await getAllProjects();
    const projectName = (allProjects.find(p => p.id === projectId) || {}).nome || '';
    const projectAlerts = alerts.filter(a => a.projeto === projectName);

    container.innerHTML = `
      <div class="roadmap-toolbar">
        <button id="addStageBtn" class="neon-button small">+ Adicionar Etapa</button>
        <button id="applyTemplateBtn" class="neon-button small">📋 Aplicar Template Padrão</button>
        <button id="viewKanbanBtn" class="neon-button small">📌 Kanban</button>
        <button id="viewTimelineBtn" class="neon-button small">⏱️ Timeline</button>
      </div>
      <div id="roadmapView" class="roadmap-view"></div>
      <div class="roadmap-metrics">
        <h3>📊 Métricas do Projeto</h3>
        <div class="metrics-grid">
          <div>Etapas concluídas: ${roadmap.stages.filter(s => s.status === 'concluido').length}/${roadmap.stages.length}</div>
          <div>Progresso: ${Math.round((roadmap.stages.filter(s => s.status === 'concluido').length / roadmap.stages.length) * 100)}%</div>
        </div>
      </div>
      <div class="roadmap-alerts">
        <h3>⚠️ Alertas</h3>
        <ul>${projectAlerts.map(a => `<li>${escapeHtml(a.mensagem)}</li>`).join('') || '<li>Nenhum alerta</li>'}</ul>
      </div>
    `;

    renderKanban(roadmap);

    document.getElementById('addStageBtn')?.addEventListener('click', () => showAddStageForm(projectId));
    document.getElementById('applyTemplateBtn')?.addEventListener('click', async () => {
      await applyTemplate(projectId, 'default');
      await loadRoadmapUI(projectId);
    });
    document.getElementById('viewKanbanBtn')?.addEventListener('click', () => renderKanban(roadmap));
    document.getElementById('viewTimelineBtn')?.addEventListener('click', () => renderTimeline(roadmap));
  } catch (err) {
    console.error('[Roadmap] Erro ao carregar:', err);
    container.innerHTML = `<div class="error">Erro ao carregar roadmap: ${err.message}</div>`;
  }
}

function renderKanban(roadmap) {
  const container = document.getElementById('roadmapView');
  if (!container) return;

  const stagesByStatus = {
    'nao_iniciado': roadmap.stages.filter(s => s.status === 'nao_iniciado'),
    'em_andamento': roadmap.stages.filter(s => s.status === 'em_andamento'),
    'concluido': roadmap.stages.filter(s => s.status === 'concluido'),
    'pausado': roadmap.stages.filter(s => s.status === 'pausado'),
    'cancelado': roadmap.stages.filter(s => s.status === 'cancelado')
  };

  if (roadmap.stages.length === 0) {
    container.innerHTML = '<div class="empty">Nenhuma etapa definida. Clique em "+ Adicionar Etapa" para começar.</div>';
    return;
  }

  container.innerHTML = `
    <div class="kanban-board">
      ${Object.entries(stagesByStatus).map(([status, stages]) => `
        <div class="kanban-col">
          <h3>${getStatusLabel(status)}</h3>
          ${stages.map(stage => `
            <div class="kanban-card" data-stage-id="${stage.id}">
              <strong>${escapeHtml(stage.titulo)}</strong>
              <p>${escapeHtml(stage.descricao || '')}</p>
              <small>Prev: ${stage.dataPrevista ? new Date(stage.dataPrevista).toLocaleDateString() : '—'}</small>
              <div class="stage-actions">
                <select class="stage-status" data-id="${stage.id}">
                  ${['nao_iniciado','em_andamento','concluido','pausado','cancelado'].map(s => `<option value="${s}" ${stage.status === s ? 'selected' : ''}>${getStatusLabel(s)}</option>`).join('')}
                </select>
                <button class="delete-stage" data-id="${stage.id}">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
  attachStageEvents(roadmap.projetoId);
}

function renderTimeline(roadmap) {
  const container = document.getElementById('roadmapView');
  if (!container) return;
  const sortedStages = [...roadmap.stages].sort((a, b) => a.ordem - b.ordem);
  if (sortedStages.length === 0) {
    container.innerHTML = '<div class="empty">Nenhuma etapa definida.</div>';
    return;
  }
  container.innerHTML = `
    <div class="timeline-horizontal">
      ${sortedStages.map(stage => `
        <div class="timeline-node ${stage.status}">
          <div class="timeline-date">${stage.dataPrevista ? new Date(stage.dataPrevista).toLocaleDateString() : '—'}</div>
          <div class="timeline-title">${escapeHtml(stage.titulo)}</div>
          <div class="timeline-status">${getStatusLabel(stage.status)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function attachStageEvents(projectId) {
  document.querySelectorAll('.stage-status').forEach(select => {
    select.addEventListener('change', async (e) => {
      const stageId = select.getAttribute('data-id');
      const newStatus = select.value;
      await updateStage(projectId, stageId, { status: newStatus });
      await loadRoadmapUI(projectId);
    });
  });
  document.querySelectorAll('.delete-stage').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const stageId = btn.getAttribute('data-id');
      if (confirm('Excluir esta etapa?')) {
        await deleteCustomStage(projectId, stageId);
        await loadRoadmapUI(projectId);
      }
    });
  });
}

async function showAddStageForm(projectId) {
  const existingModal = document.getElementById('stageModal');
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="modal-overlay" id="stageModal">
      <div class="modal-content glass-card">
        <h3>Nova Etapa</h3>
        <input type="text" id="newStageTitle" placeholder="Título" class="neon-input">
        <textarea id="newStageDesc" placeholder="Descrição" class="neon-input" rows="2"></textarea>
        <input type="date" id="newStageDate" class="neon-input">
        <div class="modal-buttons" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button id="cancelModal" class="neon-button">Cancelar</button>
          <button id="saveModal" class="neon-button">Salvar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('saveModal')?.addEventListener('click', async () => {
    const titulo = document.getElementById('newStageTitle').value.trim();
    if (!titulo) {
      alert('Título é obrigatório');
      return;
    }
    const newStage = {
      id: `custom_${Date.now()}`,
      titulo,
      descricao: document.getElementById('newStageDesc').value,
      dataPrevista: document.getElementById('newStageDate').value,
      status: 'nao_iniciado',
      ordem: 999
    };
    await addCustomStage(projectId, newStage);
    document.getElementById('stageModal')?.remove();
    await loadRoadmapUI(projectId);
  });

  document.getElementById('cancelModal')?.addEventListener('click', () => {
    document.getElementById('stageModal')?.remove();
  });
}

function getStatusLabel(status) {
  const map = {
    'nao_iniciado': '⭕ Não Iniciado',
    'em_andamento': '🟡 Em Andamento',
    'concluido': '✅ Concluído',
    'pausado': '⏸️ Pausado',
    'cancelado': '❌ Cancelado'
  };
  return map[status] || status;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}