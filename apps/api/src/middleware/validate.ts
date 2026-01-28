import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema, ZodError } from "zod";
import { badRequest } from "../utils/errors.js";

export function validateBody(schema: ZodSchema) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw badRequest("Validation failed", error.errors);
      }
      throw error;
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    try {
      request.query = schema.parse(request.query) as typeof request.query;
    } catch (error) {
      if (error instanceof ZodError) {
        throw badRequest("Validation failed", error.errors);
      }
      throw error;
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return async function (request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    try {
      request.params = schema.parse(request.params) as typeof request.params;
    } catch (error) {
      if (error instanceof ZodError) {
        throw badRequest("Validation failed", error.errors);
      }
      throw error;
    }
  };
}
