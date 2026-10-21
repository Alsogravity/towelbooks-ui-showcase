import { z } from 'zod';

import { roomMemberRoleSchema, communityCreatePolicySchema } from '../enums.js';

export const communitySettingsSchema = z.object({
  roomId: z.string().uuid(),
  discussionCreatePolicy: communityCreatePolicySchema,
  pollCreatePolicy: communityCreatePolicySchema,
  viewerRole: roomMemberRoleSchema,
  viewerCanCreateDiscussions: z.boolean(),
  viewerCanCreatePolls: z.boolean(),
  viewerCanModerate: z.boolean(),
});
export type CommunitySettings = z.infer<typeof communitySettingsSchema>;

export const updateCommunitySettingsRequestSchema = z
  .object({
    discussionCreatePolicy: communityCreatePolicySchema.optional(),
    pollCreatePolicy: communityCreatePolicySchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.discussionCreatePolicy !== undefined ||
      value.pollCreatePolicy !== undefined,
    { message: 'At least one policy must be provided.' },
  );
export type UpdateCommunitySettingsRequest = z.infer<
  typeof updateCommunitySettingsRequestSchema
>;
