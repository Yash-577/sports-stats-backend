import Match from "../models/matchModel.js"; 
import { fetchCricketMatches, fetchFootballMatches } from "../utils/api.js";

let lastCricketFetchTime = 0;
let lastFootballFetchTime = 0;
const CRICKET_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FOOTBALL_CACHE_DURATION = 1 * 60 * 1000; // 1 minute

export const getLiveMatches = async (req, res) => {
    try {
        const now = Date.now();
        
        // ✅ Only fetch from external APIs every 5 minutes
        if (now - lastFetchTime > CACHE_DURATION) {
            console.log("📥 Fetching from external APIs...");
            
            const cricketData = await fetchCricketMatches();
            const footballData = await fetchFootballMatches();

            const cricketMatches = (cricketData || []).map((m, index) => {
                const teamAInfo = m.score?.[0];
                const teamBInfo = m.score?.[1];
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
                    matchId: m.id?.toString() || `cricket-${index}-${Date.now()}`,
                };
            });

            const footballMatches = (footballData || []).map((m, index) => {
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
                    matchId: m.id?.toString() || `football-${index}-${Date.now()}`,
                };
            });

            const combined = [...cricketMatches, ...footballMatches];

            // ✅ Only save LIVE matches (not finished/completed)
            for (const m of combined) {
                if (m.status !== "Completed" && m.status !== "Finished") {
                    await Match.findOneAndUpdate(
                        { matchId: m.matchId },
                        { $set: m },
                        { upsert: true }
                    );
                }
            }

            // ✅ Delete only completed matches older than 2 days (keep recent ones for reference)
            await Match.deleteMany({
                status: { $in: ["Completed", "Finished"] },
                date: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            });

            lastFetchTime = now;
            console.log(`✅ Updated live matches in DB (skipped ${combined.length - (combined.filter(m => m.status !== "Completed" && m.status !== "Finished").length)} finished matches)`);
        } else {
            console.log("⏱️ Using cached data (5 min cache)");
        }

        // Always return from database (cached + finished matches)
        const matches = await Match.find().sort({ date: -1 });
        res.status(200).json({ success: true, matches });
    } catch (error) {
        console.error("Error fetching live matches:", error);
        res.status(500).json({ message: "Failed to fetch live matches", matches: [] });
    }
};

export const getMatchesFromDB = async (req, res) => {
    try {
        const matches = await Match.find().sort({ createdAt: -1 });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
