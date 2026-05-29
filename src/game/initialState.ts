import { INITIAL_STATS } from '../rules/coreRules';
import { calcDerivedStatsFromPrimary } from '../rules/derivedStats';
import type { Combatant, GameState } from '../state/gameState';

function createCombatant(id: Combatant['id'], name: string, level: number, position: Combatant['position']): Combatant {
  const derivedStats = calcDerivedStatsFromPrimary(level, INITIAL_STATS);
  return {
    id,
    name,
    level,
    hp: derivedStats.maxHP,
    maxHP: derivedStats.maxHP,
    mp: derivedStats.maxMP,
    maxMP: derivedStats.maxMP,
    primaryStats: INITIAL_STATS,
    derivedStats,
    position,
    guarding: false,
  };
}

export const initialGameState: GameState = {
  version: 1,
  floor: 1,
  turn: 1,
  phase: 'player-turn',
  coins: 0,
  player: createCombatant('player', '플레이어', 1, { x: 3, y: 5 }),
  enemy: createCombatant('enemy', '적', 1, { x: 3, y: 1 }),
  log: [
    '실행 가능한 PWA 기본 골격을 시작했습니다.',
    '원본 zip 미확인 상태이므로 파생 수치와 판정식은 임시 구현입니다.',
    'AI 없이 로컬 TypeScript 규칙만으로 화면과 기본 판정을 처리합니다.',
  ],
};
