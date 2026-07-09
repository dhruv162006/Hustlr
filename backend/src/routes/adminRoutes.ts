import { Router } from "express";
import {
  getAnalytics,
  getReports,
  updateReportStatus,
  getVerificationRequests,
  approveVerification,
} from "../controllers/adminController";
import { authenticateJWT, requireRole } from "../middleware/auth";

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(["ADMIN"]));

router.get("/analytics", getAnalytics);
router.get("/reports", getReports);
router.patch("/reports/:id", updateReportStatus);
router.get("/verifications", getVerificationRequests);
router.post("/verifications/:id/approve", approveVerification);

export default router;
