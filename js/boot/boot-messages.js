// ============================================================
// BOOT MESSAGES – Frases dinâmicas e taglines
// ============================================================

// Taglines disponíveis (seleciona uma aleatória a cada boot)
export const TAGLINES = [
  "The Synced Core of Your Projects",
  "Where Projects, Knowledge and AI Connect",
  "Your Neural Workspace"
];

// Mensagens exibidas durante o boot
export const BOOT_MESSAGES = [
  "Inicializando Neural Network...",
  "Loading Project Intelligence...",
  "Syncing Knowledge Graph...",
  "Activating AI Hub...",
  "Building Neural Connections...",
  "Loading Roadmap Engine...",
  "Loading Knowledge Center...",
  "Connecting Cloud Sync...",
  "Optimizing Neural Workspace...",
  "System Ready."
];

// Retorna uma mensagem aleatória evitando a última repetida
export function getRandomMessage(lastMessage) {
  const available = BOOT_MESSAGES.filter(m => m !== lastMessage);
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

// Retorna uma tagline aleatória
export function getRandomTagline() {
  const randomIndex = Math.floor(Math.random() * TAGLINES.length);
  return TAGLINES[randomIndex];
}