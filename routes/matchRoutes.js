import express from "express";
import protect from "../middleware/auth.js";
import { getLiveMatches, getMatchesFromDB } from "../controllers/matchController.js";

const router = express.Router();

router.get("/live", getLiveMatches);

router.get("/", getMatchesFromDB);

export default router;