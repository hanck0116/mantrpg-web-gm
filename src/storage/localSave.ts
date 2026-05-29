import type { GameState } from '../state/types';

const SAVE_KEY = 'manrpg-pwa-ai.save.v1';

export function saveGame(state: GameState): void {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as GameState;
}
