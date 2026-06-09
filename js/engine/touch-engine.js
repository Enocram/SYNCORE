// ============================================================
// TOUCH ENGINE – Gestos, touch targets, feedback visual
// ============================================================

let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export function initTouchEngine() {
  if (!isTouchDevice) return;
  
  // Adiciona classe para estilos específicos de toque
  document.body.classList.add('touch-device');
  
  // Feedback visual ao tocar
  document.addEventListener('touchstart', (e) => {
    const target = e.target.closest('button, .clickable, .nav-btn, a, input, textarea, select');
    if (target && !target.classList.contains('no-feedback')) {
      target.classList.add('touch-active');
      setTimeout(() => target.classList.remove('touch-active'), 150);
    }
  });
  
  // Previne zoom duplo para botões (opcional)
  document.querySelectorAll('button, .nav-btn, .touch-target').forEach(el => {
    el.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
  });
}

export function isTouch() {
  return isTouchDevice;
}

// Garante que elementos interativos tenham 48px de altura mínima
export function enforceTouchTargets() {
  const interactive = document.querySelectorAll('button, .nav-btn, .icon-btn, .clickable, a');
  interactive.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.height < 44) {
      el.style.minHeight = '44px';
      el.style.padding = '0.5rem 0.8rem';
    }
  });
}