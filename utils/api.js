 
import axios from 'axios';

export const fetchCricketMatches = async () => {
    try {
        const response = await axios.get(
            `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRIC_API_KEY}`
        );
        
        // ✅ Validate data structure
        if (response.data && Array.isArray(response.data.data)) {
            console.log(`✅ Cricket API: Found ${response.data.data.length} matches`);
            return response.data.data;
        } else {
            console.warn("⚠️ Cricket API: Unexpected data structure", response.data);
            return [];
        }
    } catch (error) {
        console.error("❌ Error fetching cricket data:", error.message);
        // Return empty array on error, never undefined
        return [];
    }
};

export const fetchFootballMatches = async () => {
    try {
        const response = await axios.get(
            "https://api.football-data.org/v4/matches",
            {
                headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
            }
        );
        
        // ✅ Validate data structure
        if (response.data && Array.isArray(response.data.matches)) {
            console.log(`✅ Football API: Found ${response.data.matches.length} matches`);
            return response.data.matches;
        } else {
            console.warn("⚠️ Football API: Unexpected data structure", response.data);
            return [];
        }
    } catch (error) {
        console.error("❌ Error fetching football data:", error.message);
        // Return empty array on error, never undefined
        return [];
    }
};
