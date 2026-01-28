import { FastifyInstance } from "fastify";
import { PuzzleService } from "./puzzle.service.js";
import { GameEngine } from "../engine/game-engine.js";
import { authenticate } from "../../../middleware/auth.js";

const puzzleService = new PuzzleService();
const gameEngine = new GameEngine();

export async function puzzleRoutes(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>("/api/puzzles/:id", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await puzzleService.getById((req.params as any).id)) });

  app.post<{ Params: { id: string }; Body: { roomId: string; answer: unknown } }>("/api/puzzles/:id/submit", { preHandler: [authenticate], handler: async (req, rep) => { const { roomId, answer } = req.body as any; rep.send(await gameEngine.submitAnswer(req.user\!.userId, roomId, (req.params as any).id, answer)); } });

  app.post<{ Params: { id: string }; Body: { roomId: string } }>("/api/puzzles/:id/hint", { preHandler: [authenticate], handler: async (req, rep) => { const { roomId } = req.body as any; rep.send(await gameEngine.requestHint(req.user\!.userId, roomId, (req.params as any).id)); } });

  app.get<{ Params: { id: string } }>("/api/puzzles/:id/attempts", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await puzzleService.getAttempts(req.user\!.userId, (req.params as any).id)) });
}
