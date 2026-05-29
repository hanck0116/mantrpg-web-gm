const MAP_SIZE = 7;
const SAVE_KEY = 'mantrpg-web-gm-save';

const REWARD_TABLE = [
  { type: 'SKILL_RESET_TICKET', label: '스킬 초기화권', weight: 5 },
  { type: 'MARTIAL_BOOK', label: '무공서', weight: 10 },
  { type: 'MAGIC_BOOK', label: '마법서', weight: 25 },
  { type: 'COIN_PLUS_1', label: '추가 코인 +1', weight: 40 },
  { type: 'COIN_PLUS_2', label: '추가 코인 +2', weight: 20 },
];
const SKILL_TEMPLATES = [
  { type: 'POWER_STRIKE', label: '강타', description: '힘 판정으로 적에게 큰 피해를 준다.', mpCost: 2, damage: 8, stat: '힘' },
  { type: 'QUICK_SLASH', label: '신속 베기', description: '민첩 판정으로 적을 빠르게 공격한다.', mpCost: 2, damage: 6, stat: '민첩' },
  { type: 'MANA_BOLT', label: '마력탄', description: '지능 판정으로 원거리 마법 피해를 준다.', mpCost: 3, damage: 7, stat: '지능' },
  { type: 'FOCUSED_GUARD', label: '집중 방어', description: '다음 적 공격 피해를 크게 줄인다.', mpCost: 1, damage: 0, stat: '체력' },
  { type: 'TACTICAL_OBSERVE', label: '전술 관찰', description: '적의 다음 행동 예고와 위험 타일 정보를 강화한다.', mpCost: 1, damage: 0, stat: '지혜' },
];
const MAGIC_POOL_1 = ['라이트', '파이어', '아이스', '윈드', '매직 애로우', '그리스', '디그', '다크니스'];
const SHOP_ITEMS = {
  buy: {
    REWARD_REROLL: { label: '보상 리롤권', price: 1, description: '다음 보상 선택 단계에서 리롤에 사용한다.' },
    BASIC_MAGIC_BOOK: { label: '기초 마법서', price: 3, description: '마법서 1개를 획득한다.' },
    MARTIAL_BOOK: { label: '무공서', price: 3, description: '무공서 1개를 획득한다.' },
    SKILL_RESET_TICKET: { label: '스킬 초기화권', price: 5, description: '스킬 초기화권 1개를 획득한다.' },
  },
  sell: {
    SELL_MAGIC_BOOK: { label: '마법서 판매', price: 1, description: '마법서 1개를 판매한다.' },
    SELL_MARTIAL_BOOK: { label: '무공서 판매', price: 1, description: '무공서 1개를 판매한다.' },
    SELL_SKILL_RESET_TICKET: { label: '스킬 초기화권 판매', price: 2, description: '스킬 초기화권 1개를 판매한다.' },
  },
};

function createBaseTile(x, y) {
  return {
    x,
    y,
    terrain: 'stone',
    durability: 10,
    fire: false,
    brand: false,
    incomingAttack: false,
    magicEffect: null,
    blocked: false,
  };
}

function createInitialMap() {
  const tiles = [];
  for (let y = 0; y < MAP_SIZE; y += 1) {
    const row = [];
    for (let x = 0; x < MAP_SIZE; x += 1) row.push(createBaseTile(x, y));
    tiles.push(row);
  }

  tiles[4][4].terrain = 'broken';
  tiles[4][4].durability = 0;
  tiles[4][4].blocked = true;

  return { size: MAP_SIZE, tiles };
}

function createInitialInventory() {
  return { skillResetTicket: 0, martialBook: 0, magicBook: 0, rewardRerollTicket: 0 };
}

function createEnemyForFloor(floor) {
  return {
    name: `${floor}층의 그림자 적`,
    hp: 18 + floor * 2,
    maxHp: 18 + floor * 2,
    position: { x: 3, y: 1 },
    stats: {
      힘: 7 + floor,
      민첩: 7 + floor,
      체력: 7 + floor,
      지능: 4 + Math.floor(floor / 2),
      지혜: 4 + Math.floor(floor / 2),
      외모: 4,
    },
    state: ['대기'],
  };
}

function createInitialGameState() {
  const player = createInitialPlayer();
  const initialState = {
    phase: 'INITIAL_STAT',
    floor: 1,
    turn: 1,
    player,
    enemy: createEnemyForFloor(1),
    map: createInitialMap(),
    reward: { options: [], selected: null, rerolled: false },
    skill: { options: [], selected: null, skipped: false },
    magicBookPhase: { baseAttemptUsed: false, extraAttempts: 0, lastResult: null },
    shop: { log: [] },
    nextFloorConfirm: { ready: false },
  };

  return recalculateDerivedStatsForState(initialState, { refillHpMp: true });
}

let gameState = createInitialGameState();

const mapElement = document.getElementById('tactical-map');
const logElement = document.getElementById('combat-log');
const actionButtons = document.querySelectorAll('[data-action]');
const newGameButton = document.getElementById('new-game-button');
const saveButton = document.getElementById('save-game-button');
const loadButton = document.getElementById('load-game-button');
const rewardPanel = document.getElementById('reward-panel');
const rewardOptionsElement = document.getElementById('reward-options');
const rerollRewardButton = document.getElementById('reroll-reward-button');
const statPanel = document.getElementById('stat-panel');
const statPanelTitleElement = document.getElementById('stat-panel-title');
const statPanelPointsElement = document.getElementById('stat-panel-points');
const statControlsElement = document.getElementById('stat-controls');
const finishStatButton = document.getElementById('finish-stat-button');
const recommendedStatButton = document.getElementById('recommended-stat-button');
const skillPanel = document.getElementById('skill-panel');
const skillPanelDescElement = document.getElementById('skill-panel-desc');
const skillOptionsElement = document.getElementById('skill-options');
const magicBookPanel = document.getElementById('magic-book-panel');
const magicBookCountElement = document.getElementById('magic-book-count');
const spellListElement = document.getElementById('spell-list');
const magicBookStatusElement = document.getElementById('magic-book-status');
const tryMagicBookButton = document.getElementById('try-magic-book-button');
const extraMagicBookButton = document.getElementById('extra-magic-book-button');
const finishMagicBookButton = document.getElementById('finish-magic-book-button');
const shopPanel = document.getElementById('shop-panel');
const shopCoinElement = document.getElementById('shop-coin');
const shopBuyOptionsElement = document.getElementById('shop-buy-options');
const shopSellOptionsElement = document.getElementById('shop-sell-options');
const finishShopButton = document.getElementById('finish-shop-button');
const nextFloorPanel = document.getElementById('next-floor-panel');
const nextFloorDescElement = document.getElementById('next-floor-desc');
const enterNextFloorButton = document.getElementById('enter-next-floor-button');
const battleOptionPanel = document.getElementById('battle-option-panel');
const battleOptionTitleElement = document.getElementById('battle-option-title');
const battleOptionListElement = document.getElementById('battle-option-list');
const closeBattleOptionButton = document.getElementById('close-battle-option-button');

function addLog(message) {
  const li = document.createElement('li');
  li.textContent = message;
  logElement.prepend(li);
  if (logElement.children.length > 20) logElement.removeChild(logElement.lastElementChild);
}

function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function rollDice(max) {
  const fixedMax = Math.max(1, Math.floor(max));
  return Math.floor(Math.random() * fixedMax) + 1;
}

function weightedPick(table) {
  const total = table.reduce((sum, item) => sum + item.weight, 0);
  let point = Math.random() * total;
  for (const item of table) {
    point -= item.weight;
    if (point < 0) return { type: item.type, label: item.label };
  }
  return { type: table[table.length - 1].type, label: table[table.length - 1].label };
}

function clearIncomingAttacks() {
  for (let y = 0; y < gameState.map.size; y += 1) {
    for (let x = 0; x < gameState.map.size; x += 1) gameState.map.tiles[y][x].incomingAttack = false;
  }
}

