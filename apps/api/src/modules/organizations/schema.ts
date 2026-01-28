import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().optional(),
  maxUsers: z.number().int().min(1).optional().default(100),
});

export const updateOrgSchema = createOrgSchema.partial();

export const updateBrandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
