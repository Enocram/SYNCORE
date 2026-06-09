// ============================================================
// REPOSITORY – Camada de compatibilidade com storage.js
// ============================================================

import * as storage from '../storage.js';

// As funções do storage.js já exportam exatamente o que precisamos
export const save = storage.saveProject;
export const get = storage.getProject;
export const getAll = storage.getAllProjects;
export const remove = storage.deleteProject;
export const archiveProject = storage.archiveProject;
export const toggleFavorite = storage.toggleFavorite;

// Para outras stores (aiModels, prompts, etc.), precisamos de funções genéricas
// Como o storage.js não tem funções genéricas, criamos wrappers que usam o storage interno

let db = null;

async function getDB() {
  if (!db) {
    await storage.initStorage();
    // O storage.js expõe o db? Não diretamente. Vamos abrir uma conexão manualmente
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('projectCommandCenterDB', 7);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }
  return db;
}

// Funções genéricas para outras stores (aiModels, prompts, etc.)
export async function saveGeneric(storeName, record) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = (e) => reject(e);
  });
}

export async function getAllGeneric(storeName, filters = {}) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => {
      let items = request.result;
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          items = items.filter(item => item[key] === value);
        }
      }
      resolve(items);
    };
    request.onerror = (e) => reject(e);
  });
}

export async function removeGeneric(storeName, id) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

// Mapeamento para manter compatibilidade com os módulos existentes
export const getAIList = (projectId) => getAllGeneric('aiModels', projectId ? { projetoId: projectId } : {});
export const saveAI = (ai) => saveGeneric('aiModels', ai);
export const deleteAI = (id) => removeGeneric('aiModels', id);

export const getPrompts = (projectId) => getAllGeneric('prompts', projectId ? { projetoId: projectId } : {});
export const savePrompt = (prompt) => saveGeneric('prompts', prompt);
export const deletePrompt = (id) => removeGeneric('prompts', id);