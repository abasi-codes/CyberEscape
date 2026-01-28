import { z } from "zod";

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(["LEARNER", "MANAGER", "ORG_ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  locale: z.string().max(10).optional(),
  avatar: z.string().url().optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  role: z.enum(["LEARNER", "MANAGER", "ORG_ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  groupId: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;
