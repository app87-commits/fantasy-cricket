const express = require("express");
const app = express();
const calculatePoints = require("./scoring");
const db = require("./firebase"); // ✅ ADD HERE

app.use(express.json());
app.use(express.static("public"));
const CRICKETDATA_KEY = "3e41c403-7151-407e-89b9-1fb2512a6908"; // replace with your key

const fetch = require("node-fetch"); // install: npm install node-fetch
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
//app.listen(3000, () => console.log("Server running"));

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

// New endpoint: get players for a team
app.get("/players/:team", async (req, res) => {
  try {
    const team = req.params.team; // e.g., MI, CSK
    const response = await fetch(
      `https://api.cricketdata.org/v1/squads/${team}?apikey=${CRICKETDATA_KEY}`,
    );
    const data = await response.json();

    // Transform into minimal info for frontend
    const players = data.players.map((p) => ({
      name: p.name,
      country: p.country,
      isForeign: p.country !== "India",
    }));

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching players");
  }
});

async function updateMatchStats() {
  const response = await fetch(
    "https://cricapi.com/api/matchScorecard?apikey=YOURKEY&id=MATCHID",
  );
  const data = await response.json();

  // Loop players → update Firebase
  for (let player of data.players) {
    let points = calculatePoints(player);
    await db
      .collection("teams")
      .doc(player.teamDocId)
      .update({ points: points });
  }
}
