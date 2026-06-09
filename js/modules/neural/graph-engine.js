// ============================================================
// GRAPH ENGINE – Estrutura de grafo (nós, arestas) e busca
// ============================================================

export class GraphEngine {
  constructor() {
    this.nodes = new Map(); // id -> node object
    this.edges = []; // array of {from, to}
    this.adjacency = new Map(); // id -> Set of neighbor ids
  }
  
  setNodes(nodesArray) {
    this.nodes.clear();
    this.adjacency.clear();
    nodesArray.forEach(node => {
      this.nodes.set(node.id, node);
      this.adjacency.set(node.id, new Set());
    });
  }
  
  setEdges(edgesArray) {
    this.edges = edgesArray;
    // Build adjacency
    edgesArray.forEach(edge => {
      if (this.adjacency.has(edge.from)) this.adjacency.get(edge.from).add(edge.to);
      if (this.adjacency.has(edge.to)) this.adjacency.get(edge.to).add(edge.from);
    });
  }
  
  getNode(id) {
    return this.nodes.get(id);
  }
  
  getNodes() {
    return Array.from(this.nodes.values());
  }
  
  getEdges() {
    return this.edges;
  }
  
  getNeighbors(nodeId) {
    return Array.from(this.adjacency.get(nodeId) || []).map(id => this.nodes.get(id));
  }
  
  getNodeDepth(nodeId) {
    const node = this.nodes.get(nodeId);
    return node ? node.depth : 0;
  }
  
  // Para uso no layout: obter lista de nós com posições iniciais
  getNodeIds() {
    return Array.from(this.nodes.keys());
  }
}