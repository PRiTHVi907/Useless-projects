# KALLARI

An intentionally ridiculous MATLAB physics game inspired by the Malayalam phrase:

> ഒന്നുകിൽ കല്ലറയ്ക്ക് പുറത്ത്, അല്ലെങ്കിൽ ആശാന്റെ നെഞ്ചത്ത്

The player launches a Kalari student toward a safe training area. Landing short displays **KALLARIK PURATH**, landing in the safe zone displays **YOU WIN!**, and overshooting into Ashan displays **ASHANTE NENJATH**.

This is a learning-first project. We will build one small, testable phase at a time. The first model is ordinary projectile motion; comedy, mouse input, animation, dialogue, and CRT effects come later.

## Phase 0: MATLAB for the Kallari Game

### Objective

Learn the project layout, scripts, functions, structures, and MATLAB paths. No GUI, Ashan, or game physics are implemented yet.

### MATLAB concepts

- A **script** runs commands in sequence and is our entry point.
- A **function** accepts inputs and returns values, making configuration reusable.
- A **structure** groups related named values, such as `game.safeZoneStart`.
- `addpath` lets `main.m` find functions in project folders.
- `fullfile` builds paths without hard-coding separators.

### First tiny challenge

1. Open MATLAB with this folder as the current folder.
2. Run `main`.
3. Inspect `game` and `simulation` in the workspace.
4. Change `game.launchPower` in `config/defaultGameConfig.m` and run `main` again.
5. Create `phase0_projectile.m` yourself. Define an angle, launch speed, gravity, and a short time vector. Calculate `x` and `y` from:

	`x = x0 + vx*t`, where `vx = speed*cos(angle)`

	`y = y0 + vy*t - 0.5*gravity*t.^2`, where `vy = speed*sin(angle)`

	Plot `x` against `y` with `plot(x, y)`.

Use radians for the angle in the equation. MATLAB's `pi/4` represents 45 degrees.

### Checkpoint

Your plot should show a curved trajectory. Change the angle or speed and confirm that the curve changes. Send me your script and any error messages before we add the game window.

## Roadmap

1. Phase 0: MATLAB basics and project structure.
2. Phase 1: Projectile simulation and trajectory graph.
3. Phase 2: Basic 2D game scene and animation.
4. Phase 3: Drag-and-release input.
5. Phase 4: Landing classification and Ashan.
6. Phase 5: Procedural difficulty and ridiculous events.
7. Phase 6: CRT effects and polish.

## Project Structure

```text
main.m                 % Phase 0 entry point
config/                % Centralized game and simulation parameters
src/                   % Shared helpers and orchestration
physics/               % Projectile and collision calculations
level/                 % Kalari scene and challenge generation
input/                 % Mouse and keyboard input
visualization/         % 2D drawing and animation
dialogue/              % Ashan's modular dialogue data
effects/               % Dust, shake, and CRT effects
tests/                 % Small checks for each phase
```

Important logic will stay visible in small files. We will introduce each folder only when its responsibility becomes useful.
# Browser Prototype

The browser version now lives in the root entry point [`index.html`](index.html). It is a small MVP of KALLARI and intentionally coexists with the MATLAB learning scaffold above.

## Run The Browser MVP

Open `index.html` in Chrome, Edge, or Firefox. No build tools or external libraries are required.

The current prototype includes:

- a fixed-resolution Canvas game scene
- pointer drag-to-aim and release-to-launch
- manually implemented projectile motion
- a visible aiming line and trajectory preview
- a Kalari-inspired placeholder scene
- safe-zone landing classification
- `KALLARIK PURATH`, `YOU WIN!`, and `ASHANTE NENJATH` outcomes
- retry control for the current challenge, or next-level progression after a win
- a small debug panel toggled with `F3`
- modular Ashan dialogue with escalating reactions after repeated failures
- persistent best score and highest-level tracking with `localStorage`
- touch-ready pointer input and a `NEW RUN` control
- CRT-style title/boot screen with Start Training and How to Play
- a predictable swinging training bag from level 2 onward
- layered Kalari architecture, lamps, training details, sand texture, and stones
- procedural pixel-art-style player and Ashan silhouettes with idle, aiming, and flying poses

### Physics used by the prototype

Canvas coordinates increase downward. The launch vector is calculated from the player to the pointer:

