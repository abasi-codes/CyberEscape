import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { unauthorized } from "../utils/errors.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (\!authHeader?.startsWith("Bearer ")) {
    throw unauthorized("Missing or invalid authorization header");
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    request.user = payload;
  } catch {
    throw unauthorized("Invalid or expired token");
  }
}
