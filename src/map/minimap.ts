import { CORE_RULES } from '../rules/coreRules';
import type { GameState } from '../state/gameState';

export function createMinimapSummary(state: GameState): readonly string[] {
  return [
    `${CORE_RULES.mapSize}x${CORE_RULES.mapSize} 고정 격자`,
    `플레이어: (${state.player.position.x + 1}, ${state.player.position.y + 1})`,
    `적 1명: (${state.enemy.position.x + 1}, ${state.enemy.position.y + 1})`,
    '지형/불/낙인/마법 효과 표시는 다음 단계에서 확장',
  ];
}
