 
import axios from 'axios';

export const fetchCricketMatches = async () => {
    try {
        const response = await axios.get( `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRIC_API_KEY}` 

        );

        return response.data.data;

    } catch (error) {
        console.error("Error fetching cricket data:", error.message);
        return [];
    }

};

export const fetchFootballMatches = async () => {
    try {
        const response = await axios.get(  "https://api.football-data.org/v4/matches",

            {
                headers: {"X-Auth-Token": process.env.FOOTBALL_API_KEY},
            }
        );
        return response.data.matches;

    } catch (error) {
        console.error("Error fetching football data:", error.message);
        return [];
    }
};