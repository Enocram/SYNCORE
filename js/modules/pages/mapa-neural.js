// ============================================================
// PAGE: MAPA NEURAL V2 – Radar Tático (NeuralMapV2)
// ============================================================

import { NeuralMapV2 } from '../neural/neural-map-v2.js';
import { getAllProjects } from '../../storage.js';

let currentMap = null;

export async function render() {
  const projects = await getAllProjects({ arquivado: false });
  return `
    <div class="neural-page">
      <h1 class="page-title">🧠 CENTRO DE COMANDO NEURAL</h1>
      <div class="project-selector" style="display: flex; gap: 12px; margin-bottom: 20px;">
        <select id="neuralProjectSelectV2" class="input" style="flex:1;">
          <option value="">-- Selecione um projeto --</option>
          ${projects.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join('')}
        </select>
        <button id="loadNeuralV2Btn" class="btn btn-primary">Ativar Radar Tático</button>
      </div>
      <div id="neuralMapContainerV2" style="width:100%; height:70vh; background: var(--color-bg-secondary); border-radius: 16px; overflow: hidden;"></div>
    </div>
  `;
}

export async function afterRender() {
  const btn = document.getElementById('loadNeuralV2Btn');
  const select = document.getElementById('neuralProjectSelectV2');
  if (!btn || !select) return;
  
  btn.addEventListener('click', () => {
    const projectId = select.value;
    if (!projectId) {
      alert('Selecione um projeto');
      return;
    }
    if (currentMap) {
      // limpar container
      const container = document.getElementById('neuralMapContainerV2');
      container.innerHTML = '';
      currentMap = null;
    }
    currentMap = new NeuralMapV2('neuralMapContainerV2', projectId);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}