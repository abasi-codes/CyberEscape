import { FastifyInstance } from "fastify";
import { UserService } from "./service.js";
import { updateUserSchema, listUsersSchema } from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import type { UpdateUserInput, ListUsersInput } from "./schema.js";

const userService = new UserService();

export async function userRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListUsersInput }>("/api/v1/users", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER"), validateQuery(listUsersSchema)],
    handler: async (request, reply) => {
      const result = await userService.list(request.user!.organizationId, request.query as ListUsersInput);
      return reply.send(result);
    },
  });

  app.get("/api/v1/users/me", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const result = await userService.getProfile(request.user!.userId);
      return reply.send(result);
    },
  });

  app.get<{ Params: { id: string } }>("/api/v1/users/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (request, reply) => {
      const result = await userService.getById((request.params as { id: string }).id);
      return reply.send(result);
    },
  });

  app.patch<{ Params: { id: string }; Body: UpdateUserInput }>("/api/v1/users/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(updateUserSchema)],
    handler: async (request, reply) => {
      const result = await userService.update((request.params as { id: string }).id, request.body);
      return reply.send(result);
    },
  });

  app.delete<{ Params: { id: string } }>("/api/v1/users/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (request, reply) => {
      const result = await userService.delete((request.params as { id: string }).id);
      return reply.send(result);
    },
  });

  app.post("/api/v1/users/import", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (request, reply) => {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: "No file uploaded" });
      const csvContent = (await data.toBuffer()).toString("utf-8");
      const result = await userService.importCsv(request.user!.organizationId, csvContent);
      return reply.send(result);
    },
  });
}
