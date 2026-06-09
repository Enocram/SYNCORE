// ============================================================
// APP ENTRYPOINT - SYNCORE
// Inicialização com BOOT EXPERIENCE PREMIUM
// ============================================================

import { initStorage } from './storage.js';
import { initRouter } from './modules/router.js';
import { ux } from './ux-engine.js';

// Serviços de nuvem
import { auth } from './services/auth.js';
import { syncFull, startAutoSync, stopAutoSync } from './services/sync-engine.js';
import { profile } from './services/profile-service.js';

// Boot Engine (nova experiência de inicialização)
import { runBootSequence } from './boot/boot-engine.js';

// ==================== FUNÇÕES BASE (mantidas) ====================
function startClock() {
  const clockElement = document.getElementById('clock');
  if (!clockElement) return;
  function update() {
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString('pt-BR');
  }
  update();
  setInterval(update, 1000);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('[SW] Registrado:', reg.scope))
        .catch(err => console.error('[SW] Falha:', err));
    });
  }
}

function detectInstallPrompt() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Pronto para instalação');
  });
}

// ==================== INICIALIZAÇÃO REAL DO APP (após boot) ====================
async function realInitApp() {
  console.log('[SYNCORE] Inicializando sistema principal...');
  
  // 1. Inicializa IndexedDB (local)
  await initStorage();
  
  // 2. Inicializa o roteador
  initRouter();
  startClock();
  //registerServiceWorker();
  detectInstallPrompt();
  
  // 3. Verifica autenticação e configura sincronização (se logado)
  const user = await auth.getCurrentUser();
  
  if (user) {
    console.log('[SYNCORE] Usuário autenticado:', user.email);
    await auth.upsertProfile(user);
    const autoSync = await profile.getSetting('auto_sync', true);
    if (autoSync) startAutoSync();
    await syncFull(); // primeira sincronização
    ux.notify('Sincronização com a nuvem ativada.', 'success', 1000);
  } else {
    console.log('[SYNCORE] Usuário não autenticado. Tela de login será exibida.');
    if (window.location.hash !== '#login') {
      window.location.hash = 'login';
    }
  }
  
  // 4. Monitora mudanças de autenticação (logout em outra aba)
  window.addEventListener('authChange', async (e) => {
    if (e.detail.user) {
      await syncFull();
      startAutoSync();
      ux.notify('Sincronização automática ativada.', 'info', 1000);
    } else {
      stopAutoSync();
      window.location.hash = 'login';
    }
  });

  ux.notify('SYNCORE pronto. Bem-vindo.', 'success', 1000);
  
  // 🔥 ADICIONE ESTA LINHA PARA TORNAR O APP VISÍVEL
  document.body.classList.add('boot-complete');
  console.log('[SYNCORE] Classe boot-complete adicionada ao body');
  }

// ==================== PONTO DE ENTRADA COM BOOT SEQUENCE ====================
async function initApp() {
  console.log('[SYNCORE] Iniciando boot sequence...');
  // Executa a experiência de inicialização (splash, mensagens, barra de progresso)
  // Depois que o boot terminar, chama a inicialização real do app
  await runBootSequence(realInitApp);
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp);