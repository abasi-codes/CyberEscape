import { FastifyInstance } from "fastify";
import { RoomService } from "./room.service.js";
import { GameEngine } from "../engine/game-engine.js";
import { authenticate } from "../../../middleware/auth.js";

const roomService = new RoomService();
const gameEngine = new GameEngine();

export async function roomRoutes(app: FastifyInstance) {
  app.get("/api/rooms", { preHandler: [authenticate], handler: async (_req, rep) => rep.send(await roomService.list()) });

  app.get<{ Params: { id: string } }>("/api/rooms/:id", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await roomService.getById((req.params as any).id)) });

  app.post<{ Params: { id: string } }>("/api/rooms/:id/start", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await gameEngine.startRoom(req.user!.userId, (req.params as any).id)) });

  app.get("/api/rooms/progress", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await roomService.getAllUserProgress(req.user!.userId)) });

  app.post<{ Params: { id: string } }>("/api/rooms/:id/activate-puzzle", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await gameEngine.activatePuzzle(req.user!.userId, (req.params as any).id)) });

  app.post<{ Params: { id: string } }>("/api/rooms/:id/debrief", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await gameEngine.moveToDebrief(req.user!.userId, (req.params as any).id)) });
}
