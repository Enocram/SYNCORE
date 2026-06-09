// ============================================================
// UX ENGINE – Gerenciador de temas, notificações, microinterações
// Versão sem overlocks e com feedback visual aprimorado
// ============================================================

class UXEngine {
  constructor() {
    this.currentTheme = localStorage.getItem('pcc-theme') || 'default';
    this.init();
  }
  
  init() {
    this.applyTheme(this.currentTheme);
    this.setupGlobalEvents();
    this.injectUXGlobals();
  }
  
  applyTheme(themeName) {
    const body = document.body;
    // Remove todas as classes de tema existentes
    body.classList.remove('theme-jarvis', 'theme-transformers', 'theme-cyber-blue', 'theme-matrix');
    if (themeName !== 'default' && themeName !== 'none') {
      body.classList.add(`theme-${themeName}`);
    }
    localStorage.setItem('pcc-theme', themeName);
    this.currentTheme = themeName;
    console.log(`[UX] Theme applied: ${themeName}`);
  }
  
  setupGlobalEvents() {
    // Feedback tátil visual (clique)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .clickable, .nav-btn');
      if (btn && !btn.classList.contains('no-feedback')) {
        btn.style.transform = 'scale(0.97)';
        setTimeout(() => { btn.style.transform = ''; }, 120);
      }
    });
    
    // Detecta prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.body.classList.add('reduce-motion');
    }
  }
  
  injectUXGlobals() {
    // Container de notificações (apenas canto inferior direito)
    if (!document.getElementById('ux-notification-container')) {
      const container = document.createElement('div');
      container.id = 'ux-notification-container';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '12px';
      container.style.pointerEvents = 'none'; // não bloqueia cliques
      document.body.appendChild(container);
    }
  }
  
  notify(message, type = 'info', duration = 3000) {
    const container = document.getElementById('ux-notification-container');
    if (!container) return;
    const notification = document.createElement('div');
    notification.className = `ux-notification ux-notification-${type}`;
    notification.style.pointerEvents = 'none';
    let borderColor = 'var(--color-accent-cyan)';
    if (type === 'success') borderColor = 'var(--color-status-success)';
    if (type === 'error') borderColor = 'var(--color-status-error)';
    if (type === 'warning') borderColor = 'var(--color-status-warning)';
    notification.innerHTML = `
      <div style="background: var(--color-bg-card); backdrop-filter: blur(12px); border-left: 4px solid ${borderColor}; border-radius: 8px; padding: 12px 16px; min-width: 240px; box-shadow: var(--shadow-lg);">
        <span style="color: var(--color-text-primary);">${message}</span>
      </div>
    `;
    container.appendChild(notification);
    // Animação de entrada
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    setTimeout(() => {
      notification.style.transition = 'all 0.2s ease';
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  showLoading(targetElement, text = 'Carregando...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.borderRadius = 'inherit';
    overlay.innerHTML = `<div class="spinner"></div><div style="margin-top: 12px;">${text}</div>`;
    targetElement.style.position = 'relative';
    targetElement.appendChild(overlay);
    return overlay;
  }
  
  hideLoading(overlay) {
    if (overlay && overlay.remove) overlay.remove();
  }
  
  setEmptyState(container, message, icon = '📭') {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: var(--space-8); color: var(--color-text-tertiary);">
        <div style="font-size: 48px; margin-bottom: var(--space-4);">${icon}</div>
        <p>${message}</p>
      </div>
    `;
  }
}

// Singleton
export const ux = new UXEngine();