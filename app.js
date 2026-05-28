const MAP_SIZE = 7;

const gameState = {
  player: { x: 3, y: 5 },
  enemy: { x: 3, y: 1 },
};

const mapElement = document.getElementById('tactical-map');
const logElement = document.getElementById('combat-log');
const actionButtons = document.querySelectorAll('[data-action]');

function addLog(message) {
  const li = document.createElement('li');
  li.textContent = message;
  logElement.prepend(li);

  if (logElement.children.length > 12) {
    logElement.removeChild(logElement.lastElementChild);
  }
}

function createTileLabel(x, y) {
  if (gameState.player.x === x && gameState.player.y === y) return 'P';
  if (gameState.enemy.x === x && gameState.enemy.y === y) return 'E';
  return '';
}

function renderMap() {
  mapElement.innerHTML = '';

  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let x = 0; x < MAP_SIZE; x += 1) {
      const tile = document.createElement('div');
      tile.className = 'tile';

      if (gameState.player.x === x && gameState.player.y === y) {
        tile.classList.add('player');
      }

      if (gameState.enemy.x === x && gameState.enemy.y === y) {
        tile.classList.add('enemy');
      }

      tile.textContent = createTileLabel(x, y);
      tile.setAttribute('role', 'gridcell');
      mapElement.appendChild(tile);
    }
  }
}

function bindActions() {
  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const actionName = button.dataset.action;
      addLog(`플레이어 행동: ${actionName}`);
    });
  });
}

function init() {
  addLog('전투 시작: 적 1명과 조우했습니다.');
  addLog('AI 기능 없음: 모든 로직은 로컬 JavaScript 기반으로 동작합니다.');
  renderMap();
  bindActions();
}

init();
