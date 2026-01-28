import { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
import { registerGameHandlers } from "./handlers/game.js";
import { registerTeamHandlers } from "./handlers/team.js";
import { registerChatHandlers } from "./handlers/chat.js";
import type { JwtPayload } from "../middleware/auth.js";

export function setupWebSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, { cors: { origin: config.cors.origin, methods: ["GET", "POST"] }, path: "/ws" });

  try {
    const pub = new Redis({ host: config.redis.host, port: config.redis.port, password: config.redis.password, lazyConnect: true });
    const sub = pub.duplicate();
    Promise.all([pub.connect(), sub.connect()]).then(() => { io.adapter(createAdapter(pub, sub)); logger.info("Socket.IO Redis adapter connected"); }).catch((e) => logger.warn({ e }, "Redis adapter unavailable"));
  } catch { logger.warn("Redis adapter setup skipped"); }

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    if (\!token) return next(new Error("Authentication required"));
    try { (socket as any).user = jwt.verify(token, config.jwt.secret) as JwtPayload; next(); }
    catch { next(new Error("Invalid token")); }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user as JwtPayload;
    logger.debug({ userId: user.userId }, "Socket connected");
    socket.join("user:" + user.userId);
    registerGameHandlers(io, socket, user);
    registerTeamHandlers(io, socket, user);
    registerChatHandlers(io, socket, user);
    socket.on("disconnect", () => logger.debug({ userId: user.userId }, "Socket disconnected"));
  });

  return io;
}
