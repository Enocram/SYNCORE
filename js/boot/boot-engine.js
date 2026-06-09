// ============================================================
// BOOT ENGINE – Gerencia a experiência de inicialização
// ============================================================

import { getRandomTagline, getRandomMessage, BOOT_MESSAGES } from './boot-messages.js';
import { initProgressBar, startProgressAnimation, stopProgressAnimation } from './boot-progress.js';
import { initParticles, switchMessage } from './boot-animation.js';

let bootComplete = false;
let splashElement = null;
let messageElement = null;
let taglineElement = null;

// Número aleatório de mensagens entre 3 e 6
function getRandomMessageCount() {
  return Math.floor(Math.random() * (3 - 2 + 1)) + 2;
}

// Executa a sequência de boot
export async function runBootSequence(onComplete) {
  if (bootComplete) return;
  
  splashElement = document.getElementById('splashScreen');
  messageElement = document.getElementById('bootMessage');
  taglineElement = document.getElementById('bootTagline');
  
  if (!splashElement) return;
  
  // 1. Exibe splash (já visível via CSS)
  splashElement.style.opacity = '1';
  
  // 2. Escolhe tagline aleatória e exibe
  const tagline = getRandomTagline();
  if (taglineElement) taglineElement.textContent = tagline;
  
  // 3. Inicializa partículas de fundo
  initParticles();
  
  // 4. Prepara barra de progresso
  initProgressBar();
  
  // 5. Sequência de mensagens rotativas
  const messageCount = getRandomMessageCount();
  let lastMessage = '';
  let currentIndex = 0;
  
  // Função para exibir a próxima mensagem
  const showNextMessage = async () => {
    if (currentIndex >= messageCount) {
      // Todas as mensagens exibidas – finaliza boot
      await finishBoot(onComplete);
      return;
    }
    
    let nextMessage = getRandomMessage(lastMessage);
    // Evita repetir a mesma mensagem consecutivamente
    while (nextMessage === lastMessage && BOOT_MESSAGES.length > 1) {
      nextMessage = getRandomMessage(lastMessage);
    }
    lastMessage = nextMessage;
    
    await switchMessage(messageElement, nextMessage, 200);
    currentIndex++;
    
    // Próxima mensagem após um intervalo (1 segundo)
    setTimeout(() => {
      showNextMessage();
    }, 400);
  };
  
  // Inicia a barra de progresso (duração total estimada: mensagens * 1.2s + final)
  const totalDuration = (messageCount * 600) + 200;
  startProgressAnimation(totalDuration, async () => {
    // Se a barra chegou a 100% antes das mensagens terminarem, espera
    // Mas o finishBoot será chamado por showNextMessage após o último.
  });
  
  // Inicia primeira mensagem
  await showNextMessage();
}

async function finishBoot(onComplete) {
  if (bootComplete) return;
  bootComplete = true;
  stopProgressAnimation();
  
  // Aguarda um instante para exibir "System Ready."
  const messageElement = document.getElementById('bootMessage');
  if (messageElement && messageElement.textContent !== 'System Ready.') {
    await switchMessage(messageElement, 'System Ready.', 200);
  }
  
  // Pequena pausa para percepção do "Ready"
  await new Promise(r => setTimeout(r, 300));
  
  // Fade out da splash screen
  if (splashElement) {
    splashElement.style.transition = 'opacity 0.5s ease';
    splashElement.style.opacity = '0';
    await new Promise(r => setTimeout(r, 300));
    splashElement.style.display = 'none';
  }
  
  // Chama callback para iniciar o app principal
  if (onComplete) onComplete();
}