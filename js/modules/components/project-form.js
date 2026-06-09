// ============================================================
// PROJECT FORM COMPONENT
// Formulário completo para criar/editar projetos
// ============================================================

import { saveProject, getProject } from '../../storage.js';

export async function renderProjectForm(containerId, projectId = null, onSaveCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let project = null;
  if (projectId) {
    project = await getProject(projectId);
  }
  
  const isEdit = !!project;
  
  container.innerHTML = `
    <div class="form-container neon-card">
      <h2>${isEdit ? '✏️ Editar Projeto' : '✨ Novo Projeto'}</h2>
      <form id="projectForm">
        <div class="form-row">
          <label>Nome do Projeto *</label>
          <input type="text" id="nome" required value="${escapeHtml(project?.nome || '')}">
        </div>
        <div class="form-row">
          <label>Descrição Curta</label>
          <input type="text" id="descricaoCurta" value="${escapeHtml(project?.descricaoCurta || '')}">
        </div>
        <div class="form-row">
          <label>Resumo Completo</label>
          <textarea id="resumoCompleto" rows="4">${escapeHtml(project?.resumoCompleto || '')}</textarea>
        </div>
        <div class="form-row half">
          <label>Categoria</label>
          <select id="categoria">
            <option value="desenvolvimento" ${project?.categoria === 'desenvolvimento' ? 'selected' : ''}>Desenvolvimento</option>
            <option value="design" ${project?.categoria === 'design' ? 'selected' : ''}>Design</option>
            <option value="infra" ${project?.categoria === 'infra' ? 'selected' : ''}>Infraestrutura</option>
            <option value="pesquisa" ${project?.categoria === 'pesquisa' ? 'selected' : ''}>Pesquisa</option>
          </select>
        </div>
        <div class="form-row half">
          <label>Tipo</label>
          <select id="tipo">
            <option value="software" ${project?.tipo === 'software' ? 'selected' : ''}>Software</option>
            <option value="hardware" ${project?.tipo === 'hardware' ? 'selected' : ''}>Hardware</option>
            <option value="servico" ${project?.tipo === 'servico' ? 'selected' : ''}>Serviço</option>
          </select>
        </div>
        <div class="form-row half">
          <label>Data de Início</label>
          <input type="date" id="dataInicio" value="${project?.dataInicio?.slice(0,10) || ''}">
        </div>
        <div class="form-row half">
          <label>Status</label>
          <select id="status">
            <option value="planejamento" ${project?.status === 'planejamento' ? 'selected' : ''}>Planejamento</option>
            <option value="ativo" ${project?.status === 'ativo' ? 'selected' : ''}>Ativo</option>
            <option value="pausado" ${project?.status === 'pausado' ? 'selected' : ''}>Pausado</option>
            <option value="concluido" ${project?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
          </select>
        </div>
        <div class="form-row half">
          <label>Prioridade</label>
          <select id="prioridade">
            <option value="baixa" ${project?.prioridade === 'baixa' ? 'selected' : ''}>Baixa</option>
            <option value="media" ${project?.prioridade === 'media' ? 'selected' : ''}>Média</option>
            <option value="alta" ${project?.prioridade === 'alta' ? 'selected' : ''}>Alta</option>
            <option value="critica" ${project?.prioridade === 'critica' ? 'selected' : ''}>Crítica</option>
          </select>
        </div>
        <div class="form-row">
          <label>Progresso: <span id="progressValue">${project?.progresso || 0}</span>%</label>
          <input type="range" id="progresso" min="0" max="100" value="${project?.progresso || 0}">
        </div>
        <div class="form-row">
          <label>IA Principal</label>
          <input type="text" id="iaPrincipal" value="${escapeHtml(project?.iaPrincipal || '')}" placeholder="Ex: GPT-4, Claude">
        </div>
        <div class="form-row">
          <label>IAs Envolvidas</label>
          <input type="text" id="iasEnvolvidas" value="${escapeHtml(project?.iasEnvolvidas || '')}" placeholder="Separadas por vírgula">
        </div>
        <div class="form-row">
          <label>Próxima Ação</label>
          <textarea id="proximaAcao" rows="2">${escapeHtml(project?.proximaAcao || '')}</textarea>
        </div>
        <div class="form-row">
          <label>Observações</label>
          <textarea id="observacoes" rows="3">${escapeHtml(project?.observacoes || '')}</textarea>
        </div>
        <div class="form-row">
          <label>Link do Projeto (URL)</label>
          <input type="url" id="projectUrl" value="${escapeHtml(project?.projectUrl || '')}" placeholder="https://meuprojeto.com">
          <small style="color: var(--color-text-tertiary);">GitHub Pages, Vercel, Netlify ou domínio próprio</small>
        </div>
        <div class="form-actions">
          <button type="button" id="cancelFormBtn" class="neon-button">Cancelar</button>
          <button type="submit" class="neon-button neon-green">${isEdit ? 'Atualizar' : 'Criar Projeto'}</button>
        </div>
      </form>
    </div>
  `;
  
  // Progresso slider
  const progressSlider = document.getElementById('progresso');
  const progressSpan = document.getElementById('progressValue');
  if (progressSlider) {
    progressSlider.addEventListener('input', () => {
      progressSpan.innerText = progressSlider.value;
    });
  }
  
  // Submit
  const form = document.getElementById('projectForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      id: isEdit ? project.id : (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36)),
      nome: document.getElementById('nome').value,
      descricaoCurta: document.getElementById('descricaoCurta').value,
      resumoCompleto: document.getElementById('resumoCompleto').value,
      categoria: document.getElementById('categoria').value,
      tipo: document.getElementById('tipo').value,
      dataInicio: document.getElementById('dataInicio').value,
      status: document.getElementById('status').value,
      prioridade: document.getElementById('prioridade').value,
      progresso: parseInt(document.getElementById('progresso').value),
      iaPrincipal: document.getElementById('iaPrincipal').value,
      iasEnvolvidas: document.getElementById('iasEnvolvidas').value,
      projectUrl: document.getElementById('projectUrl').value,
      proximaAcao: document.getElementById('proximaAcao').value,
      observacoes: document.getElementById('observacoes').value,
      ultimaAtualizacao: new Date().toISOString(),
      createdAt: isEdit ? project.createdAt : new Date().toISOString(),
      arquivado: isEdit ? project.arquivado : false,
      favorito: isEdit ? project.favorito : false
    };
    const projectUrl = document.getElementById('projectUrl').value;
  if (projectUrl) {
  const currentOrigin = window.location.origin;
  if (projectUrl.startsWith(currentOrigin)) {
    alert('Não é permitido cadastrar a URL do próprio SYNCORE. Isso causaria loop no preview.');
    return;
  }
  // Opcional: testar se a URL é acessível com fetch (pode causar CORS, mas é um aviso)
  }
    await saveProject(formData);
    if (onSaveCallback) onSaveCallback();
  });
  
  document.getElementById('cancelFormBtn').addEventListener('click', () => {
    if (onSaveCallback) onSaveCallback(true); // true = cancel
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