// ============================================================
// ADAPTIVE ENGINE – Ponto de entrada para toda a adaptação
// ============================================================

import { initBreakpointManager } from './breakpoint-manager.js';
import { initTouchEngine, enforceTouchTargets } from './touch-engine.js';
import { initLayoutManager } from './layout-manager.js';
import { initResponsiveSidebar } from './responsive-sidebar.js';
import { initResponsiveDashboard } from './responsive-dashboard.js';

// Importa o sistema de ícones personalizados
import { initIconNavigation, setActiveButton } from '../components/icon-navigation.js';

export function initAdaptiveEngine() {
  // 1. Inicializa detecção de breakpoints
  initBreakpointManager();

  // 2. Configura toque
  initTouchEngine();
  enforceTouchTargets();

  // 3. Inicializa gerenciadores de layout
  initLayoutManager();
  initResponsiveSidebar();
  initResponsiveDashboard();

  // 4. Inicializa o sistema de navegação com ícones personalizados
  //    O container é o <nav id="bottom-nav"> (que já existe)
  //    A callback altera o hash da URL
  initIconNavigation('bottom-nav', (navName) => {
    // Navegação baseada em hash (compatível com o router.js)
    window.location.hash = navName;
  });

  // 5. Sincroniza o estado ativo com mudanças na URL (por exemplo, ao usar o histórico)
  const handleHashChange = () => {
    const hash = window.location.hash.substring(1) || 'dashboard';
    setActiveButton(hash);
  };
  window.addEventListener('hashchange', handleHashChange);
  // Força a sincronização inicial (para a rota atual)
  handleHashChange();

  // 6. Aplica tipografia fluida (via CSS)
  document.body.classList.add('adaptive-ready');

  console.log('[Adaptive Engine] Sistema adaptativo ativado (com ícones personalizados)');
}