import { Router } from "express";
import {
  getProfileByUsername,
  updateProfile,
  addSkill,
  deleteSkill,
  addPortfolio,
  deletePortfolio,
  getTalents,
  getBookmarks,
} from "../controllers/profileController";
import { authenticateJWT } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

router.get("/saved/bookmarks", authenticateJWT, getBookmarks);
router.get("/talents", getTalents);
router.get("/:username", getProfileByUsername);

// Protected routes
router.patch("/update", authenticateJWT, upload.single("avatar"), updateProfile);
router.post("/skills", authenticateJWT, addSkill);
router.delete("/skills/:name", authenticateJWT, deleteSkill);
router.post("/portfolio", authenticateJWT, upload.single("portfolioImage"), addPortfolio);
router.delete("/portfolio/:id", authenticateJWT, deletePortfolio);

export default router;
