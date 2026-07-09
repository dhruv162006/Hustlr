import { Router } from "express";
import {
  createTeam,
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  getTeamDetails,
  createTask,
  updateTaskStatus,
  getUserTeams,
} from "../controllers/teamController";
import { authenticateJWT } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { teamSchema, taskSchema } from "../utils/schemas";

const router = Router();

router.use(authenticateJWT);

router.get("/", getUserTeams);
router.post("/", validateRequest(teamSchema), createTeam);
router.get("/:teamId", getTeamDetails);
router.post("/:teamId/invite", inviteMember);
router.post("/:teamId/accept", acceptInvitation);
router.post("/:teamId/reject", rejectInvitation);
router.post("/:teamId/tasks", validateRequest(taskSchema), createTask);
router.patch("/tasks/:taskId", updateTaskStatus);

export default router;
