function createObstacle(level) {
  if (level < 2) return null;
  return {
    type: 'hangingBag',
    anchorX: 330 + Math.min(level - 2, 4) * 28,
    anchorY: 105,
    length: 112,
    angle: 0,
    radius: 22,
    phase: level * 0.7,
    hitCooldown: 0
  };
}

function updateObstacle(obstacle, deltaTime, elapsedTime) {
  if (!obstacle) return;
  obstacle.angle = Math.sin(elapsedTime * 1.8 + obstacle.phase) * 0.42;
  obstacle.hitCooldown = Math.max(0, obstacle.hitCooldown - deltaTime);
}

function obstaclePosition(obstacle) {
  return {
    x: obstacle.anchorX + Math.sin(obstacle.angle) * obstacle.length,
    y: obstacle.anchorY + Math.cos(obstacle.angle) * obstacle.length
  };
}

function collideWithObstacle(player, obstacle) {
  if (!obstacle || obstacle.hitCooldown > 0) return false;
  const bag = obstaclePosition(obstacle);
  const distance = Math.hypot(player.x - bag.x, player.y - bag.y);
  if (distance > player.radius + obstacle.radius) return false;

  const normalX = (player.x - bag.x) / Math.max(distance, 1);
  const normalY = (player.y - bag.y) / Math.max(distance, 1);
  const approachSpeed = player.vx * normalX + player.vy * normalY;
  if (approachSpeed < 0) {
    player.vx -= 1.5 * approachSpeed * normalX;
    player.vy -= 1.5 * approachSpeed * normalY;
  }
  player.x = bag.x + normalX * (player.radius + obstacle.radius + 1);
  player.y = bag.y + normalY * (player.radius + obstacle.radius + 1);
  obstacle.hitCooldown = 0.25;
  return true;
}

function drawObstacle(context, obstacle) {
  if (!obstacle) return;
  const bag = obstaclePosition(obstacle);
  context.strokeStyle = '#8d7657';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(obstacle.anchorX, obstacle.anchorY);
  context.lineTo(bag.x, bag.y);
  context.stroke();
  context.fillStyle = obstacle.hitCooldown > 0 ? '#f2a65a' : '#70483b';
  context.fillRect(bag.x - obstacle.radius, bag.y - obstacle.radius, obstacle.radius * 2, obstacle.radius * 2);
  context.fillStyle = '#f3dfb5';
  context.font = 'bold 10px Space Mono';
  context.fillText('BAG', bag.x - 10, bag.y + 4);
  context.fillStyle = '#d9b578';
  context.fillRect(obstacle.anchorX - 18, obstacle.anchorY - 6, 36, 12);
}