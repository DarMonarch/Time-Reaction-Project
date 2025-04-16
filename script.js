// ELEMENTS
const startBtn    = document.getElementById('start-btn');
const restartBtn  = document.getElementById('restart-btn');
const box         = document.getElementById('box');
const playerInput = document.getElementById('player');
const messageEl   = document.getElementById('message');
const hitsEl      = document.getElementById('hits');
const missesEl    = document.getElementById('misses');
const gameArea    = document.querySelector('.game-area');
const toggleBtn   = document.getElementById('theme-toggle');

// STATE
let playerName, hits, missesLeft;
let delay, timeoutID, boxVisible;

// CONFIG
const MAX_MISSES   = 5;
const START_DELAY  = 2000;
const MIN_DELAY    = 500;
const SPEED_UP     = 50;    // decrease delay per hit
const GHOST_COUNT  = 8;
const GHOST_TIME   = 500;

// INIT
initThemeToggle();
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
box.addEventListener('click', handleHit);

function startGame() {
  playerName = playerInput.value.trim();
  if (!playerName) return alert('Please enter your name.');

  hits = 0;
  missesLeft = MAX_MISSES;
  delay = START_DELAY;
  updateStats();
  messageEl.textContent = `Good luck, ${playerName}!`;

  playerInput.disabled = true;
  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  boxVisible = false;

  timeoutID = setTimeout(spawnCycle, delay);
}

function spawnCycle() {
  // if previous real box still visible → miss
  if (boxVisible) {
    missesLeft--;
    updateStats();
    if (missesLeft <= 0) return gameOver();
    box.style.display = 'none';
    boxVisible = false;
  }

  // show distraction first
  showDistraction(() => {
    // then show real box
    showRealBox();
    // schedule next cycle using current delay (unchanged here)
    timeoutID = setTimeout(spawnCycle, delay + GHOST_TIME);
  });
}

function showDistraction(callback) {
  const areaW = gameArea.clientWidth;
  const areaH = gameArea.clientHeight;
  const ghosts = [];

  for (let i = 0; i < GHOST_COUNT; i++) {
    const g = document.createElement('div');
    g.className = 'ghost-box';
    const size = randInt(30, 80);
    g.style.width = `${size}px`;
    g.style.height = `${size}px`;
    g.style.top = `${randInt(0, areaH - size)}px`;
    g.style.left = `${randInt(0, areaW - size)}px`;
    g.style.borderRadius = (Math.random() < 0.5 ? '50%' : '0');
    g.style.backgroundColor = randColor();
    gameArea.appendChild(g);
    ghosts.push(g);
  }

  setTimeout(() => {
    ghosts.forEach(g => g.remove());
    callback();
  }, GHOST_TIME);
}

function showRealBox() {
  const areaW = gameArea.clientWidth;
  const areaH = gameArea.clientHeight;
  const size  = randInt(40, 100);

  box.style.width  = `${size}px`;
  box.style.height = `${size}px`;
  box.style.top    = `${randInt(0, areaH - size)}px`;
  box.style.left   = `${randInt(0, areaW - size)}px`;
  box.style.borderRadius   = (Math.random() < 0.5 ? '50%' : '0');
  box.style.backgroundColor = randColor();
  box.style.display = 'block';
  boxVisible = true;
}

function handleHit() {
  if (!boxVisible) return;
  hits++;
  // speed up on each successful hit
  delay = Math.max(MIN_DELAY, delay - SPEED_UP);
  updateStats();
  box.style.display = 'none';
  boxVisible = false;
}

function updateStats() {
  hitsEl.textContent   = `Hits: ${hits}`;
  missesEl.textContent = `Misses left: ${missesLeft}`;
}

function gameOver() {
  clearTimeout(timeoutID);
  box.style.display = 'none';
  messageEl.textContent = `Game Over, ${playerName}! You scored ${hits} hits.`;
  restartBtn.style.display = 'inline-block';
}

function resetGame() {
  clearTimeout(timeoutID);
  box.style.display = 'none';
  boxVisible = false;
  messageEl.textContent = 'Enter your name and click Start';
  hitsEl.textContent   = 'Hits: 0';
  missesEl.textContent = `Misses left: ${MAX_MISSES}`;
  playerInput.disabled = false;
  startBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
}

// UTILITIES
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF)
                 .toString(16).padStart(6, '0');
}

// DARK MODE TOGGLE
function initThemeToggle() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.setAttribute('data-theme','dark');
    toggleBtn.textContent = '☀️';
  }
  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme','light');
      toggleBtn.textContent = '🌙';
    } else {
      document.body.setAttribute('data-theme','dark');
      localStorage.setItem('theme','dark');
      toggleBtn.textContent = '☀️';
    }
  });
}
