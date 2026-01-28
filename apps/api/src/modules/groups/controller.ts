import { FastifyInstance } from "fastify";
import { GroupService } from "./service.js";
import { createGroupSchema, updateGroupSchema, assignUsersSchema } from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validateBody } from "../../middleware/validate.js";
import type { CreateGroupInput, UpdateGroupInput, AssignUsersInput } from "./schema.js";

const groupService = new GroupService();

export async function groupRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateGroupInput }>("/api/groups", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER"), validateBody(createGroupSchema)],
    handler: async (req, rep) => rep.status(201).send(await groupService.create(req.user!.organizationId, req.body)),
  });

  app.get("/api/groups", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await groupService.list(req.user!.organizationId)),
  });

  app.get<{ Params: { id: string } }>("/api/groups/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await groupService.getById((req.params as any).id)),
  });

  app.patch<{ Params: { id: string }; Body: UpdateGroupInput }>("/api/groups/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(updateGroupSchema)],
    handler: async (req, rep) => rep.send(await groupService.update((req.params as any).id, req.body)),
  });

  app.delete<{ Params: { id: string } }>("/api/groups/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (req, rep) => rep.send(await groupService.delete((req.params as any).id)),
  });

  app.post<{ Params: { id: string }; Body: AssignUsersInput }>("/api/groups/:id/users", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER"), validateBody(assignUsersSchema)],
    handler: async (req, rep) => rep.send(await groupService.assignUsers((req.params as any).id, (req.body as AssignUsersInput).userIds)),
  });

  app.delete<{ Params: { id: string; userId: string } }>("/api/groups/:id/users/:userId", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => { const p = req.params as any; rep.send(await groupService.removeUser(p.id, p.userId)); },
  });

  app.get<{ Params: { id: string } }>("/api/groups/:id/members", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await groupService.getMembers((req.params as any).id)),
  });
}
