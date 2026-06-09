// ============================================================
// ROADMAP ALERTS – Detecção de estagnação, atrasos, etc.
// ============================================================

import { getAllProjects } from '../../storage.js';
import { loadRoadmap } from './roadmap-manager.js';

export async function getAlerts() {
  const projects = await getAllProjects({ arquivado: false });
  const alerts = [];
  const today = new Date();
  
  for (const project of projects) {
    const roadmap = await loadRoadmap(project.id);
    if (!roadmap) continue;
    
    // 1. Projeto parado (nenhuma etapa atualizada há mais de 30 dias)
    const lastUpdate = new Date(roadmap.ultimaAtualizacao);
    const daysIdle = (today - lastUpdate) / (1000*3600*24);
    if (daysIdle > 30 && project.status !== 'concluido') {
      alerts.push({ type: 'parado', projeto: project.nome, mensagem: `Projeto sem atualização no roadmap há ${Math.floor(daysIdle)} dias` });
    }
    
    // 2. Etapas atrasadas
    for (const stage of roadmap.stages) {
      if (stage.dataPrevista && stage.status !== 'concluido') {
        const prevista = new Date(stage.dataPrevista);
        if (prevista < today) {
          const delayDays = Math.floor((today - prevista) / (1000*3600*24));
          alerts.push({ type: 'atraso', projeto: project.nome, etapa: stage.titulo, mensagem: `Etapa "${stage.titulo}" atrasada em ${delayDays} dias` });
        }
      }
      
      // 3. Prazo próximo (dataPrevista dentro de 5 dias)
      if (stage.dataPrevista && stage.status !== 'concluido') {
        const prevista = new Date(stage.dataPrevista);
        const diffDays = (prevista - today) / (1000*3600*24);
        if (diffDays <= 5 && diffDays > 0) {
          alerts.push({ type: 'prazo_proximo', projeto: project.nome, etapa: stage.titulo, mensagem: `Prazo da etapa "${stage.titulo}" se aproxima (${Math.ceil(diffDays)} dias)` });
        }
      }
    }
    
    // 4. Roadmap inconsistente (etapas puladas)
    const stagesOrdered = [...roadmap.stages].sort((a,b) => a.ordem - b.ordem);
    let lastCompletedIndex = -1;
    for (let i = 0; i < stagesOrdered.length; i++) {
      if (stagesOrdered[i].status === 'concluido') lastCompletedIndex = i;
      else if (stagesOrdered[i].status === 'em_andamento' && lastCompletedIndex < i-1) {
        alerts.push({ type: 'inconsistente', projeto: project.nome, mensagem: `Etapa "${stagesOrdered[i].titulo}" em andamento antes de concluir etapas anteriores` });
        break;
      }
    }
  }
  
  return alerts;
}