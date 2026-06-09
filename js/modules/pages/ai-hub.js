// ============================================================
// PAGE: AI HUB – Centro de Inteligência Artificial
// ============================================================

import { getAIList, saveAI, deleteAI, renderAIForm, FUNCOES_IA } from '../ai/ai-registry.js';
import { getPrompts, savePrompt, renderPromptList } from '../ai/prompt-registry.js';
import { computeMetrics, renderMetricsHTML, renderTimelineChart } from '../ai/ai-metrics.js';
import { renderNetwork } from '../ai/ai-network.js';
import { getAllProjects } from '../../storage.js';

let currentProjectId = null;

export async function render() {
  const projects = await getAllProjects({ arquivado: false }, 'nome', 'asc');
  return `
    <div class="ai-hub-container">
      <h1 class="page-title">🤖 CENTRO DE INTELIGÊNCIA ARTIFICIAL</h1>
      <div class="project-selector">
        <label>Projeto:</label>
        <select id="aiProjectSelect" class="neon-select">
          <option value="">-- Selecione um projeto --</option>
          ${projects.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('')}
        </select>
      </div>
      <div id="aiHubContent" class="ai-hub-content">
        <div class="loading">Selecione um projeto para visualizar o AI Hub</div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  const select = document.getElementById('aiProjectSelect');
  select.addEventListener('change', async (e) => {
    currentProjectId = e.target.value;
    if (currentProjectId) {
      await loadAIHub(currentProjectId);
    } else {
      document.getElementById('aiHubContent').innerHTML = '<div class="loading">Selecione um projeto</div>';
    }
  });
}

async function loadAIHub(projectId) {
  const container = document.getElementById('aiHubContent');
  if (!container) return;
  
  // Carrega dados
  const ias = await getAIList(projectId);
  const metrics = await computeMetrics(projectId);
  
  container.innerHTML = `
    <div class="ai-tabs">
      <button class="tab-btn active" data-tab="ias">📋 IAs Registradas</button>
      <button class="tab-btn" data-tab="prompts">📝 Prompts</button>
      <button class="tab-btn" data-tab="metrics">📊 Métricas</button>
      <button class="tab-btn" data-tab="network">🌐 Rede de Colaboração</button>
    </div>
    <div id="aiTabContent" class="tab-content"></div>
  `;
  
  // Aba IAs
  const renderIAsTab = () => {
    const iasHTML = `
      <div class="ai-list">
        <button id="newAIBtn" class="neon-button small">+ Nova IA</button>
        <div id="aiListContainer">
          ${ias.map(ia => `
            <div class="ai-card" data-id="${ia.id}">
              <div><strong>${escapeHtml(ia.nome)}</strong> (${ia.modelo})</div>
              <div>Função: ${ia.funcao} | Nível: ${ia.nivelParticipacao}</div>
              <div class="ai-actions">
                <button class="edit-ai" data-id="${ia.id}">✏️</button>
                <button class="delete-ai" data-id="${ia.id}">🗑️</button>
              </div>
            </div>
          `).join('') || '<div class="empty">Nenhuma IA registrada</div>'}
        </div>
        <div id="aiFormContainer" style="margin-top:1rem;"></div>
      </div>
    `;
    document.getElementById('aiTabContent').innerHTML = iasHTML;
    
    document.getElementById('newAIBtn')?.addEventListener('click', () => showAIForm(projectId));
    document.querySelectorAll('.edit-ai').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const ia = ias.find(i => i.id == id);
        showAIForm(projectId, ia);
      });
    });
    document.querySelectorAll('.delete-ai').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Excluir esta IA?')) {
          await deleteAI(parseInt(btn.dataset.id));
          loadAIHub(projectId);
        }
      });
    });
  };
  
  // Aba Prompts
  const renderPromptsTab = () => {
    const html = `
      <div class="prompt-registry">
        <button id="newPromptBtn" class="neon-button small">+ Novo Prompt</button>
        <div id="promptListContainer"></div>
        <div id="promptFormContainer" style="margin-top:1rem;"></div>
      </div>
    `;
    document.getElementById('aiTabContent').innerHTML = html;
    renderPromptList(projectId, 'promptListContainer');
    document.getElementById('newPromptBtn')?.addEventListener('click', () => showPromptForm(projectId));
  };
  
  // Aba Métricas
  const renderMetricsTab = () => {
    const html = `
      <div class="metrics-tab">
        ${renderMetricsHTML(metrics)}
        <div id="timelineChartContainer"></div>
      </div>
    `;
    document.getElementById('aiTabContent').innerHTML = html;
    renderTimelineChart('timelineChartContainer', metrics);
  };
  
  // Aba Rede
  const renderNetworkTab = async () => {
    const html = `<div id="networkContainer" style="width:100%; height:400px;"></div>`;
    document.getElementById('aiTabContent').innerHTML = html;
    await renderNetwork('networkContainer');
  };
  
  // Gerenciar abas
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      if (tabId === 'ias') renderIAsTab();
      else if (tabId === 'prompts') renderPromptsTab();
      else if (tabId === 'metrics') renderMetricsTab();
      else if (tabId === 'network') renderNetworkTab();
    });
  });
  renderIAsTab(); // ativa por padrão
}

async function showAIForm(projectId, aiData = null) {
  const container = document.getElementById('aiFormContainer');
  if (!container) return;
  container.innerHTML = renderAIForm(projectId, aiData);
  
  container.querySelector('.save-ai').addEventListener('click', async () => {
    const newAI = {
      id: document.getElementById('aiId').value || undefined,
      projetoId: projectId,
      nome: document.getElementById('aiNome').value,
      modelo: document.getElementById('aiModelo').value,
      fornecedor: document.getElementById('aiFornecedor').value,
      funcao: document.getElementById('aiFuncao').value,
      nivelParticipacao: document.getElementById('aiNivel').value,
      observacoes: document.getElementById('aiObservacoes').value
    };
    await saveAI(newAI);
    loadAIHub(projectId);
  });
  
  container.querySelector('.cancel-ai').addEventListener('click', () => {
    container.innerHTML = '';
  });
}

async function showPromptForm(projectId) {
  const ias = await getAIList(projectId);
  const html = `
    <div class="prompt-form glass-card">
      <h3>Registrar Prompt</h3>
      <select id="promptIAId" class="neon-select" required>
        <option value="">Selecione a IA</option>
        ${ias.map(ia => `<option value="${ia.id}">${escapeHtml(ia.nome)}</option>`).join('')}
      </select>
      <textarea id="promptText" placeholder="Digite o prompt utilizado..." rows="3" class="neon-input"></textarea>
      <textarea id="promptResult" placeholder="Resultado obtido..." rows="2" class="neon-input"></textarea>
      <div class="form-actions">
        <button id="cancelPromptBtn" class="neon-button">Cancelar</button>
        <button id="savePromptBtn" class="neon-button">Salvar</button>
      </div>
    </div>
  `;
  const formContainer = document.getElementById('promptFormContainer');
  formContainer.innerHTML = html;
  
  document.getElementById('savePromptBtn').addEventListener('click', async () => {
    const iaModeloId = document.getElementById('promptIAId').value;
    const prompt = document.getElementById('promptText').value;
    const resultado = document.getElementById('promptResult').value;
    if (!iaModeloId || !prompt) {
      alert('Preencha IA e Prompt');
      return;
    }
    await savePrompt({
      projetoId: projectId,
      iaModeloId: parseInt(iaModeloId),
      prompt,
      resultado,
      data: new Date().toISOString()
    });
    formContainer.innerHTML = '';
    renderPromptList(projectId, 'promptListContainer');
  });
  
  document.getElementById('cancelPromptBtn').addEventListener('click', () => {
    formContainer.innerHTML = '';
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}