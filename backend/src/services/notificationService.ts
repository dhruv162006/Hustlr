import prisma from "../config/db";
import logger from "../utils/logger";
import { NotificationType } from "@prisma/client";

// Global map to hold active socket connections. Will be populated by the Socket.io server.
export const activeUserSockets = new Map<string, string>(); // userId -> socketId
export let ioInstance: any = null;

export const setIoInstance = (io: any) => {
  ioInstance = io;
};

export const sendNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string
) => {
  try {
    // 1. Persist to DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        read: false,
      },
    });

    // 2. Emit via socket if online
    if (ioInstance) {
      const socketId = activeUserSockets.get(userId);
      if (socketId) {
        ioInstance.to(socketId).emit("notification", notification);
        logger.info(`Notification sent to online user socket: ${userId}`);
      } else {
        // Broadcast a private room emit if we use rooms (safer and cleaner)
        ioInstance.to(`user_${userId}`).emit("notification", notification);
        logger.info(`Notification sent to user room: user_${userId}`);
      }
    }

    return notification;
  } catch (error) {
    logger.error("Failed to send notification", error);
  }
};
