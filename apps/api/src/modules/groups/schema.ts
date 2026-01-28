import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const assignUsersSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AssignUsersInput = z.infer<typeof assignUsersSchema>;
