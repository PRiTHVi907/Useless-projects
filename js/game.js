const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const levelValue = document.getElementById('levelValue');
const scoreValue = document.getElementById('scoreValue');
const bestValue = document.getElementById('bestValue');
const message = document.getElementById('message');
const dialogue = document.getElementById('dialogue');
const titleOverlay = document.getElementById('titleOverlay');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 430;
const GRAVITY = 620;
const LAUNCH_SCALE = 5.2;

function storedNumber(key) {
  return Number.parseInt(localStorage.getItem(key) || '0', 10);
}

const game = {
  state: 'TITLE',
  level: 1,
  score: 0,
  bestScore: storedNumber('kallari-best-score'),
  highestLevel: storedNumber('kallari-highest-level') || 1,
  failureCount: 0,
  debug: false,
  aim: { x: 0, y: 0 },
  levelData: createLevel(1),
  player: createPlayer(),
  lastTime: 0,
  elapsedTime: 0
};

function createPlayer() {
  return { x: 105, y: GROUND_Y - 22, radius: 18, vx: 0, vy: 0, dragging: false };
}

function createLevel(level) {
  const safeStart = 510 + Math.min(level - 1, 5) * 20;
  const safeWidth = Math.max(120, 170 - (level - 1) * 8);
  const wind = level < 5 ? 0 : (level % 2 === 0 ? 18 : -14);
  return { safeStart, safeEnd: safeStart + safeWidth, ashanX: safeStart + safeWidth + 105, wind, obstacle: createObstacle(level) };
}

function setDialogue(category) {
  dialogue.textContent = chooseAshanLine(category, game.failureCount);
}

function pointerPosition(event) {
  const rectangle = canvas.getBoundingClientRect();
  return { x: (event.clientX - rectangle.left) * WIDTH / rectangle.width, y: (event.clientY - rectangle.top) * HEIGHT / rectangle.height };
}

function startAim(event) {
  if (game.state !== 'READY') return;
  const pointer = pointerPosition(event);
  const distance = Math.hypot(pointer.x - game.player.x, pointer.y - game.player.y);
  if (distance > 55) return;
  game.player.dragging = true;
  game.state = 'AIMING';
  game.aim = pointer;
  message.textContent = 'Aim the Kalari launch.';
  canvas.setPointerCapture(event.pointerId);
}

function beginTraining() {
  game.state = 'READY';
  titleOverlay.classList.add('is-hidden');
  message.textContent = 'Drag the student, then release.';
  setDialogue('ready');
}

function updateAim(event) {
  if (!game.player.dragging) return;
  game.aim = pointerPosition(event);
}

function releaseAim(event) {
  if (!game.player.dragging) return;
  game.player.dragging = false;
  game.aim = pointerPosition(event);
  const velocity = velocityFromDrag(game.player, game.aim, LAUNCH_SCALE);
  game.player.vx = velocity.vx;
  game.player.vy = velocity.vy;
  game.state = 'FLYING';
  message.textContent = 'Flying! Watch the landing...';
}

function update(deltaTime) {
  game.elapsedTime += deltaTime;
  updateObstacle(game.levelData.obstacle, deltaTime, game.elapsedTime);
  if (game.state !== 'FLYING') return;
  advanceProjectile(game.player, deltaTime, GRAVITY, game.levelData.wind);

  if (collideWithObstacle(game.player, game.levelData.obstacle)) {
    addDust(game.player.x, game.player.y, '#f2a65a', 8);
    triggerShake(7);
  }

  if (game.player.y + game.player.radius >= GROUND_Y) {
    game.player.y = GROUND_Y - game.player.radius;
    finishAttempt();
  }
}

function finishAttempt() {
  const landingX = game.player.x;
  const outcome = classifyLanding(landingX, game.levelData);
  game.state = 'RESULT';
  addDust(landingX, GROUND_Y, outcome === 'win' ? '#75b88c' : '#f2a65a');
  if (outcome === 'short') {
    game.failureCount += 1;
    message.textContent = 'KALLARIK PURATH';
    setDialogue('short');
  } else if (outcome === 'win') {
    game.failureCount = 0;
    game.score += 100;
    message.textContent = 'YOU WIN!';
    setDialogue('win');
    game.bestScore = Math.max(game.bestScore, game.score);
    game.highestLevel = Math.max(game.highestLevel, game.level);
    localStorage.setItem('kallari-best-score', String(game.bestScore));
    localStorage.setItem('kallari-highest-level', String(game.highestLevel));
  } else {
    game.failureCount += 1;
    message.textContent = 'ASHANTE NENJATH';
    setDialogue('far');
    triggerShake(14);
  }
  updateReadout();
}

function resetAttempt(nextLevel = false) {
  if (nextLevel) {
    game.level += 1;
    game.levelData = createLevel(game.level);
  }
  game.player = createPlayer();
  effects.particles = [];
  game.elapsedTime = 0;
  game.state = 'READY';
  message.textContent = 'Drag the student, then release.';
  document.getElementById('resetButton').textContent = 'RETRY';
  setDialogue('ready');
  updateReadout();
}

function startNewRun() {
  game.level = 1;
  game.score = 0;
  game.failureCount = 0;
  game.levelData = createLevel(1);
  resetAttempt(false);
}

function updateReadout() {
  levelValue.textContent = String(game.level).padStart(2, '0');
  scoreValue.textContent = String(game.score).padStart(4, '0');
  bestValue.textContent = String(game.bestScore).padStart(4, '0');
  document.getElementById('resetButton').textContent = game.state === 'RESULT' && message.textContent === 'YOU WIN!' ? 'NEXT LEVEL' : 'RETRY';
}

