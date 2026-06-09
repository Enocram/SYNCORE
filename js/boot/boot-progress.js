// ============================================================
// BOOT PROGRESS – Barra de progresso premium
// ============================================================

let progressElement = null;
let currentProgress = 0;
let animationFrame = null;

export function initProgressBar() {
  progressElement = document.getElementById('bootProgressFill');
  if (!progressElement) return;
  currentProgress = 0;
  updateProgressDisplay();
}

function updateProgressDisplay() {
  if (progressElement) {
    progressElement.style.width = currentProgress + '%';
  }
}

// Avança o progresso de forma contínua (simula carregamento)
export function startProgressAnimation(durationMs = 3000, onComplete) {
  const startTime = performance.now();
  const endTime = startTime + durationMs;
  
  function animate(now) {
    const elapsed = now - startTime;
    let percent = Math.min(100, Math.floor((elapsed / durationMs) * 100));
    if (percent !== currentProgress) {
      currentProgress = percent;
      updateProgressDisplay();
    }
    if (elapsed < durationMs) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Garante 100% ao final
      currentProgress = 100;
      updateProgressDisplay();
      if (onComplete) onComplete();
    }
  }
  
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animate);
}

export function stopProgressAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}