import Match  from "../models/matchModel.js"; 
import { fetchCricketMatches, fetchFootballMatches } from "../utils/api.js";

export const getLiveMatches = async (req, res) => {
    try {
        const cricketData = await fetchCricketMatches();
        const footballData = await fetchFootballMatches();

        const cricketMatches = cricketData.map((m, index) => {
 
  const teamAInfo = m.score?.[0]; // <-- ADDED
  const teamBInfo = m.score?.[1]; // <-- ADDED

  const scoreA = teamAInfo?.r ?? null;
  const scoreB = teamBInfo?.r ?? null;
  const oversA = teamAInfo?.o ?? null;
  const oversB = teamBInfo?.o ?? null;
  const wicketsA = teamAInfo?.w ?? null;
  const wicketsB = teamBInfo?.w ?? null;

  return {
    sport: "cricket",
    league: m.series || "Unknown League",
    teamA: m.teamInfo?.[0]?.name || "Team A",
    teamB: m.teamInfo?.[1]?.name || "Team B",
    scoreA: scoreA ? Number(scoreA) : null,
    scoreB: scoreB ? Number(scoreB) : null,
    oversA: oversA ? Number(oversA) : null,
    oversB: oversB ? Number(oversB) : null,
    wicketsA: wicketsA ? Number(wicketsA) : null,
    wicketsB: wicketsB ? Number(wicketsB) : null,
    status: m.status || "Unknown",
    date: m.date,
   matchID: m.id?.toString() || `cricket-${index}-${Date.now()}`, // ✅ fallback unique ID
  };
});

        const footballMatches = footballData.map((m, index) => {
  const home = m.score?.fullTime?.home;
  const away = m.score?.fullTime?.away;

  return {
    sport: "football",
    league: m.competition?.name || "Unknown League",
    teamA: m.homeTeam?.name || "Team A",
    teamB: m.awayTeam?.name || "Team B",
    scoreA: home == null || isNaN(Number(home)) ? null : Number(home),
    scoreB: away == null || isNaN(Number(away)) ? null : Number(away),
    status: m.status || "Unknown",
    date: m.utcDate,
     matchId: m.id?.toString() || `football-${index}-${Date.now()}`, // ✅ fallback unique ID
  };
});

        const combined = [...cricketMatches, ...footballMatches];
        for (const m of combined) {
  await Match.findOneAndUpdate(
    { matchId: m.matchId },
    { $set: m },
    { upsert: true } // ✅ add if not exists, update if exists
  );
}

// 🧹 delete only matches older than 5 days
await Match.deleteMany({
  date: { $lt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
});

        res.status(200).json({success: true, matches: combined});

    } catch (error) {
        console.error("Error fetching live matches:", error);
        res.status(500).json({message: "Failed to fetch live matches"});
    }
};

export const getMatchesFromDB = async (req, res) => {
    try {
        const matches = await Match.find().sort({createdAt: -1});
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};