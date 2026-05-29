export function browserBundle() {
  return String.raw`
const MAP_SIZE = 7;
const state = {
  floor: 1,
  turn: 1,
  phase: 'battle',
  coins: 0,
  player: { hp: 29, maxHp: 29, mp: 13, maxMp: 13, position: { x: 3, y: 5 } },
  enemy: { hp: 12, maxHp: 12, mp: 0, maxMp: 0, position: { x: 3, y: 1 } },
  log: [
    'ManRPG v18 FINAL 원본 패키지 기준으로 구현을 시작합니다.',
    '현재 단계는 프로젝트 뼈대이며, 판정/보상/AI 호출은 다음 단계에서 구현합니다.',
    '규칙 판정, 주사위, HP/MP/보상 처리는 반드시 코드가 담당합니다.'
  ]
};

function cell(x, y) {
  const isPlayer = state.player.position.x === x && state.player.position.y === y;
  const isEnemy = state.enemy.position.x === x && state.enemy.position.y === y;
  const occupant = isPlayer ? 'player' : isEnemy ? 'enemy' : '';
  const label = isPlayer ? '플레이어' : isEnemy ? '적' : '빈 칸';
  const marker = isPlayer ? 'P' : isEnemy ? 'E' : '';
  return '<div class="map-cell ' + occupant + '" role="gridcell" aria-label="' + (x + 1) + ',' + (y + 1) + ' ' + label + '">' + marker + '</div>';
}

function mapHtml() {
  let cells = '';
  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      cells += cell(x, y);
    }
  }
  return '<section class="panel map-panel" aria-labelledby="map-title"><h2 id="map-title">7x7 고정 전술 맵</h2><div class="map-grid" role="grid" aria-rowcount="7" aria-colcount="7">' + cells + '</div><p class="helper-text">P = 플레이어, E = 적. 적은 항상 1명만 표시합니다.</p></section>';
}

const root = document.querySelector('#app');
if (!root) throw new Error('App root element was not found.');
root.innerHTML = '<main class="app-shell"><header class="hero"><p class="eyebrow">Mobile-first PWA skeleton</p><h1>ManRPG PWA AI</h1><p>ManRPG v18 FINAL 원본 패키지를 기준으로 구현하는 턴제 텍스트 TRPG 프로젝트 기반입니다.</p></header><section class="panel status-panel" aria-labelledby="status-title"><h2 id="status-title">기본 상태</h2><div class="status-grid"><span>층</span><strong>' + state.floor + '</strong><span>턴</span><strong>' + state.turn + '</strong><span>단계</span><strong>' + state.phase + '</strong><span>코인</span><strong>' + state.coins + '</strong><span>HP</span><strong>' + state.player.hp + '/' + state.player.maxHp + '</strong><span>MP</span><strong>' + state.player.mp + '/' + state.player.maxMp + '</strong></div></section><section class="panel log-panel" aria-labelledby="log-title"><h2 id="log-title">전투 로그</h2><ol>' + state.log.map((entry) => '<li>' + entry + '</li>').join('') + '</ol></section><section class="panel ai-panel" aria-labelledby="ai-title"><h2 id="ai-title">AI 설정</h2><p>선택형 AI 서술자 영역입니다. API 키 없이도 게임은 로컬 규칙으로 진행됩니다.</p><button type="button" disabled>다음 단계에서 설정</button></section>' + mapHtml() + '</main>';
`;
}
