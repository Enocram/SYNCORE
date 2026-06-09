// ============================================================
// ROUTER - Gerencia navegação por hash
// ============================================================

import * as dashboard from './pages/dashboard.js';
import * as projetos from './pages/projetos.js';
import * as mapaNeural from './pages/mapa-neural.js';
import * as configuracoes from './pages/configuracoes.js';
import * as aiHub from './pages/ai-hub.js';
import * as roadmap from './pages/roadmap.js';
import * as login from './pages/login.js';
import * as profile from './pages/profile.js';
import * as syncStatus from './pages/sync-status.js';

const routes = {
  'dashboard': dashboard,
  'projetos': projetos,
  'mapa-neural': mapaNeural,
  'configuracoes': configuracoes,
  'ai-hub': aiHub,
  'roadmap': roadmap,
  'login': login,
  'profile': profile,
  'sync-status': syncStatus
};

let currentPage = null;

export async function navigateTo(pageId) {
  console.log('[Router] Navegando para:', pageId);
  if (!routes[pageId]) {
    console.warn('[Router] Rota não encontrada:', pageId);
    pageId = 'dashboard';
  }
  const pageModule = routes[pageId];
  const mainContainer = document.getElementById('main-content');
  if (!mainContainer) {
    console.error('[Router] main-content não encontrado');
    return;
  }
  
  try {
    const html = await pageModule.render();
    if (!html) throw new Error('render() retornou vazio');
    mainContainer.innerHTML = html;
    console.log('[Router] HTML injetado com sucesso');
  } catch (err) {
    console.error('[Router] Erro ao renderizar página:', err);
    mainContainer.innerHTML = `<div class="error">Erro ao carregar página: ${err.message}</div>`;
    return;
  }
  
  if (pageModule.afterRender && typeof pageModule.afterRender === 'function') {
    await pageModule.afterRender();
  }
  
  currentPage = pageId;
  
  // Atualiza classe ativa nos botões
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const navValue = btn.getAttribute('data-nav');
    if (navValue === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  const pageNames = {
    login: 'Login | SYNCORE',
    profile: 'Perfil | SYNCORE',
    'sync-status': 'Status | SYNCORE',
    dashboard: 'Dashboard | SYNCORE',
    projetos: 'Projetos | SYNCORE',
    'mapa-neural': 'Mapa Neural | SYNCORE',
    configuracoes: 'Configurações | SYNCORE',
    'ai-hub': 'AI Hub | SYNCORE',
    roadmap: 'Roadmap | SYNCORE'
  };
  document.title = pageNames[pageId] || 'SYNCORE';
}

export function initRouter() {
  const hash = window.location.hash.substring(1) || 'dashboard';
  navigateTo(hash);
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.substring(1) || 'dashboard';
    navigateTo(newHash);
  });
}

export function getCurrentPage() {
  return currentPage;
}