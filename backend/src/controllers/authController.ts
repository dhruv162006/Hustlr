import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import logger from "../utils/logger";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, college, degree, gradYear, skills, goals } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Determine Role
    let role = "STUDENT";
    if (goals?.includes("startup")) {
      role = "FOUNDER";
    }

    // Create user, profile, skills, and portfolio database transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role as any,
          isVerified: true, // Default to true for ease of use in student network
        },
      });

      const username = "@" + email.split("@")[0] + "_" + Math.floor(1000 + Math.random() * 9000);
      
      const mappedBadges = goals ? (goals as string[]).map(g => {
        if (g === "freelance") return "Top Freelancer";
        if (g === "projects") return "Rising Builder";
        if (g === "startup") return "Founder";
        return "Verified Developer";
      }) : ["Student"];

      const profile = await tx.profile.create({
        data: {
          userId: newUser.id,
          username,
          university: college,
          degree,
          gradYear,
          bio: `I am a student at ${college} building projects in HUSTLR.`,
          badges: mappedBadges,
        },
      });

      if (skills && Array.isArray(skills)) {
        await tx.skill.createMany({
          data: skills.map((s: string) => ({
            profileId: profile.id,
            name: s,
            level: "INTERMEDIATE",
            endorsements: 0,
          })),
        });
      }

      return newUser;
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    logger.info(`User registered successfully: ${user.email}`);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    logger.info(`User logged in successfully: ${user.email}`);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        username: user.profile?.username,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const usedRefreshTokens = new Set<string>();

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      usedRefreshTokens.add(token);
    }
    res.clearCookie("refreshToken", {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    return res.json({ message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "Refresh token missing" });
    }

    if (usedRefreshTokens.has(token)) {
      res.clearCookie("refreshToken", { ...COOKIE_OPTIONS, maxAge: 0 });
      logger.warn(`Refresh token reuse detected. Invalidating user session.`);
      return res.status(403).json({ error: "Access denied. Token has already been used." });
    }

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Invalidate old token
    usedRefreshTokens.add(token);

    // Generate rotated tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Set rotated cookie
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return res.json({ accessToken });
  } catch (error) {
    logger.warn("Refresh token validation failed", error);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`Password reset requested for: ${email}`);
    // Simulate email dispatch
    return res.json({ message: "Password reset link sent to email (simulated)" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    // In a full implementation, verify password reset token. Here, we simulate by updating the user.
    return res.json({ message: "Password reset successfully (simulated)" });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    return res.json({ message: "Email verified successfully (simulated)" });
  } catch (error) {
    next(error);
  }
};
