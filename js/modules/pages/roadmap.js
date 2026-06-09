// ============================================================
// PAGE: ROADMAP – Wrapper para o Roadmap Engine
// ============================================================

import { render as engineRender, afterRender as engineAfterRender } from '../roadmap/roadmap-engine.js';

export async function render() {
  return await engineRender();
}

export async function afterRender() {
  await engineAfterRender();
}