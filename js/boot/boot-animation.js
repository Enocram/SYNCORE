// ============================================================
// BOOT ANIMATION – Transições suaves, partículas
// ============================================================

let particlesContainer = null;

export function initParticles() {
  particlesContainer = document.getElementById('bootParticles');
  if (!particlesContainer) return;
  
  // Cria partículas leves (apenas decorativas)
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('boot-particle');
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = 3 + Math.random() * 4 + 's';
    particlesContainer.appendChild(particle);
  }
}

// Aplica fade out em um elemento
export function fadeOut(element, duration = 300) {
  return new Promise(resolve => {
    if (!element) { resolve(); return; }
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

// Aplica fade in
export function fadeIn(element, duration = 300) {
  return new Promise(resolve => {
    if (!element) { resolve(); return; }
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '1';
    setTimeout(() => resolve(), duration);
  });
}

// Anima a troca de mensagem (fade out, mudança de texto, fade in)
export async function switchMessage(element, newText, duration = 300) {
  if (!element) return;
  await fadeOut(element, duration);
  element.textContent = newText;
  await fadeIn(element, duration);
}