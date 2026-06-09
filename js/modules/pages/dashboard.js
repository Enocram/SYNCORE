// ============================================================
// PAGE: DASHBOARD (Tático Inteligente)
// Orquestra os widgets de estatísticas, atividades e alertas
// ============================================================

import { renderStatsWidget } from '../components/dashboard-stats.js';
import { renderActivityWidget } from '../components/dashboard-activity.js';
import { renderAlertsWidget } from '../components/dashboard-widgets.js';

let refreshInterval = null;

export async function render() {
  return `
    <div class="dashboard-tactical">
      <div class="dashboard-header">
        <h1 class="page-title">⚡ CENTRO DE INTELIGÊNCIA TÁTICA</h1>
        <div class="dashboard-controls">
          <button id="refreshDashboardBtn" class="neon-button small">🔄 ATUALIZAR</button>
        </div>
      </div>
      <div id="statsWidget" class="dashboard-section"></div>
      <div id="activityWidget" class="dashboard-section"></div>
      <div id="alertsWidget" class="dashboard-section"></div>
    </div>
  `;
}

export async function afterRender() {
  await loadAllWidgets();
  
  // Atualização manual
  const refreshBtn = document.getElementById('refreshDashboardBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadAllWidgets());
  }
  
  // Atualização automática a cada 30 segundos
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    loadAllWidgets();
  }, 30000);
  
  // Escuta eventos de alteração de projetos (disparado pelos componentes CRUD)
  window.addEventListener('projectsChanged', () => loadAllWidgets());
}

async function loadAllWidgets() {
  await renderStatsWidget('statsWidget');
  await renderActivityWidget('activityWidget');
  await renderAlertsWidget('alertsWidget');
}