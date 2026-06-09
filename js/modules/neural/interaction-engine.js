// ============================================================
// INTERACTION ENGINE – Zoom, pan, drag, clique, duplo clique
// Gerencia transformações de canvas e eventos do mouse
// ============================================================

export class InteractionEngine {
  constructor(canvas, neuralMap, layoutEngine) {
    this.canvas = canvas;
    this.neuralMap = neuralMap;
    this.layout = layoutEngine;
    
    this.zoom = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    
    this.draggedNode = null;
    
    this.highlightedNode = null;
    
    this.initEvents();
  }
  
  initEvents() {
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
  }
  
  onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(3, Math.max(0.3, this.zoom * delta));
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - this.offsetX) / this.zoom;
    const worldY = (mouseY - this.offsetY) / this.zoom;
    this.zoom = newZoom;
    this.offsetX = mouseX - worldX * this.zoom;
    this.offsetY = mouseY - worldY * this.zoom;
    this.neuralMap.render();
  }
  
  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = this.screenToWorld(mouseX, mouseY);
    
    // Verifica se clicou em algum nó
    const hitNode = this.findNodeAt(worldPos.x, worldPos.y);
    if (hitNode) {
      this.draggedNode = hitNode;
      this.isDragging = true;
      this.dragStartX = worldPos.x;
      this.dragStartY = worldPos.y;
      this.highlightedNode = hitNode;
      this.neuralMap.render();
    } else {
      this.isDragging = true;
      this.dragStartX = mouseX;
      this.dragStartY = mouseY;
      this.dragOffsetX = this.offsetX;
      this.dragOffsetY = this.offsetY;
      this.highlightedNode = null;
    }
  }
  
  onMouseMove(e) {
    if (!this.isDragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (this.draggedNode) {
      const worldPos = this.screenToWorld(mouseX, mouseY);
      const deltaX = worldPos.x - this.dragStartX;
      const deltaY = worldPos.y - this.dragStartY;
      const pos = this.layout.getNodePosition(this.draggedNode);
      if (pos) {
        this.layout.setNodePosition(this.draggedNode, pos.x + deltaX, pos.y + deltaY);
        this.dragStartX = worldPos.x;
        this.dragStartY = worldPos.y;
      }
    } else {
      const deltaX = mouseX - this.dragStartX;
      const deltaY = mouseY - this.dragStartY;
      this.offsetX = this.dragOffsetX + deltaX;
      this.offsetY = this.dragOffsetY + deltaY;
    }
    this.neuralMap.render();
  }
  
  onMouseUp() {
    this.isDragging = false;
    this.draggedNode = null;
  }
  
  onClick(e) {
    if (this.draggedNode) return; // foi arrasto, não clique
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldPos = this.screenToWorld(mouseX, mouseY);
    const clickedNode = this.findNodeAt(worldPos.x, worldPos.y);
    if (clickedNode) {
      // Expande ou recolhe (a ser implementado)
      console.log('Node clicked:', clickedNode);
      // Futuramente: expandir/colapsar nós filhos
    }
  }
  
  onDoubleClick(e) {
    this.centerView();
  }
  
  centerView() {
    // Centralizar no centro do grafo
    let sumX = 0, sumY = 0, count = 0;
    for (let pos of this.layout.getNodePositions().values()) {
      sumX += pos.x;
      sumY += pos.y;
      count++;
    }
    if (count === 0) return;
    const centerX = sumX / count;
    const centerY = sumY / count;
    const targetOffsetX = this.canvas.width/2 - centerX * this.zoom;
    const targetOffsetY = this.canvas.height/2 - centerY * this.zoom;
    this.offsetX = targetOffsetX;
    this.offsetY = targetOffsetY;
    this.neuralMap.render();
  }
  
  resetTransform() {
    this.zoom = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.centerView();
  }
  
  applyTransform(ctx) {
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.zoom, this.zoom);
  }
  
  screenToWorld(screenX, screenY) {
    const worldX = (screenX - this.offsetX) / this.zoom;
    const worldY = (screenY - this.offsetY) / this.zoom;
    return { x: worldX, y: worldY };
  }
  
  findNodeAt(worldX, worldY) {
    for (let [id, pos] of this.layout.getNodePositions().entries()) {
      const node = this.neuralMap.graphEngine.getNode(id);
      const radius = Math.max(12, 20 - (node.depth * 2));
      const dx = worldX - pos.x;
      const dy = worldY - pos.y;
      if (Math.hypot(dx, dy) <= radius) return id;
    }
    return null;
  }
  
  destroy() {
    // Remove event listeners (simplificado, poderia ser mais robusto)
  }
}