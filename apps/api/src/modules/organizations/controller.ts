import { FastifyInstance } from "fastify";
import { OrganizationService } from "./service.js";
import { createOrgSchema, updateOrgSchema, updateBrandingSchema } from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validateBody } from "../../middleware/validate.js";
import type { CreateOrgInput, UpdateOrgInput, UpdateBrandingInput } from "./schema.js";

const orgService = new OrganizationService();

export async function organizationRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateOrgInput }>("/api/organizations", {
    preHandler: [authenticate, requireRole("SUPER_ADMIN"), validateBody(createOrgSchema)],
    handler: async (request, reply) => reply.status(201).send(await orgService.create(request.body)),
  });

  app.get<{ Params: { id: string } }>("/api/organizations/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (request, reply) => reply.send(await orgService.getById((request.params as any).id)),
  });

  app.patch<{ Params: { id: string }; Body: UpdateOrgInput }>("/api/organizations/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(updateOrgSchema)],
    handler: async (request, reply) => reply.send(await orgService.update((request.params as any).id, request.body)),
  });

  app.delete<{ Params: { id: string } }>("/api/organizations/:id", {
    preHandler: [authenticate, requireRole("SUPER_ADMIN")],
    handler: async (request, reply) => reply.send(await orgService.delete((request.params as any).id)),
  });

  app.get<{ Params: { id: string } }>("/api/organizations/:id/settings", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (request, reply) => reply.send(await orgService.getSettings((request.params as any).id)),
  });

  app.patch<{ Params: { id: string }; Body: UpdateBrandingInput }>("/api/organizations/:id/branding", {
    preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(updateBrandingSchema)],
    handler: async (request, reply) => reply.send(await orgService.updateBranding((request.params as any).id, request.body)),
  });
}
