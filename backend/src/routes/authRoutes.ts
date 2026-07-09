import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController";
import { validateRequest } from "../middleware/validate";
import { registerSchema, loginSchema } from "../utils/schemas";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);

export default router;
