// ============================================================
// NODE ENGINE – Gera nós hierárquicos a partir do projeto
// ============================================================

export class NodeEngine {
  generateFromProject(project) {
    const nodes = [];
    const edges = [];
    
    // Nó central (projeto)
    const projectNode = {
      id: `proj_${project.id}`,
      label: project.nome,
      type: 'project',
      depth: 0,
      color: '#ff00ff',
      icon: '🔷',
      data: project
    };
    nodes.push(projectNode);
    
    // Nós secundários fixos
    const secondaryCategories = [
      { key: 'informacoes', label: 'Informações', icon: 'ℹ️', color: '#00ffff', children: ['descricao', 'categoria', 'tipo', 'status'] },
      { key: 'arquitetura', label: 'Arquitetura', icon: '🏗️', color: '#ff6600', children: [] },
      { key: 'ias', label: 'IAs', icon: '🤖', color: '#00ff66', children: this.extractIAs(project) },
      { key: 'roadmap', label: 'Roadmap', icon: '🗺️', color: '#ffcc00', children: [] },
      { key: 'documentacao', label: 'Documentação', icon: '📄', color: '#66ccff', children: [] },
      { key: 'atividades', label: 'Atividades', icon: '⚡', color: '#ff33cc', children: [] },
      { key: 'pendencias', label: 'Pendências', icon: '⚠️', color: '#ff3333', children: [] },
      { key: 'proximasAcoes', label: 'Próximas Ações', icon: '🎯', color: '#ffaa33', children: [] },
      { key: 'metricas', label: 'Métricas', icon: '📊', color: '#33ffcc', children: [] }
    ];
    
    // Adiciona nós secundários e arestas para o projeto
    secondaryCategories.forEach(cat => {
      const catNode = {
        id: `${cat.key}_${project.id}`,
        label: cat.label,
        type: cat.key,
        depth: 1,
        color: cat.color,
        icon: cat.icon
      };
      nodes.push(catNode);
      edges.push({ from: `proj_${project.id}`, to: catNode.id });
      
      // Adiciona filhos para categorias com dados reais
      if (cat.key === 'informacoes') {
        const infoChildren = [
          { label: `Descrição: ${(project.descricaoCurta || 'N/A').substring(0, 30)}`, icon: '📝' },
          { label: `Categoria: ${project.categoria || 'N/A'}`, icon: '📁' },
          { label: `Tipo: ${project.tipo || 'N/A'}`, icon: '🔧' },
          { label: `Status: ${project.status || 'N/A'}`, icon: '🔄' }
        ];
        infoChildren.forEach((child, idx) => {
          const childNode = {
            id: `info_${project.id}_${idx}`,
            label: child.label,
            type: 'info',
            depth: 2,
            color: '#88ffff',
            icon: child.icon
          };
          nodes.push(childNode);
          edges.push({ from: catNode.id, to: childNode.id });
        });
      }
      
      if (cat.key === 'ias' && cat.children.length > 0) {
        cat.children.forEach(ia => {
          const iaNode = {
            id: `ia_${project.id}_${ia.name}`,
            label: ia.name,
            type: 'ia',
            depth: 2,
            color: '#00ff88',
            icon: '🧠'
          };
          nodes.push(iaNode);
          edges.push({ from: catNode.id, to: iaNode.id });
        });
      }
    });
    
    // Adiciona nós de próxima ação se existir
    if (project.proximaAcao && project.proximaAcao.trim()) {
      const actionNode = {
        id: `action_${project.id}`,
        label: `Próxima: ${project.proximaAcao.substring(0, 40)}`,
        type: 'action',
        depth: 2,
        color: '#ffaa33',
        icon: '⚡'
      };
      nodes.push(actionNode);
      edges.push({ from: `proximasAcoes_${project.id}`, to: actionNode.id });
    }
    
    // Adiciona métricas: progresso
    const metricNode = {
      id: `metric_prog_${project.id}`,
      label: `Progresso: ${project.progresso || 0}%`,
      type: 'metric',
      depth: 2,
      color: '#33ffcc',
      icon: '📈'
    };
    nodes.push(metricNode);
    edges.push({ from: `metricas_${project.id}`, to: metricNode.id });
    
    return { nodes, edges };
  }
  
  extractIAs(project) {
    const ias = [];
    if (project.iaPrincipal) ias.push({ name: project.iaPrincipal });
    if (project.iasEnvolvidas) {
      const list = project.iasEnvolvidas.split(',').map(s => s.trim()).filter(s => s);
      list.forEach(name => ias.push({ name }));
    }
    if (ias.length === 0) ias.push({ name: 'Nenhuma IA' });
    return ias;
  }
}