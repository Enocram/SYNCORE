// ============================================================
// LAYOUT MANAGER – Reorganiza componentes por dispositivo
// ============================================================

import { getCurrentBreakpoint, getCurrentOrientation } from './breakpoint-manager.js';

export function initLayoutManager() {
  applyLayout();
  window.addEventListener('breakpointChange', () => applyLayout());
}

function applyLayout() {
  const breakpoint = getCurrentBreakpoint();
  // O container de navegação é o <nav> com id="bottom-nav" (gerado dinamicamente)
  const sidebar = document.querySelector('.bottom-nav');
  const mainContent = document.getElementById('main-content');

  if (!sidebar) return;

  // Remove classes anteriores de estilo (mantém apenas as novas)
  sidebar.classList.remove('mobile-bottom-nav', 'tablet-sidebar', 'desktop-sidebar');

  if (breakpoint === 'XS' || breakpoint === 'SM') {
    // Mobile: bottom navigation fixa
    sidebar.classList.add('mobile-bottom-nav');
    sidebar.style.position = 'fixed';
    sidebar.style.bottom = '0';
    sidebar.style.top = 'auto';
    sidebar.style.width = '100%';
    sidebar.style.flexDirection = 'row';
    if (mainContent) {
      mainContent.style.marginBottom = '70px';  // espaço para o menu inferior
      mainContent.style.marginLeft = '0';
    }
  } 
  else if (breakpoint === 'MD' || breakpoint === 'LG') {
    // Tablet: sidebar vertical recolhível
    sidebar.classList.add('tablet-sidebar');
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0';
    sidebar.style.top = '0';
    sidebar.style.height = '100vh';
    sidebar.style.width = '80px';
    sidebar.style.flexDirection = 'column';
    if (mainContent) {
      mainContent.style.marginLeft = '90px';
      mainContent.style.marginBottom = '0';
    }
  } 
  else {
    // Desktop: sidebar expandida (tamanho suficiente para ícone + texto)
    sidebar.classList.add('desktop-sidebar');
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0';
    sidebar.style.top = '0';
    sidebar.style.height = '100vh';
    sidebar.style.width = '90px';
    sidebar.style.flexDirection = 'column';
    if (mainContent) {
      mainContent.style.marginLeft = '100px';
      mainContent.style.marginBottom = '0';
    }
  }

  // Garante que nenhum elemento tenha pointer-events: none acidentalmente
  sidebar.style.pointerEvents = 'auto';
  if (mainContent) mainContent.style.pointerEvents = 'auto';
}