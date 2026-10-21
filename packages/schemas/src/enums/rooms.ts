import { z } from 'zod';

export const roomVisibilitySchema = z.enum(['private', 'public']);
export type RoomVisibility = z.infer<typeof roomVisibilitySchema>;

export const roomJoinPolicySchema = z.enum([
  'invite_only',
  'request_to_join',
  'open',
]);
export type RoomJoinPolicy = z.infer<typeof roomJoinPolicySchema>;

export const roomRoleCapabilityCodeSchema = z.enum(['join_requests_review']);
export type RoomRoleCapabilityCode = z.infer<
  typeof roomRoleCapabilityCodeSchema
>;

export const roomMemberRoleSchema = z.enum([
  'owner',
  'admin',
  'moderator',
  'member',
]);
export type RoomMemberRole = z.infer<typeof roomMemberRoleSchema>;

export const roomMemberStatusSchema = z.enum([
  'active',
  'suspended',
  'removed',
  'banned',
]);
export type RoomMemberStatus = z.infer<typeof roomMemberStatusSchema>;

export const roomAccessGrantSourceSchema = z.enum([
  'manual',
  'invite',
  'system',
  'payment',
]);
export type RoomAccessGrantSource = z.infer<typeof roomAccessGrantSourceSchema>;

export const roomMemberAccessStateSchema = z.enum([
  'active',
  'expired',
  'revoked',
  'none',
  'suspended',
]);
export type RoomMemberAccessState = z.infer<typeof roomMemberAccessStateSchema>;

export const roomMeetingLocationTypeSchema = z.enum([
  'online',
  'in_person',
  'hybrid',
]);
export type RoomMeetingLocationType = z.infer<
  typeof roomMeetingLocationTypeSchema
>;

export const roomMeetingStatusSchema = z.enum(['scheduled', 'cancelled']);
export type RoomMeetingStatus = z.infer<typeof roomMeetingStatusSchema>;

export const communityCreatePolicySchema = z.enum(['members', 'moderators']);
export type CommunityCreatePolicy = z.infer<typeof communityCreatePolicySchema>;
