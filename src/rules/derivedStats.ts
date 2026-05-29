import type { Combatant, DerivedStats, GameState, PrimaryStats } from '../state/gameState';

export function calcDerivedStats(input: Pick<Combatant, 'level' | 'primaryStats'> | GameState): DerivedStats {
  const level = 'player' in input ? input.player.level : input.level;
  const stats = 'player' in input ? input.player.primaryStats : input.primaryStats;

  return calcDerivedStatsFromPrimary(level, stats);
}

export function calcDerivedStatsFromPrimary(level: number, stats: PrimaryStats): DerivedStats {
  return {
    maxHP: stats.stamina * 10,
    maxMP: level * 5 + stats.intelligence * 10,
    mpRegen: level + stats.wisdom * 2,
    basicAtk: Math.floor((stats.strength + stats.stamina) / 10) + 2,
  };
}
