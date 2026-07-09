import { GoogleGenAI } from "@google/genai";
import prisma from "../config/db";
import logger from "../utils/logger";

const getGoogleAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY is not configured.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
};

export const getAIRecommendations = async (userId: string, type: "gigs" | "projects") => {
  try {
    const ai = getGoogleAI();
    if (!ai) {
      return { error: "AI Service not configured on host." };
    }

    // 1. Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { skills: true },
    });

    if (!profile) {
      return { error: "User profile not found." };
    }

    const skillsList = profile.skills.map((s) => s.name);
    const profileSummary = {
      name: profile.username,
      university: profile.university,
      degree: profile.degree,
      skills: skillsList,
      bio: profile.bio,
    };

    let prompt = "";

    if (type === "gigs") {
      // Fetch latest 10 opportunities
      const gigs = await prisma.opportunity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      if (gigs.length === 0) return [];

      prompt = `Given this student profile: ${JSON.stringify(profileSummary)}, and these available gigs: ${JSON.stringify(gigs)}. Recommend the top 2 gigs and explain briefly why they match in a JSON array format like: [{"gigId": "some-cuid", "reason": "Matches your React skills."}]`;
    } else {
      // Fetch latest 10 teams/projects
      const projects = await prisma.team.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      if (projects.length === 0) return [];

      prompt = `Given this student profile: ${JSON.stringify(profileSummary)}, and these projects: ${JSON.stringify(projects)}. Recommend the top 2 projects to join and explain briefly why in a JSON array format like: [{"projectId": "some-cuid", "reason": "They need a backend dev."}]`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      logger.error("Failed to parse Gemini recommendations JSON response", e);
      return [];
    }
  } catch (error) {
    logger.error("Error generating AI recommendations", error);
    return [];
  }
};
