import { z } from 'zod';

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().positive(),
  OUTBOX_BATCH_SIZE: z.coerce.number().int().positive(),
});
