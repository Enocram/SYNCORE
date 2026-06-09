// ============================================================
// URL VALIDATOR – Validação, sanitização e detecção de plataforma
// ============================================================

/**
 * Valida se a string é uma URL http/https válida
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Sanitiza URL (remove espaços, garante protocolo)
 */
export function sanitizeUrl(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Detecta a plataforma de hospedagem a partir da URL
 */
export function detectPlatform(url) {
  if (!url) return 'desconhecido';
  if (url.includes('github.io')) return 'GitHub Pages';
  if (url.includes('vercel.app')) return 'Vercel';
  if (url.includes('netlify.app')) return 'Netlify';
  if (url.includes('herokuapp.com')) return 'Heroku';
  if (url.includes('render.com')) return 'Render';
  return 'domínio próprio';
}

/**
 * Verifica se o link está acessível (fetch simples, apenas para indicar status)
 * Retorna { status: 'ok' | 'error', message: string }
 */
export async function checkUrlStatus(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) return { status: 'ok', message: 'Acessível' };
    return { status: 'error', message: `HTTP ${response.status}` };
  } catch (err) {
    if (err.name === 'AbortError') return { status: 'error', message: 'Timeout' };
    return { status: 'error', message: 'Não acessível' };
  }
}