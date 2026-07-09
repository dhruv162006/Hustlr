import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { uploadToCloudinary } from "../services/uploadService";
import logger from "../utils/logger";

export const getProfileByUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const profile = await prisma.profile.findFirst({
      where: { username },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
        skills: true,
        portfolios: true,
        experiences: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Fetch received reviews
    const reviews = await prisma.review.findMany({
      where: { targetUserId: profile.userId },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Structure response like MOCK_PROFILE
    const formattedProfile = {
      name: profile.user.name,
      username: profile.username,
      headline: profile.headline,
      university: profile.university,
      degree: profile.degree,
      gradYear: profile.gradYear,
      availability: profile.availability.replace(/_/g, " "), // Format enum
      isVerified: profile.user.isVerified,
      avatarGradient: profile.avatarGradient,
      bannerGradient: profile.bannerGradient,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      bio: profile.bio,
      socials: {
        github: profile.github,
        twitter: profile.twitter,
        portfolio: profile.portfolioUrl,
      },
      stats: {
        reputation: profile.reputation,
        collabScore: profile.collabScore,
        profileViews: profile.profileViews,
        projectsCompleted: profile.portfolios.length,
        reviews: reviews.length,
      },
      skills: profile.skills.map((s) => ({
        name: s.name,
        level: s.level,
        endorsements: s.endorsements,
      })),
      badges: profile.badges,
      portfolio: profile.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        description: p.description,
        tech: p.tech,
        metrics: p.metrics,
        link: p.link,
        imageUrl: p.imageUrl,
      })),
      experience: profile.experiences.map((e) => ({
        role: e.role,
        company: e.company,
        date: e.date,
        description: e.description,
      })),
      reviews: reviews.map((r) => ({
        author: r.author.name,
        role: r.author.role,
        text: r.text,
        rating: r.rating,
        date: r.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      })),
    };

    // Increment profile views
    await prisma.profile.update({
      where: { id: profile.id },
      data: { profileViews: { increment: 1 } },
    });

    return res.json(formattedProfile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { headline, bio, university, degree, gradYear, availability, github, twitter, portfolioUrl } = req.body;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    let avatarUrl = profile.avatarUrl;
    let bannerUrl = profile.bannerUrl;

    if (req.file) {
      const fieldname = req.file.fieldname;
      const url = await uploadToCloudinary(req.file.buffer, "hustlr_profiles");
      if (fieldname === "avatar") avatarUrl = url;
      if (fieldname === "banner") bannerUrl = url;
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        headline: headline !== undefined ? headline : profile.headline,
        bio: bio !== undefined ? bio : profile.bio,
        university: university !== undefined ? university : profile.university,
        degree: degree !== undefined ? degree : profile.degree,
        gradYear: gradYear !== undefined ? gradYear : profile.gradYear,
        availability: availability !== undefined ? (availability.toUpperCase().replace(/ /g, "_") as any) : profile.availability,
        github: github !== undefined ? github : profile.github,
        twitter: twitter !== undefined ? twitter : profile.twitter,
        portfolioUrl: portfolioUrl !== undefined ? portfolioUrl : profile.portfolioUrl,
        avatarUrl,
        bannerUrl,
      },
    });

    return res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { name, level } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Skill name is required" });
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const skill = await prisma.skill.create({
      data: {
        profileId: profile.id,
        name,
        level: (level?.toUpperCase() || "INTERMEDIATE") as any,
        endorsements: 0,
      },
    });

    return res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.params;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await prisma.skill.deleteMany({
      where: {
        profileId: profile.id,
        name,
      },
    });

    return res.json({ message: "Skill deleted" });
  } catch (error) {
    next(error);
  }
};

export const addPortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { title, type, description, tech, metrics, link } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Portfolio title and description are required" });
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "hustlr_portfolios");
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        profileId: profile.id,
        title,
        type: type || "Freelance Project",
        description,
        tech: tech ? (typeof tech === "string" ? JSON.parse(tech) : tech) : [],
        metrics: metrics || "",
        link: link || "",
        imageUrl,
      },
    });

    return res.status(201).json(portfolio);
  } catch (error) {
    next(error);
  }
};

export const deletePortfolio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await prisma.portfolio.deleteMany({
      where: {
        id,
        profileId: profile.id,
      },
    });

    return res.json({ message: "Portfolio item deleted" });
  } catch (error) {
    next(error);
  }
};

export const getTalents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, availability } = req.query;

    const whereClause: any = {};

    if (availability && availability !== "All") {
      whereClause.availability = (availability as string).toUpperCase().replace(/ /g, "_") as any;
    }

    if (category && category !== "All") {
      if (category === "Developers") {
        whereClause.headline = { contains: "Developer", mode: "insensitive" };
      } else if (category === "Designers") {
        whereClause.headline = { contains: "Designer", mode: "insensitive" };
      } else if (category === "AI/ML") {
        whereClause.headline = { contains: "AI", mode: "insensitive" };
      } else if (category === "Product") {
        whereClause.headline = { contains: "Product", mode: "insensitive" };
      }
    }

    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { user: { name: { contains: searchStr, mode: "insensitive" } } },
        { headline: { contains: searchStr, mode: "insensitive" } },
        { university: { contains: searchStr, mode: "insensitive" } },
        { skills: { any: { name: { contains: searchStr, mode: "insensitive" } } } },
      ];
    }

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            isVerified: true,
          },
        },
        skills: true,
        portfolios: true,
      },
      orderBy: { reputation: "desc" },
    });

    const formattedTalents = profiles.map((p) => ({
      id: p.id,
      name: p.user.name,
      role: p.headline || "Builder",
      university: p.university || "Other College",
      skills: p.skills.map((s) => s.name),
      reputation: p.reputation,
      projectsCompleted: p.portfolios.length,
      availability: p.availability.replace(/_/g, " "),
      badges: p.badges,
      bio: p.bio || "",
      avatarGradient: p.avatarGradient || "from-blue-500 to-indigo-600",
    }));

    return res.json(formattedTalents);
  } catch (error) {
    next(error);
  }
};

export const getBookmarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: { select: { name: true } },
            community: { select: { name: true } }
          }
        },
        opportunity: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = bookmarks.map(b => {
      if (b.post) {
        return {
          id: b.id,
          type: "post",
          postId: b.post.id,
          title: b.post.title || "Community Post",
          description: b.post.content,
          author: b.post.user.name,
          space: b.post.community.name,
          date: b.createdAt.toLocaleDateString()
        };
      } else if (b.opportunity) {
        return {
          id: b.id,
          type: "opportunity",
          opportunityId: b.opportunity.id,
          title: b.opportunity.title,
          description: b.opportunity.description,
          budget: b.opportunity.budget,
          clientName: b.opportunity.clientName,
          date: b.createdAt.toLocaleDateString()
        };
      }
      return null;
    }).filter(Boolean);

    return res.json(formatted);
  } catch (error) {
    next(error);
  }
};

