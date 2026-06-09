// ============================================================
// PAGE: PROJETOS (ORQUESTRADOR)
// Gerencia sub-visualizações: lista, formulário, detalhes
// ============================================================

import { renderProjectList, setProjectListCallback } from '../components/project-list.js';
import { renderProjectForm } from '../components/project-form.js';
import { renderProjectDetails } from '../components/project-details.js';

let currentView = 'list'; // list, form, details
let currentProjectId = null;

export async function render() {
  // Container limpo, será preenchido pelo orquestrador
  return `<div id="projectsDynamicContainer" class="projects-page"></div>`;
}

export async function afterRender() {
  // Força a lista como padrão
  await showListView();
}

async function showListView() {
  currentView = 'list';
  currentProjectId = null;
  const container = document.getElementById('projectsDynamicContainer');
  if (!container) return;
  
  // Renderiza botão "Novo Projeto" fixo
  container.innerHTML = `
    <div class="projects-header">
      <h1 class="page-title">📁 PROJETOS</h1>
      <button id="newProjectBtn" class="neon-button neon-green">+ Novo Projeto</button>
    </div>
    <div id="projectListContainer"></div>
  `;
  
  // Inicializa a lista com callbacks
  await renderProjectList('projectListContainer', 
    (id) => showFormView(id),   // editar
    (id) => showDetailsView(id) // detalhes
  );
  
  document.getElementById('newProjectBtn')?.addEventListener('click', () => showFormView(null));
}

async function showFormView(projectId = null) {
  currentView = 'form';
  currentProjectId = projectId;
  const container = document.getElementById('projectsDynamicContainer');
  if (!container) return;
  container.innerHTML = `<div id="formContainer"></div>`;
  
  await renderProjectForm('formContainer', projectId, (canceled) => {
    if (!canceled) {
      showListView(); // após salvar volta para lista
    } else {
      showListView(); // cancel também volta
    }
  });
}

async function showDetailsView(projectId) {
  currentView = 'details';
  currentProjectId = projectId;
  const container = document.getElementById('projectsDynamicContainer');
  if (!container) return;
  container.innerHTML = `<div id="detailsContainer"></div>`;
  
  await renderProjectDetails('detailsContainer', projectId, 
    () => showListView(),   // back
    (id) => showFormView(id) // editar
  );
}