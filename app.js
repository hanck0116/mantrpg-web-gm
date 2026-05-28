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

  tiles[2][1].fire = true;
  tiles[2][5].incomingAttack = true;
  tiles[4][2].brand = true;
  tiles[4][4].terrain = 'broken';
  tiles[4][4].durability = 0;

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

function renderStatus() {
  document.getElementById('player-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
  document.getElementById('player-mp').textContent = `${gameState.player.mp}/${gameState.player.maxMp}`;
  document.getElementById('player-coin').textContent = String(gameState.player.coin);
  document.getElementById('enemy-name').textContent = gameState.enemy.name;
  document.getElementById('enemy-hp').textContent = `${gameState.enemy.hp}/${gameState.enemy.maxHp}`;
  document.getElementById('enemy-state').textContent = gameState.enemy.state.join(', ') || '없음';
  document.getElementById('game-floor').textContent = String(gameState.floor);
  document.getElementById('game-turn').textContent = String(gameState.turn);
}

function getTileLabel(tile, x, y) {
  if (gameState.player.position.x === x && gameState.player.position.y === y) return '나';
  if (gameState.enemy.position.x === x && gameState.enemy.position.y === y) return '적';
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
      if (gameState.enemy.position.x === x && gameState.enemy.position.y === y) tile.classList.add('enemy');

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
  addLog('현재 버전: 상태표와 전술 맵 테스트 단계입니다.');
  addLog('타일을 누르면 해당 위치의 상태를 확인할 수 있습니다.');
  renderStatus();
  renderMap();
}

function bindActions() {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      addLog(`플레이어 행동: ${button.dataset.action}`);
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
