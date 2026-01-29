import { FastifyInstance } from "fastify";
import { AlertService } from "./service.js";
import { createAlertSchema } from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validateBody } from "../../middleware/validate.js";
import type { CreateAlertInput } from "./schema.js";

const svc = new AlertService();

export async function alertRoutes(app: FastifyInstance) {
  app.get("/api/v1/alerts", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => { const { acknowledged } = req.query as any; rep.send(await svc.list(req.user!.organizationId, acknowledged === "true" ? true : acknowledged === "false" ? false : undefined)); } });
  app.post<{ Body: CreateAlertInput }>("/api/v1/alerts", { preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(createAlertSchema)], handler: async (req, rep) => rep.status(201).send(await svc.create(req.user!.organizationId, req.body)) });
  app.post<{ Params: { id: string } }>("/api/v1/alerts/:id/acknowledge", { preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")], handler: async (req, rep) => rep.send(await svc.acknowledge((req.params as any).id, req.user!.userId)) });
}
