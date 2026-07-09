import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { uploadToCloudinary } from "../services/uploadService";
import { sendNotification } from "../services/notificationService";
import logger from "../utils/logger";
import { OpportunityType, WorkMode, ApplicationStatus } from "@prisma/client";
import { sanitizeHtml } from "../utils/sanitize";

export const createOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user?.userId;
    const { title, description, budget, tags, deadline, projectType, duration, teamSizeNeeded, workMode } = req.body;

    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({ error: "Title, description, budget, and deadline are required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: creatorId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sanitizedTitle = sanitizeHtml(title);
    const sanitizedDesc = sanitizeHtml(description);

    const opportunity = await prisma.opportunity.create({
      data: {
        creatorId,
        title: sanitizedTitle,
        description: sanitizedDesc,
        budget,
        tags: Array.isArray(tags) ? tags : [],
        clientName: user.name,
        clientReputation: user.profile?.reputation || 5.0,
        deadline: new Date(deadline),
        projectType: (projectType?.toUpperCase().replace(/ /g, "_") || "STARTUP_PROJECT") as OpportunityType,
        duration: duration || "1-3 months",
        teamSizeNeeded: teamSizeNeeded ? parseInt(teamSizeNeeded.toString()) : 1,
        workMode: (workMode?.toUpperCase().replace(/ /g, "_") || "REMOTE") as WorkMode,
      },
    });

    logger.info(`Opportunity created by user ${creatorId}: ${opportunity.id}`);
    return res.status(201).json(opportunity);
  } catch (error) {
    next(error);
  }
};

export const editOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user?.userId;
    const { id } = req.params;
    const { title, description, budget, tags, deadline, projectType, duration, teamSizeNeeded, workMode } = req.body;

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    if (opportunity.creatorId !== creatorId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access forbidden: you are not the creator of this opportunity" });
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        title: title || opportunity.title,
        description: description || opportunity.description,
        budget: budget || opportunity.budget,
        tags: Array.isArray(tags) ? tags : opportunity.tags,
        deadline: deadline ? new Date(deadline) : opportunity.deadline,
        projectType: projectType ? (projectType.toUpperCase().replace(/ /g, "_") as OpportunityType) : opportunity.projectType,
        duration: duration || opportunity.duration,
        teamSizeNeeded: teamSizeNeeded ? parseInt(teamSizeNeeded.toString()) : opportunity.teamSizeNeeded,
        workMode: workMode ? (workMode.toUpperCase().replace(/ /g, "_") as WorkMode) : opportunity.workMode,
      },
    });

    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creatorId = req.user?.userId;
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    if (opportunity.creatorId !== creatorId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Access forbidden: you are not the creator of this opportunity" });
    }

    await prisma.opportunity.delete({ where: { id } });

    return res.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, type, budget } = req.query;

    const whereClause: any = {};

    if (type && type !== "All Types") {
      whereClause.projectType = (type as string).toUpperCase().replace(/ /g, "_") as OpportunityType;
    }

    if (category && category !== "All") {
      // Map frontend category to tags search
      whereClause.tags = {
        hasSome: [category as string, (category === "Development" ? "React Native" : "")].filter(Boolean),
      };
    }

    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { title: { contains: searchStr, mode: "insensitive" } },
        { description: { contains: searchStr, mode: "insensitive" } },
        { tags: { has: searchStr } },
      ];
    }

    // Map budget filter (e.g. Free, Paid, or ranges)
    if (budget) {
      if (budget === "Free") {
        whereClause.budget = "Free";
      } else if (budget === "₹5k+") {
        // Simple search string check or regex
        whereClause.budget = { not: "Free" };
      }
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        applications: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response to fit Frontend Gig interface
    const formattedGigs = opportunities.map((opp) => ({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      budget: opp.budget,
      tags: opp.tags,
      client: opp.clientName,
      clientReputation: opp.clientReputation,
      date: opp.createdAt.toISOString(),
      deadline: opp.deadline.toISOString(),
      projectType: opp.projectType.toLowerCase().replace(/_/g, " "),
      duration: opp.duration,
      applicants: opp.applications.length,
      teamSizeNeeded: opp.teamSizeNeeded,
      workMode: opp.workMode.toLowerCase().replace(/_/g, " "),
    }));

    return res.json(formattedGigs);
  } catch (error) {
    next(error);
  }
};

export const getOpportunityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            isVerified: true,
            profile: {
              select: {
                reputation: true,
                headline: true,
              },
            },
          },
        },
        applications: true,
      },
    });

    if (!opp) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    // Format to frontend specifications
    const formatted = {
      id: opp.id,
      title: opp.title,
      description: opp.description,
      budget: opp.budget,
      tags: opp.tags,
      client: opp.clientName,
      clientReputation: opp.clientReputation,
      date: opp.createdAt.toISOString(),
      deadline: opp.deadline.toISOString(),
      projectType: opp.projectType.toLowerCase().replace(/_/g, " "),
      duration: opp.duration,
      applicants: opp.applications.length,
      teamSizeNeeded: opp.teamSizeNeeded,
      workMode: opp.workMode.toLowerCase().replace(/_/g, " "),
      creator: {
        name: opp.creator.name,
        headline: opp.creator.profile?.headline || "Campus Creator",
        isVerified: opp.creator.isVerified,
      },
    };

    return res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const applyToOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicantId = req.user?.userId;
    const { id: opportunityId } = req.params;
    const { proposal, githubLink, otherLinks } = req.body;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        opportunityId_applicantId: {
          opportunityId,
          applicantId,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied to this opportunity" });
    }

    let resumeUrl = null;
    if (req.file) {
      resumeUrl = await uploadToCloudinary(req.file.buffer, "hustlr_resumes");
    }

    const parsedOtherLinks = otherLinks ? (typeof otherLinks === "string" ? JSON.parse(otherLinks) : otherLinks) : [];

    const application = await prisma.application.create({
      data: {
        opportunityId,
        applicantId,
        proposal,
        resumeUrl,
        githubLink,
        otherLinks: parsedOtherLinks,
      },
    });

    // Notify opportunity owner
    await sendNotification(
      opportunity.creatorId,
      "APPLICATION_STATUS",
      "New Applicant",
      `Someone applied to your opportunity: "${opportunity.title}"`
    );

    return res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

export const getApplicationPipeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applicantId = req.user?.userId;

    const applications = await prisma.application.findMany({
      where: { applicantId },
      include: {
        opportunity: {
          select: {
            title: true,
            clientName: true,
            budget: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pipeline = applications.map((app) => ({
      id: app.id,
      opportunityId: app.opportunityId,
      title: app.opportunity.title,
      clientName: app.opportunity.clientName,
      budget: app.opportunity.budget,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
    }));

    return res.json(pipeline);
  } catch (error) {
    next(error);
  }
};

export const toggleOpportunityBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id: opportunityId } = req.params;

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        opportunityId,
        postId: null
      }
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      return res.json({ bookmarked: false, message: "Bookmark removed" });
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          opportunityId
        }
      });
      return res.json({ bookmarked: true, message: "Bookmark added" });
    }
  } catch (error) {
    next(error);
  }
};

