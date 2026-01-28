import http from "http";
import { Server as SocketIOServer } from "socket.io";
import * as mediasoup from "mediasoup";
import type { Worker } from "mediasoup/node/lib/types.js";
import pino from "pino";
import { config } from "./config.js";
import { RoomManager } from "./room-manager.js";

const logger = pino({ name: "media-server" });

const workers: Worker[] = [];
let roomManager: RoomManager;

async function createWorkers(): Promise<Worker[]> {
  const created: Worker[] = [];
  for (let i = 0; i < config.numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: config.workerSettings.logLevel,
      logTags: config.workerSettings.logTags as unknown as mediasoup.types.WorkerLogTag[],
      rtcMinPort: config.workerSettings.rtcMinPort,
      rtcMaxPort: config.workerSettings.rtcMaxPort,
    });

    worker.on("died", () => {
      logger.error({ pid: worker.pid }, "mediasoup worker died, exiting");
      setTimeout(() => process.exit(1), 2000);
    });

    created.push(worker);
    logger.info({ pid: worker.pid, index: i }, "mediasoup worker created");
  }
  return created;
}

function verifyToken(token: string | undefined): { userId: string } | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return { userId: payload.sub || payload.userId || payload.id || "anonymous" };
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const httpServer = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "media-server" }));
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const createdWorkers = await createWorkers();
  workers.push(...createdWorkers);
  roomManager = new RoomManager(workers);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const user = verifyToken(token);
    if (!user) {
      return next(new Error("Authentication failed"));
    }
    (socket.data as Record<string, unknown>).userId = user.userId;
    next();
  });

  io.on("connection", (socket) => {
    const peerId = socket.data.userId as string;
    let currentRoomId: string | null = null;

    logger.info({ peerId, socketId: socket.id }, "Client connected");

    socket.on("getRouterRtpCapabilities", (data: { roomId: string }, callback) => {
      try {
        const caps = roomManager.getRtpCapabilities(data.roomId);
        if (!caps) {
          callback({ error: "Room not found, join first" });
          return;
        }
        callback({ rtpCapabilities: caps });
      } catch (err) {
        logger.error(err, "getRouterRtpCapabilities error");
        callback({ error: (err as Error).message });
      }
    });

    socket.on("joinRoom", async (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;
        currentRoomId = roomId;

        await roomManager.addPeer(roomId, peerId, socket);
        await socket.join(roomId);

        const rtpCapabilities = roomManager.getRtpCapabilities(roomId);
        const existingProducers = roomManager.getProducersForPeer(roomId, peerId);

        const otherSockets = roomManager.getOtherPeerSockets(roomId, peerId);
        for (const s of otherSockets) {
          s.emit("newPeer", { peerId });
        }

        logger.info({ roomId, peerId }, "Peer joined room");
        callback({
          rtpCapabilities,
          existingProducers,
        });
      } catch (err) {
        logger.error(err, "joinRoom error");
        callback({ error: (err as Error).message });
      }
    });

    socket.on("leaveRoom", (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;

        const otherSockets = roomManager.getOtherPeerSockets(roomId, peerId);
        for (const s of otherSockets) {
          s.emit("peerLeft", { peerId });
        }

        roomManager.removePeer(roomId, peerId);
        socket.leave(roomId);
        currentRoomId = null;

        logger.info({ roomId, peerId }, "Peer left room");
        callback({ success: true });
      } catch (err) {
        logger.error(err, "leaveRoom error");
        callback({ error: (err as Error).message });
      }
    });

    socket.on(
      "createWebRtcTransport",
      async (data: { direction: "send" | "recv" }, callback) => {
        try {
          if (!currentRoomId) {
            callback({ error: "Not in a room" });
            return;
          }
          const transportParams = await roomManager.createTransport(
            currentRoomId,
            peerId,
            data.direction
          );
          callback(transportParams);
        } catch (err) {
          logger.error(err, "createWebRtcTransport error");
          callback({ error: (err as Error).message });
        }
      }
    );

    socket.on(
      "connectTransport",
      async (
        data: { transportId: string; dtlsParameters: unknown },
        callback
      ) => {
        try {
          if (!currentRoomId) {
            callback({ error: "Not in a room" });
            return;
          }
          await roomManager.connectTransport(
            currentRoomId,
            peerId,
            data.transportId,
            data.dtlsParameters as mediasoup.types.DtlsParameters
          );
          callback({ success: true });
        } catch (err) {
          logger.error(err, "connectTransport error");
          callback({ error: (err as Error).message });
        }
      }
    );

    socket.on(
      "produce",
      async (
        data: {
          transportId: string;
          kind: "audio" | "video";
          rtpParameters: unknown;
        },
        callback
      ) => {
        try {
          if (!currentRoomId) {
            callback({ error: "Not in a room" });
            return;
          }
          const producerId = await roomManager.produce(
            currentRoomId,
            peerId,
            data.transportId,
            data.kind,
            data.rtpParameters as mediasoup.types.RtpParameters
          );

          const otherSockets = roomManager.getOtherPeerSockets(
            currentRoomId,
            peerId
          );
          for (const s of otherSockets) {
            s.emit("newProducer", {
              peerId,
              producerId,
              kind: data.kind,
            });
          }

          callback({ producerId });
        } catch (err) {
          logger.error(err, "produce error");
          callback({ error: (err as Error).message });
        }
      }
    );

    socket.on(
      "consume",
      async (
        data: { producerId: string; rtpCapabilities: unknown },
        callback
      ) => {
        try {
          if (!currentRoomId) {
            callback({ error: "Not in a room" });
            return;
          }
          const consumerParams = await roomManager.consume(
            currentRoomId,
            peerId,
            data.producerId,
            data.rtpCapabilities as mediasoup.types.RtpCapabilities
          );
          callback(consumerParams);
        } catch (err) {
          logger.error(err, "consume error");
          callback({ error: (err as Error).message });
        }
      }
    );

    socket.on(
      "resume",
      async (data: { consumerId: string }, callback) => {
        try {
          if (!currentRoomId) {
            callback({ error: "Not in a room" });
            return;
          }
          await roomManager.resumeConsumer(
            currentRoomId,
            peerId,
            data.consumerId
          );
          callback({ success: true });
        } catch (err) {
          logger.error(err, "resume error");
          callback({ error: (err as Error).message });
        }
      }
    );

    socket.on(
      "closeProducer",
      (data: { producerId: string }, callback) => {
        try {
          if (!currentRoomId) {
            callback({ error: "Not in a room" });
            return;
          }
          roomManager.closeProducer(currentRoomId, peerId, data.producerId);

          const otherSockets = roomManager.getOtherPeerSockets(
            currentRoomId,
            peerId
          );
          for (const s of otherSockets) {
            s.emit("producerClosed", {
              peerId,
              producerId: data.producerId,
            });
          }

          callback({ success: true });
        } catch (err) {
          logger.error(err, "closeProducer error");
          callback({ error: (err as Error).message });
        }
      }
    );

    socket.on("disconnect", () => {
      logger.info({ peerId, socketId: socket.id }, "Client disconnected");

      if (currentRoomId) {
        const otherSockets = roomManager.getOtherPeerSockets(
          currentRoomId,
          peerId
        );
        for (const s of otherSockets) {
          s.emit("peerLeft", { peerId });
        }

        roomManager.removePeer(currentRoomId, peerId);
        currentRoomId = null;
      }
    });
  });

  httpServer.listen(config.port, () => {
    logger.info(
      { port: config.port, workers: workers.length },
      "Media server listening"
    );
  });

  const shutdown = async () => {
    logger.info("Shutting down gracefully...");

    io.close();
    httpServer.close();

    for (const worker of workers) {
      worker.close();
    }

    logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.fatal(err, "Failed to start media server");
  process.exit(1);
});
