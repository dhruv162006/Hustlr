import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import logger from "../utils/logger";
import { sanitizeHtml } from "../utils/sanitize";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { communityId, title, content } = req.body;

    if (!title || !content || !communityId) {
      return res.status(400).json({ error: "CommunityId, title, and content are required" });
    }

    const sanitizedTitle = sanitizeHtml(title);
    const sanitizedContent = sanitizeHtml(content);

    const post = await prisma.post.create({
      data: {
        communityId,
        userId,
        title: sanitizedTitle,
        content: sanitizedContent,
        likesCount: 0,
        commentsCount: 0,
        likedBy: [],
        savedBy: [],
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { search, sortBy } = req.query;

    const whereClause: any = {};

    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { title: { contains: searchStr, mode: "insensitive" } },
        { content: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    let orderByClause: any = { createdAt: "desc" };
    if (sortBy === "top") {
      orderByClause = { likesCount: "desc" };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            role: true,
            profile: {
              select: {
                avatarGradient: true,
              },
            },
          },
        },
        community: {
          select: {
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          where: { userId: userId || "" }
        },
        bookmarks: {
          where: { userId: userId || "" }
        }
      },
      orderBy: orderByClause,
    });

    const formattedPosts = posts.map((post) => {
      const isLiked = post.likes.length > 0;
      const isSaved = post.bookmarks.length > 0;

      return {
        id: post.id,
        community: post.community.name,
        author: {
          name: post.user.name,
          role: post.user.role.toLowerCase(),
          avatarGradient: post.user.profile?.avatarGradient || "from-blue-600 to-indigo-600",
        },
        title: post.title,
        content: post.content,
        likes: post.likesCount,
        commentsCount: post.comments.length,
        liked: isLiked,
        saved: isSaved,
        time: post.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        comments: post.comments.map((c) => ({
          id: c.id,
          author: c.user.name,
          role: c.user.role.toLowerCase(),
          text: c.text,
          time: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        })),
      };
    });

    return res.json(formattedPosts);
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: userId || ""
        }
      }
    });

    let isLikedNow = false;
    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId: userId || ""
        }
      });
      isLikedNow = true;
    }

    const likesCount = await prisma.postLike.count({ where: { postId } });
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount }
    });

    return res.json({ likes: likesCount, liked: isLikedNow });
  } catch (error) {
    next(error);
  }
};

export const commentPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        text,
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    const formattedComment = {
      id: comment.id,
      author: comment.user.name,
      role: comment.user.role.toLowerCase(),
      text: comment.text,
      time: comment.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    return res.status(201).json(formattedComment);
  } catch (error) {
    next(error);
  }
};

export const savePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        postId,
        opportunityId: null
      }
    });

    let isSavedNow = false;
    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          postId
        }
      });
      isSavedNow = true;
    }

    return res.json({ saved: isSavedNow });
  } catch (error) {
    next(error);
  }
};
