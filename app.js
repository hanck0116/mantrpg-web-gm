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
  return { skillResetTicket: 0, martialBook: 0, magicBook: 0 };
}

function createInitialGameState() {
  return {
    phase: 'BATTLE',
    floor: 1,
    turn: 1,
    player: {
      name: '하르벤',
      level: 1,
      hp: 30,
      maxHp: 30,
      mp: 12,
      maxMp: 12,
      coin: 0,
      position: { x: 3, y: 5 },
      stats: { 힘: 10, 민첩: 10, 체력: 10, 지능: 8, 지혜: 8, 외모: 8 },
      state: [],
      inventory: createInitialInventory(),
      statPoints: 0,
      skills: [],
    },
    enemy: {
      name: '그림자 도적',
      hp: 20,
      maxHp: 20,
      position: { x: 3, y: 1 },
      stats: { 힘: 8, 민첩: 8, 체력: 8, 지능: 4, 지혜: 4, 외모: 4 },
      state: ['대기'],
    },
    map: createInitialMap(),
    reward: { options: [], selected: null, rerolled: false },
    skill: { options: [], selected: null, skipped: false },
  };
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
const statPanelPointsElement = document.getElementById('stat-panel-points');
const statControlsElement = document.getElementById('stat-controls');
const finishStatButton = document.getElementById('finish-stat-button');
const skillPanel = document.getElementById('skill-panel');
const skillPanelDescElement = document.getElementById('skill-panel-desc');
const skillOptionsElement = document.getElementById('skill-options');

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

function ensureStateShape() {
  if (!gameState.player.inventory) gameState.player.inventory = createInitialInventory();
  if (typeof gameState.player.statPoints !== 'number') gameState.player.statPoints = 0;
  if (!gameState.reward) gameState.reward = { options: [], selected: null, rerolled: false };
  if (!Array.isArray(gameState.reward.options)) gameState.reward.options = [];
  if (typeof gameState.reward.rerolled !== 'boolean') gameState.reward.rerolled = false;
  if (!Array.isArray(gameState.player.skills)) gameState.player.skills = [];
  if (!gameState.skill) gameState.skill = { options: [], selected: null, skipped: false };
  if (!Array.isArray(gameState.skill.options)) gameState.skill.options = [];
  if (typeof gameState.skill.skipped !== 'boolean') gameState.skill.skipped = false;
}

function renderStatus() {
  ensureStateShape();
  document.getElementById('player-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
  document.getElementById('player-mp').textContent = `${gameState.player.mp}/${gameState.player.maxMp}`;
  document.getElementById('player-coin').textContent = String(gameState.player.coin);
  document.getElementById('player-level').textContent = String(gameState.player.level);
  document.getElementById('inv-skill-reset').textContent = String(gameState.player.inventory.skillResetTicket);
  document.getElementById('inv-martial-book').textContent = String(gameState.player.inventory.martialBook);
  document.getElementById('inv-magic-book').textContent = String(gameState.player.inventory.magicBook);
  document.getElementById('enemy-name').textContent = gameState.enemy.name;
  document.getElementById('enemy-hp').textContent = `${gameState.enemy.hp}/${gameState.enemy.maxHp}`;
  document.getElementById('enemy-state').textContent = gameState.enemy.state.join(', ') || '없음';
  document.getElementById('game-floor').textContent = String(gameState.floor);
  document.getElementById('game-turn').textContent = String(gameState.turn);
  document.getElementById('game-phase').textContent = gameState.phase;
  document.getElementById('player-stat-points').textContent = String(gameState.player.statPoints);
  document.getElementById('player-skill-count').textContent = String(gameState.player.skills.length);
}

function getTileLabel(tile, x, y) {
  if (gameState.player.position.x === x && gameState.player.position.y === y) return '나';
  if (gameState.enemy.position.x === x && gameState.enemy.position.y === y && gameState.enemy.hp > 0) return '적';
  if (tile.incomingAttack) return '↓';
  if (tile.fire) return '불';
  if (tile.brand) return '낙';
  if (tile.terrain === 'broken') return '파';
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
      if (gameState.player.position.x === x && gameState.player.position.y === y) tile.classList.add('player');
      if (gameState.enemy.position.x === x && gameState.enemy.position.y === y && gameState.enemy.hp > 0) tile.classList.add('enemy');
      tile.textContent = getTileLabel(tileState, x, y);
      tile.addEventListener('click', () => describeTile(x, y));
      mapElement.appendChild(tile);
    }
  }
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
  if (gameState.phase !== 'IMAGINATION_STAT') {
    statPanel.hidden = true;
    statControlsElement.innerHTML = '';
    return;
  }

  statPanel.hidden = false;
  statPanelPointsElement.textContent = String(gameState.player.statPoints);
  statControlsElement.innerHTML = '';
  ['힘', '민첩', '체력', '지능', '지혜', '외모'].forEach((statName) => {
    const row = document.createElement('div');
    row.className = 'stat-row';

    const label = document.createElement('span');
    label.textContent = statName;

    const value = document.createElement('strong');
    value.textContent = String(gameState.player.stats[statName]);

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '+';
    button.addEventListener('click', () => increaseStat(statName));

    row.append(label, value, button);
    statControlsElement.appendChild(row);
  });
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
    renderMap();
    return;
  }

  gameState.skill.options = pickRandomSkillOptions(3);
  gameState.skill.selected = null;
  gameState.skill.skipped = false;
  addLog('스킬 후보 3개 중 하나를 선택하세요.');
  renderSkillPanel();
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
  if (gameState.player.coin < 1) {
    addLog('코인이 부족해 리롤할 수 없습니다.');
    return;
  }

  gameState.player.coin -= 1;
  gameState.reward.options = [weightedPick(REWARD_TABLE), weightedPick(REWARD_TABLE)];
  gameState.reward.rerolled = true;
  addLog('코인 1개를 사용해 보상 후보를 다시 생성했습니다.');
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
  const enemyStr = rollDice(gameState.enemy.stats.힘);
  const playerAgi = rollDice(gameState.player.stats.민첩);
  addLog(`[판정] 적 힘 ${gameState.enemy.stats.힘} → 1d${gameState.enemy.stats.힘} = ${enemyStr} / 플레이어 민첩 ${gameState.player.stats.민첩} → 1d${gameState.player.stats.민첩} = ${playerAgi}`);

  if (enemyStr > playerAgi) {
    let damage = 4;
    const defenseIndex = gameState.player.state.indexOf('방어');
    if (defenseIndex >= 0) {
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
    addLog('패배: 플레이어 HP가 0이 되어 게임 오버입니다.');
  }
}

