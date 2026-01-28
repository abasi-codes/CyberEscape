import { FastifyInstance } from "fastify";
import { AnalyticsService } from "./service.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";

const svc = new AnalyticsService();

export async function analyticsRoutes(app: FastifyInstance) {
  app.get("/api/analytics/overview", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => rep.send(await svc.getOrgOverview(req.user\!.organizationId)) });
  app.get<{ Params: { groupId: string } }>("/api/analytics/groups/:groupId", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => rep.send(await svc.getByGroup(req.user\!.organizationId, (req.params as any).groupId)) });
  app.get<{ Params: { roomId: string } }>("/api/analytics/rooms/:roomId", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => rep.send(await svc.getByRoom(req.user\!.organizationId, (req.params as any).roomId)) });
  app.get<{ Params: { userId: string } }>("/api/analytics/users/:userId", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => rep.send(await svc.getByUser((req.params as any).userId)) });
  app.get("/api/analytics/risk-users", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => rep.send(await svc.getRiskUsers(req.user\!.organizationId)) });
}
