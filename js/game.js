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
  elapsedTime: 0,
  ashanRage: 0
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
  const rageLevel = getRageLevel(game.ashanRage);
  const dialogueCategory = ['ANNOYED', 'FURIOUS'].includes(rageLevel) && category !== 'win' ? 'irritated' : category;
  const selectedDialogue = chooseAshanLine(dialogueCategory, game.failureCount);
  dialogue.textContent = selectedDialogue.text;
  voiceManager.speak(selectedDialogue, category === 'far');
}

function pointerPosition(event) {
  const rectangle = canvas.getBoundingClientRect();
  return { x: (event.clientX - rectangle.left) * WIDTH / rectangle.width, y: (event.clientY - rectangle.top) * HEIGHT / rectangle.height };
}

function startAim(event) {
  if (game.state !== 'READY' || effects.resultFreeze > 0) return;
  voiceManager.unlock();
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
  voiceManager.unlock();
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
  effects.resultFreeze = 0.18;
  if (outcome === 'short') {
    game.failureCount += 1;
    game.ashanRage = Math.min(game.ashanRage + 12, 100);
    message.textContent = 'KALLARIK PURATH';
    setDialogue('short');
    addDust(landingX, GROUND_Y, '#f2a65a', 12);
    triggerShake(5);
  } else if (outcome === 'win') {
    game.failureCount = 0;
    game.ashanRage = 0;
    game.score += 100;
    message.textContent = 'YOU WIN!';
    setDialogue('win');
    game.bestScore = Math.max(game.bestScore, game.score);
    game.highestLevel = Math.max(game.highestLevel, game.level);
    localStorage.setItem('kallari-best-score', String(game.bestScore));
    localStorage.setItem('kallari-highest-level', String(game.highestLevel));
    addDust(landingX, GROUND_Y, '#75b88c', 20);
    triggerShake(6);
  } else {
    game.failureCount += 1;
    game.ashanRage = Math.min(game.ashanRage + 18, 100);
    message.textContent = 'ASHANTE NENJATH';
    setDialogue('far');
    addImpact(game.levelData.ashanX, GROUND_Y - 40, 1.8);
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
  game.ashanRage = 0;
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
  context.imageSmoothingEnabled = false;
  drawKalariBackground();
  drawSandFloor();
  drawLamps();
  drawTrainingDetails();
  context.fillStyle = '#75b88c';
  context.fillRect(game.levelData.safeStart, GROUND_Y + 12, game.levelData.safeEnd - game.levelData.safeStart, 18);
  context.fillStyle = '#244137';
  context.font = 'bold 14px Space Mono';
  context.fillText('SAFE ZONE', game.levelData.safeStart + 12, GROUND_Y + 55);
  drawObstacle(context, game.levelData.obstacle);
  drawAshan();
  drawPlayer();
}

function drawKalariBackground() {
  context.fillStyle = '#899c7d';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#34473d';
  context.fillRect(0, 0, WIDTH, 240);
  context.fillStyle = '#1d302b';
  context.fillRect(0, 80, WIDTH, 175);
  context.fillStyle = '#52614c';
  context.beginPath();
  context.moveTo(0, 0); context.lineTo(WIDTH / 2, 54); context.lineTo(WIDTH, 0); context.closePath(); context.fill();
  context.fillStyle = '#283a32';
  for (let x = 0; x < WIDTH; x += 92) {
    context.fillRect(x, 24, 12, 260);
    context.fillRect(x + 40, 62, 7, 190);
  }
  context.strokeStyle = '#765d45'; context.lineWidth = 10;
  context.beginPath(); context.moveTo(0, 70); context.lineTo(WIDTH, 70); context.stroke();
  context.strokeStyle = '#b28b5c'; context.lineWidth = 3;
  context.beginPath(); context.moveTo(0, 75); context.lineTo(WIDTH, 75); context.stroke();
  context.fillStyle = '#17221f';
  context.fillRect(58, 150, 88, 7); context.fillRect(760, 150, 110, 7);
  context.fillStyle = '#70523e';
  context.fillRect(78, 157, 8, 54); context.fillRect(118, 157, 8, 54);
  context.fillRect(790, 157, 8, 54); context.fillRect(832, 157, 8, 54);
}

function drawSandFloor() {
  context.fillStyle = '#d9b578';
  context.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  context.fillStyle = '#c19b68';
  for (let x = 10; x < WIDTH; x += 31) {
    const y = GROUND_Y + 22 + ((x * 17) % 70);
    context.fillRect(x, y, 3 + (x % 5), 2);
    if (x % 3 === 0) context.fillRect(x + 13, y + 20, 2, 2);
  }
  context.fillStyle = '#8f734f';
  [210, 392, 674, 884].forEach((x) => context.fillRect(x, GROUND_Y + 76, 5, 4));
  context.strokeStyle = '#a98257'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(20, GROUND_Y + 40); context.lineTo(44, GROUND_Y + 48); context.moveTo(54, GROUND_Y + 48); context.lineTo(82, GROUND_Y + 40); context.stroke();
}

function drawLamps() {
  [480, 710].forEach((x, index) => {
    const flicker = Math.sin(game.elapsedTime * 7 + index) * 2;
    context.fillStyle = 'rgba(242, 166, 90, 0.11)';
    context.beginPath(); context.arc(x, 190, 38 + flicker, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#b28b5c'; context.fillRect(x - 3, 126, 6, 50);
    context.fillStyle = '#f2a65a'; context.fillRect(x - 7, 173, 14, 7);
    context.fillStyle = '#f3dfb5'; context.fillRect(x - 2, 164 + flicker, 4, 9);
  });
}

function drawTrainingDetails() {
  context.fillStyle = '#765d45';
  context.fillRect(188, 266, 92, 8); context.fillRect(205, 274, 8, 45); context.fillRect(255, 274, 8, 45);
  context.fillStyle = '#b28b5c'; context.fillRect(198, 252, 70, 14);
  context.fillStyle = '#dc5b49'; context.fillRect(198, 252, 70, 4);
  context.fillStyle = '#d9b578'; context.fillRect(610, 280, 32, 32); context.fillRect(650, 290, 24, 22);
  context.fillStyle = '#8f734f'; context.fillRect(606, 308, 80, 6);
}

function drawAshan() {
  const x = game.levelData.ashanX;
  const breathing = Math.sin(game.elapsedTime * 2.2) * 2;
  const sway = Math.sin(game.elapsedTime * 0.8) * 1.2;
  const blink = Math.sin(game.elapsedTime * 3.3) > 0.92 ? 0.3 : 0;
  const rageNorm = Math.min(game.ashanRage / 100, 1);
  const eyebrowAngle = Math.floor(rageNorm * 12);
  context.fillStyle = '#17221f';
  context.fillRect(x - 23, GROUND_Y - 80 + breathing + sway, 46, 52);
  context.fillStyle = rageNorm > 0.6 ? '#9d3f38' : '#dc5b49';
  context.fillRect(x - 19, GROUND_Y - 84 + breathing + sway, 38, 55);
  context.fillStyle = '#e2a673';
  context.fillRect(x - 19, GROUND_Y - 122 + breathing + sway, 38, 34);
  context.fillStyle = '#17221f';
  context.fillRect(x - 12, GROUND_Y - 108 + breathing + sway - rageNorm * 3, 7, 5); context.fillRect(x + 5, GROUND_Y - 108 + breathing + sway - rageNorm * 3, 7, 5);
  context.fillRect(x - 14 + eyebrowAngle, GROUND_Y - 119 + breathing + sway, 6, 2); context.fillRect(x + 8 - eyebrowAngle, GROUND_Y - 119 + breathing + sway, 6, 2);
  context.fillRect(x - 14, GROUND_Y - 116 + breathing + sway, 28, 5);
  context.fillRect(x - 13, GROUND_Y - 126 + breathing + sway, 26, 8);
  context.fillStyle = '#f3dfb5'; context.fillRect(x - 5, GROUND_Y - 96 + breathing, 10, 3);
  context.fillStyle = '#17221f'; context.font = 'bold 13px Space Mono'; context.fillText('ASHAN', x - 27, GROUND_Y + 24);
}

function drawPlayer() {
  const player = game.player;
  const breathing = Math.sin(game.elapsedTime * 3) * 1.5;
  const airborne = game.state === 'FLYING';
  const crouched = game.state === 'AIMING';
  const blink = Math.sin(game.elapsedTime * 4.1) > 0.93 ? 0.2 : 0;
  const chargeAmount = crouched ? Math.hypot(game.aim.x - player.x, game.aim.y - player.y) / 150 : 0;
  const crouchDepth = Math.min(chargeAmount * 6, 8);
  const bodyY = player.y + (crouched ? crouchDepth : breathing);
  if (game.state === 'AIMING') {
    context.strokeStyle = '#dc5b49'; context.lineWidth = 4;
    context.beginPath(); context.moveTo(player.x, player.y); context.lineTo(game.aim.x, game.aim.y); context.stroke();
    drawPreview();
  }
  context.save(); context.translate(player.x, bodyY); context.rotate(airborne ? Math.atan2(player.vy, Math.max(player.vx, 1)) * 0.18 : 0);
  context.fillStyle = '#17221f'; context.fillRect(-15, -10, 30, 31);
  context.fillStyle = '#dc5b49'; context.fillRect(-11, -8, 22, 24);
  context.fillStyle = '#e2a673'; context.fillRect(-12, -34, 24, 23);
  context.fillStyle = '#17221f'; context.fillRect(-14, -38, 28, 7); context.fillRect(-9, -26, 4, 4 - blink); context.fillRect(5, -26, 4, 4 - blink);
  context.fillStyle = '#f3dfb5'; context.fillRect(-7, -15, 14, 3);
  context.fillStyle = '#17221f';
  context.fillRect(-20, -2, 9, 5); context.fillRect(11, -2, airborne ? 14 : 9, 5);
  context.fillRect(-13, 14, 8, airborne ? 13 : 10); context.fillRect(5, 14, 8, airborne ? 8 : 10);
  context.fillStyle = '#f3dfb5'; context.fillRect(-15, 24, 11, 5); context.fillRect(4, 22, 11, 5);
  context.restore();
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
  context.fillStyle = '#17221f'; context.fillRect(18, 18, 280, 126);
  context.fillStyle = '#f3dfb5'; context.font = '12px Space Mono';
  context.fillText(`STATE: ${game.state}`, 30, 40); context.fillText(`POS: ${game.player.x.toFixed(1)}, ${game.player.y.toFixed(1)}`, 30, 58); context.fillText(`VEL: ${game.player.vx.toFixed(1)}, ${game.player.vy.toFixed(1)}`, 30, 76); context.fillText(`WIND: ${game.levelData.wind.toFixed(1)}`, 30, 94); context.fillText(`OBSTACLE: ${game.levelData.obstacle ? 'BAG' : 'NONE'}`, 30, 112); context.fillText(`VOICE: ${voiceManager.status}`, 30, 130);
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
document.getElementById('voiceButton').addEventListener('click', (event) => {
  voiceManager.toggle();
  event.currentTarget.textContent = voiceManager.enabled ? 'VOICE ON' : 'VOICE OFF';
  voiceManager.unlock();
});
document.addEventListener('keydown', (event) => { if (event.key === 'F3') { event.preventDefault(); game.debug = !game.debug; } });
document.getElementById('voiceButton').textContent = voiceManager.enabled ? 'VOICE ON' : 'VOICE OFF';
updateReadout(); setDialogue('ready'); requestAnimationFrame(gameLoop);