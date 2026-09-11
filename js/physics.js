function velocityFromDrag(player, aim, launchScale) {
  const dx = aim.x - player.x;
  const dy = aim.y - player.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  return {
    vx: dx / distance * distance * launchScale,
    vy: dy / distance * distance * launchScale
  };
}

function advanceProjectile(player, deltaTime, gravity, wind) {
  player.vx += wind * deltaTime;
  player.vy += gravity * deltaTime;
  player.x += player.vx * deltaTime;
  player.y += player.vy * deltaTime;
}

function predictedPosition(player, aim, time, launchScale, gravity, wind) {
  const velocity = velocityFromDrag(player, aim, launchScale);
  return {
    x: player.x + velocity.vx * time + 0.5 * wind * time * time,
    y: player.y + velocity.vy * time + 0.5 * gravity * time * time
  };
}