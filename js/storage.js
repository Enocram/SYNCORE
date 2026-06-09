// ============================================================
// STORAGE MODULE v7 – Criação forçada de todas as stores
// ============================================================

const DB_NAME = 'projectCommandCenterDB';
const DB_VERSION = 7; // Nova versão para garantir criação
let db = null;

// Lista obrigatória de todas as stores usadas no sistema
const REQUIRED_STORES = [
  'projetos',
  'configuracoes',
  'aiModels',
  'prompts',
  'aiInsights',
  'roadmaps',
  'notes',
  'researchLinks',
  'decisions',
  'promptVault',
  'activities',
  'neural_nodes'
];

// Abre (ou cria) o banco com a versão 7
export async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => reject(event.target.error);
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('[Storage] Banco conectado, versão:', db.version);
      // Verifica se todas as stores existem (proteção extra)
      verifyAndCreateMissingStores().then(resolve).catch(reject);
    };
    
    request.onupgradeneeded = (event) => {
      const dbUp = event.target.result;
      console.log('[Storage] Upgrade necessário para versão', DB_VERSION);
      // Cria todas as stores (se não existirem)
      for (const storeName of REQUIRED_STORES) {
        if (!dbUp.objectStoreNames.contains(storeName)) {
          criarStore(dbUp, storeName);
        }
      }
    };
  });
}

// Função auxiliar para criar cada store com seus índices
function criarStore(db, storeName) {
  let store;
  switch (storeName) {
    case 'projetos':
      store = db.createObjectStore('projetos', { keyPath: 'id' });
      store.createIndex('nome', 'nome');
      store.createIndex('status', 'status');
      store.createIndex('prioridade', 'prioridade');
      store.createIndex('favorito', 'favorito');
      store.createIndex('arquivado', 'arquivado');
      store.createIndex('ultimaAtualizacao', 'ultimaAtualizacao');
      break;
    case 'configuracoes':
      store = db.createObjectStore('configuracoes', { keyPath: 'chave' });
      break;
    case 'aiModels':
      store = db.createObjectStore('aiModels', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('nome', 'nome');
      store.createIndex('funcao', 'funcao');
      break;
    case 'prompts':
      store = db.createObjectStore('prompts', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('iaModeloId', 'iaModeloId');
      store.createIndex('data', 'data');
      break;
    case 'aiInsights':
      store = db.createObjectStore('aiInsights', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('tipo', 'tipo');
      break;
    case 'roadmaps':
      store = db.createObjectStore('roadmaps', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId', { unique: true });
      store.createIndex('dataCriacao', 'dataCriacao');
      break;
    case 'notes':
      store = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('createdAt', 'createdAt');
      break;
    case 'researchLinks':
      store = db.createObjectStore('researchLinks', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('categoria', 'categoria');
      break;
    case 'decisions':
      store = db.createObjectStore('decisions', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('data', 'data');
      break;
    case 'promptVault':
      store = db.createObjectStore('promptVault', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projetoId', 'projetoId');
      store.createIndex('iaModeloId', 'iaModeloId');
      store.createIndex('categoria', 'categoria');
      break;
    case 'activities':
      store = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
      store.createIndex('projectId', 'projectId');
      store.createIndex('tipo', 'tipo');
      store.createIndex('timestamp', 'timestamp');
      break;
    case 'neural_nodes':
      store = db.createObjectStore('neural_nodes', { keyPath: 'id', autoIncrement: true });
      break;
    default:
      store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
  }
  console.log(`[Storage] Store "${storeName}" criada/verificada`);
}

// Verifica stores ausentes e força upgrade dinâmico
async function verifyAndCreateMissingStores() {
  const missing = REQUIRED_STORES.filter(store => !db.objectStoreNames.contains(store));
  if (missing.length === 0) return;
  
  console.log('[Storage] Stores ausentes detectadas:', missing);
  const currentVersion = db.version;
  db.close();
  
  return new Promise((resolve, reject) => {
    const newVersion = currentVersion + 1;
    const request = indexedDB.open(DB_NAME, newVersion);
    request.onupgradeneeded = (event) => {
      const dbUp = event.target.result;
      for (const storeName of missing) {
        if (!dbUp.objectStoreNames.contains(storeName)) {
          criarStore(dbUp, storeName);
        }
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('[Storage] Stores ausentes criadas. Nova versão:', db.version);
      resolve();
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

// Helper para obter o banco
async function getDB() {
  if (!db) await initIndexedDB();
  return db;
}

// ==================== CRUD PROJETOS ====================
export async function saveProject(project) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['projetos'], 'readwrite');
    const store = transaction.objectStore('projetos');
    const request = store.put(project);
    request.onsuccess = () => {
      window.dispatchEvent(new Event('projectsChanged'));
      resolve(project);
    };
    request.onerror = (e) => reject(e);
  });
}

export async function getProject(id) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['projetos'], 'readonly');
    const store = transaction.objectStore('projetos');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e) => reject(e);
  });
}

export async function getAllProjects(filters = {}, sortBy = 'ultimaAtualizacao', sortOrder = 'desc') {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['projetos'], 'readonly');
    const store = transaction.objectStore('projetos');
    const request = store.getAll();
    request.onsuccess = () => {
      let projects = request.result || [];
      if (filters.status && filters.status !== 'todos') projects = projects.filter(p => p.status === filters.status);
      if (filters.prioridade && filters.prioridade !== 'todas') projects = projects.filter(p => p.prioridade === filters.prioridade);
      if (filters.arquivado !== undefined) projects = projects.filter(p => p.arquivado === filters.arquivado);
      if (filters.favorito === true) projects = projects.filter(p => p.favorito === true);
      if (filters.busca && filters.busca.trim() !== '') {
        const term = filters.busca.toLowerCase();
        projects = projects.filter(p => p.nome.toLowerCase().includes(term) || (p.descricaoCurta && p.descricaoCurta.toLowerCase().includes(term)));
      }
      projects.sort((a, b) => {
        let valA = a[sortBy], valB = b[sortBy];
        if (sortBy === 'progresso') { valA = Number(valA); valB = Number(valB); }
        if (sortBy === 'prioridade') {
          const priorMap = { 'baixa': 1, 'media': 2, 'alta': 3, 'critica': 4 };
          valA = priorMap[a.prioridade] || 0; valB = priorMap[b.prioridade] || 0;
        }
        if (sortBy === 'dataInicio' || sortBy === 'ultimaAtualizacao') {
          valA = new Date(valA).getTime(); valB = new Date(valB).getTime();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      resolve(projects);
    };
    request.onerror = (e) => reject(e);
  });
}

export async function deleteProject(id) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['projetos'], 'readwrite');
    const store = transaction.objectStore('projetos');
    const request = store.delete(id);
    request.onsuccess = () => {
      window.dispatchEvent(new Event('projectsChanged'));
      resolve(true);
    };
    request.onerror = (e) => reject(e);
  });
}

