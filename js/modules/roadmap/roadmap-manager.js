// ============================================================
// ROADMAP MANAGER – CRUD completo de etapas
// ============================================================

import { saveRoadmap, getRoadmap } from '../../storage.js';
import { getTemplate, calculateProgress } from './roadmap-templates.js';

export async function loadRoadmap(projetoId) {
  let roadmap = await getRoadmap(projetoId);
  if (!roadmap) {
    roadmap = {
      projetoId,
      dataCriacao: new Date().toISOString(),
      stages: getTemplate('default'),
      ultimaAtualizacao: new Date().toISOString()
    };
    await saveRoadmap(roadmap);
  }
  return roadmap;
}

export async function updateStage(projetoId, stageId, updates) {
  const roadmap = await loadRoadmap(projetoId);
  const stageIndex = roadmap.stages.findIndex(s => s.id === stageId);
  if (stageIndex === -1) throw new Error('Etapa não encontrada');
  
  roadmap.stages[stageIndex] = { ...roadmap.stages[stageIndex], ...updates };
  roadmap.ultimaAtualizacao = new Date().toISOString();
  
  // Atualiza o progresso do projeto (se quiser sincronizar com campo progresso)
  const progress = calculateProgress(roadmap.stages);
  // Opcional: atualizar projeto.progresso – pode ser feito via evento
  await saveRoadmap(roadmap);
  return roadmap;
}

export async function addCustomStage(projetoId, newStage) {
  const roadmap = await loadRoadmap(projetoId);
  const maxOrdem = Math.max(...roadmap.stages.map(s => s.ordem), -1);
  newStage.ordem = maxOrdem + 1;
  newStage.id = `custom_${Date.now()}`;
  newStage.status = newStage.status || 'nao_iniciado';
  roadmap.stages.push(newStage);
  roadmap.ultimaAtualizacao = new Date().toISOString();
  await saveRoadmap(roadmap);
  return roadmap;
}

export async function deleteCustomStage(projetoId, stageId) {
  const roadmap = await loadRoadmap(projetoId);
  roadmap.stages = roadmap.stages.filter(s => s.id !== stageId);
  roadmap.ultimaAtualizacao = new Date().toISOString();
  await saveRoadmap(roadmap);
  return roadmap;
}

export async function reorderStages(projetoId, stageIdsInOrder) {
  const roadmap = await loadRoadmap(projetoId);
  const newStages = [];
  stageIdsInOrder.forEach((id, idx) => {
    const stage = roadmap.stages.find(s => s.id === id);
    if (stage) {
      stage.ordem = idx;
      newStages.push(stage);
    }
  });
  roadmap.stages = newStages;
  roadmap.ultimaAtualizacao = new Date().toISOString();
  await saveRoadmap(roadmap);
  return roadmap;
}

export async function applyTemplate(projetoId, templateType) {
  const template = getTemplate(templateType);
  const roadmap = await loadRoadmap(projetoId);
  roadmap.stages = template;
  roadmap.ultimaAtualizacao = new Date().toISOString();
  await saveRoadmap(roadmap);
  return roadmap;
}