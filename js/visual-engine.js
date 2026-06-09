// ============================================================
// VISUAL ENGINE – Apenas utilitários de renderização (sem overlays)
// ============================================================

export class VisualEngine {
  constructor() {
    // Não faz nada automaticamente
  }
  
  // Aplica animação de fade em um elemento
  fadeIn(element, duration = 200) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    setTimeout(() => { element.style.opacity = '1'; }, 10);
  }
  
  // Renderiza um card inteligente (HTML)
  renderSmartCard(title, content, icon, accentColor = 'var(--color-accent-blue)') {
    return `
      <div class="smart-card" style="background: linear-gradient(135deg, var(--color-bg-card) 0%, rgba(0,0,0,0.3) 100%); border-radius: var(--radius-lg); padding: var(--space-5); border-left: 4px solid ${accentColor};">
        <div class="flex" style="gap: var(--space-3); align-items: center; margin-bottom: var(--space-3);">
          <span style="font-size: 28px;">${icon}</span>
          <h3 style="margin: 0;">${title}</h3>
        </div>
        <div>${content}</div>
      </div>
    `;
  }
  
  // Força reflow (útil para animações)
  forceReflow(element) {
    void element.offsetHeight;
  }
}

export const visual = new VisualEngine();