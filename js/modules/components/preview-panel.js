// ============================================================
// PREVIEW PANEL – Card de metadados (sem iframe, sem proxy)
// Exibe favicon via Google S2 (fallback local), domínio e botões
// ============================================================

import { isValidUrl, sanitizeUrl, detectPlatform, checkUrlStatus } from '../utils/url-validator.js';

export class PreviewPanel {
  constructor(containerId, projectUrl) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error('Container não encontrado');
    this.originalUrl = projectUrl;
    this.currentUrl = null;
    this.init();
  }

  async init() {
    if (!this.originalUrl || !isValidUrl(this.originalUrl)) {
      this.renderEmpty();
      return;
    }
    this.currentUrl = sanitizeUrl(this.originalUrl);
    this.renderCard();
    // Não tenta buscar metadados via proxy (evita CORS/erros)
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="preview-empty">
        <span class="preview-icon">🔗</span>
        <p>Nenhum link de projeto cadastrado.</p>
        <p class="preview-hint">Edite o projeto e adicione uma URL válida.</p>
      </div>
    `;
  }

  renderCard() {
    const platform = detectPlatform(this.currentUrl);
    const domain = this.getDomain(this.currentUrl);
    
    // Favicon usando Google S2 (fallback se falhar)
    const faviconUrl = '/assets/icons/favicon.ico';
    
    this.container.innerHTML = `
      <div class="preview-card">
        <div class="preview-header">
          <h3>🔍 Visualização do Projeto</h3>
          <span class="badge">${platform}</span>
        </div>
        <div class="preview-content">
          <div class="preview-icon">
            <img id="previewFavicon" 
                 src="${faviconUrl}" 
                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23888%22%3E%3Cpath d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z%22/%3E%3C/svg%3E';"
                 alt="Favicon">
          </div>
          <div class="preview-info">
            <h4 id="previewTitle">🔗 Projeto externo</h4>
            <p id="previewDomain" class="preview-domain">${domain}</p>
            <p id="previewDescription" class="preview-description">Clique em "Abrir em nova aba" para visualizar o site completo.</p>
          </div>
        </div>
        <div class="preview-actions">
          <a id="previewOpenBtn" href="${this.currentUrl}" target="_blank" class="btn btn-primary">🌐 Abrir em nova aba</a>
          <button id="previewCopyBtn" class="btn btn-secondary">📋 Copiar link</button>
          <button id="previewCheckStatusBtn" class="btn btn-outline">✓ Verificar status</button>
        </div>
        <div id="previewStatus" class="preview-status"></div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const copyBtn = document.getElementById('previewCopyBtn');
    const checkBtn = document.getElementById('previewCheckStatusBtn');
    const statusDiv = document.getElementById('previewStatus');

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(this.currentUrl);
          if (statusDiv) statusDiv.innerHTML = '<span class="status-ok">✅ Link copiado!</span>';
          setTimeout(() => { if (statusDiv) statusDiv.innerHTML = ''; }, 2000);
        } catch (err) {
          if (statusDiv) statusDiv.innerHTML = '<span class="status-error">❌ Erro ao copiar.</span>';
        }
      });
    }

    if (checkBtn) {
      checkBtn.addEventListener('click', async () => {
        if (statusDiv) statusDiv.innerHTML = '<span>🔄 Verificando...</span>';
        const result = await checkUrlStatus(this.currentUrl);
        if (statusDiv) {
          if (result.status === 'ok') {
            statusDiv.innerHTML = `<span class="status-ok">✅ Site acessível (${result.message})</span>`;
          } else {
            statusDiv.innerHTML = `<span class="status-error">⚠️ ${result.message}</span>`;
          }
        }
      });
    }
  }

  getDomain(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch (e) {
      return url;
    }
  }

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}