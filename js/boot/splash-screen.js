// ============================================================
// SPLASH SCREEN – Estrutura HTML (usada no index.html)
// ============================================================

// Esta função não é chamada diretamente; o HTML já está no index.html.
// Mantemos o arquivo para organização, mas o conteúdo real está no index.html.
export const splashHTML = `
  <div id="splashScreen" class="splash-container">
    <div class="splash-content">
      <div class="splash-logo">◎</div>
      <h1 class="splash-title">SYNCORE</h1>
      <div id="bootTagline" class="splash-tagline">The Synced Core of Your Projects</div>
      <div id="bootMessage" class="splash-message">Inicializando...</div>
      <div class="progress-bar-container">
        <div id="bootProgressFill" class="progress-bar-fill"></div>
      </div>
      <div class="splash-footer">
        <span>Neural Map</span> • <span>AI Hub</span> • <span>Knowledge Center</span> • <span>Roadmaps</span> • <span>Cloud Sync</span>
      </div>
    </div>
    <div id="bootParticles" class="particles-container"></div>
  </div>
`;