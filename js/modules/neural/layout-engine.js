// ============================================================
// LAYOUT ENGINE – Posicionamento força-dirigida + hierárquico
// Suporte a zoom, pan e centralização automática
// ============================================================

export class LayoutEngine {
  constructor() {
    this.graph = null;
    this.nodePositions = new Map(); // id -> {x, y}
    this.width = 800;
    this.height = 600;
    this.repulsion = 200;
    this.attraction = 0.05;
    this.springLength = 120;
    this.damping = 0.85;
    this.iterations = 0;
  }
  
  setGraph(graphEngine) {
    this.graph = graphEngine;
    this.initPositions();
  }
  
  setDimensions(width, height) {
    this.width = width;
    this.height = height;
  }
  
  initPositions() {
    const nodeIds = this.graph.getNodeIds();
    nodeIds.forEach(id => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.min(this.width, this.height) * 0.3 * Math.random();
      const x = this.width/2 + Math.cos(angle) * radius;
      const y = this.height/2 + Math.sin(angle) * radius;
      this.nodePositions.set(id, { x, y, vx: 0, vy: 0 });
    });
  }
  
  computeLayout(iterations = 30) {
    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();
    const nodeMap = this.nodePositions;
    
    for (let iter = 0; iter < iterations; iter++) {
      // Força de repulsão entre todos os pares
      const nodeIds = Array.from(nodeMap.keys());
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i+1; j < nodeIds.length; j++) {
          const idA = nodeIds[i];
          const idB = nodeIds[j];
          const posA = nodeMap.get(idA);
          const posB = nodeMap.get(idB);
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const dist = Math.hypot(dx, dy) || 1;
          const force = this.repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          posA.vx += fx;
          posA.vy += fy;
          posB.vx -= fx;
          posB.vy -= fy;
        }
      }
      
      // Força de atração (molas)
      edges.forEach(edge => {
        const fromPos = nodeMap.get(edge.from);
        const toPos = nodeMap.get(edge.to);
        if (!fromPos || !toPos) return;
        const dx = fromPos.x - toPos.x;
        const dy = fromPos.y - toPos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const force = this.attraction * (dist - this.springLength);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        fromPos.vx -= fx;
        fromPos.vy -= fy;
        toPos.vx += fx;
        toPos.vy += fy;
      });
      
      // Atualizar posições com damping
      nodeIds.forEach(id => {
        const pos = nodeMap.get(id);
        pos.vx *= this.damping;
        pos.vy *= this.damping;
        pos.x += pos.vx;
        pos.y += pos.vy;
        // Limitar bordas
        pos.x = Math.min(Math.max(pos.x, 30), this.width - 30);
        pos.y = Math.min(Math.max(pos.y, 30), this.height - 30);
      });
    }
    
    // Centralizar o layout no viewport
    this.centerLayout();
  }
  
  centerLayout() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let pos of this.nodePositions.values()) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const offsetX = this.width/2 - centerX;
    const offsetY = this.height/2 - centerY;
    for (let pos of this.nodePositions.values()) {
      pos.x += offsetX;
      pos.y += offsetY;
    }
  }
  
  getNodePositions() {
    return this.nodePositions;
  }
  
  updateViewport(width, height) {
    this.width = width;
    this.height = height;
    // Opcional: re-centralizar
    this.centerLayout();
  }
  
  // Métodos para InteractionEngine
  setNodePosition(id, x, y) {
    const pos = this.nodePositions.get(id);
    if (pos) {
      pos.x = x;
      pos.y = y;
      pos.vx = 0;
      pos.vy = 0;
    }
  }
  
  getNodePosition(id) {
    return this.nodePositions.get(id);
  }
}