function recalculateDerivedStatsForState(state, options = {}) {
  const { refillHpMp = false } = options;
  state.player.maxHp = 20 + state.player.stats.체력;
  state.player.maxMp = 4 + state.player.stats.지능;

  if (refillHpMp) {
    state.player.hp = state.player.maxHp;
    state.player.mp = state.player.maxMp;
  } else {
    if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
    if (state.player.mp > state.player.maxMp) state.player.mp = state.player.maxMp;
  }

  return state;
}


function createInitialPlayer() {
  return {
    name: '하르벤',
    level: 1,
    hp: 0,
    maxHp: 0,
    mp: 0,
    maxMp: 0,
    coin: 0,
    position: { x: 3, y: 5 },
    stats: { 힘: 1, 민첩: 1, 체력: 1, 지능: 1, 지혜: 1, 외모: 1 },
    state: [],
    inventory: createInitialInventory(),
    statPoints: 48,
    skills: [],
    spells: [],
  };
}

function ensureStateShape() {
  if (!gameState.player) gameState.player = createInitialPlayer();
  if (!gameState.enemy) gameState.enemy = createEnemyForFloor(gameState.floor || 1);
  if (!Array.isArray(gameState.player.state)) gameState.player.state = [];
  if (!Array.isArray(gameState.enemy.state)) gameState.enemy.state = [];
  if (!gameState.map || gameState.map.size !== MAP_SIZE || !Array.isArray(gameState.map.tiles)) gameState.map = createInitialMap();
  for (let y = 0; y < gameState.map.size; y += 1) {
    for (let x = 0; x < gameState.map.size; x += 1) {
      gameState.map.tiles[y][x] = { ...createBaseTile(x, y), ...gameState.map.tiles[y][x] };
    }
  }
  if (!gameState.player.inventory) gameState.player.inventory = createInitialInventory();
  if (typeof gameState.player.inventory.skillResetTicket !== 'number') gameState.player.inventory.skillResetTicket = 0;
  if (typeof gameState.player.inventory.martialBook !== 'number') gameState.player.inventory.martialBook = 0;
  if (typeof gameState.player.inventory.magicBook !== 'number') gameState.player.inventory.magicBook = 0;
  if (typeof gameState.player.inventory.rewardRerollTicket !== 'number') gameState.player.inventory.rewardRerollTicket = 0;
  if (typeof gameState.player.statPoints !== 'number') gameState.player.statPoints = 0;
  if (!gameState.reward) gameState.reward = { options: [], selected: null, rerolled: false };
  if (!Array.isArray(gameState.reward.options)) gameState.reward.options = [];
  if (typeof gameState.reward.rerolled !== 'boolean') gameState.reward.rerolled = false;
  if (!Array.isArray(gameState.player.skills)) gameState.player.skills = [];
  if (!Array.isArray(gameState.player.spells)) gameState.player.spells = [];
  if (!gameState.skill) gameState.skill = { options: [], selected: null, skipped: false };
  if (!Array.isArray(gameState.skill.options)) gameState.skill.options = [];
  if (typeof gameState.skill.skipped !== 'boolean') gameState.skill.skipped = false;
  if (!gameState.magicBookPhase) gameState.magicBookPhase = { baseAttemptUsed: false, extraAttempts: 0, lastResult: null };
  if (typeof gameState.magicBookPhase.baseAttemptUsed !== 'boolean') gameState.magicBookPhase.baseAttemptUsed = false;
  if (typeof gameState.magicBookPhase.extraAttempts !== 'number') gameState.magicBookPhase.extraAttempts = 0;
  if (!('lastResult' in gameState.magicBookPhase)) gameState.magicBookPhase.lastResult = null;
  if (!gameState.shop) gameState.shop = { log: [] };
  if (!Array.isArray(gameState.shop.log)) gameState.shop.log = [];
  if (!gameState.nextFloorConfirm) gameState.nextFloorConfirm = { ready: false };
  if (typeof gameState.nextFloorConfirm.ready !== 'boolean') gameState.nextFloorConfirm.ready = false;
}

function renderStatus() {
  ensureStateShape();
  if (gameState.phase !== 'BATTLE') hideBattleOptionPanel();
  document.getElementById('player-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
  document.getElementById('player-mp').textContent = `${gameState.player.mp}/${gameState.player.maxMp}`;
  document.getElementById('player-coin').textContent = String(gameState.player.coin);
  document.getElementById('player-level').textContent = String(gameState.player.level);
  document.getElementById('inv-skill-reset').textContent = String(gameState.player.inventory.skillResetTicket);
  document.getElementById('inv-martial-book').textContent = String(gameState.player.inventory.martialBook);
  document.getElementById('inv-magic-book').textContent = String(gameState.player.inventory.magicBook);
  document.getElementById('inv-reroll-ticket').textContent = String(gameState.player.inventory.rewardRerollTicket);
  document.getElementById('enemy-name').textContent = gameState.enemy.name;
  document.getElementById('enemy-hp').textContent = `${gameState.enemy.hp}/${gameState.enemy.maxHp}`;
  document.getElementById('enemy-state').textContent = gameState.enemy.state.join(', ') || '없음';
  document.getElementById('game-floor').textContent = String(gameState.floor);
  document.getElementById('game-turn').textContent = String(gameState.turn);
  document.getElementById('game-phase').textContent = gameState.phase;
  document.getElementById('player-stat-points').textContent = String(gameState.player.statPoints);
  document.getElementById('player-skill-count').textContent = String(gameState.player.skills.length);
  document.getElementById('player-spell-count').textContent = String(gameState.player.spells.length);
}

function getTileLabel(tile, x, y) {
  if (gameState.player.position.x === x && gameState.player.position.y === y) return '나';
  if (gameState.enemy.position.x === x && gameState.enemy.position.y === y && gameState.enemy.hp > 0) return '적';
  if (tile.incomingAttack) return '↓';
  if (tile.fire) return '불';
  if (tile.brand) return '낙';
  if (tile.terrain === 'broken') return '파';
  if (tile.magicEffect === 'grease') return '기름';
  if (tile.magicEffect) return '마';
  return '';
}

function renderMap() {
  mapElement.innerHTML = '';
  for (let y = 0; y < gameState.map.size; y += 1) {
    for (let x = 0; x < gameState.map.size; x += 1) {
      const tileState = gameState.map.tiles[y][x];
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.setAttribute('role', 'gridcell');
      if (tileState.terrain === 'broken') tile.classList.add('broken');
      if (tileState.fire) tile.classList.add('fire');
      if (tileState.brand) tile.classList.add('brand');
      if (tileState.incomingAttack) tile.classList.add('incoming');
      if (tileState.magicEffect && !tileState.fire) tile.classList.add('magic-effect');
      if (gameState.player.position.x === x && gameState.player.position.y === y) tile.classList.add('player');
      if (gameState.enemy.position.x === x && gameState.enemy.position.y === y && gameState.enemy.hp > 0) tile.classList.add('enemy');
      tile.textContent = getTileLabel(tileState, x, y);
      tile.addEventListener('click', () => describeTile(x, y));
      mapElement.appendChild(tile);
    }
  }
}


function hideBattleOptionPanel() {
  battleOptionPanel.hidden = true;
  battleOptionListElement.innerHTML = '';
}

function countDangerTiles() {
  let dangerTiles = 0;
  for (let y = 0; y < gameState.map.size; y += 1) {
    for (let x = 0; x < gameState.map.size; x += 1) {
      const tile = gameState.map.tiles[y][x];
      if (tile.fire || tile.incomingAttack || tile.brand || tile.terrain === 'broken' || tile.magicEffect) dangerTiles += 1;
    }
  }
  return dangerTiles;
}

function markIncomingAttackFromEnemy() {
  clearIncomingAttacks();
  const dx = gameState.player.position.x - gameState.enemy.position.x;
  const dy = gameState.player.position.y - gameState.enemy.position.y;
  const attackTile = { x: gameState.enemy.position.x + Math.sign(dx), y: gameState.enemy.position.y + Math.sign(dy) };
  if (attackTile.x >= 0 && attackTile.x < MAP_SIZE && attackTile.y >= 0 && attackTile.y < MAP_SIZE) {
    gameState.map.tiles[attackTile.y][attackTile.x].incomingAttack = true;
    return true;
  }
  return false;
}

function renderBattleOptionPanel(mode) {
  ensureStateShape();
  if (mode !== 'skill' && mode !== 'spell') return;
  if (gameState.phase !== 'BATTLE') {
    hideBattleOptionPanel();
    return;
  }

  const isSkillMode = mode === 'skill';
  const items = isSkillMode ? gameState.player.skills : gameState.player.spells;
  battleOptionPanel.hidden = false;
  battleOptionTitleElement.textContent = isSkillMode ? '보유 스킬 선택' : '보유 마법 선택';
  battleOptionListElement.innerHTML = '';

  if (items.length < 1) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = '사용 가능한 항목이 없습니다.';
    battleOptionListElement.appendChild(emptyMessage);
    return;
  }

  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'battle-option-button';
    if (isSkillMode) {
      button.innerHTML = `<strong>${item.label}</strong><span>${item.description}</span><span>MP ${item.mpCost} / 기준 ${item.stat}</span>`;
      button.addEventListener('click', () => useSkill(index));
    } else {
      button.textContent = item;
      button.addEventListener('click', () => useSpell(item));
    }
    battleOptionListElement.appendChild(button);
  });
}

