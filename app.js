const MAP_SIZE = 7;
const SAVE_KEY = 'mantrpg-web-gm-save';

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
    for (let x = 0; x < MAP_SIZE; x += 1) {
      row.push(createBaseTile(x, y));
    }
    tiles.push(row);
  }

  tiles[4][4].terrain = 'broken';
  tiles[4][4].durability = 0;
  tiles[4][4].blocked = true;

  return {
    size: MAP_SIZE,
    tiles,
  };
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
      stats: {
        힘: 10,
        민첩: 10,
        체력: 10,
        지능: 8,
        지혜: 8,
        외모: 8,
      },
      state: [],
    },
    enemy: {
      name: '그림자 도적',
      hp: 20,
      maxHp: 20,
      position: { x: 3, y: 1 },
      stats: {
        힘: 8,
        민첩: 8,
        체력: 8,
        지능: 4,
        지혜: 4,
        외모: 4,
      },
      state: ['대기'],
    },
    map: createInitialMap(),
  };
}

let gameState = createInitialGameState();

const mapElement = document.getElementById('tactical-map');
const logElement = document.getElementById('combat-log');
const actionButtons = document.querySelectorAll('[data-action]');
const newGameButton = document.getElementById('new-game-button');
const saveButton = document.getElementById('save-game-button');
const loadButton = document.getElementById('load-game-button');

function addLog(message) {
  const li = document.createElement('li');
  li.textContent = message;
  logElement.prepend(li);

  if (logElement.children.length > 20) {
    logElement.removeChild(logElement.lastElementChild);
  }
}

function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function rollDice(max, label) {
  const fixedMax = Math.max(1, Math.floor(max));
  const result = Math.floor(Math.random() * fixedMax) + 1;
  if (label) addLog(`${label} = ${result}`);
  return result;
}

function clearIncomingAttacks() {
  for (let y = 0; y < gameState.map.size; y += 1) {
    for (let x = 0; x < gameState.map.size; x += 1) {
      gameState.map.tiles[y][x].incomingAttack = false;
    }
  }
}

function renderStatus() {
  document.getElementById('player-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
  document.getElementById('player-mp').textContent = `${gameState.player.mp}/${gameState.player.maxMp}`;
  document.getElementById('player-coin').textContent = String(gameState.player.coin);
  document.getElementById('enemy-name').textContent = gameState.enemy.name;
  document.getElementById('enemy-hp').textContent = `${gameState.enemy.hp}/${gameState.enemy.maxHp}`;
  document.getElementById('enemy-state').textContent = gameState.enemy.state.join(', ') || '없음';
  document.getElementById('game-floor').textContent = String(gameState.floor);
  document.getElementById('game-turn').textContent = String(gameState.turn);
  document.getElementById('game-phase').textContent = gameState.phase;
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
  gameState.phase = 'FLOOR_CLEAR';
  gameState.enemy.hp = 0;
  addLog('층 클리어: 적을 쓰러뜨렸습니다.');
  addLog('다음 단계는 심상세계 절차입니다.');
}

function canBattleAction() {
  if (gameState.phase !== 'BATTLE') {
    addLog(`현재 단계(${gameState.phase})에서는 전투 행동을 할 수 없습니다.`);
    return false;
  }
  return true;
}

function findBestStepToward(from, target) {
  const candidates = [
    { x: from.x + 1, y: from.y },
    { x: from.x - 1, y: from.y },
    { x: from.x, y: from.y + 1 },
    { x: from.x, y: from.y - 1 },
  ];

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

function enemyAttack() {
  addLog(`[적 행동] ${gameState.enemy.name}이 공격합니다.`);
  const enemyStr = rollDice(gameState.enemy.stats.힘, `적 힘 ${gameState.enemy.stats.힘} → 1d${gameState.enemy.stats.힘}`);
  const playerAgi = rollDice(gameState.player.stats.민첩, `플레이어 민첩 ${gameState.player.stats.민첩} → 1d${gameState.player.stats.민첩}`);
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
  const playerPos = gameState.player.position;
  const enemyTile = gameState.map.tiles[enemyPos.y][enemyPos.x];

  if (enemyTile.fire) {
    const safeStep = findBestStepToward(enemyPos, playerPos);
    if (safeStep && !gameState.map.tiles[safeStep.y][safeStep.x].fire) {
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
      const attackTile = {
        x: gameState.enemy.position.x + Math.sign(dx),
        y: gameState.enemy.position.y + Math.sign(dy),
      };
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
    addLog('적이 너무 멀어 공격할 수 없습니다.');
    renderMap();
    return;
  }

  const playerRoll = rollDice(gameState.player.stats.힘, `플레이어 힘 ${gameState.player.stats.힘} → 1d${gameState.player.stats.힘}`);
  const enemyRoll = rollDice(gameState.enemy.stats.체력, `적 체력 ${gameState.enemy.stats.체력} → 1d${gameState.enemy.stats.체력}`);
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
  if (!gameState.player.state.includes('방어')) {
    gameState.player.state.push('방어');
  }
  addLog('방어 태세를 취했습니다. 다음 적 공격 피해가 감소합니다.');
  renderStatus();
  renderMap();
  enemyTurn();
}

function handleMove() {
  if (!canBattleAction()) return;
  clearIncomingAttacks();
  const step = findBestStepToward(gameState.player.position, gameState.enemy.position);
  if (!step) {
    addLog('이동할 수 있는 칸이 없습니다.');
  } else {
    gameState.player.position = step;
    addLog(`플레이어가 (${step.x}, ${step.y})로 이동했습니다.`);
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
  const targets = [
    { x, y },
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
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
    renderStatus();
    renderMap();
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
}

function bindActions() {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleAction(button.dataset.action);
    });
  });

  newGameButton.addEventListener('click', resetGame);
  saveButton.addEventListener('click', saveGame);
  loadButton.addEventListener('click', loadGame);
}

function init() {
  bindActions();
  resetGame();
}

init();
