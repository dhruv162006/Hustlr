import { Router } from "express";
import {
  createPost,
  getPosts,
  likePost,
  commentPost,
  savePost,
} from "../controllers/communityController";
import { authenticateJWT } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { postSchema } from "../utils/schemas";

const router = Router();

router.get("/posts", authenticateJWT, getPosts);
router.post("/posts", authenticateJWT, validateRequest(postSchema), createPost);
router.post("/posts/:postId/like", authenticateJWT, likePost);
router.post("/posts/:postId/comment", authenticateJWT, commentPost);
router.post("/posts/:postId/save", authenticateJWT, savePost);

export default router;
