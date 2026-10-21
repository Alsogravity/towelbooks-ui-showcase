import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import { bannerPresetIdSchema } from '../banner-presets.js';
import { catalogCategoryReferenceSchema } from '../catalog/taxonomy.js';
import { appLocaleSchema } from '../common/app-locale.js';
import { externalLinkSchema } from '../common/external-links.js';
import { userStatusSchema } from '../enums.js';
import { BIO_MAX_LENGTH } from '../limits.js';
import { createCursorPaginatedResponseSchema } from '../pagination.js';
import { bannerImageSchema } from '../profile/media-assets.js';
import { libraryItemSchema } from '../libraries/library-item.js';

import {
  legalAcceptanceSelectionSchema,
  requiredLegalAcceptanceSchema,
} from './legal-acceptance.js';
import { userSummarySchema, usernameSchema } from './identity.js';

export const meResponseSchema = userSummarySchema.extend({
  legalDocumentsUnavailable: z.boolean(),
  requiredLegalAcceptances: z.array(requiredLegalAcceptanceSchema),
  status: userStatusSchema,
});
export type MeResponse = z.infer<typeof meResponseSchema>;

export const READING_CATEGORY_PREFERENCE_COUNT = 3;

export const readingCategoryPreferencesResponseSchema = z
  .object({
    categories: z.array(catalogCategoryReferenceSchema),
  })
  .strict();
export type ReadingCategoryPreferencesResponse = z.infer<
  typeof readingCategoryPreferencesResponseSchema
>;

export const replaceReadingCategoryPreferencesRequestSchema = z
  .object({
    categoryIds: z
      .array(z.string().uuid())
      .length(READING_CATEGORY_PREFERENCE_COUNT)
      .superRefine((categoryIds, context) => {
        if (new Set(categoryIds).size !== categoryIds.length) {
          context.addIssue({
            code: 'custom',
            message: 'categoryIds must contain unique values.',
          });
        }
      }),
  })
  .strict();
export type ReplaceReadingCategoryPreferencesRequest = z.infer<
  typeof replaceReadingCategoryPreferencesRequestSchema
>;

export const acceptRequiredLegalAcceptancesRequestSchema = z
  .object({
    acceptances: z.array(legalAcceptanceSelectionSchema).min(1),
  })
  .superRefine(({ acceptances }, context) => {
    const types = new Set<string>();
    for (const acceptance of acceptances) {
      if (types.has(acceptance.type)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate legal acceptance type: ${acceptance.type}`,
          path: ['acceptances'],
        });
      }
      types.add(acceptance.type);
    }
  });
export type AcceptRequiredLegalAcceptancesRequest = z.infer<
  typeof acceptRequiredLegalAcceptancesRequestSchema
>;

export const profileViewerSchema = z.object({
  isSelf: z.boolean(),
});
export type ProfileViewer = z.infer<typeof profileViewerSchema>;

export const profileVisibilityAccessSchema = z.enum(['public', 'private']);
export type ProfileVisibilityAccess = z.infer<
  typeof profileVisibilityAccessSchema
>;

export const profileContentRelationshipSchema = z.enum([
  'self',
  'active_follower',
  'public_reader',
  'locked',
]);
export type ProfileContentRelationship = z.infer<
  typeof profileContentRelationshipSchema
>;

export const profileFollowAccessStatusSchema = z.enum([
  'none',
  'requested',
  'active',
]);
export type ProfileFollowAccessStatus = z.infer<
  typeof profileFollowAccessStatusSchema
>;

export const profileAccessSchema = z.object({
  visibility: profileVisibilityAccessSchema,
  canViewContent: z.boolean(),
  relationship: profileContentRelationshipSchema,
  followStatus: profileFollowAccessStatusSchema,
  followedByStatus: profileFollowAccessStatusSchema,
});
export type ProfileAccess = z.infer<typeof profileAccessSchema>;

export const publicProfileListItemSchema = z.object({
  avatar: avatarSchema,
  bannerPresetId: bannerPresetIdSchema.nullable(),
  bannerImage: bannerImageSchema.nullable(),
  bio: z.string().max(BIO_MAX_LENGTH).nullable(),
  displayName: z.string().nullable(),
  id: z.string().min(1),
  username: usernameSchema,
});
export type PublicProfileListItem = z.infer<typeof publicProfileListItemSchema>;

export const profileSummarySchema = z.object({
  avatar: avatarSchema,
  bannerPresetId: bannerPresetIdSchema.nullable(),
  bannerImage: bannerImageSchema.nullable(),
  bio: z.string().max(BIO_MAX_LENGTH).nullable(),
  displayName: z.string().nullable(),
  id: z.string().min(1),
  locale: appLocaleSchema.nullable(),
  username: usernameSchema,
  links: z.array(externalLinkSchema).default([]),
});
export type ProfileSummary = z.infer<typeof profileSummarySchema>;

export const profileIdentitySummarySchema = z
  .object({
    avatar: avatarSchema,
    bio: z.string().max(BIO_MAX_LENGTH).nullable(),
    displayName: z.string().nullable(),
    username: usernameSchema,
  })
  .strict();
export type ProfileIdentitySummary = z.infer<
  typeof profileIdentitySummarySchema
>;

export const profileStatsSchema = z
  .object({
    booksReadCount: z.number().int().nonnegative(),
    roomsCount: z.number().int().nonnegative(),
    followersCount: z.number().int().nonnegative(),
    followingCount: z.number().int().nonnegative(),
    libraryBooksCount: z.number().int().nonnegative(),
    ratingsCount: z.number().int().nonnegative(),
    catalogReviewsCount: z.number().int().nonnegative(),
  })
  .strict();
export type ProfileStats = z.infer<typeof profileStatsSchema>;

export const profileResponseSchema = z.object({
  access: profileAccessSchema,
  defaultLibraryId: z.string().min(1).nullable(),
  profile: z.union([profileSummarySchema, profileIdentitySummarySchema]),
  stats: profileStatsSchema.nullable(),
  viewer: profileViewerSchema.optional(),
});
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export const profileBooksReadResponseSchema = z.object({
  items: z.array(libraryItemSchema),
});
export type ProfileBooksReadResponse = z.infer<
  typeof profileBooksReadResponseSchema
>;

export const profileFollowListQuerySchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export type ProfileFollowListQuery = z.infer<
  typeof profileFollowListQuerySchema
>;

export const profileFollowListViewerRelationshipSchema = z.object({
  canFollow: z.boolean(),
  canFollowBack: z.boolean(),
  canUnfollow: z.boolean(),
  userFollowsViewer: profileFollowAccessStatusSchema,
  viewerFollowsUser: profileFollowAccessStatusSchema,
});
export type ProfileFollowListViewerRelationship = z.infer<
  typeof profileFollowListViewerRelationshipSchema
>;

export const profileFollowListItemSchema = publicProfileListItemSchema.extend({
  viewerRelationship: profileFollowListViewerRelationshipSchema,
});
export type ProfileFollowListItem = z.infer<typeof profileFollowListItemSchema>;

export const profileFollowListResponseSchema =
  createCursorPaginatedResponseSchema(profileFollowListItemSchema);
export type ProfileFollowListResponse = z.infer<
  typeof profileFollowListResponseSchema
>;
