import type { GameState } from '../state/gameState';

const SAVE_KEY = 'manrpg-pwa-ai:save:v1';

export function saveGameStub(state: GameState): void {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGameStub(): GameState | null {
  const raw = window.localStorage.getItem(SAVE_KEY);
  return raw === null ? null : (JSON.parse(raw) as GameState);
}