function enemyTurn() {
  if (gameState.phase !== 'BATTLE') return;
  clearIncomingAttacks();

  const enemyPos = gameState.enemy.position;
  const enemyTile = gameState.map.tiles[enemyPos.y][enemyPos.x];

  if (enemyTile.fire) {
    const safeStep = findSafeAdjacentStep(enemyPos);
    if (safeStep) {
      gameState.enemy.position = safeStep;
      addLog(`[적 행동] ${gameState.enemy.name}이 불길을 피해 이동했습니다.`);
    }
  }

  const distance = getDistance(gameState.enemy.position, gameState.player.position);
  if (distance <= 1) {
    enemyAttack();
  } else {
    const step = findBestStepToward(gameState.enemy.position, gameState.player.position);
    if (step) {
      gameState.enemy.position = step;
      addLog(`[적 행동] ${gameState.enemy.name}이 플레이어에게 접근했습니다.`);
    }

    if (getDistance(gameState.enemy.position, gameState.player.position) <= 1) {
      const dx = gameState.player.position.x - gameState.enemy.position.x;
      const dy = gameState.player.position.y - gameState.enemy.position.y;
      const attackTile = { x: gameState.enemy.position.x + Math.sign(dx), y: gameState.enemy.position.y + Math.sign(dy) };
      if (attackTile.x >= 0 && attackTile.x < MAP_SIZE && attackTile.y >= 0 && attackTile.y < MAP_SIZE) {
        gameState.map.tiles[attackTile.y][attackTile.x].incomingAttack = true;
        addLog('[적 행동] 다음 턴 공격이 예고되었습니다.');
      }
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
  clearIncomingAttacks();
  if (gameState.player.mp < 3) {
    addLog('MP가 부족해 파이어를 사용할 수 없습니다.');
    return;
  }

  gameState.player.mp -= 3;
  addLog('파이어를 사용했습니다. MP -3');
  const { x, y } = gameState.enemy.position;
  const targets = [{ x, y }, { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];
  targets.forEach((pos) => {
    if (pos.x >= 0 && pos.x < MAP_SIZE && pos.y >= 0 && pos.y < MAP_SIZE) {
      gameState.map.tiles[pos.y][pos.x].fire = true;
      gameState.map.tiles[pos.y][pos.x].magicEffect = 'fire';
    }
  });

  gameState.enemy.hp = Math.max(0, gameState.enemy.hp - 3);
  addLog('적 주변에 불길이 번졌습니다. 적 HP -3');

  renderStatus();
  renderMap();
  if (gameState.enemy.hp <= 0) {
    clearFloor();
    renderStatus();
    return;
  }
  enemyTurn();
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
  renderMap();
}


function recalculateDerivedStats(changedStatName) {
  const newMaxHp = 20 + gameState.player.stats.체력;
  const newMaxMp = 4 + gameState.player.stats.지능;

  gameState.player.maxHp = newMaxHp;
  gameState.player.maxMp = newMaxMp;

  if (changedStatName === '체력') gameState.player.hp = gameState.player.maxHp;
  if (changedStatName === '지능') gameState.player.mp = gameState.player.maxMp;

  if (gameState.player.hp > gameState.player.maxHp) gameState.player.hp = gameState.player.maxHp;
  if (gameState.player.mp > gameState.player.maxMp) gameState.player.mp = gameState.player.maxMp;
}

function increaseStat(statName) {
  if (gameState.phase !== 'IMAGINATION_STAT') return;
  if (gameState.player.statPoints < 1) {
    addLog('스탯 포인트가 부족합니다.');
    return;
  }

  const levelCap = gameState.player.level >= 80 ? 100 : gameState.player.level + 20;
  if (gameState.player.stats[statName] >= levelCap) {
    addLog('현재 레벨 기준 최대치를 넘길 수 없습니다.');
    return;
  }

  gameState.player.stats[statName] += 1;
  gameState.player.statPoints -= 1;
  if (statName === '체력' || statName === '지능' || statName === '지혜') recalculateDerivedStats(statName);
  if (statName === '지혜') addLog('지혜 효과는 추후 시스템에서 사용될 예정입니다.');
  addLog(`${statName}이 1 증가했습니다.`);
  renderStatus();
  renderStatPanel();
}

function finishStatDistribution() {
  if (gameState.phase !== 'IMAGINATION_STAT') return;
  gameState.phase = 'IMAGINATION_SKILL';
  addLog('스탯 분배를 마쳤습니다.');
  addLog('다음 단계: 심상세계 3단계 - 스킬 생성');
  enterSkillPhase();
  renderStatus();
  renderStatPanel();
  renderRewardOptions();
  renderSkillPanel();
  renderMap();
}

function handleObserve() {
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
  if (action === 'magic') handleMagic();
  if (action === 'observe') handleObserve();
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  addLog('저장 완료: 현재 상태를 로컬에 저장했습니다.');
}

function loadGame() {
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
    addLog('불러오기 완료: 저장된 상태를 적용했습니다.');
  } catch (error) {
    addLog('불러오기 실패: 저장 데이터가 손상되었습니다.');
  }
}

function resetGame() {
  gameState = createInitialGameState();
  localStorage.removeItem(SAVE_KEY);
  logElement.innerHTML = '';
  addLog('전투 시작: 적 1명과 조우했습니다.');
  addLog('현재 버전: 전투 턴과 주사위 엔진 구현 단계입니다.');
  renderStatus();
  renderMap();
  renderRewardOptions();
  renderStatPanel();
  renderSkillPanel();
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
}

function init() {
  bindActions();
  resetGame();
}

init();
