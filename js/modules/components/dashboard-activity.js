// ============================================================
// DASHBOARD ACTIVITY – Últimos projetos editados, criados, heatmap
// ============================================================

import { getAllProjects } from '../../storage.js';

export async function renderActivityWidget(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const projects = await getAllProjects({}, 'ultimaAtualizacao', 'desc');
  const recentEdited = projects.slice(0, 5);
  
  const createdSorted = [...projects].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentCreated = createdSorted.slice(0, 5);
  
  // Projetos mais trabalhados (maior progresso)
  const mostWorked = [...projects].sort((a,b) => (b.progresso || 0) - (a.progresso || 0)).slice(0, 5);
  
  const html = `
    <div class="activity-widget">
      <h2 class="widget-title neon-text-green">📈 ATIVIDADE RECENTE</h2>
      <div class="activity-grid">
        <div class="activity-card">
          <h3>🕒 Últimos Editados</h3>
          <ul class="activity-list">
            ${recentEdited.map(p => `<li><strong>${escapeHtml(p.nome)}</strong> - ${formatRelativeTime(p.ultimaAtualizacao)}</li>`).join('') || '<li>Nenhum projeto</li>'}
          </ul>
        </div>
        <div class="activity-card">
          <h3>✨ Criados Recentemente</h3>
          <ul class="activity-list">
            ${recentCreated.map(p => `<li><strong>${escapeHtml(p.nome)}</strong> - ${formatDate(p.createdAt)}</li>`).join('') || '<li>Nenhum projeto</li>'}
          </ul>
        </div>
        <div class="activity-card">
          <h3>⚡ Mais Trabalhados (Progresso)</h3>
          <ul class="activity-list">
            ${mostWorked.map(p => `<li><strong>${escapeHtml(p.nome)}</strong> - ${p.progresso || 0}%</li>`).join('') || '<li>Nenhum projeto</li>'}
          </ul>
        </div>
      </div>
      
      <!-- Heatmap Simulado (últimos 7 dias de edições) -->
      <div class="heatmap-container">
        <h3>🔥 HEATMAP DE ATIVIDADE (últimos 7 dias)</h3>
        <div id="heatmapGrid" class="heatmap-grid"></div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Gerar heatmap baseado nas datas de atualização
  const heatmapData = generateHeatmap(projects);
  renderHeatmap(heatmapData);
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return 'desconhecido';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'ontem';
  return `${diffDays} dias`;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('pt-BR');
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

function generateHeatmap(projects) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    last7Days.push(d.toISOString().slice(0,10));
  }
  const counts = {};
  last7Days.forEach(day => { counts[day] = 0; });
  projects.forEach(p => {
    if (p.ultimaAtualizacao) {
      const day = p.ultimaAtualizacao.slice(0,10);
      if (counts[day] !== undefined) counts[day]++;
    }
  });
  return { days: last7Days, counts };
}

function renderHeatmap({ days, counts }) {
  const container = document.getElementById('heatmapGrid');
  if (!container) return;
  const maxCount = Math.max(...Object.values(counts), 1);
  container.innerHTML = days.map(day => {
    const count = counts[day];
    const intensity = Math.floor((count / maxCount) * 100);
    const bgColor = `rgba(0, 255, 255, ${0.2 + intensity/100 * 0.6})`;
    return `<div class="heatmap-cell" style="background:${bgColor};" title="${day}: ${count} edições">${day.slice(5)}<br><small>${count}</small></div>`;
  }).join('');
}