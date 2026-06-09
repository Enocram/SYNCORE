// ============================================================
// NEURAL MAP V2 – Radar Tático (corrigido)
// ============================================================

import { ux } from '../../ux-engine.js';
import { getProject, getAllProjects } from '../../storage.js';
import { loadRoadmap } from '../roadmap/roadmap-manager.js';
import { getAIList } from '../ai/ai-registry.js';

export class NeuralMapV2 {
  constructor(containerId, projectId) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error('Container não encontrado');
    this.projectId = projectId;
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 600;
    this.nodes = [];
    this.edges = [];
    this.nodePositions = new Map();
    this.zoom = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.hoveredNode = null;
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupCanvas();
      this.setupEvents();
      this.animate();
    } catch (err) {
      console.error('[NeuralMapV2] Erro na inicialização:', err);
      this.container.innerHTML = `<div class="error" style="color:#ff6666; padding:1rem;">Erro ao carregar mapa: ${err.message}</div>`;
    }
  }

  async loadData() {
    const project = await getProject(this.projectId);
    if (!project) throw new Error('Projeto não encontrado');

    // Nó central: Projeto
    this.nodes.push({
      id: 'project',
      label: project.nome,
      type: 'project',
      radius: 28,
      color: '#00a3ff'
    });

    // IAs envolvidas (pode ser vazio)
    const ias = await getAIList(this.projectId);
    if (ias.length === 0) {
      // Adiciona nó informativo
      this.nodes.push({
        id: 'no_ia',
        label: 'Nenhuma IA registrada',
        type: 'info',
        radius: 16,
        color: '#777'
      });
      this.edges.push({ from: 'project', to: 'no_ia', weight: 0.5 });
    } else {
      ias.forEach(ia => {
        this.nodes.push({
          id: `ia_${ia.id}`,
          label: ia.nome,
          type: 'ia',
          radius: 20,
          color: '#9d4eff'
        });
        this.edges.push({ from: 'project', to: `ia_${ia.id}`, weight: 1 });
      });
    }

    // Roadmap (etapas)
    const roadmap = await loadRoadmap(this.projectId);
    if (!roadmap || !roadmap.stages || roadmap.stages.length === 0) {
      // Adiciona nó informativo
      this.nodes.push({
        id: 'no_roadmap',
        label: 'Nenhum roadmap definido',
        type: 'info',
        radius: 16,
        color: '#ffaa33'
      });
      this.edges.push({ from: 'project', to: 'no_roadmap', weight: 0.5 });
    } else {
      roadmap.stages.forEach((stage, idx) => {
        this.nodes.push({
          id: `stage_${stage.id}`,
          label: stage.titulo,
          type: 'stage',
          radius: 18,
          color: stage.status === 'concluido' ? '#00e676' : '#ffb74d'
        });
        this.edges.push({ from: 'project', to: `stage_${stage.id}` });
        if (idx > 0) {
          this.edges.push({ from: `stage_${roadmap.stages[idx-1].id}`, to: `stage_${stage.id}` });
        }
      });
    }

    // Dependências (projetos relacionados pela mesma categoria)
    const allProjects = await getAllProjects({ arquivado: false });
    const related = allProjects.filter(p => p.categoria === project.categoria && p.id !== project.id).slice(0, 4);
    related.forEach(rel => {
      this.nodes.push({
        id: `proj_${rel.id}`,
        label: rel.nome,
        type: 'related',
        radius: 16,
        color: '#00e5ff'
      });
      this.edges.push({ from: 'project', to: `proj_${rel.id}`, weight: 0.5 });
    });

    // Posições iniciais em círculo
    const angleStep = (Math.PI * 2) / this.nodes.length;
    this.nodes.forEach((node, i) => {
      const angle = i * angleStep;
      const radius = Math.min(this.width, this.height) * 0.35;
      this.nodePositions.set(node.id, {
        x: this.width/2 + Math.cos(angle) * radius,
        y: this.height/2 + Math.sin(angle) * radius
      });
    });
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.background = 'var(--color-bg-secondary, #0a0e1a)';
    this.canvas.style.borderRadius = 'var(--radius-lg, 16px)';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.recenterNodes();
    this.render();
  }

  recenterNodes() {
    if (this.nodePositions.size === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let pos of this.nodePositions.values()) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const offsetX = this.width / 2 - centerX;
    const offsetY = this.height / 2 - centerY;
    for (let pos of this.nodePositions.values()) {
      pos.x += offsetX;
      pos.y += offsetY;
    }
  }

  setupEvents() {
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.min(3, Math.max(0.3, this.zoom * delta));
      this.render();
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.dragStart = { x: e.clientX - this.offsetX, y: e.clientY - this.offsetY };
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      this.offsetX = e.clientX - this.dragStart.x;
      this.offsetY = e.clientY - this.dragStart.y;
      this.render();
    });
    window.addEventListener('mouseup', () => { this.dragging = false; });
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.onClick(e));
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.offsetX) / this.zoom;
    const mouseY = (e.clientY - rect.top - this.offsetY) / this.zoom;
    let hit = null;
    for (let [id, pos] of this.nodePositions.entries()) {
      const node = this.nodes.find(n => n.id === id);
      if (!node) continue;
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= node.radius) {
        hit = id;
        break;
      }
    }
    if (this.hoveredNode !== hit) {
      this.hoveredNode = hit;
      this.render();
    }
  }

  onClick(e) {
    if (this.hoveredNode) {
      const node = this.nodes.find(n => n.id === this.hoveredNode);
      ux.notify(`Nó selecionado: ${node.label}`, 'info', 1500);
    }
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.zoom, this.zoom);

    // Arestas
    this.edges.forEach(edge => {
      const fromPos = this.nodePositions.get(edge.from);
      const toPos = this.nodePositions.get(edge.to);
      if (fromPos && toPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.strokeStyle = `rgba(0, 229, 255, ${0.2 + (edge.weight || 0.5) * 0.3})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }
    });

    // Nós
    this.nodes.forEach(node => {
      const pos = this.nodePositions.get(node.id);
      if (!pos) return;
      const radius = node.radius * (this.hoveredNode === node.id ? 1.1 : 1);
      const grad = this.ctx.createRadialGradient(pos.x - 3, pos.y - 3, 2, pos.x, pos.y, radius);
      grad.addColorStop(0, node.color);
      grad.addColorStop(1, 'rgba(0,0,0,0.8)');
      this.ctx.fillStyle = grad;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = node.color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.font = `bold ${Math.max(11, 14 - (node.label.length > 15 ? 2 : 0))}px var(--font-family-sans, monospace)`;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(node.label, pos.x - radius, pos.y - radius - 4);
    });

    this.ctx.restore();

    // Legenda
    this.ctx.font = '12px var(--font-family-sans, monospace)';
    this.ctx.fillStyle = 'var(--color-text-tertiary, #aaa)';
    this.ctx.fillText('🔵 Projeto | 🟣 IA | 🟠 Etapas | 🔗 Dependências', 12, 30);
  }

  animate() {
    this.render();
    requestAnimationFrame(() => this.animate());
  }
}