function drawScene() {
  context.fillStyle = '#b5c99e';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#d9b578';
  context.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  context.fillStyle = '#405e4d';
  context.fillRect(0, GROUND_Y - 96, WIDTH, 12);
  context.fillStyle = '#294338';
  context.fillRect(32, GROUND_Y - 98, 12, 98);
  context.fillRect(WIDTH - 44, GROUND_Y - 98, 12, 98);
  context.fillStyle = '#f2a65a';
  context.fillRect(480, GROUND_Y - 115, 4, 20);
  context.fillRect(476, GROUND_Y - 98, 12, 4);
  context.fillStyle = '#75b88c';
  context.fillRect(game.levelData.safeStart, GROUND_Y + 12, game.levelData.safeEnd - game.levelData.safeStart, 18);
  context.fillStyle = '#244137';
  context.font = 'bold 14px Space Mono';
  context.fillText('SAFE ZONE', game.levelData.safeStart + 12, GROUND_Y + 55);
  drawObstacle(context, game.levelData.obstacle);
  drawAshan();
  drawPlayer();
}

function drawAshan() {
  const x = game.levelData.ashanX;
  context.fillStyle = '#dc5b49';
  context.fillRect(x - 15, GROUND_Y - 80, 30, 48);
  context.fillStyle = '#e2a673';
  context.beginPath(); context.arc(x, GROUND_Y - 98, 19, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#17221f';
  context.fillRect(x - 12, GROUND_Y - 103, 7, 5); context.fillRect(x + 5, GROUND_Y - 103, 7, 5);
  context.fillRect(x - 14, GROUND_Y - 123, 28, 9);
  context.fillStyle = '#17221f'; context.font = 'bold 13px Space Mono'; context.fillText('ASHAN', x - 27, GROUND_Y + 24);
}

function drawPlayer() {
  const player = game.player;
  if (game.state === 'AIMING') {
    context.strokeStyle = '#dc5b49'; context.lineWidth = 4;
    context.beginPath(); context.moveTo(player.x, player.y); context.lineTo(game.aim.x, game.aim.y); context.stroke();
    drawPreview();
  }
  context.fillStyle = '#dc5b49'; context.fillRect(player.x - 13, player.y - 8, 26, 28);
  context.fillStyle = '#e2a673'; context.beginPath(); context.arc(player.x, player.y - 23, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#17221f'; context.fillRect(player.x - 10, player.y - 30, 20, 6);
  context.fillStyle = '#f3dfb5'; context.fillRect(player.x - 15, player.y + 19, 10, 7); context.fillRect(player.x + 5, player.y + 19, 10, 7);
}

function drawPreview() {
  context.fillStyle = '#405e4d';
  for (let time = 0; time < 1.4; time += 0.14) {
    const point = predictedPosition(game.player, game.aim, time, LAUNCH_SCALE, GRAVITY, game.levelData.wind);
    context.beginPath(); context.arc(point.x, point.y, 3, 0, Math.PI * 2); context.fill();
  }
}

function drawDebug() {
  if (!game.debug) return;
  context.fillStyle = '#17221f'; context.fillRect(18, 18, 250, 108);
  context.fillStyle = '#f3dfb5'; context.font = '12px Space Mono';
  context.fillText(`STATE: ${game.state}`, 30, 40); context.fillText(`POS: ${game.player.x.toFixed(1)}, ${game.player.y.toFixed(1)}`, 30, 58); context.fillText(`VEL: ${game.player.vx.toFixed(1)}, ${game.player.vy.toFixed(1)}`, 30, 76); context.fillText(`WIND: ${game.levelData.wind.toFixed(1)}`, 30, 94); context.fillText(`OBSTACLE: ${game.levelData.obstacle ? 'BAG' : 'NONE'}`, 30, 112);
}

function render() {
  const shakeX = (Math.random() - 0.5) * effects.shake;
  const shakeY = (Math.random() - 0.5) * effects.shake;
  context.save();
  context.translate(shakeX, shakeY);
  drawScene();
  drawEffects(context);
  drawDebug();
  context.restore();
}

function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - game.lastTime) / 1000 || 0, 0.04);
  game.lastTime = timestamp;
  update(deltaTime); updateEffects(deltaTime); render(); requestAnimationFrame(gameLoop);
}

canvas.addEventListener('pointerdown', startAim);
canvas.addEventListener('pointermove', updateAim);
canvas.addEventListener('pointerup', releaseAim);
document.getElementById('startButton').addEventListener('click', beginTraining);
document.getElementById('howToButton').addEventListener('click', (event) => {
  const panel = document.getElementById('howToPanel');
  panel.hidden = !panel.hidden;
  event.currentTarget.textContent = panel.hidden ? 'HOW TO PLAY' : 'CLOSE GUIDE';
});
document.getElementById('resetButton').addEventListener('click', () => {
  const won = game.state === 'RESULT' && message.textContent === 'YOU WIN!';
  resetAttempt(won);
});
document.getElementById('newRunButton').addEventListener('click', startNewRun);
document.getElementById('debugButton').addEventListener('click', () => { game.debug = !game.debug; });
document.getElementById('crtButton').addEventListener('click', (event) => {
  document.body.classList.toggle('crt-off');
  event.currentTarget.textContent = document.body.classList.contains('crt-off') ? 'CRT OFF' : 'CRT ON';
});
document.addEventListener('keydown', (event) => { if (event.key === 'F3') { event.preventDefault(); game.debug = !game.debug; } });
updateReadout(); setDialogue('ready'); requestAnimationFrame(gameLoop);