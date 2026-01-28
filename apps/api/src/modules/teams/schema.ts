import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  maxSize: z.number().int().min(2).max(8).optional().default(4),
});

export const joinTeamSchema = z.object({
  joinCode: z.string().length(6),
});

export const assignRoleSchema = z.object({
  userId: z.string(),
  role: z.string().min(1),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type JoinTeamInput = z.infer<typeof joinTeamSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
