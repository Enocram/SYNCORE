// ============================================================
// RESPONSIVE SIDEBAR – Mobile/Tablet/Desktop adaptável (sem toggle)
// ============================================================

import { getCurrentBreakpoint } from './breakpoint-manager.js';

export function initResponsiveSidebar() {
  updateSidebar();
  window.addEventListener('breakpointChange', () => updateSidebar());
}

function updateSidebar() {
  const breakpoint = getCurrentBreakpoint();
  const sidebar = document.querySelector('.bottom-nav');
  const mainContent = document.getElementById('main-content');
  if (!sidebar) return;
  
  if (breakpoint === 'XS' || breakpoint === 'SM') {
    // Mobile: bottom navigation fixa
    sidebar.style.position = 'fixed';
    sidebar.style.bottom = '0';
    sidebar.style.top = 'auto';
    sidebar.style.width = '100%';
    sidebar.style.flexDirection = 'row';
    sidebar.style.justifyContent = 'space-around';
    if (mainContent) mainContent.style.marginBottom = '70px';
  } 
  else if (breakpoint === 'MD' || breakpoint === 'LG') {
    // Tablet: sidebar vertical compacta
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0';
    sidebar.style.top = '0';
    sidebar.style.height = '100vh';
    sidebar.style.width = '80px';
    sidebar.style.flexDirection = 'column';
    sidebar.style.justifyContent = 'flex-start';
    if (mainContent) mainContent.style.marginLeft = '90px';
  } 
  else {
    // Desktop: sidebar expandida
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0';
    sidebar.style.top = '0';
    sidebar.style.height = '100vh';
    sidebar.style.width = '90px';
    sidebar.style.flexDirection = 'column';
    sidebar.style.justifyContent = 'flex-start';
    if (mainContent) mainContent.style.marginLeft = '100px';
  }
  
  // Garante clicabilidade
  sidebar.style.pointerEvents = 'auto';
}