# TinkerHub Forked Repo;

['FORKED REPO'](https://github.com/PRiTHVi907/kalari_TV)

# KALARI TV

KALARI TV is a retro Malayalam CRT arcade game about launching a Kalari student toward a safe training zone. Aim, charge, and release with the right power while managing gravity, wind, obstacles, and timing.

Landing outcomes:

- **KALLARIK PURATH**: the student lands short.
- **YOU WIN!**: the student reaches the safe zone.
- **ASHANTE NENJATH**: the student overshoots into Ashan.

## Run The Game

Open [`index.html`](index.html) in Chrome, Edge, or Firefox. No build tools or external libraries are required.

Orelse open the link : [KALARI_TV]](https://useless-projects-nine.vercel.app/)

## Features

- Drag-to-aim and release-to-launch projectile physics
- Gravity, wind, shrinking safe zones, and level progression
- Malayalam on-screen dialogue with Ashan rage states
- Procedural pixel-art-style player and Ashan characters
- Idle breathing, blinking, stance movement, aiming, charging, and flying poses
- Kalari environment with roof beams, earthen walls, lamps, training details, sand, stones, and footprints
- Swinging training bag from level 2 onward
- Dust particles, impact effects, screen shake, and result freeze frames
- CRT scanlines, flicker, vignette, and CRT toggle
- Optional trajectory preview toggle
- Persistent best score, highest level, and trajectory preference
- F3 debug panel for state, position, velocity, wind, and obstacle information
- Touch-ready pointer controls

## Controls

1. Press **START TRAINING**.
2. Drag from the student to aim and charge the launch.
3. Release to launch.
4. Use **RETRY** after a failed attempt or **NEXT LEVEL** after winning.
5. Use **TRAJECTORY ON/OFF** to show or hide the aiming guide and dotted preview.
6. Press **F3 DEBUG** to inspect the current simulation state.

## Physics

The launch vector is calculated from the student to the pointer:

```text
dx = pointerX - playerX
dy = pointerY - playerY
power = distance between player and pointer
vx = dx / distance * power * launchScale
vy = dy / distance * power * launchScale
```

Each animation frame applies gravity and wind, then updates the player position. The trajectory preview uses the same equations without changing gameplay physics.

## Project Structure

```text
index.html             Browser game entry point
style.css              CRT arcade layout and visual styling
js/game.js             Game loop, input, state, scoring, and rendering
js/physics.js          Launch and projectile motion calculations
js/collision.js        Landing outcome classification
js/obstacles.js        Swinging training bag behavior
js/effects.js          Dust particles and screen shake
js/dialogue.js         Ashan dialogue and rage-aware line selection

```

The browser game is the main active project. The MATLAB files remain as a small reference implementation for experimenting with projectile motion.
