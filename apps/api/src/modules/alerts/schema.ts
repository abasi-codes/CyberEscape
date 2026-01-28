import { z } from "zod";

export const createAlertSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
