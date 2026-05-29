import { createFixedMap } from '../map/fixedMap';
import { CORE_RULES } from '../rules/coreRules';
import type { GameState } from '../state/types';

function renderStatus(state: GameState): string {
  return `
    <section class="panel status-panel" aria-labelledby="status-title">
      <h2 id="status-title">기본 상태</h2>
      <div class="status-grid">
        <span>층</span><strong>${state.floor}</strong>
        <span>턴</span><strong>${state.turn}</strong>
        <span>단계</span><strong>${state.phase}</strong>
        <span>코인</span><strong>${state.coins}</strong>
        <span>HP</span><strong>${state.player.hp}/${state.player.maxHp}</strong>
        <span>MP</span><strong>${state.player.mp}/${state.player.maxMp}</strong>
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
      <p class="helper-text">P = 플레이어, E = 적. 적은 항상 1명만 표시합니다.</p>
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

function renderAiPanel(): string {
  return `
    <section class="panel ai-panel" aria-labelledby="ai-title">
      <h2 id="ai-title">AI 설정</h2>
      <p>선택형 AI 서술자 영역입니다. API 키 없이도 게임은 로컬 규칙으로 진행됩니다.</p>
      <button type="button" disabled>다음 단계에서 설정</button>
    </section>
  `;
}

export function renderApp(root: HTMLElement, state: GameState): void {
  root.innerHTML = `
    <main class="app-shell">
      <header class="hero">
        <p class="eyebrow">Mobile-first PWA skeleton</p>
        <h1>ManRPG PWA AI</h1>
        <p>ManRPG v18 FINAL 원본 패키지를 기준으로 구현하는 턴제 텍스트 TRPG 프로젝트 기반입니다.</p>
      </header>
      ${renderStatus(state)}
      ${renderLog(state)}
      ${renderAiPanel()}
      ${renderMap(state)}
    </main>
  `;
}
