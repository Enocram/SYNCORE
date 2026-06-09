// ============================================================
// PROJECT PREVIEW – Integração com a página de detalhes
// ============================================================

import { PreviewPanel } from './preview-panel.js';

let currentPreview = null;

export function renderProjectPreview(containerId, projectUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Destrói preview anterior se existir
  if (currentPreview) {
    currentPreview.destroy();
    currentPreview = null;
  }

  currentPreview = new PreviewPanel(containerId, projectUrl);
}