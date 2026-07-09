import { Router } from "express";
import {
  createOpportunity,
  editOpportunity,
  deleteOpportunity,
  getOpportunities,
  getOpportunityById,
  applyToOpportunity,
  getApplicationPipeline,
  toggleOpportunityBookmark,
} from "../controllers/opportunityController";
import { authenticateJWT, requireRole } from "../middleware/auth";
import upload from "../middleware/upload";
import { validateRequest } from "../middleware/validate";
import { opportunitySchema } from "../utils/schemas";

const router = Router();

router.get("/", getOpportunities);
router.get("/pipeline", authenticateJWT, getApplicationPipeline);
router.get("/:id", getOpportunityById);

// Protected routes
router.post("/", authenticateJWT, requireRole(["FOUNDER", "RECRUITER", "ADMIN"]), validateRequest(opportunitySchema), createOpportunity);
router.put("/:id", authenticateJWT, editOpportunity);
router.delete("/:id", authenticateJWT, deleteOpportunity);
router.post("/:id/apply", authenticateJWT, upload.single("resume"), applyToOpportunity);
router.post("/:id/bookmark", authenticateJWT, toggleOpportunityBookmark);

export default router;
