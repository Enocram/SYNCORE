// ============================================================
// NAV ICON BUTTON – Botão de navegação com imagem e estados
// ============================================================

import { loadIcon } from '../utils/icon-loader.js';

export class NavIconButton {
  constructor({ id, name, label, iconName, onClick }) {
    this.id = id;
    this.name = name;
    this.label = label;
    this.iconName = iconName;
    this.onClick = onClick;
    this.element = null;
    this.imgElement = null;
    this.isActive = false;
    this.init();
  }
  
  async init() {
    this.element = document.createElement('button');
    this.element.className = 'nav-icon-btn';
    this.element.setAttribute('data-nav', this.name);
    this.element.setAttribute('aria-label', this.label);
    this.element.setAttribute('role', 'tab');
    this.element.setAttribute('tabindex', '0');
    
    // Estrutura interna
    this.imgElement = document.createElement('img');
    this.imgElement.alt = this.label;
    this.imgElement.className = 'nav-icon-img';
    
    const spanLabel = document.createElement('span');
    spanLabel.className = 'nav-icon-label';
    spanLabel.textContent = this.label;  
    this.element.appendChild(this.imgElement);
    this.element.appendChild(spanLabel);
    
    // Carrega imagem
    const iconUrl = await loadIcon(this.iconName);
    if (iconUrl.startsWith('blob:')) {
      this.imgElement.src = iconUrl;
    } else {
      // Fallback (emoji) – mostrar texto
      this.imgElement.style.display = 'none';
      spanLabel.style.fontSize = '1.2rem';
      spanLabel.textContent = iconUrl + ' ' + this.label;
    }
    
    // Evento de clique
    this.element.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.onClick) this.onClick(this.name);
    });
    
    // Suporte a teclado
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onClick) this.onClick(this.name);
      }
    });
  }
  
  setActive(active) {
    this.isActive = active;
    if (active) {
      this.element.classList.add('active');
      this.element.setAttribute('aria-selected', 'true');
    } else {
      this.element.classList.remove('active');
      this.element.setAttribute('aria-selected', 'false');
    }
  }
  
  getElement() {
    return this.element;
  }
}