import { Server, Socket } from "socket.io";
import prisma from "../config/db";
import { activeUserSockets, sendNotification } from "../services/notificationService";
import logger from "../utils/logger";
import { verifyAccessToken } from "../utils/jwt";

export const configureSockets = (io: Server) => {
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication error: token missing"));
      }
      const decoded = verifyAccessToken(token as string);
      socket.data = { userId: decoded.userId, email: decoded.email, role: decoded.role };
      next();
    } catch (error) {
      logger.warn("Socket handshake auth failed", error);
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected to Socket.io: ${userId} (Socket: ${socket.id})`);

    // Track active connection
    activeUserSockets.set(userId, socket.id);
    socket.join(`user_${userId}`); // Private room for target alerts

    // Broadcast online presence
    socket.broadcast.emit("user_status", { userId, status: "online" });

    // Join specific chat room
    socket.on("join_chat", (chatId: string) => {
      socket.join(`chat_${chatId}`);
      logger.info(`Socket ${socket.id} joined room chat_${chatId}`);
    });

    // Leave specific chat room
    socket.on("leave_chat", (chatId: string) => {
      socket.leave(`chat_${chatId}`);
      logger.info(`Socket ${socket.id} left room chat_${chatId}`);
    });

    // Real-time typing indicators
    socket.on("typing", (data: { chatId: string; username: string }) => {
      socket.to(`chat_${data.chatId}`).emit("user_typing", {
        chatId: data.chatId,
        userId,
        username: data.username,
        isTyping: true,
      });
    });

    socket.on("stop_typing", (data: { chatId: string }) => {
      socket.to(`chat_${data.chatId}`).emit("user_typing", {
        chatId: data.chatId,
        userId,
        isTyping: false,
      });
    });

    // Send Message Event
    socket.on("send_message", async (data: { chatId: string; text: string; attachments?: any[] }) => {
      try {
        const { chatId, text, attachments } = data;

        if (!chatId || !text) {
          return;
        }

        // 1. Save to DB
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: userId,
            text,
            reactions: "[]",
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // 2. Format to fit frontend model
        const formattedMsg = {
          id: message.id,
          chatId: message.chatId,
          senderId: message.senderId,
          senderName: message.sender.name,
          senderAvatar: message.sender.name.charAt(0),
          text: message.text,
          timestamp: message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false, // Will be set to true on the sender's client
          attachments: [],
          reactions: [],
        };

        // 3. Emit message to all clients in room
        io.to(`chat_${chatId}`).emit("receive_message", formattedMsg);

        // 4. Update Chat Participant unread counts
        const otherParticipants = await prisma.chatParticipant.findMany({
          where: {
            chatId,
            userId: { not: userId },
          },
        });

        for (const participant of otherParticipants) {
          await prisma.chatParticipant.update({
            where: { id: participant.id },
            data: { unreadCount: { increment: 1 } },
          });

          // Send push/in-app alert notification
          await sendNotification(
            participant.userId,
            "NEW_MESSAGE",
            "New Message",
            `${message.sender.name.split(" ")[0]}: ${text}`
          );
        }

        // Update chat parent record timestamps
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

      } catch (error) {
        logger.error("Failed to save or broadcast real-time socket message", error);
      }
    });

    // Workspace Team Join Event
    socket.on("join_team", (teamId: string) => {
      socket.join(`team_${teamId}`);
      logger.info(`Socket ${socket.id} joined room team_${teamId}`);
    });

    socket.on("leave_team", (teamId: string) => {
      socket.leave(`team_${teamId}`);
      logger.info(`Socket ${socket.id} left room team_${teamId}`);
    });

    // Broadcast Task Status Movements
    socket.on("move_task", (data: { teamId: string; taskId: string; status: string }) => {
      socket.to(`team_${data.teamId}`).emit("task_moved", {
        taskId: data.taskId,
        status: data.status
      });
      logger.info(`Broadcast task ${data.taskId} moved to ${data.status} in team ${data.teamId}`);
    });

    // Read Receipts
    socket.on("read_chat", async (chatId: string) => {
      try {
        await prisma.chatParticipant.updateMany({
          where: { chatId, userId },
          data: { unreadCount: 0 },
        });

        socket.to(`chat_${chatId}`).emit("chat_read", { chatId, userId });
      } catch (error) {
        logger.error("Failed to update chat read receipt", error);
      }
    });

    // Disconnect Handler
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${userId} (Socket: ${socket.id})`);
      activeUserSockets.delete(userId);
      socket.broadcast.emit("user_status", { userId, status: "offline" });
    });
  });
};
