const express = require("express");
const app = express();
const calculatePoints = require("./scoring");
const db = require("./firebase"); // ✅ ADD HERE

app.use(express.json());
app.use(express.static("public"));

app.listen(3000, () => console.log("Server running"));

const MAX_FOREIGN = 4;
const MAX_DRAFT = 2;

function validateTeam(players) {
  let foreignCount = 0;
  let teams = new Set();

  for (let p of players) {
    if (p.isForeign) foreignCount++;
    if (foreignCount > MAX_FOREIGN) return "Too many foreign players";

    if (teams.has(p.team)) return "Only 1 player per IPL team";
    teams.add(p.team);

    if (p.draftCount >= MAX_DRAFT) return `${p.name} fully drafted`;
  }
  return "Valid";
}

app.post("/submitTeam", async (req, res) => {
  const players = req.body.players;

  const validation = validateTeam(players);
  if (validation !== "Valid") return res.send(validation);

  await db.collection("teams").add({
    players,
    createdAt: new Date(),
  });

  res.send("Team saved successfully!");
});

app.get("/leaderboard", async (req, res) => {
  const snapshot = await db.collection("teams").get();
  let leaderboard = [];

  snapshot.forEach((doc) => {
    let team = doc.data();
    let totalPoints = 0;

    team.players.forEach((p) => {
      totalPoints += calculatePoints(p);
    });

    leaderboard.push({ id: doc.id, points: totalPoints });
  });

  leaderboard.sort((a, b) => b.points - a.points);
  res.json(leaderboard);
});
