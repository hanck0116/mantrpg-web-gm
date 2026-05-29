import type { PlayerStats } from '../state/types';

export const MAP_SIZE = 7;

export const CORE_RULES = {
  sourcePackage: 'ManRPG_v18_FINAL_병합패키지.zip',
  enemyCount: 1,
  bossMonstersAllowed: false,
  mapSize: MAP_SIZE,
  mapIsFixed: true,
  aiCanJudgeRules: false,
  aiCanRollDice: false,
  aiCanGenerateRewards: false,
} as const;

export const INITIAL_STATS: PlayerStats = {
  strength: 9,
  agility: 9,
  stamina: 9,
  intelligence: 9,
  wisdom: 9,
  appearance: 9,
};

export function maxHp(stats: PlayerStats): number {
  return 20 + stats.stamina;
}

export function maxMp(stats: PlayerStats): number {
  return 4 + stats.intelligence;
}
