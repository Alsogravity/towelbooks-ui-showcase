import { z } from 'zod';

export const adminSearchItemSchema = z.object({
  kind: z.enum(['user', 'room', 'catalog_item', 'audit_request']),
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
});

export type AdminSearchItem = z.infer<typeof adminSearchItemSchema>;

export const adminSearchResponseSchema = z.object({
  items: z.array(adminSearchItemSchema),
});

export type AdminSearchResponse = z.infer<typeof adminSearchResponseSchema>;
