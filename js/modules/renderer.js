// ============================================================
// RENDERER HELPER - Utilitários para renderização dinâmica
// Futuramente usado para componentes reutilizáveis
// ============================================================

// Cria um elemento com atributos e filhos (versão simplificada)
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  return element;
}

// Atualiza um container com novo HTML mantendo referências (evitar innerHTML bruto)
export function safeRender(container, htmlString) {
  if (!container) return;
  // Usa insertAdjacentHTML para preservar eventos externos? Melhor definir assim:
  container.innerHTML = htmlString;
}

// Gera um ID único simples
export function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}