import { FastifyInstance } from "fastify";
import { GamificationService } from "./service.js";
import { authenticate } from "../../middleware/auth.js";

const svc = new GamificationService();

export async function gamificationRoutes(app: FastifyInstance) {
  app.get("/api/gamification/leaderboard", { preHandler: [authenticate], handler: async (req, rep) => { const { scope, limit } = req.query as any; rep.send(await svc.getLeaderboard(scope || "global", req.user!.organizationId, limit ? parseInt(limit) : 20)); } });
  app.get("/api/gamification/badges", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await svc.getBadges(req.user!.userId)) });
  app.get("/api/gamification/badges/all", { preHandler: [authenticate], handler: async (_req, rep) => rep.send(await svc.getAllBadges()) });
  app.get("/api/gamification/progress", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await svc.getUserProgress(req.user!.userId)) });
  app.get("/api/gamification/streaks", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await svc.getStreaks(req.user!.userId)) });
}
