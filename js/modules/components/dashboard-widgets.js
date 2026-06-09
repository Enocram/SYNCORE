// ============================================================
// DASHBOARD WIDGETS – Alertas, Timeline, Projetos estagnados
// ============================================================

import { getAllProjects } from '../../storage.js';

export async function renderAlertsWidget(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const projects = await getAllProjects({}, 'ultimaAtualizacao', 'desc');
  const now = new Date();
  
  // Alertas: projetos sem atualização há mais de 30 dias
  const staleProjects = projects.filter(p => {
    if (!p.ultimaAtualizacao) return false;
    const lastUpdate = new Date(p.ultimaAtualizacao);
    const diffDays = (now - lastUpdate) / (1000 * 3600 * 24);
    return diffDays > 30 && p.status !== 'concluido' && !p.arquivado;
  });
  
  // Projetos próximos do término (progresso >= 85% e status ativo)
  const nearCompletion = projects.filter(p => p.progresso >= 85 && p.status === 'ativo' && !p.arquivado);
  
  // Projetos estagnados (sem progresso e sem atualização há 14 dias)
  const stagnant = projects.filter(p => {
    if (!p.ultimaAtualizacao) return false;
    const lastUpdate = new Date(p.ultimaAtualizacao);
    const diffDays = (now - lastUpdate) / (1000 * 3600 * 24);
    return (p.progresso === 0 || p.progresso < 10) && diffDays > 14 && p.status === 'ativo' && !p.arquivado;
  });
  
  const html = `
    <div class="alerts-widget">
      <h2 class="widget-title neon-text-blue">⚠️ CENTRO DE ALERTAS</h2>
      <div class="alerts-grid">
        <div class="alert-card alert-stale">
          <h3>⏳ Projetos sem atualização (>30 dias)</h3>
          <ul>${staleProjects.map(p => `<li>${escapeHtml(p.nome)} - última atualização ${formatDate(p.ultimaAtualizacao)}</li>`).join('') || '<li>Nenhum alerta</li>'}</ul>
        </div>
        <div class="alert-card alert-near">
          <h3>🎯 Próximos do término (≥85%)</h3>
          <ul>${nearCompletion.map(p => `<li>${escapeHtml(p.nome)} - ${p.progresso}%</li>`).join('') || '<li>Nenhum projeto próximo</li>'}</ul>
        </div>
        <div class="alert-card alert-stagnant">
          <h3>🐢 Projetos estagnados (sem progresso >14 dias)</h3>
          <ul>${stagnant.map(p => `<li>${escapeHtml(p.nome)} - parado desde ${formatDate(p.ultimaAtualizacao)}</li>`).join('') || '<li>Nenhum projeto estagnado</li>'}</ul>
        </div>
      </div>
      
      <!-- Timeline (linha do tempo dos últimos 10 eventos de criação/edição) -->
      <div class="timeline-container">
        <h3>📅 TIMELINE DE EVENTOS</h3>
        <div class="timeline">
          ${generateTimeline(projects).map(event => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <strong>${escapeHtml(event.nome)}</strong> – ${event.tipo} em ${formatDate(event.data)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

function generateTimeline(projects) {
  const events = [];
  projects.forEach(p => {
    events.push({ nome: p.nome, tipo: 'Criado', data: p.createdAt, sort: new Date(p.createdAt) });
    if (p.ultimaAtualizacao && p.ultimaAtualizacao !== p.createdAt) {
      events.push({ nome: p.nome, tipo: 'Atualizado', data: p.ultimaAtualizacao, sort: new Date(p.ultimaAtualizacao) });
    }
  });
  events.sort((a,b) => b.sort - a.sort);
  return events.slice(0, 8);
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