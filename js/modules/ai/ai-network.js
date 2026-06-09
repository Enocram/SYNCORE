// ============================================================
// AI NETWORK – Mapa de colaboração IA ↔ Projetos
// ============================================================

import { getAllProjects } from '../../storage.js';
import { getAIList } from './ai-registry.js';
import { getPrompts } from './prompt-registry.js';

export async function buildCollaborationGraph() {
  const projects = await getAllProjects({}, 'nome', 'asc');
  const ias = await getAIList();
  const prompts = await getPrompts();
  
  const nodes = [];
  const edges = [];
  
  // Nós de projetos
  projects.forEach(p => {
    nodes.push({
      id: `proj_${p.id}`,
      label: p.nome,
      type: 'project',
      color: '#00ff66'
    });
  });
  
  // Nós de IAs
  ias.forEach(ia => {
    nodes.push({
      id: `ia_${ia.id}`,
      label: ia.nome,
      type: 'ia',
      color: '#ff00ff'
    });
  });
  
  // Arestas: IA <-> Projeto (baseado em prompts)
  const edgeSet = new Set();
  prompts.forEach(p => {
    const from = `proj_${p.projetoId}`;
    const to = `ia_${p.iaModeloId}`;
    const key = `${from}|${to}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ from, to, weight: 1 });
    } else {
      // incrementa peso (não usado no layout simples)
    }
  });
  
  return { nodes, edges };
}

// Renderiza o canvas com o grafo (layout simples círculo)
export async function renderNetwork(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const { nodes, edges } = await buildCollaborationGraph();
  const width = container.clientWidth;
  const height = 400;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.background = '#050510';
  canvas.style.borderRadius = '12px';
  container.innerHTML = '';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  
  // Layout circular simples
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const positions = {};
  
  nodes.forEach((node, idx) => {
    const angle = (idx / nodes.length) * Math.PI * 2;
    positions[node.id] = {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  });
  
  // Desenha arestas
  edges.forEach(edge => {
    const from = positions[edge.from];
    const to = positions[edge.to];
    if (from && to) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = `rgba(0, 255, 255, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  
  // Desenha nós
  nodes.forEach(node => {
    const pos = positions[node.id];
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.shadowBlur = 8;
    ctx.shadowColor = node.color;
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    ctx.fillText(node.label.slice(0, 10), pos.x - 20, pos.y - 10);
    ctx.shadowBlur = 0;
  });
}