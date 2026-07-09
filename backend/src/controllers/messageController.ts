import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import logger from "../utils/logger";

export const getChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    const participants = await prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: {
                      select: {
                        avatarGradient: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { timestamp: "desc" },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { chat: { updatedAt: "desc" } },
    });

    const formattedChats = participants.map((p) => {
      const chat = p.chat;
      const lastMsg = chat.messages[0];
      
      let chatName = chat.name;
      let avatarGradient = chat.avatarGradient;
      let avatarText = chat.avatarText;
      let online = false;

      if (chat.type === "DIRECT") {
        // If direct chat, use the other participant's details
        const otherParticipant = chat.participants.find((part) => part.userId !== userId);
        if (otherParticipant) {
          chatName = otherParticipant.user.name;
          avatarGradient = otherParticipant.user.profile?.avatarGradient || "from-gray-700 to-gray-800";
          avatarText = otherParticipant.user.name.charAt(0);
          online = true; // Simulating active online statuses for simplicity
        }
      }

      return {
        id: chat.id,
        type: chat.type.toLowerCase(),
        name: chatName || "Chat Hub",
        avatarGradient: avatarGradient || "from-blue-600 to-indigo-600",
        avatarText: avatarText || "C",
        unread: p.unreadCount,
        online,
        lastMessage: lastMsg ? `${lastMsg.sender.id === userId ? "You" : lastMsg.sender.name.split(" ")[0]}: ${lastMsg.text}` : "No messages yet.",
        lastMessageTime: lastMsg ? lastMsg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        participants: chat.participants.length,
      };
    });

    return res.json(formattedChats);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.userId;

    // Reset unread count for this participant
    await prisma.chatParticipant.updateMany({
      where: { chatId, userId },
      data: { unreadCount: 0 },
    });

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatarGradient: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: { timestamp: "asc" },
    });

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      chatId: m.chatId,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderAvatar: m.sender.name.charAt(0),
      text: m.text,
      timestamp: m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: m.senderId === userId,
      attachments: m.attachments.map((att) => ({
        type: att.type,
        name: att.name,
        size: att.size,
        url: att.url,
      })),
      reactions: m.reactions ? JSON.parse(JSON.stringify(m.reactions)) : [],
    }));

    return res.json(formattedMessages);
  } catch (error) {
    next(error);
  }
};

export const createDirectChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const myUserId = req.user?.userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "Target userId is required" });
    }

    if (myUserId === targetUserId) {
      return res.status(400).json({ error: "Cannot start a chat with yourself" });
    }

    // Check if direct chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: "DIRECT",
        participants: { every: { userId: { in: [myUserId, targetUserId] } } },
      },
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    const newChat = await prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          type: "DIRECT",
        },
      });

      await tx.chatParticipant.createMany({
        data: [
          { chatId: chat.id, userId: myUserId },
          { chatId: chat.id, userId: targetUserId },
        ],
      });

      return chat;
    });

    return res.status(201).json(newChat);
  } catch (error) {
    next(error);
  }
};
