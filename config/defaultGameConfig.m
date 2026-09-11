function game = defaultGameConfig()
%DEFAULTGAMECONFIG Return the initial KALARI TV game settings.

game = struct();
game.launchPower = 12;          % m/s, initial projectile speed
game.launchAngle = pi / 4;      % radians, initial aiming angle
game.safeZoneStart = 8;         % m, start of the target area
game.safeZoneEnd = 12;          % m, end of the target area
end