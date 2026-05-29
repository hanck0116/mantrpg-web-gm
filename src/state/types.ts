export type StatName = 'strength' | 'agility' | 'stamina' | 'intelligence' | 'wisdom' | 'appearance';

export type Position = {
  readonly x: number;
  readonly y: number;
};

export type Actor = {
  readonly id: 'player' | 'enemy';
  readonly name: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly mp: number;
  readonly maxMp: number;
  readonly position: Position;
};

export type PlayerStats = Record<StatName, number>;

export type GamePhase = 'battle' | 'imaginary-world' | 'setup';

export type GameState = {
  readonly floor: number;
  readonly turn: number;
  readonly phase: GamePhase;
  readonly coins: number;
  readonly stats: PlayerStats;
  readonly player: Actor;
  readonly enemy: Actor;
  readonly log: readonly string[];
};
