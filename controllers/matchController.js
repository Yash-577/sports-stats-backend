import Match from "../models/matchModel.js"; 
import { fetchCricketMatches, fetchFootballMatches } from "../utils/api.js";

let lastCricketFetchTime = 0;
let lastFootballFetchTime = 0;
const CRICKET_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FOOTBALL_CACHE_DURATION = 1 * 60 * 1000; // 1 minute

export const getLiveMatches = async (req, res) => {
    try {
        const now = Date.now();
        
        // ✅ Fetch cricket every 5 minutes
        let cricketData = [];
        if (now - lastCricketFetchTime > CRICKET_CACHE_DURATION) {
            console.log("📥 Fetching cricket matches from API...");
            cricketData = await fetchCricketMatches();
            console.log("🔍 Cricket API Response:", JSON.stringify(cricketData, null, 2));
            lastCricketFetchTime = now;
        } else {
            console.log("⏱️ Using cached cricket data (5 min cache)");
        }

        // ✅ Fetch football every 1 minute
        let footballData = [];
        if (now - lastFootballFetchTime > FOOTBALL_CACHE_DURATION) {
            console.log("📥 Fetching football matches from API...");
            footballData = await fetchFootballMatches();
            lastFootballFetchTime = now;
        } else {
            console.log("⏱️ Using cached football data (1 min cache)");
        }

        // ✅ FIXED: Match scores by team name in inning field
        const cricketMatches = (cricketData || []).map((m, index) => {
            const teamA = m.teamInfo?.[0]?.name || "Team A";
            const teamB = m.teamInfo?.[1]?.name || "Team B";

            // Find scores by matching team name in inning field
            const firstInningA = m.score?.filter(s => s.inning?.includes(teamA))?.[0];
            const firstInningB = m.score?.filter(s => s.inning?.includes(teamB))?.[0];

            return {
                sport: "cricket",
                league: m.series || "Unknown League",
                teamA: teamA,
                teamB: teamB,
                scoreA: firstInningA?.r ? Number(firstInningA.r) : null,
                scoreB: firstInningB?.r ? Number(firstInningB.r) : null,
                oversA: firstInningA?.o ? Number(firstInningA.o) : null,
                oversB: firstInningB?.o ? Number(firstInningB.o) : null,
                wicketsA: firstInningA?.w ? Number(firstInningA.w) : null,
                wicketsB: firstInningB?.w ? Number(firstInningB.w) : null,
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

        // ✅ Delete only completed matches older than 3 days
        await Match.deleteMany({
            status: { $in: ["Completed", "Finished"] },
            date: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        });

        console.log(`✅ Updated live matches in DB (skipped ${combined.length - (combined.filter(m => m.status !== "Completed" && m.status !== "Finished").length)} finished matches)`);

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
