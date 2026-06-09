// ============================================================
// ICON NAVIGATION – Gera o menu completo com imagens
// ============================================================

import { NavIconButton } from './nav-icon-button.js';

const MENU_ITEMS = [
  { name: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { name: 'projetos', label: 'Projetos', icon: 'projects' },
  { name: 'mapa-neural', label: 'Mapa Neural', icon: 'neural-map' },
  { name: 'ai-hub', label: 'AI Hub', icon: 'ai-hub' },
  { name: 'roadmap', label: 'Roadmap', icon: 'roadmap' },
  { name: 'profile', label: 'Perfil', icon: 'profile' },
  { name: 'configuracoes', label: 'Configurações', icon: 'settings' }
];

let buttons = [];
let currentActive = 'dashboard';

export async function initIconNavigation(containerId, onNavigate) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('[IconNav] Container não encontrado:', containerId);
    return;
  }
  
  container.innerHTML = ''; // limpa conteúdo
  buttons = [];
  
  for (const item of MENU_ITEMS) {
    const btn = new NavIconButton({
      id: 'nav-' + item.name,
      name: item.name,
      label: item.label,
      iconName: item.icon,
      onClick: function(navName) {
        setActiveButton(navName);
        if (onNavigate) onNavigate(navName);
      }
    });
    const btnElement = await btn.getElement();
    container.appendChild(btnElement);
    buttons.push(btn);
  }
  
  // Estado inicial baseado na URL hash
  var hash = window.location.hash.substring(1) || 'dashboard';
  setActiveButton(hash);
}

export function setActiveButton(buttonName) {
  if (currentActive === buttonName) return;
  var activeBtn = buttons.find(function(b) { return b.name === buttonName; });
  if (activeBtn) {
    buttons.forEach(function(b) { b.setActive(false); });
    activeBtn.setActive(true);
    currentActive = buttonName;
  }
}

export function getCurrentActive() {
  return currentActive;
}