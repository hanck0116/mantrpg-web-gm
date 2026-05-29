import type { PrimaryStats } from '../state/gameState';
import { calcDerivedStatsFromPrimary } from './derivedStats';

export const MAP_SIZE = 7;

export const CORE_RULES = {
  mapSize: MAP_SIZE,
  enemyCount: 1,
  fixedMap: true,
  localRulesOnly: true,
  aiCanJudgeRules: false,
  aiCanRollDice: false,
  aiCanGenerateRewards: false,
} as const;

export const INITIAL_STATS: PrimaryStats = {
  strength: 9,
  agility: 9,
  stamina: 9,
  intelligence: 9,
  wisdom: 9,
  appearance: 9,
};

export function maxHp(stats: PrimaryStats): number {
  return calcDerivedStatsFromPrimary(1, stats).maxHP;
}

export function maxMp(stats: PrimaryStats): number {
  return calcDerivedStatsFromPrimary(1, stats).maxMP;
}
