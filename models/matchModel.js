import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(

{
    sport: {type: String, required: true},
    league: {type: String},
    teamA: {type: String, required: true},
    teamB: {type: String, required: true},
    scoreA: {type: Number, default: null},
    scoreB: {type: Number, default: null},
    oversA: { type: Number, default: null }, // ✅ add this
    oversB: { type: Number, default: null }, // ✅ add this
    wicketsA: { type: Number, default: null }, // optional but nice to have
    wicketsB: { type: Number, default: null }, // optional but nice to have
    status: { type: String, default: "upcoming" },
    date: {type: Date},
    matchId: {type: String, required: true, unique: true, sparse: true}, // unique identifier
},
{timestamps: true}
);

const Match = mongoose.model('Match', matchSchema);
export default Match;