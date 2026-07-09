import { Router } from "express";
import {
  getDashboardStats,
  getDashboardTodayFocus,
} from "../controllers/dashboardController";
import { authenticateJWT } from "../middleware/auth";
import { getAIRecommendations } from "../services/aiService";

const router = Router();

router.use(authenticateJWT);

router.get("/stats", getDashboardStats);
router.get("/today-focus", getDashboardTodayFocus);

router.post("/ai/recommend", async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { type } = req.body; // gigs or projects
    const recommendations = await getAIRecommendations(userId || "", type || "gigs");
    return res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

export default router;
