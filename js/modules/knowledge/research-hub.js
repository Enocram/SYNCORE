// ============================================================
// RESEARCH HUB – Gerenciar links, artigos, vídeos
// ============================================================

import { save, getAll, remove } from '../../db/repository.js'; // se existir; senão, usar storage

export async function renderResearchHub(projectId) {
  const filters = projectId ? { projetoId: projectId } : {};
  const links = await getAll('researchLinks', filters);
  return `
    <div class="research-hub">
      <button id="addResearchBtn" class="neon-button small">+ Adicionar Link</button>
      <div class="research-grid">
        ${links.map(link => `
          <div class="research-card" data-id="${link.id}">
            <h3><a href="${link.url}" target="_blank">${escapeHtml(link.titulo)}</a></h3>
            <p>${escapeHtml(link.descricao || '')}</p>
            <span class="research-category">${link.categoria || 'geral'}</span>
            <button class="delete-research" data-id="${link.id}">🗑️</button>
          </div>
        `).join('') || '<div class="empty">Nenhum link salvo.</div>'}
      </div>
      <div id="researchForm" style="display:none;" class="glass-card">
        <h3>Novo Link</h3>
        <input type="text" id="resTitle" placeholder="Título" class="neon-input">
        <input type="url" id="resUrl" placeholder="URL" class="neon-input">
        <textarea id="resDesc" placeholder="Descrição" class="neon-input"></textarea>
        <select id="resCategory" class="neon-select">
          <option value="artigo">Artigo</option>
          <option value="video">Vídeo</option>
          <option value="doc">Documentação</option>
          <option value="ferramenta">Ferramenta</option>
        </select>
        <div class="form-actions">
          <button id="cancelResearchBtn" class="neon-button">Cancelar</button>
          <button id="saveResearchBtn" class="neon-button">Salvar</button>
        </div>
      </div>
    </div>
  `;
}

export function attachResearchEvents(projectId) {
  const addBtn = document.getElementById('addResearchBtn');
  const formDiv = document.getElementById('researchForm');
  if (addBtn) addBtn.onclick = () => formDiv.style.display = 'block';
  const cancel = document.getElementById('cancelResearchBtn');
  if (cancel) cancel.onclick = () => formDiv.style.display = 'none';
  const save = document.getElementById('saveResearchBtn');
  if (save) save.onclick = async () => {
    const newLink = {
      projetoId: projectId || null,
      titulo: document.getElementById('resTitle').value,
      url: document.getElementById('resUrl').value,
      descricao: document.getElementById('resDesc').value,
      categoria: document.getElementById('resCategory').value,
      createdAt: new Date().toISOString()
    };
    if (!newLink.titulo || !newLink.url) return alert('Preencha título e URL');
    await save('researchLinks', newLink);
    formDiv.style.display = 'none';
    // recarregar a aba (disparar evento)
    window.dispatchEvent(new CustomEvent('knowledgeReload', { detail: { tab: 'research', projectId } }));
  };
  document.querySelectorAll('.delete-research').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Excluir este link?')) await remove('researchLinks', id);
      window.dispatchEvent(new CustomEvent('knowledgeReload', { detail: { tab: 'research', projectId } }));
    };
  });
}