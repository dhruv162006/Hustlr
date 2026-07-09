import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import logger from "../utils/logger";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn("JWT authentication failed", error);
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden: insufficient permissions" });
    }

    next();
  };
};