export async function archiveProject(id, archived = true) {
  const project = await getProject(id);
  if (!project) throw new Error('Projeto não encontrado');
  project.arquivado = archived;
  project.ultimaAtualizacao = new Date().toISOString();
  return await saveProject(project);
}

export async function toggleFavorite(id) {
  const project = await getProject(id);
  if (!project) throw new Error('Projeto não encontrado');
  project.favorito = !project.favorito;
  project.ultimaAtualizacao = new Date().toISOString();
  return await saveProject(project);
}

export async function duplicateProject(id) {
  const original = await getProject(id);
  if (!original) throw new Error('Projeto não encontrado');
  const { id: _, ...cloneData } = original;
  const newProject = {
    ...cloneData,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36),
    nome: original.nome + ' (cópia)',
    createdAt: new Date().toISOString(),
    ultimaAtualizacao: new Date().toISOString(),
    progresso: 0,
    status: 'planejamento',
    arquivado: false,
    favorito: false
  };
  return await saveProject(newProject);
}

// ==================== CONFIGURAÇÕES ====================
export async function setConfig(key, value) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['configuracoes'], 'readwrite');
    const store = transaction.objectStore('configuracoes');
    const request = store.put({ chave: key, valor: value });
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

export async function getConfig(key) {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['configuracoes'], 'readonly');
    const store = transaction.objectStore('configuracoes');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ? request.result.valor : null);
    request.onerror = (e) => reject(e);
  });
}

// ==================== ROADMAP (com fallback se store não existir) ====================
export async function saveRoadmap(roadmap) {
  const database = await getDB();
  // Verifica se a store existe (se não, força criação)
  if (!database.objectStoreNames.contains('roadmaps')) {
    await ensureStore('roadmaps');
    return saveRoadmap(roadmap);
  }
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['roadmaps'], 'readwrite');
    const store = transaction.objectStore('roadmaps');
    const request = store.put(roadmap);
    request.onsuccess = () => {
      window.dispatchEvent(new Event('roadmapChanged'));
      resolve(roadmap);
    };
    request.onerror = (e) => reject(e);
  });
}

export async function getRoadmap(projetoId) {
  const database = await getDB();
  if (!database.objectStoreNames.contains('roadmaps')) {
    await ensureStore('roadmaps');
    return getRoadmap(projetoId);
  }
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['roadmaps'], 'readonly');
    const store = transaction.objectStore('roadmaps');
    const index = store.index('projetoId');
    const request = index.get(projetoId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e) => reject(e);
  });
}

export async function deleteRoadmap(projetoId) {
  const roadmap = await getRoadmap(projetoId);
  if (!roadmap) return;
  const database = await getDB();
  if (!database.objectStoreNames.contains('roadmaps')) {
    await ensureStore('roadmaps');
    return deleteRoadmap(projetoId);
  }
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['roadmaps'], 'readwrite');
    const store = transaction.objectStore('roadmaps');
    const request = store.delete(roadmap.id);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e);
  });
}

// Função auxiliar para garantir que uma store exista (cria dinamicamente)
async function ensureStore(storeName) {
  const currentDB = await getDB();
  const currentVersion = currentDB.version;
  currentDB.close();
  return new Promise((resolve, reject) => {
    const newVersion = currentVersion + 1;
    const request = indexedDB.open(DB_NAME, newVersion);
    request.onupgradeneeded = (event) => {
      const dbUp = event.target.result;
      if (!dbUp.objectStoreNames.contains(storeName)) {
        criarStore(dbUp, storeName);
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log(`[Storage] Store "${storeName}" criada via ensureStore`);
      resolve();
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

// ==================== LOCALSTORAGE ====================
export const localStorageAPI = {
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  get: (key, defaultValue = null) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  },
  remove: (key) => localStorage.removeItem(key)
};

export async function initStorage() {
  await initIndexedDB();
  const tema = await getConfig('tema');
  if (!tema) await setConfig('tema', 'neon-dark');
  console.log('[Storage] Pronto (versão 7 com criação dinâmica)');
}