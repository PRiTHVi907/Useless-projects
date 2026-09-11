function classifyLanding(landingX, levelData) {
  if (landingX < levelData.safeStart) return 'short';
  if (landingX <= levelData.safeEnd) return 'win';
  return 'far';
}