function renderRewardOptions() {
  if (gameState.phase !== 'REWARD_SELECT') {
    rewardPanel.hidden = true;
    rewardOptionsElement.innerHTML = '';
    return;
  }

  rewardPanel.hidden = false;
  rewardOptionsElement.innerHTML = '';
  gameState.reward.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option.label;
    button.className = 'reward-button';
    button.addEventListener('click', () => selectReward(index));
    rewardOptionsElement.appendChild(button);
  });
}

function renderStatPanel() {
  if (gameState.phase !== 'INITIAL_STAT' && gameState.phase !== 'IMAGINATION_STAT') {
    statPanel.hidden = true;
    statControlsElement.innerHTML = '';
    return;
  }

  statPanel.hidden = false;
  statPanelTitleElement.textContent = gameState.phase === 'INITIAL_STAT' ? '캐릭터 생성: 초기 스탯 분배' : '심상세계 2단계: 스탯 분배';
  statPanelPointsElement.textContent = String(gameState.player.statPoints);
  statControlsElement.innerHTML = '';
  ['힘', '민첩', '체력', '지능', '지혜', '외모'].forEach((statName) => {
    const row = document.createElement('div');
    row.className = 'stat-row';

    const label = document.createElement('span');
    label.textContent = statName;

    const value = document.createElement('strong');
    value.textContent = String(gameState.player.stats[statName]);

    const decreaseButton = document.createElement('button');
    decreaseButton.type = 'button';
    decreaseButton.textContent = '-';
    decreaseButton.disabled = gameState.phase !== 'INITIAL_STAT';
    decreaseButton.addEventListener('click', () => decreaseStat(statName));

    const increaseButton = document.createElement('button');
    increaseButton.type = 'button';
    increaseButton.textContent = '+';
    increaseButton.addEventListener('click', () => increaseStat(statName));

    const increaseFiveButton = document.createElement('button');
    increaseFiveButton.type = 'button';
    increaseFiveButton.textContent = '+5';
    increaseFiveButton.addEventListener('click', () => increaseStatBy(statName, 5));

    row.append(label, value, decreaseButton, increaseButton, increaseFiveButton);
    statControlsElement.appendChild(row);
  });
}

function renderMagicBookPanel() {
  if (gameState.phase !== 'IMAGINATION_MAGIC_BOOK') {
    magicBookPanel.hidden = true;
    return;
  }
  magicBookPanel.hidden = false;
  magicBookCountElement.textContent = String(gameState.player.inventory.magicBook);
  spellListElement.textContent = gameState.player.spells.length > 0 ? gameState.player.spells.join(', ') : '없음';
  const baseAttempt = gameState.magicBookPhase.baseAttemptUsed ? '사용함' : '미사용';
  const lastResult = gameState.magicBookPhase.lastResult || '아직 시도 기록이 없습니다.';
  const noBookGuide = gameState.player.inventory.magicBook < 1 ? '보유 마법서가 없습니다. 완료를 눌러 상점으로 이동하세요. / ' : '';
  magicBookStatusElement.textContent = `${noBookGuide}기본 시도: ${baseAttempt} / 추가 시도: ${gameState.magicBookPhase.extraAttempts}회 / 보유 코인: ${gameState.player.coin} / 최근 결과: ${lastResult}`;
}

function renderShopPanel() {
  if (gameState.phase !== 'IMAGINATION_SHOP') {
    shopPanel.hidden = true;
    shopBuyOptionsElement.innerHTML = '';
    shopSellOptionsElement.innerHTML = '';
    return;
  }

  shopPanel.hidden = false;
  shopCoinElement.textContent = String(gameState.player.coin);
  shopBuyOptionsElement.innerHTML = '';
  shopSellOptionsElement.innerHTML = '';

  Object.entries(SHOP_ITEMS.buy).forEach(([type, item]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shop-button';
    button.innerHTML = `<strong>${item.label}</strong><span>가격: 코인 ${item.price}</span><span>${item.description}</span>`;
    button.addEventListener('click', () => buyShopItem(type));
    shopBuyOptionsElement.appendChild(button);
  });

  Object.entries(SHOP_ITEMS.sell).forEach(([type, item]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shop-button';
    button.innerHTML = `<strong>${item.label}</strong><span>판매가: 코인 ${item.price}</span><span>${item.description}</span>`;
    button.addEventListener('click', () => sellShopItem(type));
    shopSellOptionsElement.appendChild(button);
  });
}

function renderNextFloorPanel() {
  if (gameState.phase !== 'NEXT_FLOOR_CONFIRM') {
    nextFloorPanel.hidden = true;
    return;
  }

  nextFloorPanel.hidden = false;
  nextFloorDescElement.textContent = `현재 ${gameState.floor}층을 클리어했습니다. 다음은 ${gameState.floor + 1}층입니다. 다음 층에도 적은 1명만 등장합니다.`;
}

function renderSkillPanel() {
  if (gameState.phase !== 'IMAGINATION_SKILL') {
    skillPanel.hidden = true;
    skillOptionsElement.innerHTML = '';
    return;
  }

  skillPanel.hidden = false;
  skillOptionsElement.innerHTML = '';
  if (gameState.player.level < 10) {
    skillPanelDescElement.textContent = '레벨 조건 미달로 스킬 생성이 생략되었습니다.';
    return;
  }

  skillPanelDescElement.textContent = gameState.skill.selected ? '스킬 선택이 완료되었습니다.' : '스킬 후보 3개 중 1개를 선택하세요.';
  gameState.skill.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'skill-button';
    button.innerHTML = `<strong>${option.label}</strong><span>${option.description}</span><span>MP ${option.mpCost} / 기준 ${option.stat}</span>`;
    button.addEventListener('click', () => selectSkill(index));
    if (gameState.skill.selected) button.disabled = true;
    skillOptionsElement.appendChild(button);
  });
}

