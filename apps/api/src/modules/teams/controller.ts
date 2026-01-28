import { FastifyInstance } from "fastify";
import { TeamService } from "./service.js";
import { createTeamSchema, joinTeamSchema, assignRoleSchema } from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import type { CreateTeamInput, JoinTeamInput, AssignRoleInput } from "./schema.js";

const teamService = new TeamService();

export async function teamRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateTeamInput }>("/api/teams", { preHandler: [authenticate, validateBody(createTeamSchema)], handler: async (req, rep) => rep.status(201).send(await teamService.create(req.user!.userId, req.body)) });
  app.post<{ Body: JoinTeamInput }>("/api/teams/join", { preHandler: [authenticate, validateBody(joinTeamSchema)], handler: async (req, rep) => rep.send(await teamService.joinByCode(req.user!.userId, (req.body as JoinTeamInput).joinCode)) });
  app.get("/api/teams/matchmaking", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await teamService.findMatchmaking(req.user!.userId)) });
  app.get<{ Params: { id: string } }>("/api/teams/:id", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await teamService.getById((req.params as any).id)) });
  app.post<{ Params: { id: string } }>("/api/teams/:id/leave", { preHandler: [authenticate], handler: async (req, rep) => rep.send(await teamService.leave(req.user!.userId, (req.params as any).id)) });
  app.post<{ Params: { id: string } }>("/api/teams/:id/ready", { preHandler: [authenticate], handler: async (req, rep) => { const { isReady } = req.body as any; rep.send(await teamService.setReady(req.user!.userId, (req.params as any).id, isReady)); } });
  app.post<{ Params: { id: string }; Body: AssignRoleInput }>("/api/teams/:id/role", { preHandler: [authenticate, validateBody(assignRoleSchema)], handler: async (req, rep) => { const { userId, role } = req.body as AssignRoleInput; rep.send(await teamService.assignRole((req.params as any).id, userId, role)); } });
  app.post<{ Params: { id: string } }>("/api/teams/:id/start", { preHandler: [authenticate], handler: async (req, rep) => { const { roomId } = req.body as any; rep.send(await teamService.startGame((req.params as any).id, roomId)); } });
}
