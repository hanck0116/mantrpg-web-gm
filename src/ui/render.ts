import { applyPlayerAction } from '../game/turn';
import { createFixedMap } from '../map/fixedMap';
import { createMinimapSummary } from '../map/minimap';
import { CORE_RULES } from '../rules/coreRules';
import { loadGameStub, saveGameStub } from '../storage/save';
import type { ActionType, Combatant, GameState } from '../state/gameState';
import { renderAiSettingsPanel } from './aiSettings';

const actionLabels: ReadonlyArray<{ action: ActionType; label: string }> = [
  { action: 'move', label: '이동' },
  { action: 'basic-attack', label: '기본 공격' },
  { action: 'skill', label: '스킬' },
  { action: 'magic', label: '마법' },
  { action: 'item', label: '아이템' },
  { action: 'defend', label: '방어' },
  { action: 'wait', label: '대기' },
  { action: 'end-turn', label: '턴 마무리' },
];

function renderCombatantStatus(title: string, combatant: Combatant): string {
  return `
    <section class="panel status-panel" aria-labelledby="${combatant.id}-status-title">
      <h2 id="${combatant.id}-status-title">${title}</h2>
      <div class="status-grid">
        <span>이름</span><strong>${combatant.name}</strong>
        <span>레벨</span><strong>${combatant.level}</strong>
        <span>HP</span><strong>${combatant.hp}/${combatant.maxHP}</strong>
        <span>MP</span><strong>${combatant.mp}/${combatant.maxMP}</strong>
        <span>기본 공격</span><strong>${combatant.derivedStats.basicAtk}</strong>
        <span>MP 재생</span><strong>${combatant.derivedStats.mpRegen}</strong>
      </div>
    </section>
  `;
}

function renderRoundStatus(state: GameState): string {
  return `
    <section class="panel status-panel" aria-labelledby="round-status-title">
      <h2 id="round-status-title">진행 상태</h2>
      <div class="status-grid">
        <span>층</span><strong>${state.floor}</strong>
        <span>턴</span><strong>${state.turn}</strong>
        <span>단계</span><strong>${state.phase}</strong>
        <span>코인</span><strong>${state.coins}</strong>
      </div>
    </section>
  `;
}

function renderMap(state: GameState): string {
  const cells = createFixedMap(state)
    .map((cell) => {
      const label = cell.occupant === 'player' ? '플레이어' : cell.occupant === 'enemy' ? '적' : '빈 칸';
      const marker = cell.occupant === 'player' ? 'P' : cell.occupant === 'enemy' ? 'E' : '';
      return `<div class="map-cell ${cell.occupant ?? ''}" role="gridcell" aria-label="${cell.x + 1},${cell.y + 1} ${label}">${marker}</div>`;
    })
    .join('');

  return `
    <section class="panel map-panel" aria-labelledby="map-title">
      <h2 id="map-title">7x7 고정 전술 맵</h2>
      <div class="map-grid" role="grid" aria-rowcount="${CORE_RULES.mapSize}" aria-colcount="${CORE_RULES.mapSize}">
        ${cells}
      </div>
      <p class="helper-text">P = 플레이어, E = 적 1명. 맵은 항상 동일한 CSS Grid입니다.</p>
    </section>
  `;
}

function renderMinimapSummary(state: GameState): string {
  return `
    <section class="panel minimap-panel" aria-labelledby="minimap-title">
      <h2 id="minimap-title">미니맵 요약</h2>
      <ul class="summary-list">
        ${createMinimapSummary(state).map((line) => `<li>${line}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderActions(): string {
  return `
    <section class="panel actions-panel" aria-labelledby="actions-title">
      <h2 id="actions-title">행동 버튼</h2>
      <div class="action-grid">
        ${actionLabels.map(({ action, label }) => `<button type="button" data-action="${action}">${label}</button>`).join('')}
      </div>
    </section>
  `;
}

function renderLog(state: GameState): string {
  return `
    <section class="panel log-panel" aria-labelledby="log-title">
      <h2 id="log-title">전투 로그</h2>
      <ol>
        ${state.log.map((entry) => `<li>${entry}</li>`).join('')}
      </ol>
    </section>
  `;
}

function renderStorageControls(): string {
  return `
    <section class="panel storage-panel" aria-labelledby="storage-title">
      <h2 id="storage-title">저장 / 불러오기</h2>
      <div class="action-grid two">
        <button type="button" data-save="true">저장 stub</button>
        <button type="button" data-load="true">불러오기 stub</button>
      </div>
    </section>
  `;
}

export function renderApp(root: HTMLElement, state: GameState): void {
  let currentState = state;

  function paint(nextState: GameState): void {
    currentState = nextState;
    root.innerHTML = `
      <main class="app-shell">
        <header class="hero">
          <p class="eyebrow">Mobile-first PWA skeleton</p>
          <h1>ManRPG PWA AI</h1>
          <p>실행 가능한 PWA 기본 골격, 로컬 규칙 엔진 시작, 7x7 고정 맵 화면입니다.</p>
        </header>
        ${renderRoundStatus(currentState)}
        ${renderCombatantStatus('플레이어 상태창', currentState.player)}
        ${renderCombatantStatus('적 상태창', currentState.enemy)}
        ${renderActions()}
        ${renderLog(currentState)}
        ${renderAiSettingsPanel()}
        ${renderMinimapSummary(currentState)}
        ${renderStorageControls()}
        ${renderMap(currentState)}
      </main>
    `;

    root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action as ActionType;
        paint(applyPlayerAction(currentState, action));
      });
    });

    root.querySelector<HTMLButtonElement>('[data-save]')?.addEventListener('click', () => {
      saveGameStub(currentState);
      paint({ ...currentState, log: [...currentState.log, '현재 상태를 localStorage에 저장했습니다.'].slice(-12) });
    });

    root.querySelector<HTMLButtonElement>('[data-load]')?.addEventListener('click', () => {
      const loaded = loadGameStub();
      paint(loaded ?? { ...currentState, log: [...currentState.log, '저장된 상태가 없습니다.'].slice(-12) });
    });
  }

  paint(currentState);
}