```text
dx = pointerX - playerX
dy = pointerY - playerY
angle = atan2(dy, dx)
power = distance between player and pointer
vx = dx / distance * power * launchScale
vy = dy / distance * power * launchScale
```

Each animation frame then applies gravity and integrates the position:

```text
velocityY = velocityY + gravity * deltaTime
positionX = positionX + velocityX * deltaTime
positionY = positionY + velocityY * deltaTime
```

The game uses simple pixel-like geometry first. Dialogue, procedural chaos, richer character art, audio, and stronger CRT effects belong to later phases.

## Browser Roadmap

1. MVP: projectile physics, drag input, landing outcomes, retry.
2. Ashan dialogue, failure streaks, and next-level progression.
3. Separate physics and collision modules after the current loop is understood.
4. Add procedural challenges.
5. Add particles, sound, camera movement, and CRT polish.

## Current Stage: Title And Boot Flow

The browser now starts in a `TITLE` state. The title overlay gates gameplay until `START TRAINING` is pressed, and `HOW TO PLAY` explains the drag, release, and three landing outcomes. Once started, the existing game enters `READY` and uses the same physics loop as before.

Test this stage by reloading the page, opening and closing the guide, pressing Start Training, and confirming that a drag from the student enters the flying state. The title screen is intentionally lightweight: the next presentation stage can add a longer intro sequence and generated audio without changing the projectile model.

## Current Checkpoint: Ashan And Progression

The dialogue data is in [`js/dialogue.js`](js/dialogue.js), while [`js/game.js`](js/game.js) decides which category to request. Three consecutive failures add irritated lines to the random pool. A successful landing clears the failure streak, awards 100 points, and changes the result button to `NEXT LEVEL`.

Test this phase by deliberately making three short or overshooting launches, then win once. Confirm that Ashan's lines vary, the win clears the streak, and the next challenge displays level 02.

## Final Prototype Architecture

- [`js/physics.js`](js/physics.js) contains launch-vector calculation, gravity/wind integration, and trajectory prediction.
- [`js/collision.js`](js/collision.js) classifies a landing as short, successful, or overshooting.
- [`js/effects.js`](js/effects.js) owns dust particles and screen shake.
- [`js/dialogue.js`](js/dialogue.js) owns Ashan's randomized Malayalam lines.
- [`js/game.js`](js/game.js) coordinates input, state transitions, rendering, scoring, and level progression.

The final prototype also includes level-based wind, shrinking safe zones, impact particles, screen shake, CRT scanlines/flicker/vignette, a CRT toggle, an F3 debug panel, and persistent score history. It deliberately remains a simplified 2D projectile model: there are no rigid bodies, sound assets, or full sprite animations yet.

### Final Checkpoint

You should be able to drag the student, preview the path, launch, receive one of the three outcomes, retry failures, progress after a win, see the score increase, and toggle CRT effects. F3 exposes state, position, velocity, and wind so the equations can be inspected while playing.

The original MATLAB Phase 0 material remains below as a parallel learning path.

## Current Stage: Interactive Obstacle

[`js/obstacles.js`](js/obstacles.js) now owns a simple hanging training bag. Its position uses a sinusoidal swing, and the player collision applies a readable velocity reflection rather than pretending to be a full rigid-body solver. The obstacle appears from level 2 onward and is visible before launch, so its timing can be learned.

Test it by winning level 1, advancing to level 2, and watching the bag swing before launching. Toggle F3 to confirm the obstacle is reported, then deliberately intersect the bag and look for a small dust burst and screen shake.

## Current Stage: Visual Character And Environment Upgrade

The renderer in [`js/game.js`](js/game.js) now draws the arena in background, midground, and foreground layers. It includes roof beams, earthen interior walls, lamps with a small flicker, training furniture, sand texture, stones, and footprints. The player and Ashan use original procedural pixel-art-style silhouettes with dark outlines, simple shading, expressive faces, breathing motion, and state-aware aiming/flying poses.

Test this stage by starting training, checking the scene at rest, dragging the student to see the crouched aiming pose, and releasing to see the airborne pose. The art remains deliberately procedural so the physics and MATLAB-compatible coordinate model stay easy to inspect; sprite sheets and richer animation can be added later without changing the game rules.
