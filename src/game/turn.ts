import { resolveBasicAttack } from '../rules/combat';
import type { ActionType, GameState } from '../state/gameState';

function appendLog(state: GameState, entries: readonly string[]): readonly string[] {
  return [...state.log, ...entries].slice(-12);
}

export function applyPlayerAction(state: GameState, action: ActionType): GameState {
  if (action === 'basic-attack') {
    const result = resolveBasicAttack(state.player, state.enemy);
    return {
      ...state,
      enemy: result.target,
      lastAction: action,
      log: appendLog(state, result.log),
    };
  }

  if (action === 'defend') {
    return {
      ...state,
      player: { ...state.player, guarding: true },
      lastAction: action,
      log: appendLog(state, ['플레이어가 방어 자세를 취했습니다.']),
    };
  }

  if (action === 'end-turn') {
    return {
      ...state,
      turn: state.turn + 1,
      phase: 'player-turn',
      player: { ...state.player, guarding: false },
      lastAction: action,
      log: appendLog(state, ['턴을 마무리했습니다. 적 행동 규칙은 다음 단계에서 구현합니다.']),
    };
  }

  const labels: Record<Exclude<ActionType, 'basic-attack' | 'defend' | 'end-turn'>, string> = {
    move: '이동은 버튼 자리만 준비했습니다. 격자 이동 규칙은 다음 단계에서 구현합니다.',
    skill: '스킬은 원본 zip 확인 후 로컬 규칙으로 구현합니다.',
    magic: '마법은 원본 zip 확인 후 로컬 규칙으로 구현합니다.',
    item: '아이템은 원본 zip 확인 후 로컬 규칙으로 구현합니다.',
    wait: '플레이어가 대기했습니다.',
  };

  return {
    ...state,
    lastAction: action,
    log: appendLog(state, [labels[action]]),
  };
}
