export function browserBundle() {
  return String.raw`
const MAP_SIZE = 7;
const initialStats = { strength: 9, agility: 9, stamina: 9, intelligence: 9, wisdom: 9, appearance: 9 };
function derived(level, stats) {
  return {
    maxHP: stats.stamina * 10,
    maxMP: level * 5 + stats.intelligence * 10,
    mpRegen: level + stats.wisdom * 2,
    basicAtk: Math.floor((stats.strength + stats.stamina) / 10) + 2,
  };
}
function combatant(id, name, level, position) {
  const d = derived(level, initialStats);
  return { id, name, level, hp: d.maxHP, maxHP: d.maxHP, mp: d.maxMP, maxMP: d.maxMP, primaryStats: initialStats, derivedStats: d, position, guarding: false };
}
let state = {
  version: 1,
  floor: 1,
  turn: 1,
  phase: 'player-turn',
  coins: 0,
  player: combatant('player', '플레이어', 1, { x: 3, y: 5 }),
  enemy: combatant('enemy', '적', 1, { x: 3, y: 1 }),
  log: [
    '실행 가능한 PWA 기본 골격을 시작했습니다.',
    '원본 zip 미확인 상태이므로 파생 수치와 판정식은 임시 구현입니다.',
    'AI 없이 로컬 TypeScript 규칙만으로 화면과 기본 판정을 처리합니다.'
  ]
};
const actions = [
  ['move', '이동'], ['basic-attack', '기본 공격'], ['skill', '스킬'], ['magic', '마법'],
  ['item', '아이템'], ['defend', '방어'], ['wait', '대기'], ['end-turn', '턴 마무리']
];
function append(entries) { state = { ...state, log: [...state.log, ...entries].slice(-12) }; }
function roll(sides) { return Math.floor(Math.random() * Math.max(1, Math.floor(sides))) + 1; }
function action(kind) {
  if (kind === 'basic-attack') {
    const die = roll(state.player.primaryStats.strength);
    const total = die + state.player.derivedStats.basicAtk;
    const line = Math.max(4, Math.floor(state.enemy.primaryStats.agility / 2) + 4);
    const hit = total >= line;
    const damage = hit ? state.player.derivedStats.basicAtk : 0;
    state = { ...state, enemy: { ...state.enemy, hp: Math.max(0, state.enemy.hp - damage) } };
    append(['플레이어 기본 공격: 1d' + state.player.primaryStats.strength + '+' + state.player.derivedStats.basicAtk + ' = ' + total, hit ? '적에게 ' + damage + ' 피해를 입혔습니다.' : '적 공격에 실패했습니다.']);
  } else if (kind === 'defend') {
    state = { ...state, player: { ...state.player, guarding: true } };
    append(['플레이어가 방어 자세를 취했습니다.']);
  } else if (kind === 'end-turn') {
    state = { ...state, turn: state.turn + 1, player: { ...state.player, guarding: false } };
    append(['턴을 마무리했습니다. 적 행동 규칙은 다음 단계에서 구현합니다.']);
  } else {
    const labels = {
      move: '이동은 버튼 자리만 준비했습니다. 격자 이동 규칙은 다음 단계에서 구현합니다.',
      skill: '스킬은 원본 zip 확인 후 로컬 규칙으로 구현합니다.',
      magic: '마법은 원본 zip 확인 후 로컬 규칙으로 구현합니다.',
      item: '아이템은 원본 zip 확인 후 로컬 규칙으로 구현합니다.',
      wait: '플레이어가 대기했습니다.'
    };
    append([labels[kind]]);
  }
  render();
}
function status(title, c) {
  return '<section class="panel status-panel"><h2>' + title + '</h2><div class="status-grid"><span>이름</span><strong>' + c.name + '</strong><span>레벨</span><strong>' + c.level + '</strong><span>HP</span><strong>' + c.hp + '/' + c.maxHP + '</strong><span>MP</span><strong>' + c.mp + '/' + c.maxMP + '</strong><span>기본 공격</span><strong>' + c.derivedStats.basicAtk + '</strong><span>MP 재생</span><strong>' + c.derivedStats.mpRegen + '</strong></div></section>';
}
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
  for (let y = 0; y < MAP_SIZE; y += 1) for (let x = 0; x < MAP_SIZE; x += 1) cells += cell(x, y);
  return '<section class="panel map-panel"><h2>7x7 고정 전술 맵</h2><div class="map-grid" role="grid" aria-rowcount="7" aria-colcount="7">' + cells + '</div><p class="helper-text">P = 플레이어, E = 적 1명. 맵은 항상 동일한 CSS Grid입니다.</p></section>';
}
function render() {
  const root = document.querySelector('#app');
  if (!root) throw new Error('App root element was not found.');
  root.innerHTML = '<main class="app-shell"><header class="hero"><p class="eyebrow">Mobile-first PWA skeleton</p><h1>ManRPG PWA AI</h1><p>실행 가능한 PWA 기본 골격, 로컬 규칙 엔진 시작, 7x7 고정 맵 화면입니다.</p></header>'
    + '<section class="panel status-panel"><h2>진행 상태</h2><div class="status-grid"><span>층</span><strong>' + state.floor + '</strong><span>턴</span><strong>' + state.turn + '</strong><span>단계</span><strong>' + state.phase + '</strong><span>코인</span><strong>' + state.coins + '</strong></div></section>'
    + status('플레이어 상태창', state.player) + status('적 상태창', state.enemy)
    + '<section class="panel actions-panel"><h2>행동 버튼</h2><div class="action-grid">' + actions.map(([k, v]) => '<button type="button" data-action="' + k + '">' + v + '</button>').join('') + '</div></section>'
    + '<section class="panel log-panel"><h2>전투 로그</h2><ol>' + state.log.map((entry) => '<li>' + entry + '</li>').join('') + '</ol></section>'
    + '<details class="panel ai-panel"><summary>AI 설정</summary><p>선택형 AI 서술자 자리입니다. API 키 없이도 게임은 로컬 규칙으로 진행됩니다.</p><dl class="compact-list"><div><dt>상태</dt><dd>disabled</dd></div><div><dt>판정 관여</dt><dd>불가</dd></div><div><dt>실제 호출</dt><dd>다음 단계 구현</dd></div></dl></details>'
    + '<section class="panel minimap-panel"><h2>미니맵 요약</h2><ul class="summary-list"><li>7x7 고정 격자</li><li>플레이어: (' + (state.player.position.x + 1) + ', ' + (state.player.position.y + 1) + ')</li><li>적 1명: (' + (state.enemy.position.x + 1) + ', ' + (state.enemy.position.y + 1) + ')</li><li>지형/불/낙인/마법 효과 표시는 다음 단계에서 확장</li></ul></section>'
    + '<section class="panel storage-panel"><h2>저장 / 불러오기</h2><div class="action-grid two"><button type="button" data-save="true">저장 stub</button><button type="button" data-load="true">불러오기 stub</button></div></section>'
    + mapHtml() + '</main>';
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => action(button.dataset.action)));
  document.querySelector('[data-save]')?.addEventListener('click', () => { localStorage.setItem('manrpg-pwa-ai:save:v1', JSON.stringify(state)); append(['현재 상태를 localStorage에 저장했습니다.']); render(); });
  document.querySelector('[data-load]')?.addEventListener('click', () => { const raw = localStorage.getItem('manrpg-pwa-ai:save:v1'); state = raw ? JSON.parse(raw) : state; append([raw ? '저장된 상태를 불러왔습니다.' : '저장된 상태가 없습니다.']); render(); });
}
render();
`;
}
