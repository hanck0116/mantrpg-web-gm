import { CORE_RULES } from '../rules/coreRules';
import type { GameState, Position } from '../state/gameState';

export type MapCell = {
  readonly x: number;
  readonly y: number;
  readonly occupant: 'player' | 'enemy' | null;
  readonly terrain: 'plain';
  readonly effect: 'none' | 'attack-preview' | 'fire' | 'mark' | 'magic';
};

function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function createFixedMap(state: GameState): MapCell[] {
  return Array.from({ length: CORE_RULES.mapSize * CORE_RULES.mapSize }, (_, index) => {
    const x = index % CORE_RULES.mapSize;
    const y = Math.floor(index / CORE_RULES.mapSize);
    const position = { x, y };
    const occupant = samePosition(position, state.player.position)
      ? 'player'
      : samePosition(position, state.enemy.position)
        ? 'enemy'
        : null;

    return {
      x,
      y,
      occupant,
      terrain: 'plain',
      effect: 'none',
    };
  });
}
