// ============================================================
// PROJECT LIST COMPONENT
// Exibe cartões neon com filtros, ordenação, busca e ações
// ============================================================

import { getAllProjects, deleteProject, archiveProject, toggleFavorite, duplicateProject } from '../../storage.js';

let currentFilters = {
  status: 'todos',
  prioridade: 'todas',
  categoria: 'todas',
  arquivado: false,
  favorito: false,
  busca: ''
};
let currentSort = { field: 'ultimaAtualizacao', order: 'desc' };
let onProjectSelectCallback = null; // callback para abrir detalhes

export function setProjectListCallback(callback) {
  onProjectSelectCallback = callback;
}

export async function renderProjectList(containerId, onEditCallback, onDetailsCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Renderiza estrutura com filtros e botões
  container.innerHTML = `
    <div class="project-list-controls">
      <div class="search-bar">
        <input type="text" id="searchInput" placeholder="🔍 Buscar projetos..." class="neon-input">
      </div>
      <div class="filters-bar">
        <select id="filterStatus" class="neon-select">
          <option value="todos">Status: Todos</option>
          <option value="ativo">Ativos</option>
          <option value="pausado">Pausados</option>
          <option value="concluido">Concluídos</option>
        </select>
        <select id="filterPrioridade" class="neon-select">
          <option value="todas">Prioridade: Todas</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
        <select id="sortBy" class="neon-select">
          <option value="ultimaAtualizacao">Ordenar: Última atualização</option>
          <option value="nome">Nome</option>
          <option value="progresso">Progresso</option>
          <option value="prioridade">Prioridade</option>
          <option value="dataInicio">Data de início</option>
        </select>
        <button id="toggleArquivados" class="neon-button small">📦 Arquivados</button>
        <button id="showFavoritos" class="neon-button small">⭐ Favoritos</button>
      </div>
    </div>
    <div id="projectsGrid" class="projects-grid"></div>
  `;
  
  // Bind dos eventos
  document.getElementById('searchInput').addEventListener('input', (e) => {
    currentFilters.busca = e.target.value;
    refreshList();
  });
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    refreshList();
  });
  document.getElementById('filterPrioridade').addEventListener('change', (e) => {
    currentFilters.prioridade = e.target.value;
    refreshList();
  });
  document.getElementById('sortBy').addEventListener('change', (e) => {
    const [field, order] = e.target.value.split('|');
    currentSort.field = field;
    currentSort.order = order || 'desc';
    refreshList();
  });
  let showArchived = false;
  document.getElementById('toggleArquivados').addEventListener('click', () => {
    showArchived = !showArchived;
    currentFilters.arquivado = showArchived;
    document.getElementById('toggleArquivados').classList.toggle('active', showArchived);
    refreshList();
  });
  let showFavOnly = false;
  document.getElementById('showFavoritos').addEventListener('click', () => {
    showFavOnly = !showFavOnly;
    currentFilters.favorito = showFavOnly;
    document.getElementById('showFavoritos').classList.toggle('active', showFavOnly);
    refreshList();
  });
  
  async function refreshList() {
    const projects = await getAllProjects(currentFilters, currentSort.field, currentSort.order);
    renderGrid(projects, onEditCallback, onDetailsCallback);
  }
  
  await refreshList();
}

async function renderGrid(projects, onEditCallback, onDetailsCallback) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  
  if (projects.length === 0) {
    grid.innerHTML = '<div class="card empty-state">Nenhum projeto encontrado. Crie o primeiro!</div>';
    return;
  }
  
  grid.innerHTML = projects.map(project => `
    <div class="project-card ${project.favorito ? 'favorito' : ''}" data-id="${project.id}">
      <div class="card-header">
        <h3>${escapeHtml(project.nome)}</h3>
        <div class="card-actions">
          <button class="icon-btn fav-btn" data-id="${project.id}" title="Favorito">${project.favorito ? '⭐' : '☆'}</button>
          <button class="icon-btn duplicate-btn" data-id="${project.id}" title="Duplicar">📋</button>
          <button class="icon-btn archive-btn" data-id="${project.id}" title="${project.arquivado ? 'Restaurar' : 'Arquivar'}">${project.arquivado ? '📤' : '📦'}</button>
          <button class="icon-btn delete-btn" data-id="${project.id}" title="Excluir">🗑️</button>
        </div>
      </div>
      <div class="card-body" data-id="${project.id}" style="cursor:pointer;">
        <p class="descricao">${escapeHtml(project.descricaoCurta || 'Sem descrição')}</p>
        <div class="meta-info">
          <span class="status-badge ${project.status}">${getStatusText(project.status)}</span>
          <span class="priority-badge ${project.prioridade}">${getPriorityText(project.prioridade)}</span>
          <span class="progress">${project.progresso || 0}%</span>
        </div>
        <div class="progress-bar"><div style="width: ${project.progresso || 0}%"></div></div>
      </div>
      <div class="card-footer">
        <button class="neon-button small edit-btn" data-id="${project.id}">✏️ Editar</button>
        <button class="neon-button small details-btn" data-id="${project.id}">🔍 Detalhes</button>
      </div>
    </div>
  `).join('');
  
  // Event listeners dinâmicos
  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      await toggleFavorite(id);
      refreshList();
    });
  });
  document.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      await duplicateProject(id);
      refreshList();
    });
  });
  document.querySelectorAll('.archive-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const project = (await getAllProjects({}, '', '')).find(p => p.id === id);
      if (project) await archiveProject(id, !project.arquivado);
      refreshList();
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Excluir permanentemente este projeto?')) {
        const id = btn.dataset.id;
        await deleteProject(id);
        refreshList();
      }
    });
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onEditCallback) onEditCallback(btn.dataset.id);
    });
  });
  document.querySelectorAll('.details-btn, .card-body').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = el.closest('.project-card')?.dataset.id || el.dataset.id;
      if (id && onDetailsCallback) onDetailsCallback(id);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function getStatusText(status) {
  const map = { 'ativo': 'Ativo', 'pausado': 'Pausado', 'concluido': 'Concluído', 'planejamento': 'Planejamento' };
  return map[status] || status;
}

function getPriorityText(prioridade) {
  const map = { 'baixa': 'Baixa', 'media': 'Média', 'alta': 'Alta', 'critica': 'Crítica' };
  return map[prioridade] || prioridade;
}