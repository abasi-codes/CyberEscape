import { FastifyInstance } from "fastify";
import { AuthService } from "./service.js";
import { registerSchema, loginSchema, refreshSchema } from "./schema.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import type { RegisterInput, LoginInput, RefreshInput } from "./schema.js";

const authService = new AuthService();

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterInput }>("/api/v1/auth/register", {
    preHandler: [validateBody(registerSchema)],
    handler: async (request, reply) => {
      const result = await authService.register(request.body);
      return reply.status(201).send(result);
    },
  });

  app.post<{ Body: LoginInput }>("/api/v1/auth/login", {
    preHandler: [validateBody(loginSchema)],
    handler: async (request, reply) => {
      const result = await authService.login(request.body);
      return reply.send(result);
    },
  });

  app.post<{ Body: RefreshInput }>("/api/v1/auth/refresh", {
    preHandler: [validateBody(refreshSchema)],
    handler: async (request, reply) => {
      const result = await authService.refresh((request.body as RefreshInput).refreshToken);
      return reply.send(result);
    },
  });

  app.post("/api/v1/auth/logout", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const { refreshToken } = request.body as { refreshToken: string };
      await authService.logout(refreshToken);
      return reply.send({ success: true });
    },
  });

  app.get<{ Querystring: { code: string } }>("/api/v1/auth/google/callback", {
    handler: async (request, reply) => {
      const { code } = request.query;
      const result = await authService.googleCallback(code);
      return reply.send(result);
    },
  });
}
