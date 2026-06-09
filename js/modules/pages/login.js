// ============================================================
// PAGE: LOGIN – Tela de escolha do provedor OAuth
// ============================================================

import { auth } from '../../services/auth.js';

export async function render() {
  return `
    <div class="login-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh;">
      <div class="glass-card" style="text-align: center; max-width: 400px; width: 100%;">
        <h1 class="page-title">⚡ SYNCORE</h1>
        <p>Entre com sua conta para acessar seus projetos em qualquer dispositivo.</p>
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
          <button id="googleLoginBtn" class="btn btn-primary" style="background: #db4437;">🔐 Google</button>
          <button id="githubLoginBtn" class="btn btn-primary" style="background: #333;">🐙 GitHub</button>
        </div>
      </div>
    </div>
  `;
}

export async function afterRender() {
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => auth.signInWithGoogle());
  document.getElementById('githubLoginBtn')?.addEventListener('click', () => auth.signInWithGitHub());
}