// ============================================================
// DASHBOARD STATS – KPIs, métricas, gráficos
// Cards neon, progress bars, radar (canvas)
// ============================================================

import { getAllProjects } from '../../storage.js';

export async function renderStatsWidget(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const projects = await getAllProjects({}, 'ultimaAtualizacao', 'desc');
  
  // Cálculo dos KPIs
  const total = projects.length;
  const ativos = projects.filter(p => p.status === 'ativo').length;
  const pausados = projects.filter(p => p.status === 'pausado').length;
  const concluidos = projects.filter(p => p.status === 'concluido').length;
  const arquivados = projects.filter(p => p.arquivado === true).length;
  const favoritos = projects.filter(p => p.favorito === true).length;
  
  // Métricas por prioridade
  const prioridadeCount = {
    baixa: projects.filter(p => p.prioridade === 'baixa').length,
    media: projects.filter(p => p.prioridade === 'media').length,
    alta: projects.filter(p => p.prioridade === 'alta').length,
    critica: projects.filter(p => p.prioridade === 'critica').length
  };
  
  // Métricas por categoria
  const categoriaCount = {};
  projects.forEach(p => {
    const cat = p.categoria || 'sem categoria';
    categoriaCount[cat] = (categoriaCount[cat] || 0) + 1;
  });
  
  // Métricas por IA principal
  const iaCount = {};
  projects.forEach(p => {
    const ia = p.iaPrincipal || 'nenhuma';
    iaCount[ia] = (iaCount[ia] || 0) + 1;
  });
  
  const html = `
    <div class="stats-widget">
      <h2 class="widget-title neon-text-purple">📊 PAINEL DE SITUAÇÃO</h2>
      
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card neon-card"><span class="kpi-value">${total}</span><span class="kpi-label">Total Projetos</span></div>
        <div class="kpi-card neon-card"><span class="kpi-value">${ativos}</span><span class="kpi-label">Ativos</span></div>
        <div class="kpi-card neon-card"><span class="kpi-value">${pausados}</span><span class="kpi-label">Pausados</span></div>
        <div class="kpi-card neon-card"><span class="kpi-value">${concluidos}</span><span class="kpi-label">Concluídos</span></div>
        <div class="kpi-card neon-card"><span class="kpi-value">${arquivados}</span><span class="kpi-label">Arquivados</span></div>
        <div class="kpi-card neon-card"><span class="kpi-value">${favoritos}</span><span class="kpi-label">Favoritos</span></div>
      </div>
      
      <!-- Gráficos inline -->
      <div class="charts-row">
        <div class="chart-box">
          <h3>🎯 Por Prioridade</h3>
          <div class="progress-stack">
            ${Object.entries(prioridadeCount).map(([prior, qtd]) => `
              <div class="progress-item">
                <span class="priority-label ${prior}">${prior.toUpperCase()}</span>
                <div class="progress-bar-bg"><div class="progress-fill" style="width: ${total ? (qtd/total)*100 : 0}%; background: var(--neon-${prior === 'critica' ? 'purple' : prior === 'alta' ? 'red' : prior === 'media' ? 'yellow' : 'green'});"></div></div>
                <span>${qtd}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="chart-box">
          <h3>📂 Por Categoria</h3>
          <div class="simple-list">
            ${Object.entries(categoriaCount).map(([cat, qtd]) => `<div>${cat}: ${qtd}</div>`).join('') || '<div>Nenhuma categoria</div>'}
          </div>
        </div>
        <div class="chart-box">
          <h3>🤖 IAs Principais</h3>
          <div class="simple-list">
            ${Object.entries(iaCount).map(([ia, qtd]) => `<div>${ia}: ${qtd}</div>`).join('') || '<div>Nenhuma IA atribuída</div>'}
          </div>
        </div>
      </div>
      
      <!-- Radar de Projetos (Canvas) -->
      <div class="radar-container">
        <h3>🧠 RADAR NEURAL</h3>
        <canvas id="projectRadarCanvas" width="300" height="300" style="width:100%; max-width:300px; height:auto; background:#000; border-radius:50%;"></canvas>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Desenha radar com base nos dados
  drawRadar(projects);
}

function drawRadar(projects) {
  const canvas = document.getElementById('projectRadarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth;
  const h = canvas.height = canvas.clientHeight;
  const centerX = w/2, centerY = h/2;
  const radius = Math.min(w, h) * 0.35;
  
  // Dimensões: ativos, pausados, alta prioridade, favoritos, progresso médio
  const ativos = projects.filter(p => p.status === 'ativo').length;
  const pausados = projects.filter(p => p.status === 'pausado').length;
  const altaPrioridade = projects.filter(p => p.prioridade === 'alta' || p.prioridade === 'critica').length;
  const favoritos = projects.filter(p => p.favorito).length;
  const progressoMedio = projects.reduce((acc, p) => acc + (p.progresso || 0), 0) / (projects.length || 1);
  
  const total = projects.length || 1;
  const values = [
    (ativos / total) * 100,
    (pausados / total) * 100,
    (altaPrioridade / total) * 100,
    (favoritos / total) * 100,
    progressoMedio
  ];
  
  const labels = ['Ativos', 'Pausados', 'Alta Prior.', 'Favoritos', 'Progresso'];
  const angles = [0, 72, 144, 216, 288].map(deg => deg * Math.PI / 180);
  
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#00ffff';
  ctx.fillStyle = '#00ffff22';
  ctx.lineWidth = 1.5;
  
  // Desenha eixos e grade
  for (let level = 1; level <= 4; level++) {
    ctx.beginPath();
    for (let i = 0; i <= angles.length; i++) {
      const angle = angles[i % angles.length];
      const r = radius * (level / 4);
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#555';
    ctx.stroke();
  }
  
  // Desenha linhas dos eixos
  angles.forEach(angle => {
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#00ffff44';
    ctx.stroke();
  });
  
  // Desenha área dos valores
  ctx.beginPath();
  values.forEach((val, i) => {
    const r = radius * (val / 100);
    const x = centerX + Math.cos(angles[i]) * r;
    const y = centerY + Math.sin(angles[i]) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = '#00ffff66';
  ctx.fill();
  ctx.strokeStyle = '#00ffff';
  ctx.stroke();
  
  // Labels
  ctx.font = '10px monospace';
  ctx.fillStyle = '#0ff';
  labels.forEach((label, i) => {
    const angle = angles[i];
    const x = centerX + Math.cos(angle) * (radius + 20);
    const y = centerY + Math.sin(angle) * (radius + 20);
    ctx.fillText(label, x - 20, y);
  });
}