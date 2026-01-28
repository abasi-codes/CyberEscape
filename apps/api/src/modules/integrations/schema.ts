import { z } from "zod";

export const webhookConfigSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(16),
  isActive: z.boolean().optional().default(true),
});

export const xApiConfigSchema = z.object({
  endpoint: z.string().url(),
  key: z.string().min(1),
  secret: z.string().min(1),
});

export type WebhookConfigInput = z.infer<typeof webhookConfigSchema>;
export type XApiConfigInput = z.infer<typeof xApiConfigSchema>;
