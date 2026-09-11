%% KALLARI Phase 0 entry point
% This script verifies the project layout and loads named configuration.

projectRoot = fileparts(mfilename('fullpath'));
addpath(genpath(projectRoot));

game = defaultGameConfig();
simulation = defaultSimulationConfig();

fprintf('KALLARI - Phase 0\n');
fprintf('Launch power: %.1f m/s\n', game.launchPower);
fprintf('Gravity: %.2f m/s^2\n', simulation.gravity);
fprintf('Simulation timestep: %.4f s\n', simulation.timeStep);