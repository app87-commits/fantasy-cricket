function calculatePoints(player) {
  let resultPts = player.result === "Win" ? 30 : 15;

  return (
    resultPts +
    player.runs * 1 +
    player.wickets * 25 +
    player.catches * 5 +
    (player.superOverRuns || 0) +
    (player.superOverWickets || 0)
  );
}

module.exports = calculatePoints;
