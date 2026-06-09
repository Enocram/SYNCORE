// ============================================================
// AI METRICS – Estatísticas de uso das IAs
// ============================================================

import { getAll } from '../../db/repository.js';
import { getAIList } from './ai-registry.js';
import { getPrompts } from './prompt-registry.js';

export async function computeMetrics(projectId = null) {
  const ias = await getAIList(projectId);
  const prompts = await getPrompts(projectId);
  
  // IA mais utilizada (mais prompts)
  const iaPromptCount = {};
  prompts.forEach(p => {
    iaPromptCount[p.iaModeloId] = (iaPromptCount[p.iaModeloId] || 0) + 1;
  });
  let mostUsedIA = null;
  let maxCount = 0;
  for (const [iaId, count] of Object.entries(iaPromptCount)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedIA = iaId;
    }
  }
  
  // Total de prompts
  const totalPrompts = prompts.length;
  
  // Participação por IA (nível médio)
  const participacaoMap = {};
  ias.forEach(ia => {
    const nivelMap = { baixo: 1, médio: 2, alto: 3, crítico: 4 };
    participacaoMap[ia.nome] = nivelMap[ia.nivelParticipacao] || 0;
  });
  
  // Timeline de uso (últimos 30 dias)
  const last30Days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last30Days.push(d.toISOString().slice(0,10));
  }
  const timelineCount = {};
  last30Days.forEach(day => { timelineCount[day] = 0; });
  prompts.forEach(p => {
    const day = p.data.slice(0,10);
    if (timelineCount[day] !== undefined) timelineCount[day]++;
  });
  
  return {
    totalIAs: ias.length,
    totalPrompts,
    mostUsedIA,
    iaPromptCount,
    participacaoMap,
    timeline: { days: last30Days, counts: timelineCount }
  };
}

// Renderiza gráfico de timeline (canvas)
export function renderTimelineChart(containerId, metrics) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth;
  canvas.height = 150;
  container.innerHTML = '';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  const days = metrics.timeline.days;
  const counts = metrics.timeline.counts;
  const maxCount = Math.max(...Object.values(counts), 1);
  const w = canvas.width;
  const h = canvas.height;
  const barWidth = (w / days.length) * 0.7;
  const step = w / days.length;
  
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < days.length; i++) {
    const count = counts[days[i]];
    const height = (count / maxCount) * (h - 20);
    ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + (count/maxCount)*0.5})`;
    ctx.fillRect(i * step + step*0.15, h - height, barWidth, height);
    ctx.fillStyle = '#0ff';
    ctx.font = '8px monospace';
    ctx.fillText(count, i * step + step*0.3, h - height - 2);
  }
}

// Renderiza métricas em HTML
export function renderMetricsHTML(metrics) {
  return `
    <div class="ai-metrics-grid">
      <div class="metric-card"><span class="metric-value">${metrics.totalIAs}</span><span>IAs Registradas</span></div>
      <div class="metric-card"><span class="metric-value">${metrics.totalPrompts}</span><span>Prompts Totais</span></div>
      <div class="metric-card"><span class="metric-value">${metrics.mostUsedIA ? metrics.mostUsedIA : '—'}</span><span>IA Mais Usada</span></div>
    </div>
    <div class="timeline-container">
      <h4>📅 Timeline de Prompts (últimos 30 dias)</h4>
      <canvas id="timelineCanvas" width="100%" height="150"></canvas>
    </div>
  `;
}