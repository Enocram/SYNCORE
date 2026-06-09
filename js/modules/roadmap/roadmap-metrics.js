// ============================================================
// ROADMAP METRICS – Cálculos estatísticos
// ============================================================

import { getAllProjects } from '../../storage.js';
import { loadRoadmap } from './roadmap-manager.js';

export async function getMetrics() {
  const projects = await getAllProjects({ arquivado: false });
  let totalStages = 0;
  let completedStages = 0;
  let delayedStages = 0;
  const projectsByPhase = {};
  const stageDuration = {};

  for (const project of projects) {
    const roadmap = await loadRoadmap(project.id);
    if (!roadmap) continue;
    
    const stages = roadmap.stages;
    totalStages += stages.length;
    const completed = stages.filter(s => s.status === 'concluido').length;
    completedStages += completed;
    
    // Projetos por fase (última etapa concluída)
    let lastCompleted = stages.filter(s => s.status === 'concluido').sort((a,b) => b.ordem - a.ordem)[0];
    let fase = lastCompleted ? lastCompleted.titulo : 'Nenhuma';
    projectsByPhase[fase] = (projectsByPhase[fase] || 0) + 1;
    
    // Duração média por etapa (se houver dataInicio e dataConclusao)
    stages.forEach(stage => {
      if (stage.dataInicio && stage.dataConclusao) {
        const start = new Date(stage.dataInicio);
        const end = new Date(stage.dataConclusao);
        const days = (end - start) / (1000*3600*24);
        if (!stageDuration[stage.titulo]) stageDuration[stage.titulo] = [];
        stageDuration[stage.titulo].push(days);
      }
    });
    
    // Atrasos: dataPrevista < hoje e status não concluído
    const today = new Date();
    stages.forEach(stage => {
      if (stage.dataPrevista && stage.status !== 'concluido') {
        const prevista = new Date(stage.dataPrevista);
        if (prevista < today) delayedStages++;
      }
    });
  }
  
  const avgDuration = {};
  for (const [stage, durations] of Object.entries(stageDuration)) {
    avgDuration[stage] = (durations.reduce((a,b) => a+b,0) / durations.length).toFixed(1);
  }
  
  return {
    totalStages,
    completedStages,
    completionRate: totalStages ? Math.round((completedStages/totalStages)*100) : 0,
    delayedStages,
    projectsByPhase,
    avgDuration
  };
}