import type { Combatant } from '../state/gameState';

export type SpellPreview = {
  readonly available: boolean;
  readonly reason: string;
};

export function previewSpellUse(caster: Combatant): SpellPreview {
  if (caster.mp <= 0) {
    return { available: false, reason: 'MP가 부족합니다. 마법 규칙은 원본 zip 확인 후 확정합니다.' };
  }

  return { available: true, reason: '마법 상세 효과는 원본 zip 확인 후 구현 대기 중입니다.' };
}
