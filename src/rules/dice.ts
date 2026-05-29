export type DiceRoll = {
  readonly sides: number;
  readonly roll: number;
  readonly bonus: number;
  readonly total: number;
};

function rollDie(sides: number): number {
  const safeSides = Math.max(1, Math.floor(sides));
  return Math.floor(Math.random() * safeSides) + 1;
}

export function rollStatCheck(effectiveStat: number, bonus = 0): DiceRoll {
  const roll = rollDie(effectiveStat);
  return {
    sides: Math.max(1, Math.floor(effectiveStat)),
    roll,
    bonus,
    total: roll + bonus,
  };
}

export function rollAbsoluteCheck(effectiveStat: number, bonus = 0): DiceRoll {
  const roll = rollDie(20);
  return {
    sides: 20,
    roll,
    bonus,
    total: roll + Math.floor(effectiveStat) + bonus,
  };
}
