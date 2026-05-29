import type { Combatant } from '../state/gameState';
import { rollStatCheck } from './dice';

export type BasicAttackResult = {
  readonly actor: Combatant;
  readonly target: Combatant;
  readonly roll: ReturnType<typeof rollStatCheck>;
  readonly damage: number;
  readonly hit: boolean;
  readonly log: readonly string[];
};

export function resolveBasicAttack(actor: Combatant, target: Combatant): BasicAttackResult {
  const roll = rollStatCheck(actor.primaryStats.strength, actor.derivedStats.basicAtk);
  const defenseLine = Math.max(4, Math.floor(target.primaryStats.agility / 2) + 4);
  const hit = roll.total >= defenseLine;
  const damage = hit ? Math.max(1, actor.derivedStats.basicAtk - (target.guarding ? 1 : 0)) : 0;
  const nextTarget = {
    ...target,
    hp: Math.max(0, target.hp - damage),
  };

  return {
    actor,
    target: nextTarget,
    roll,
    damage,
    hit,
    log: [
      `${actor.name} 기본 공격: 1d${roll.sides}+${roll.bonus} = ${roll.total}`,
      hit ? `${target.name}에게 ${damage} 피해를 입혔습니다.` : `${target.name} 공격에 실패했습니다.`,
    ],
  };
}
