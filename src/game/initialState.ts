import { INITIAL_STATS, maxHp, maxMp } from '../rules/coreRules';
import type { GameState } from '../state/types';

const playerMaxHp = maxHp(INITIAL_STATS);
const playerMaxMp = maxMp(INITIAL_STATS);

export const initialGameState: GameState = {
  floor: 1,
  turn: 1,
  phase: 'battle',
  coins: 0,
  stats: INITIAL_STATS,
  player: {
    id: 'player',
    name: '플레이어',
    hp: playerMaxHp,
    maxHp: playerMaxHp,
    mp: playerMaxMp,
    maxMp: playerMaxMp,
    position: { x: 3, y: 5 },
  },
  enemy: {
    id: 'enemy',
    name: '적',
    hp: 12,
    maxHp: 12,
    mp: 0,
    maxMp: 0,
    position: { x: 3, y: 1 },
  },
  log: [
    'ManRPG v18 FINAL 원본 패키지 기준으로 구현을 시작합니다.',
    '현재 단계는 프로젝트 뼈대이며, 판정/보상/AI 호출은 다음 단계에서 구현합니다.',
    '규칙 판정, 주사위, HP/MP/보상 처리는 반드시 코드가 담당합니다.',
  ],
};
