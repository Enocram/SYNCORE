// ============================================================
// NEURAL MAP – Motor principal do mapa interativo
// Gerencia canvas, integração dos sub-módulos e ciclo de renderização
// ============================================================

import { NodeEngine } from './node-engine.js';
import { GraphEngine } from './graph-engine.js';
import { LayoutEngine } from './layout-engine.js';
import { InteractionEngine } from './interaction-engine.js';

export class NeuralMap {
  constructor(containerId, projectId = null) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error('Container not found');
    
    this.projectId = projectId;
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 600;
    
    this.nodeEngine = new NodeEngine();
    this.graphEngine = new GraphEngine();
    this.layoutEngine = new LayoutEngine();
    this.interaction = null;
    
    this.animationId = null;
    this.isRunning = true;
    
    this.initCanvas();
    this.interaction = new InteractionEngine(this.canvas, this, this.layoutEngine);
    this.setupEventListeners();
  }
  
  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.background = '#050510';
    this.canvas.style.borderRadius = '12px';
    this.canvas.style.border = '1px solid #00ffff';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    if (this.layoutEngine) {
      this.layoutEngine.setDimensions(this.width, this.height);
      this.layoutEngine.updateViewport(this.width, this.height);
    }
    this.render();
  }
  
  async loadProject(projectId) {
    this.projectId = projectId;
    // Busca projeto do storage (assumindo que storage.js está disponível)
    const { getProject } = await import('../../storage.js');
    const project = await getProject(projectId);
    if (!project) throw new Error('Projeto não encontrado');
    
    // Gera nós e conexões
    const { nodes, edges } = this.nodeEngine.generateFromProject(project);
    this.graphEngine.setNodes(nodes);
    this.graphEngine.setEdges(edges);
    
    // Calcula layout inicial
    this.layoutEngine.setGraph(this.graphEngine);
    this.layoutEngine.computeLayout(50); // iterações iniciais
    
    this.interaction.resetTransform();
    this.startRenderLoop();
  }
  
  setupEventListeners() {
    // Double-click no canvas para centralizar
    this.canvas.addEventListener('dblclick', (e) => {
      this.interaction.centerView();
      this.render();
    });
  }
  
  startRenderLoop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    const loop = () => {
      if (this.isRunning) {
        this.render();
        this.animationId = requestAnimationFrame(loop);
      }
    };
    this.animationId = requestAnimationFrame(loop);
  }
  
  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Aplica transformação de zoom/pan
    this.ctx.save();
    this.interaction.applyTransform(this.ctx);
    
    // Desenha arestas (conexões)
    const edges = this.graphEngine.getEdges();
    const nodes = this.graphEngine.getNodes();
    const nodePositions = this.layoutEngine.getNodePositions();
    
    this.ctx.beginPath();
    edges.forEach(edge => {
      const fromPos = nodePositions.get(edge.from);
      const toPos = nodePositions.get(edge.to);
      if (fromPos && toPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(Date.now() * 0.002) * 0.1})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }
    });
    
    // Desenha nós
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      const radius = Math.max(12, 20 - (this.graphEngine.getNodeDepth(node.id) * 2));
      const isHighlighted = this.interaction.highlightedNode === node.id;
      
      // Glow e sombra
      this.ctx.shadowBlur = isHighlighted ? 15 : 8;
      this.ctx.shadowColor = node.color || '#00ffff';
      
      // Gradiente radial neon
      const grad = this.ctx.createRadialGradient(pos.x - 3, pos.y - 3, 2, pos.x, pos.y, radius);
      grad.addColorStop(0, node.color || '#0ff');
      grad.addColorStop(1, `rgba(0,0,0,0.8)`);
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Borda neon pulsante
      this.ctx.shadowBlur = 10;
      this.ctx.strokeStyle = node.color || '#0ff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius + 2, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Texto do nó
      this.ctx.font = `bold ${Math.max(10, 14 - this.graphEngine.getNodeDepth(node.id))}px monospace`;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(node.label, pos.x - 20, pos.y - radius - 4);
      
      // Ícone pequeno para tipo de nó
      this.ctx.font = '12px monospace';
      this.ctx.fillStyle = '#00ff66';
      this.ctx.fillText(node.icon || '●', pos.x - 5, pos.y + 4);
    });
    
    this.ctx.restore();
    
    // Desenha controles de zoom (texto)
    this.ctx.font = '10px monospace';
    this.ctx.fillStyle = '#0ff';
    this.ctx.fillText(`Zoom: ${Math.round(this.interaction.zoom * 100)}%`, 10, 20);
    this.ctx.fillText(`Arraste para mover | Duplo clique centraliza`, 10, 35);
  }
  
  destroy() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.interaction.destroy();
    this.canvas.remove();
  }
}