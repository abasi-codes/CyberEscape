import { FastifyInstance } from "fastify";
import { IntegrationService } from "./service.js";
import { webhookConfigSchema } from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validateBody } from "../../middleware/validate.js";

const svc = new IntegrationService();

export async function integrationRoutes(app: FastifyInstance) {
  app.get("/api/integrations/webhooks", { preHandler: [authenticate, requireRole("ORG_ADMIN")], handler: async (req, rep) => rep.send(await svc.listWebhooks(req.user!.organizationId)) });
  app.post("/api/integrations/webhooks", { preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(webhookConfigSchema)], handler: async (req, rep) => rep.status(201).send(await svc.createWebhook(req.user!.organizationId, req.body)) });
  app.patch<{ Params: { id: string } }>("/api/integrations/webhooks/:id", { preHandler: [authenticate, requireRole("ORG_ADMIN")], handler: async (req, rep) => rep.send(await svc.updateWebhook((req.params as any).id, req.body as any)) });
  app.delete<{ Params: { id: string } }>("/api/integrations/webhooks/:id", { preHandler: [authenticate, requireRole("ORG_ADMIN")], handler: async (req, rep) => rep.send(await svc.deleteWebhook((req.params as any).id)) });
  app.get("/api/integrations/scorm", { preHandler: [authenticate, requireRole("ORG_ADMIN")], handler: async (req, rep) => rep.send(await svc.getScormPackages(req.user!.organizationId)) });
  app.post("/api/integrations/scorm", { preHandler: [authenticate, requireRole("ORG_ADMIN")], handler: async (req, rep) => { const { name, roomIds } = req.body as any; rep.status(201).send(await svc.generateScormPackage(req.user!.organizationId, name, roomIds)); } });
  app.post("/api/integrations/xapi", { preHandler: [authenticate, requireRole("ORG_ADMIN")], handler: async (req, rep) => { const { endpoint, key, secret, statement } = req.body as any; rep.send(await svc.sendXApiStatement(endpoint, { key, secret }, statement)); } });
}
