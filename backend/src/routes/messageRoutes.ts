import { Router } from "express";
import {
  getChats,
  getMessages,
  createDirectChat,
} from "../controllers/messageController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.use(authenticateJWT);

router.get("/chats", getChats);
router.get("/chats/:chatId/messages", getMessages);
router.post("/chats/direct", createDirectChat);

export default router;
