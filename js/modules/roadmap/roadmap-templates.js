// ============================================================
// ROADMAP TEMPLATES – Etapas padrão e personalizadas
// ============================================================

export const DEFAULT_STAGES = [
  { id: 'idea', titulo: 'IDEIA', descricao: 'Concepção da ideia inicial', ordem: 0, status: 'nao_iniciado' },
  { id: 'pesquisa', titulo: 'PESQUISA', descricao: 'Levantamento de requisitos e mercado', ordem: 1, status: 'nao_iniciado' },
  { id: 'planejamento', titulo: 'PLANEJAMENTO', descricao: 'Definição de escopo, prazos e recursos', ordem: 2, status: 'nao_iniciado' },
  { id: 'mvp', titulo: 'MVP', descricao: 'Versão mínima viável', ordem: 3, status: 'nao_iniciado' },
  { id: 'desenvolvimento', titulo: 'DESENVOLVIMENTO', descricao: 'Construção da solução', ordem: 4, status: 'nao_iniciado' },
  { id: 'testes', titulo: 'TESTES', descricao: 'Validação e QA', ordem: 5, status: 'nao_iniciado' },
  { id: 'deploy', titulo: 'DEPLOY', descricao: 'Implantação em produção', ordem: 6, status: 'nao_iniciado' },
  { id: 'escala', titulo: 'ESCALA', descricao: 'Expansão e otimização', ordem: 7, status: 'nao_iniciado' },
  { id: 'concluido', titulo: 'CONCLUÍDO', descricao: 'Projeto finalizado', ordem: 8, status: 'nao_iniciado' }
];

export const AGILE_TEMPLATE = [
  { id: 'backlog', titulo: 'BACKLOG', descricao: 'Itens priorizados', ordem: 0, status: 'nao_iniciado' },
  { id: 'sprint', titulo: 'SPRINT', descricao: 'Execução de ciclo', ordem: 1, status: 'nao_iniciado' },
  { id: 'review', titulo: 'REVIEW', descricao: 'Entrega e validação', ordem: 2, status: 'nao_iniciado' },
  { id: 'retro', titulo: 'RETROSPECTIVA', descricao: 'Melhorias contínuas', ordem: 3, status: 'nao_iniciado' }
];

export const getTemplate = (type) => {
  if (type === 'agile') return JSON.parse(JSON.stringify(AGILE_TEMPLATE));
  return JSON.parse(JSON.stringify(DEFAULT_STAGES));
};

export const calculateProgress = (stages) => {
  const concluidos = stages.filter(s => s.status === 'concluido').length;
  return Math.round((concluidos / stages.length) * 100);
};

export const getNextSuggestedStage = (stages) => {
  const pending = stages.find(s => s.status === 'nao_iniciado' && (s.status !== 'pausado' && s.status !== 'cancelado'));
  return pending || null;
};