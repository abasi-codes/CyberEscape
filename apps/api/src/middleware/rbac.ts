import { FastifyRequest, FastifyReply } from "fastify";
import { forbidden } from "../utils/errors.js";

const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 4,
  ORG_ADMIN: 3,
  MANAGER: 2,
  LEARNER: 1,
};

export function requireRole(...allowedRoles: string[]) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const user = request.user;
    if (\!user) {
      throw forbidden("No authenticated user");
    }
    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = Math.min(...allowedRoles.map((r) => ROLE_HIERARCHY[r] ?? 99));
    if (userLevel < requiredLevel) {
      throw forbidden("Insufficient permissions");
    }
  };
}
