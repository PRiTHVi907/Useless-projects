const effects = { particles: [], shake: 0 };

function addDust(x, y, color, count = 16) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 100;
    effects.particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 35,
      life: 0.45 + Math.random() * 0.35, maxLife: 0.8, size: 2 + Math.random() * 4, color
    });
  }
}

function triggerShake(amount) { effects.shake = Math.max(effects.shake, amount); }

function updateEffects(deltaTime) {
  effects.shake = Math.max(0, effects.shake - deltaTime * 22);
  effects.particles = effects.particles.filter((particle) => {
    particle.life -= deltaTime;
    particle.vy += 180 * deltaTime;
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    return particle.life > 0;
  });
}

function drawEffects(context) {
  effects.particles.forEach((particle) => {
    context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    context.fillStyle = particle.color;
    context.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  context.globalAlpha = 1;
}