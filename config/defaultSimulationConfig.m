function simulation = defaultSimulationConfig()
%DEFAULTSIMULATIONCONFIG Return initial numerical simulation settings.

simulation = struct();
simulation.gravity = 9.81;         % m/s^2, downward acceleration
simulation.timeStep = 0.01;        % s, used by the first simulation
simulation.duration = 3;           % s, plotting window for the first exercise
end