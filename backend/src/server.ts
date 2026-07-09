import express from "express";
import http from "http";
import path from "path";
import { Server as SocketServer } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

// Sockets, Routes & Middlewares
import { configureSockets } from "./sockets/chatSocket";
import { setIoInstance } from "./services/notificationService";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import opportunityRoutes from "./routes/opportunityRoutes";
import teamRoutes from "./routes/teamRoutes";
import messageRoutes from "./routes/messageRoutes";
import communityRoutes from "./routes/communityRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import adminRoutes from "./routes/adminRoutes";
import errorHandler from "./middleware/error";
import logger from "./utils/logger";

async function startServer() {
  const PORT = process.env.PORT || 3000;
  const app = express();
  const server = http.createServer(app);

  // 1. Socket.io setup
  const io = new SocketServer(server, {
    cors: {
      origin: "*", // Handled by consolidated server route proxies
      methods: ["GET", "POST"],
    },
  });
  setIoInstance(io);
  configureSockets(io);

  // 2. Global Express Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again later." },
  });
  app.use("/api/", limiter);

  // 3. API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/opportunities", opportunityRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/community", communityRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/admin", adminRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // Global Error Handler
  app.use(errorHandler);

  // 4. Vite Frontend middleware integration
  if (process.env.NODE_ENV !== "production") {
    logger.info("Starting server in development mode, mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Starting server in production mode, serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error("Failed to start the consolidated backend server", error);
});
