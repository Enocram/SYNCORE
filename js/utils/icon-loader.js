// ============================================================
// ICON LOADER – Carregamento lazy e fallback para ícones
// ============================================================

const iconCache = new Map();

export async function loadIcon(name, retries = 2) {
  const iconPath = `assets/icons/${name}.webp`;
  if (iconCache.has(iconPath)) return iconCache.get(iconPath);
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(iconPath);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        iconCache.set(iconPath, url);
        return url;
      }
    } catch (e) {
      // continua tentando
    }
    await new Promise(r => setTimeout(r, 100 * (i + 1)));
  }
  // Fallback: emoji
  const fallback = getFallbackEmoji(name);
  iconCache.set(iconPath, fallback);
  return fallback;
}

function getFallbackEmoji(name) {
  const map = {
    'dashboard': '📊',
    'projects': '📁',
    'neural-map': '🧠',
    'ai-hub': '🤖',
    'roadmap': '🗺️',
    'profile': '👤',
    'settings': '⚙️'
  };
  return map[name] || '🔹';
}

export function clearIconCache() {
  for (const url of iconCache.values()) {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  }
  iconCache.clear();
}