function pickRandomSkillOptions(count) {
  const pool = [...SKILL_TEMPLATES];
  const picked = [];
  while (pool.length > 0 && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function enterSkillPhase() {
  if (gameState.phase !== 'IMAGINATION_SKILL') return;

  if (gameState.player.level < 10) {
    gameState.skill.options = [];
    gameState.skill.selected = null;
    gameState.skill.skipped = true;
    addLog('레벨 10 미만이므로 스킬 생성 단계를 생략합니다.');
    addLog('다음 단계: 심상세계 4단계 - 마법서 관련 행동');
    gameState.phase = 'IMAGINATION_MAGIC_BOOK';
    renderSkillPanel();
    renderStatus();
    renderMagicBookPanel();
    renderShopPanel();
    renderNextFloorPanel();
    renderMap();
    return;
  }

  gameState.skill.options = pickRandomSkillOptions(3);
  gameState.skill.selected = null;
  gameState.skill.skipped = false;
  addLog('스킬 후보 3개 중 하나를 선택하세요.');
  renderSkillPanel();
  renderNextFloorPanel();
}

function selectSkill(index) {
  ensureStateShape();
  if (gameState.phase !== 'IMAGINATION_SKILL') {
    addLog('현재 단계에서는 스킬을 선택할 수 없습니다.');
    return;
  }
  if (gameState.skill.selected) {
    addLog('이미 스킬을 선택했습니다.');
    return;
  }
  const selectedSkill = gameState.skill.options[index];
  if (!selectedSkill) {
    addLog('유효하지 않은 스킬 선택입니다.');
    return;
  }

  gameState.player.skills.push(selectedSkill);
  gameState.skill.selected = selectedSkill;
  addLog(`스킬 선택: ${selectedSkill.label}`);
  addLog('다음 단계: 심상세계 4단계 - 마법서 관련 행동');
  gameState.phase = 'IMAGINATION_MAGIC_BOOK';
  renderSkillPanel();
  renderStatus();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}

function finishMagicBookPhase() {
  if (gameState.phase !== 'IMAGINATION_MAGIC_BOOK') return;
  gameState.phase = 'IMAGINATION_SHOP';
  addLog('마법서 관련 행동을 마쳤습니다.');
  addLog('다음 단계: 심상세계 5단계 - 상점 이용');
  renderStatus();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}

function describeTile(x, y) {
  const tile = gameState.map.tiles[y][x];
  const terrainLabel = tile.terrain === 'broken' ? '파괴 지형' : '석재 바닥';
  const fireLabel = tile.fire ? '불 있음' : '불 없음';
  const brandLabel = tile.brand ? '낙인 있음' : '낙인 없음';
  const incomingLabel = tile.incomingAttack ? '공격 예고 있음' : '공격 예고 없음';
  const magicLabel = tile.magicEffect ? `마법 효과 ${tile.magicEffect}` : '마법 효과 없음';
  addLog(`좌표 (${x}, ${y}): ${terrainLabel} / 내구도 ${tile.durability} / ${fireLabel} / ${brandLabel} / ${incomingLabel} / ${magicLabel}`);
}

function clearFloor() {
  ensureStateShape();
  hideBattleOptionPanel();
  gameState.phase = 'REWARD_SELECT';
  gameState.enemy.hp = 0;
  gameState.player.level += 5;
  gameState.player.statPoints += 15;
  gameState.player.coin += 1;
  gameState.player.hp = gameState.player.maxHp;
  gameState.player.mp = gameState.player.maxMp;
  gameState.player.state = [];
  gameState.reward.options = [weightedPick(REWARD_TABLE), weightedPick(REWARD_TABLE)];
  gameState.reward.selected = null;
  gameState.reward.rerolled = false;
  addLog('층 클리어: 적을 쓰러뜨렸습니다.');
  addLog('레벨 +5, 스탯 포인트 +15, 기본 코인 +1, HP/MP가 모두 회복되었습니다.');
  addLog('보상 후보 2개 중 하나를 선택하세요.');
  renderStatus();
  renderRewardOptions();
  renderStatPanel();
  renderSkillPanel();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}

function rerollRewards() {
  ensureStateShape();
  if (gameState.phase !== 'REWARD_SELECT') return;
  if (gameState.reward.selected) {
    addLog('이미 보상을 선택해 리롤할 수 없습니다.');
    return;
  }
  if (gameState.reward.rerolled) {
    addLog('이미 리롤했습니다.');
    return;
  }
  if (gameState.player.inventory.rewardRerollTicket > 0) {
    gameState.player.inventory.rewardRerollTicket -= 1;
    addLog('보상 리롤권을 사용했습니다.');
  } else if (gameState.player.coin >= 1) {
    gameState.player.coin -= 1;
    addLog('코인 1개를 사용해 보상 후보를 다시 생성했습니다.');
  } else {
    addLog('리롤권 또는 코인이 부족해 리롤할 수 없습니다.');
    return;
  }

  gameState.reward.options = [weightedPick(REWARD_TABLE), weightedPick(REWARD_TABLE)];
  gameState.reward.rerolled = true;
  renderStatus();
  renderRewardOptions();
}


function canBattleAction() {
  if (gameState.phase !== 'BATTLE') {
    addLog(`현재 단계(${gameState.phase})에서는 전투 행동을 할 수 없습니다.`);
    return false;
  }
  return true;
}

function findBestStepToward(from, target) {
  const candidates = [{ x: from.x + 1, y: from.y }, { x: from.x - 1, y: from.y }, { x: from.x, y: from.y + 1 }, { x: from.x, y: from.y - 1 }];
  const valid = candidates.filter((pos) => {
    if (pos.x < 0 || pos.x >= MAP_SIZE || pos.y < 0 || pos.y >= MAP_SIZE) return false;
    const tile = gameState.map.tiles[pos.y][pos.x];
    if (tile.blocked) return false;
    if (pos.x === gameState.player.position.x && pos.y === gameState.player.position.y) return false;
    if (pos.x === gameState.enemy.position.x && pos.y === gameState.enemy.position.y) return false;
    return true;
  });
  valid.sort((a, b) => getDistance(a, target) - getDistance(b, target));
  return valid[0] || null;
}

function findSafeAdjacentStep(from) {
  const candidates = [{ x: from.x + 1, y: from.y }, { x: from.x - 1, y: from.y }, { x: from.x, y: from.y + 1 }, { x: from.x, y: from.y - 1 }];
  return candidates.find((pos) => {
    if (pos.x < 0 || pos.x >= MAP_SIZE || pos.y < 0 || pos.y >= MAP_SIZE) return false;
    const tile = gameState.map.tiles[pos.y][pos.x];
    if (tile.blocked || tile.fire) return false;
    if (pos.x === gameState.player.position.x && pos.y === gameState.player.position.y) return false;
    if (pos.x === gameState.enemy.position.x && pos.y === gameState.enemy.position.y) return false;
    return true;
  }) || null;
}

function enemyAttack() {
  addLog(`[적 행동] ${gameState.enemy.name}이 공격합니다.`);
  let enemyStrMax = gameState.enemy.stats.힘;
  const darknessIndex = gameState.enemy.state.indexOf('암흑');
  if (darknessIndex >= 0) {
    enemyStrMax = Math.max(1, Math.floor(gameState.enemy.stats.힘 / 2));
    gameState.enemy.state.splice(darknessIndex, 1);
    addLog('암흑으로 적의 명중 능력이 약화되었습니다.');
  }

  const enemyStr = rollDice(enemyStrMax);
  const playerAgi = rollDice(gameState.player.stats.민첩);
  addLog(`[판정] 적 힘 ${gameState.enemy.stats.힘} → 1d${enemyStrMax} = ${enemyStr} / 플레이어 민첩 ${gameState.player.stats.민첩} → 1d${gameState.player.stats.민첩} = ${playerAgi}`);

  if (enemyStr > playerAgi) {
    let damage = 4;
    const focusedGuardIndex = gameState.player.state.indexOf('집중 방어');
    const defenseIndex = gameState.player.state.indexOf('방어');
    if (focusedGuardIndex >= 0) {
      damage = 1;
      gameState.player.state.splice(focusedGuardIndex, 1);
      addLog('집중 방어로 피해를 크게 줄였습니다.');
    } else if (defenseIndex >= 0) {
      damage = 2;
      gameState.player.state.splice(defenseIndex, 1);
    }
    gameState.player.hp = Math.max(0, gameState.player.hp - damage);
    addLog(`[결과] 적 공격 명중. 플레이어 HP -${damage}`);
  } else {
    addLog('[결과] 적 공격이 빗나갔습니다.');
  }

  if (gameState.player.hp <= 0) {
    gameState.phase = 'GAME_OVER';
    hideBattleOptionPanel();
    addLog('패배: 플레이어 HP가 0이 되어 게임 오버입니다.');
  }
}

function enemyTurn() {
  if (gameState.phase !== 'BATTLE') return;
  clearIncomingAttacks();

  const enemyPos = gameState.enemy.position;
  const enemyTile = gameState.map.tiles[enemyPos.y][enemyPos.x];
  let canMove = true;

  const frozenIndex = gameState.enemy.state.indexOf('빙결');
  if (frozenIndex >= 0) {
    canMove = false;
    gameState.enemy.state.splice(frozenIndex, 1);
    addLog('[적 상태] 빙결로 이동하지 못합니다.');
  }

  const distanceBeforeMove = getDistance(gameState.enemy.position, gameState.player.position);

  if (canMove && enemyTile.fire) {
    const safeStep = findSafeAdjacentStep(enemyPos);
    if (safeStep) {
      gameState.enemy.position = safeStep;
      addLog(`[적 행동] ${gameState.enemy.name}이 불길을 피해 이동했습니다.`);
    }
  }

  const slipIndex = gameState.enemy.state.indexOf('미끄러짐');
  if (canMove && slipIndex >= 0 && getDistance(gameState.enemy.position, gameState.player.position) > 1) {
    const slipRoll = rollDice(gameState.enemy.stats.민첩);
    addLog(`[상태] 미끄러짐 판정: 적 민첩 ${gameState.enemy.stats.민첩} → 1d${gameState.enemy.stats.민첩} = ${slipRoll}`);
    if (slipRoll <= 3) {
      canMove = false;
      addLog('[상태] 미끄러짐으로 적 이동이 실패했습니다.');
    }
    gameState.enemy.state.splice(slipIndex, 1);
  }

  const distance = getDistance(gameState.enemy.position, gameState.player.position);
  if (distance <= 1) {
    enemyAttack();
  } else {
    if (canMove && distanceBeforeMove > 1) {
      const step = findBestStepToward(gameState.enemy.position, gameState.player.position);
      if (step) {
        gameState.enemy.position = step;
        addLog(`[적 행동] ${gameState.enemy.name}이 플레이어에게 접근했습니다.`);
      }
    }

    if (getDistance(gameState.enemy.position, gameState.player.position) <= 1) {
      if (markIncomingAttackFromEnemy()) addLog('[적 행동] 다음 턴 공격이 예고되었습니다.');
    }
  }

  gameState.turn += 1;
  renderStatus();
  renderMap();
}

function handleAttack() {
  if (!canBattleAction()) return;
  clearIncomingAttacks();
  const distance = getDistance(gameState.player.position, gameState.enemy.position);
  if (distance > 1) {
    addLog('적이 너무 멀어 공격할 수 없습니다. 행동이 소모됩니다.');
    renderMap();
    enemyTurn();
    return;
  }

  const playerRoll = rollDice(gameState.player.stats.힘);
  const enemyRoll = rollDice(gameState.enemy.stats.체력);
  addLog(`[판정] 플레이어 힘 ${gameState.player.stats.힘} → 1d${gameState.player.stats.힘} = ${playerRoll} / 적 체력 ${gameState.enemy.stats.체력} → 1d${gameState.enemy.stats.체력} = ${enemyRoll}`);

  if (playerRoll > enemyRoll) {
    gameState.enemy.hp = Math.max(0, gameState.enemy.hp - 5);
    addLog('[결과] 공격 성공. 적 HP -5');
  } else {
    addLog('[결과] 공격 실패. 피해 없음');
  }

  renderStatus();
  renderMap();
  if (gameState.enemy.hp <= 0) {
    clearFloor();
    renderStatus();
    return;
  }
  enemyTurn();
}

function handleDefend() {
  if (!canBattleAction()) return;
  clearIncomingAttacks();
  if (!gameState.player.state.includes('방어')) gameState.player.state.push('방어');
  addLog('방어 태세를 취했습니다. 다음 적 공격 피해가 감소합니다.');
  renderStatus();
  renderMap();
  enemyTurn();
}

function movePlayer(dx, dy) {
  if (!canBattleAction()) return;
  clearIncomingAttacks();

  const nx = gameState.player.position.x + dx;
  const ny = gameState.player.position.y + dy;

  if (nx < 0 || nx >= MAP_SIZE || ny < 0 || ny >= MAP_SIZE) {
    addLog('맵 밖으로는 이동할 수 없습니다. 행동이 소모됩니다.');
    renderMap();
    enemyTurn();
    return;
  }

  const targetTile = gameState.map.tiles[ny][nx];
  if (targetTile.blocked) {
    addLog('막힌 지형이라 이동할 수 없습니다. 행동이 소모됩니다.');
    renderMap();
    enemyTurn();
    return;
  }

  if (nx === gameState.enemy.position.x && ny === gameState.enemy.position.y && gameState.enemy.hp > 0) {
    addLog('적이 있는 칸으로는 이동할 수 없습니다. 행동이 소모됩니다.');
    renderMap();
    enemyTurn();
    return;
  }

  gameState.player.position = { x: nx, y: ny };
  const dirLabel = dx === 1 ? '오른쪽' : dx === -1 ? '왼쪽' : dy === 1 ? '아래쪽' : '위쪽';
  addLog(`플레이어가 ${dirLabel}으로 이동했습니다.`);
  renderStatus();
  renderMap();
  enemyTurn();
}

function handleMove() {
  if (!canBattleAction()) return;
  clearIncomingAttacks();
  const step = findBestStepToward(gameState.player.position, gameState.enemy.position);
  if (!step) {
    addLog('이동할 수 있는 칸이 없습니다. 행동이 소모됩니다.');
  } else {
    gameState.player.position = step;
    addLog(`플레이어가 (${step.x}, ${step.y})로 접근했습니다.`);
  }
  renderStatus();
  renderMap();
  enemyTurn();
}

function handleMagic() {
  if (!canBattleAction()) return;
  if (gameState.player.spells.length < 1) {
    hideBattleOptionPanel();
    addLog('보유 마법이 없습니다.');
    return;
  }
  renderBattleOptionPanel('spell');
}

function resolveBattleActionAfterPlayerEffect() {
  renderStatus();
  renderMap();
  if (gameState.enemy.hp <= 0) {
    clearFloor();
    renderStatus();
    return;
  }
  enemyTurn();
}

function useSkill(index) {
  ensureStateShape();
  if (gameState.phase !== 'BATTLE') return;
  const skill = gameState.player.skills[index];
  if (!skill) return addLog('선택한 스킬을 사용할 수 없습니다.');
  if (gameState.player.mp < skill.mpCost) return addLog('MP가 부족해 스킬을 사용할 수 없습니다.');

  const distance = getDistance(gameState.player.position, gameState.enemy.position);
  if ((skill.type === 'POWER_STRIKE' || skill.type === 'QUICK_SLASH') && distance > 1) return addLog(`${skill.label}는 거리 1 이하에서만 사용할 수 있습니다.`);

  hideBattleOptionPanel();
  clearIncomingAttacks();
  gameState.player.mp -= skill.mpCost;
  addLog(`[스킬] ${skill.label}를 사용했습니다. MP -${skill.mpCost}`);

  if (skill.type === 'FOCUSED_GUARD') {
    if (!gameState.player.state.includes('집중 방어')) gameState.player.state.push('집중 방어');
    addLog('[결과] 집중 방어 태세를 취했습니다. 다음 적 공격 피해가 1로 줄어듭니다.');
    resolveBattleActionAfterPlayerEffect();
    return;
  }

  if (skill.type === 'TACTICAL_OBSERVE') {
    addLog(`[관찰] 적: ${gameState.enemy.name} / HP ${gameState.enemy.hp}/${gameState.enemy.maxHp} / 상태 ${gameState.enemy.state.join(', ') || '없음'} / 위치 (${gameState.enemy.position.x}, ${gameState.enemy.position.y})`);
    addLog(`[관찰] 플레이어와 적 거리: ${distance}`);
    addLog(`[관찰] 현재 위험 타일 수: ${countDangerTiles()}`);
    if (markIncomingAttackFromEnemy()) addLog('[관찰] 다음 적 공격 예고 타일을 표시했습니다.');
    renderStatus();
    renderMap();
    enemyTurn();
    return;
  }

  const contestMap = {
    POWER_STRIKE: { playerStat: '힘', enemyStat: '체력' },
    QUICK_SLASH: { playerStat: '민첩', enemyStat: '민첩' },
    MANA_BOLT: { playerStat: '지능', enemyStat: '지혜' },
  };
  const contest = contestMap[skill.type];
  if (!contest) return addLog('아직 사용할 수 없는 스킬입니다.');

  const playerRoll = rollDice(gameState.player.stats[contest.playerStat]);
  const enemyRoll = rollDice(gameState.enemy.stats[contest.enemyStat]);
  addLog(`[판정] 플레이어 ${contest.playerStat} ${gameState.player.stats[contest.playerStat]} → 1d${gameState.player.stats[contest.playerStat]} = ${playerRoll} / 적 ${contest.enemyStat} ${gameState.enemy.stats[contest.enemyStat]} → 1d${gameState.enemy.stats[contest.enemyStat]} = ${enemyRoll}`);

  if (playerRoll > enemyRoll) {
    gameState.enemy.hp = Math.max(0, gameState.enemy.hp - skill.damage);
    addLog(`[결과] ${skill.label} 성공. 적 HP -${skill.damage}`);
  } else {
    addLog(`[결과] ${skill.label} 실패. 피해 없음`);
  }

  resolveBattleActionAfterPlayerEffect();
}

function pushEnemyState(stateName) {
  if (!gameState.enemy.state.includes(stateName)) gameState.enemy.state.push(stateName);
}

function useSpell(spellName) {
  ensureStateShape();
  if (gameState.phase !== 'BATTLE') return;
  if (!gameState.player.spells.includes(spellName)) return addLog('보유하지 않은 마법은 사용할 수 없습니다.');

  const spellCosts = { 라이트: 1, 파이어: 3, 아이스: 3, 윈드: 2, '매직 애로우': 2, 그리스: 2, 디그: 2, 다크니스: 3 };
  const mpCost = spellCosts[spellName];
  if (!mpCost) return addLog('알 수 없는 마법입니다.');
  if (gameState.player.mp < mpCost) return addLog('MP가 부족해 마법을 사용할 수 없습니다.');

  hideBattleOptionPanel();
  clearIncomingAttacks();
  gameState.player.mp -= mpCost;
  addLog(`[마법] ${spellName}을 사용했습니다. MP -${mpCost}`);

  const enemyPos = gameState.enemy.position;
  if (spellName === '라이트') {
    addLog(`[마법] 적: ${gameState.enemy.name} / HP ${gameState.enemy.hp}/${gameState.enemy.maxHp} / 상태 ${gameState.enemy.state.join(', ') || '없음'} / 위치 (${enemyPos.x}, ${enemyPos.y})`);
    addLog(`[마법] 주변 위험 타일 수: ${countDangerTiles()}`);
    if (markIncomingAttackFromEnemy()) addLog('[마법] 적의 다음 공격 예고 타일을 표시했습니다.');
  }

  if (spellName === '파이어') {
    const targets = [enemyPos, { x: enemyPos.x + 1, y: enemyPos.y }, { x: enemyPos.x - 1, y: enemyPos.y }, { x: enemyPos.x, y: enemyPos.y + 1 }, { x: enemyPos.x, y: enemyPos.y - 1 }];
    targets.forEach((pos) => {
      if (pos.x >= 0 && pos.x < MAP_SIZE && pos.y >= 0 && pos.y < MAP_SIZE) {
        gameState.map.tiles[pos.y][pos.x].fire = true;
        gameState.map.tiles[pos.y][pos.x].magicEffect = 'fire';
      }
    });
    gameState.enemy.hp = Math.max(0, gameState.enemy.hp - 3);
    addLog('[결과] 적 주변에 불길이 번졌습니다. 적 HP -3');
  }

  if (spellName === '아이스') {
    pushEnemyState('빙결');
    addLog('[결과] 적이 빙결 상태가 되어 다음 이동을 할 수 없습니다.');
  }

  if (spellName === '윈드') {
    const rawDx = gameState.enemy.position.x - gameState.player.position.x;
    const rawDy = gameState.enemy.position.y - gameState.player.position.y;
    const pushDx = Math.abs(rawDx) >= Math.abs(rawDy) ? Math.sign(rawDx) : 0;
    const pushDy = Math.abs(rawDy) > Math.abs(rawDx) ? Math.sign(rawDy) : 0;
    const pushTarget = { x: gameState.enemy.position.x + pushDx, y: gameState.enemy.position.y + pushDy };
    if (pushTarget.x >= 0 && pushTarget.x < MAP_SIZE && pushTarget.y >= 0 && pushTarget.y < MAP_SIZE && !gameState.map.tiles[pushTarget.y][pushTarget.x].blocked) {
      gameState.enemy.position = pushTarget;
      addLog(`[결과] 적이 (${pushTarget.x}, ${pushTarget.y})로 밀려났습니다.`);
    } else {
      addLog('[결과] 적을 밀어낼 수 없었습니다.');
    }
    gameState.enemy.hp = Math.max(0, gameState.enemy.hp - 1);
    addLog('[결과] 바람 피해. 적 HP -1');
  }

  if (spellName === '매직 애로우') {
    const playerRoll = rollDice(gameState.player.stats.지능);
    const enemyRoll = rollDice(gameState.enemy.stats.지혜);
    addLog(`[판정] 플레이어 지능 ${gameState.player.stats.지능} → 1d${gameState.player.stats.지능} = ${playerRoll} / 적 지혜 ${gameState.enemy.stats.지혜} → 1d${gameState.enemy.stats.지혜} = ${enemyRoll}`);
    if (playerRoll > enemyRoll) {
      gameState.enemy.hp = Math.max(0, gameState.enemy.hp - 5);
      addLog('[결과] 매직 애로우 성공. 적 HP -5');
    } else {
      addLog('[결과] 매직 애로우 실패. 피해 없음');
    }
  }

  if (spellName === '그리스') {
    const tile = gameState.map.tiles[enemyPos.y][enemyPos.x];
    tile.magicEffect = 'grease';
    pushEnemyState('미끄러짐');
    addLog('[결과] 적 위치에 기름을 깔았습니다. 적은 다음 이동 전 미끄러짐 판정을 합니다.');
  }

  if (spellName === '디그') {
    const betweenDx = Math.abs(gameState.player.position.x - enemyPos.x) >= Math.abs(gameState.player.position.y - enemyPos.y) ? Math.sign(gameState.player.position.x - enemyPos.x) : 0;
    const betweenDy = Math.abs(gameState.player.position.y - enemyPos.y) > Math.abs(gameState.player.position.x - enemyPos.x) ? Math.sign(gameState.player.position.y - enemyPos.y) : 0;
    const candidates = [
      { x: enemyPos.x + betweenDx, y: enemyPos.y + betweenDy },
      { x: enemyPos.x + 1, y: enemyPos.y },
      { x: enemyPos.x - 1, y: enemyPos.y },
      { x: enemyPos.x, y: enemyPos.y + 1 },
      { x: enemyPos.x, y: enemyPos.y - 1 },
    ];
    const target = candidates.find((pos) => pos.x >= 0 && pos.x < MAP_SIZE && pos.y >= 0 && pos.y < MAP_SIZE && !(pos.x === enemyPos.x && pos.y === enemyPos.y) && !(pos.x === gameState.player.position.x && pos.y === gameState.player.position.y));
    if (target) {
      const tile = gameState.map.tiles[target.y][target.x];
      tile.terrain = 'broken';
      tile.durability = 0;
      tile.blocked = true;
      addLog(`[결과] (${target.x}, ${target.y}) 지형을 파괴했습니다.`);
    } else {
      addLog('[결과] 파괴할 수 있는 지형이 없습니다.');
    }
  }

  if (spellName === '다크니스') {
    pushEnemyState('암흑');
    addLog('[결과] 적이 암흑 상태가 되어 다음 공격 명중 능력이 약화됩니다.');
  }

  resolveBattleActionAfterPlayerEffect();
}

function selectReward(index) {
  ensureStateShape();
  if (gameState.phase !== 'REWARD_SELECT') {
    addLog('현재 단계에서는 보상을 선택할 수 없습니다.');
    return;
  }
  if (gameState.reward.selected) {
    addLog('이미 보상을 선택했습니다.');
    return;
  }

  const selected = gameState.reward.options[index];
  if (!selected) {
    addLog('유효하지 않은 보상 선택입니다.');
    return;
  }

  gameState.reward.selected = selected;
  if (selected.type === 'COIN_PLUS_1') gameState.player.coin += 1;
  if (selected.type === 'COIN_PLUS_2') gameState.player.coin += 2;
  if (selected.type === 'SKILL_RESET_TICKET') gameState.player.inventory.skillResetTicket += 1;
  if (selected.type === 'MARTIAL_BOOK') gameState.player.inventory.martialBook += 1;
  if (selected.type === 'MAGIC_BOOK') gameState.player.inventory.magicBook += 1;

  gameState.phase = 'IMAGINATION_STAT';
  addLog(`보상 선택: ${selected.label}`);
  addLog('다음 단계: 심상세계 2단계 - 스탯 분배');
  renderStatus();
  renderRewardOptions();
  renderStatPanel();
  renderSkillPanel();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}


function recalculateDerivedStats(changedStatName) {
  const refillHp = changedStatName === '체력';
  const refillMp = changedStatName === '지능';
  recalculateDerivedStatsForState(gameState);
  if (refillHp) gameState.player.hp = gameState.player.maxHp;
  if (refillMp) gameState.player.mp = gameState.player.maxMp;
}

function increaseStatBy(statName, amount) {
  if (gameState.phase !== 'INITIAL_STAT' && gameState.phase !== 'IMAGINATION_STAT') return;
  if (gameState.player.statPoints < amount) {
    addLog('스탯 포인트가 부족합니다.');
    return;
  }

  const levelCap = gameState.phase === 'INITIAL_STAT' ? 21 : (gameState.player.level >= 80 ? 100 : gameState.player.level + 20);
  if (gameState.player.stats[statName] + amount > levelCap) {
    addLog('현재 레벨 기준 최대치를 넘길 수 없습니다.');
    return;
  }

  gameState.player.stats[statName] += amount;
  gameState.player.statPoints -= amount;
  if (statName === '체력' || statName === '지능' || statName === '지혜') recalculateDerivedStats(statName);
  if (statName === '지혜') addLog('지혜 효과는 추후 시스템에서 사용될 예정입니다.');
  addLog(`${statName}이 ${amount} 증가했습니다.`);
  renderStatus();
  renderStatPanel();
}

function increaseStat(statName) {
  increaseStatBy(statName, 1);
}

function applyRecommendedStats() {
  if (gameState.phase !== 'INITIAL_STAT') return;
  gameState.player.stats = { 힘: 10, 민첩: 10, 체력: 10, 지능: 8, 지혜: 8, 외모: 8 };
  gameState.player.statPoints = 0;
  recalculateDerivedStatsForState(gameState, { refillHpMp: true });
  addLog('추천 스탯 분배를 적용했습니다.');
  renderStatus();
  renderStatPanel();
}

function tryMagicBookAttempt(isExtra) {
  if (gameState.phase !== 'IMAGINATION_MAGIC_BOOK') return;
  if (isExtra && !gameState.magicBookPhase.baseAttemptUsed) return addLog('기본 시도를 먼저 사용해야 합니다.');
  if (gameState.player.inventory.magicBook < 1) return addLog('보유 마법서가 없습니다.');
  if (!isExtra && gameState.magicBookPhase.baseAttemptUsed) return addLog('기본 습득 시도는 이미 사용했습니다.');

  if (isExtra) {
    if (gameState.player.coin < 1) return addLog('코인이 부족해 추가 시도를 할 수 없습니다.');
    gameState.player.coin -= 1;
    gameState.magicBookPhase.extraAttempts += 1;
  } else {
    gameState.magicBookPhase.baseAttemptUsed = true;
  }

  const success = gameState.player.stats.지혜 >= 50 || rollDice(50) < gameState.player.stats.지혜;
  if (success) {
    const unlearned = MAGIC_POOL_1.filter((spell) => !gameState.player.spells.includes(spell));
    if (unlearned.length < 1) {
      gameState.magicBookPhase.lastResult = '실패: 배울 수 있는 새 마법 없음';
      addLog('마법서 습득 실패: 배울 수 있는 새 마법이 없습니다.');
    } else {
      const spell = unlearned[Math.floor(Math.random() * unlearned.length)];
      gameState.player.spells.push(spell);
      gameState.player.inventory.magicBook -= 1;
      gameState.magicBookPhase.lastResult = `성공: ${spell}`;
      addLog(`마법서 습득 성공: ${spell}을 배웠습니다.`);
    }
  } else {
    gameState.magicBookPhase.lastResult = '실패: 마법서 유지';
    addLog('마법서 습득 실패: 마법서는 사라지지 않습니다.');
  }
  renderStatus();
  renderMagicBookPanel();
}

function getShopItemCount(type) {
  const inventory = gameState.player.inventory;
  if (type === 'SELL_MAGIC_BOOK') return inventory.magicBook;
  if (type === 'SELL_MARTIAL_BOOK') return inventory.martialBook;
  if (type === 'SELL_SKILL_RESET_TICKET') return inventory.skillResetTicket;
  return 0;
}

function addShopLog(message) {
  gameState.shop.log.unshift(message);
  if (gameState.shop.log.length > 20) gameState.shop.log.pop();
  addLog(message);
}

function buyShopItem(type) {
  ensureStateShape();
  if (gameState.phase !== 'IMAGINATION_SHOP') return;
  const item = SHOP_ITEMS.buy[type];
  if (!item) return;

  if (gameState.player.coin < item.price) {
    addShopLog('코인이 부족합니다.');
    return;
  }

  gameState.player.coin -= item.price;
  if (type === 'REWARD_REROLL') gameState.player.inventory.rewardRerollTicket += 1;
  if (type === 'BASIC_MAGIC_BOOK') gameState.player.inventory.magicBook += 1;
  if (type === 'MARTIAL_BOOK') gameState.player.inventory.martialBook += 1;
  if (type === 'SKILL_RESET_TICKET') gameState.player.inventory.skillResetTicket += 1;

  addShopLog(`구매 완료: ${item.label}`);
  renderStatus();
  renderShopPanel();
}

function sellShopItem(type) {
  ensureStateShape();
  if (gameState.phase !== 'IMAGINATION_SHOP') return;
  const item = SHOP_ITEMS.sell[type];
  if (!item) return;

  if (getShopItemCount(type) < 1) {
    addShopLog('판매할 아이템이 없습니다.');
    return;
  }

  if (type === 'SELL_MAGIC_BOOK') gameState.player.inventory.magicBook -= 1;
  if (type === 'SELL_MARTIAL_BOOK') gameState.player.inventory.martialBook -= 1;
  if (type === 'SELL_SKILL_RESET_TICKET') gameState.player.inventory.skillResetTicket -= 1;
  gameState.player.coin += item.price;

  addShopLog(`판매 완료: ${item.label}`);
  renderStatus();
  renderShopPanel();
}

function finishShopPhase() {
  ensureStateShape();
  if (gameState.phase !== 'IMAGINATION_SHOP') return;
  gameState.phase = 'NEXT_FLOOR_CONFIRM';
  gameState.nextFloorConfirm.ready = true;
  addShopLog('상점 이용을 마쳤습니다.');
  addShopLog('다음 단계: 다음 층 진입 여부 선택');
  renderStatus();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}

function enterNextFloor() {
  ensureStateShape();
  hideBattleOptionPanel();
  if (gameState.phase !== 'NEXT_FLOOR_CONFIRM') return;

  gameState.floor += 1;
  gameState.turn = 1;
  gameState.enemy = createEnemyForFloor(gameState.floor);
  gameState.map = createInitialMap();
  gameState.player.position = { x: 3, y: 5 };
  gameState.player.hp = gameState.player.maxHp;
  gameState.player.mp = gameState.player.maxMp;
  gameState.player.state = [];
  gameState.reward = { options: [], selected: null, rerolled: false };
  gameState.skill = { options: [], selected: null, skipped: false };
  gameState.magicBookPhase = { baseAttemptUsed: false, extraAttempts: 0, lastResult: null };
  gameState.nextFloorConfirm.ready = false;
  gameState.phase = 'BATTLE';

  addLog(`${gameState.floor}층에 진입했습니다.`);
  addLog('새로운 적 1명이 나타났습니다.');
  renderStatus();
  renderRewardOptions();
  renderStatPanel();
  renderSkillPanel();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}

function decreaseStat(statName) {
  if (gameState.phase !== 'INITIAL_STAT') return;
  if (gameState.player.stats[statName] <= 1) {
    addLog('초기 스탯은 1 미만으로 낮출 수 없습니다.');
    return;
  }

  gameState.player.stats[statName] -= 1;
  gameState.player.statPoints += 1;
  if (statName === '체력' || statName === '지능') recalculateDerivedStats(statName);
  addLog(`${statName}이 1 감소했습니다.`);
  renderStatus();
  renderStatPanel();
}

function finishStatDistribution() {
  if (gameState.phase === 'INITIAL_STAT') {
    if (gameState.player.statPoints !== 0) {
      addLog('초기 스탯 포인트를 모두 분배해야 합니다.');
      return;
    }

    recalculateDerivedStatsForState(gameState, { refillHpMp: true });
    gameState.phase = 'BATTLE';
    addLog('초기 스탯 분배가 완료되었습니다.');
    addLog('1층 전투를 시작합니다.');
    renderStatus();
    renderStatPanel();
    renderRewardOptions();
    renderSkillPanel();
    renderMagicBookPanel();
    renderShopPanel();
    renderNextFloorPanel();
    renderMap();
    return;
  }

  if (gameState.phase !== 'IMAGINATION_STAT') return;
  gameState.phase = 'IMAGINATION_SKILL';
  gameState.magicBookPhase = { baseAttemptUsed: false, extraAttempts: 0, lastResult: null };
  addLog('스탯 분배를 마쳤습니다.');
  addLog('다음 단계: 심상세계 3단계 - 스킬 생성');
  enterSkillPhase();
  renderStatus();
  renderStatPanel();
  renderRewardOptions();
  renderSkillPanel();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
  renderMap();
}

function handleObserve() {
  if (gameState.phase === 'INITIAL_STAT') {
    addLog('초기 스탯 분배 중입니다.');
    return;
  }

  const enemy = gameState.enemy;
  const distance = getDistance(gameState.player.position, enemy.position);
  let dangerTiles = 0;
  for (let y = 0; y < gameState.map.size; y += 1) {
    for (let x = 0; x < gameState.map.size; x += 1) {
      const tile = gameState.map.tiles[y][x];
      if (tile.fire || tile.incomingAttack || tile.brand || tile.terrain === 'broken') dangerTiles += 1;
    }
  }
  addLog(`[관찰] 적: ${enemy.name} / HP ${enemy.hp}/${enemy.maxHp} / 상태 ${enemy.state.join(', ') || '없음'} / 위치 (${enemy.position.x}, ${enemy.position.y})`);
  addLog(`[관찰] 적 스탯: 힘 ${enemy.stats.힘}, 민첩 ${enemy.stats.민첩}, 체력 ${enemy.stats.체력}, 지능 ${enemy.stats.지능}, 지혜 ${enemy.stats.지혜}, 외모 ${enemy.stats.외모}`);
  addLog(`[관찰] 플레이어와 적 거리: ${distance}`);
  addLog(`[관찰] 현재 위험 타일 수: ${dangerTiles}`);
}

function handleAction(action) {
  if (action === 'attack') handleAttack();
  if (action === 'defend') handleDefend();
  if (action === 'move') handleMove();
  if (action === 'move-up') movePlayer(0, -1);
  if (action === 'move-down') movePlayer(0, 1);
  if (action === 'move-left') movePlayer(-1, 0);
  if (action === 'move-right') movePlayer(1, 0);
  if (action === 'skill') renderBattleOptionPanel('skill');
  if (action === 'magic') handleMagic();
  if (action === 'observe') handleObserve();
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  addLog('저장 완료: 현재 상태를 로컬에 저장했습니다.');
}

function loadGame() {
  hideBattleOptionPanel();
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) {
    addLog('불러오기 실패: 저장된 데이터가 없습니다.');
    return;
  }

  try {
    gameState = JSON.parse(saved);
    ensureStateShape();
    renderStatus();
    renderMap();
    renderRewardOptions();
    renderStatPanel();
    renderSkillPanel();
    renderMagicBookPanel();
    renderShopPanel();
    renderNextFloorPanel();
    addLog('불러오기 완료: 저장된 상태를 적용했습니다.');
  } catch (error) {
    addLog('불러오기 실패: 저장 데이터가 손상되었습니다.');
  }
}

function resetGame() {
  hideBattleOptionPanel();
  gameState = createInitialGameState();
  localStorage.removeItem(SAVE_KEY);
  logElement.innerHTML = '';
  addLog('새 게임을 시작합니다.');
  addLog('초기 스탯 총합 54가 되도록 스탯 포인트 48을 모두 분배하세요.');
  addLog('분배 완료 후 1층 전투가 시작됩니다.');
  renderStatus();
  renderMap();
  renderRewardOptions();
  renderStatPanel();
  renderSkillPanel();
  renderMagicBookPanel();
  renderShopPanel();
  renderNextFloorPanel();
}


function bindActions() {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => handleAction(button.dataset.action));
  });
  newGameButton.addEventListener('click', resetGame);
  saveButton.addEventListener('click', saveGame);
  loadButton.addEventListener('click', loadGame);
  rerollRewardButton.addEventListener('click', rerollRewards);
  finishStatButton.addEventListener('click', finishStatDistribution);
  recommendedStatButton.addEventListener('click', applyRecommendedStats);
  tryMagicBookButton.addEventListener('click', () => tryMagicBookAttempt(false));
  extraMagicBookButton.addEventListener('click', () => tryMagicBookAttempt(true));
  finishMagicBookButton.addEventListener('click', finishMagicBookPhase);
  finishShopButton.addEventListener('click', finishShopPhase);
  enterNextFloorButton.addEventListener('click', enterNextFloor);
  closeBattleOptionButton.addEventListener('click', hideBattleOptionPanel);
}

function init() {
  bindActions();
  resetGame();
}

init();
