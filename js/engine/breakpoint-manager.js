// ============================================================
// BREAKPOINT MANAGER – Detecta tamanho de tela e orientação
// ============================================================

export const BREAKPOINTS = {
  XS: { min: 0, max: 479 },
  SM: { min: 480, max: 767 },
  MD: { min: 768, max: 1023 },
  LG: { min: 1024, max: 1439 },
  XL: { min: 1440, max: 1919 },
  XXL: { min: 1920, max: Infinity }
};

let currentBreakpoint = null;
let currentOrientation = window.screen.orientation?.type || 
                         (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');

function getBreakpoint(width) {
  for (const [name, range] of Object.entries(BREAKPOINTS)) {
    if (width >= range.min && width <= range.max) return name;
  }
  return 'LG';
}

function update() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation = (window.screen.orientation?.type || (height > width ? 'portrait' : 'landscape'));
  const breakpoint = getBreakpoint(width);
  
  const changed = (breakpoint !== currentBreakpoint) || (orientation !== currentOrientation);
  if (changed) {
    currentBreakpoint = breakpoint;
    currentOrientation = orientation;
    window.dispatchEvent(new CustomEvent('breakpointChange', {
      detail: { breakpoint, orientation, width, height }
    }));
  }
}

export function initBreakpointManager() {
  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
}

export function getCurrentBreakpoint() {
  return currentBreakpoint;
}

export function getCurrentOrientation() {
  return currentOrientation;
}