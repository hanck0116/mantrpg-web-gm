export type Position = {
  readonly x: number;
  readonly y: number;
};

export type PrimaryStats = {
  readonly strength: number;
  readonly agility: number;
  readonly stamina: number;
  readonly intelligence: number;
  readonly wisdom: number;
  readonly appearance: number;
};

export type DerivedStats = {
  readonly maxHP: number;
  readonly maxMP: number;
  readonly mpRegen: number;
  readonly basicAtk: number;
};

export type Combatant = {
  readonly id: 'player' | 'enemy';
  readonly name: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHP: number;
  readonly mp: number;
  readonly maxMP: number;
  readonly primaryStats: PrimaryStats;
  readonly derivedStats: DerivedStats;
  readonly position: Position;
  readonly guarding: boolean;
};

export type BattlePhase = 'player-turn' | 'enemy-turn' | 'turn-ended';

export type ActionType = 'move' | 'basic-attack' | 'skill' | 'magic' | 'item' | 'defend' | 'wait' | 'end-turn';

export type GameState = {
  readonly version: 1;
  readonly floor: number;
  readonly turn: number;
  readonly phase: BattlePhase;
  readonly coins: number;
  readonly player: Combatant;
  readonly enemy: Combatant;
  readonly log: readonly string[];
  readonly lastAction?: ActionType;
};
