import { z } from 'zod';

export const CodeContentSchema = z.object({
  oid: z.string(),
  type: z.enum(['item', 'system']),
});
