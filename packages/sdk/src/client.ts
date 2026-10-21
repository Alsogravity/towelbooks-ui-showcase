import {
  createActivityEventsResource,
  type ActivityEventsResource,
} from './resources/activity-events.js';
import { createAdminResource, type AdminResource } from './resources/admin.js';
import { createAuthResource, type AuthResource } from './resources/auth.js';
import {
  createCatalogReviewsResource,
  type CatalogReviewsResource,
} from './resources/catalog-reviews.js';
import {
  createCatalogResource,
  type CatalogResource,
} from './resources/catalog.js';
import {
  createCollectionsResource,
  type CollectionsResource,
} from './resources/collections.js';
import {
  createAdminCatalogEditResource,
  type AdminCatalogEditResource,
} from './resources/admin-catalog-edit.js';
import {
  createAdminCatalogEditionDeletionResource,
  type AdminCatalogEditionDeletionResource,
} from './resources/admin-catalog-edition-deletion.js';
import { createRoomsResource, type RoomsResource } from './resources/rooms.js';
import {
  createCommunityResource,
  type CommunityResource,
} from './resources/community.js';
import {
  createCommentsResource,
  type CommentsResource,
} from './resources/comments.js';
import {
  createDiscussionsResource,
  type DiscussionsResource,
} from './resources/discussions.js';
import {
  createInAppMessagesResource,
  type InAppMessagesResource,
} from './resources/in-app-messages.js';
import {
  createInvitesResource,
  type InvitesResource,
} from './resources/invites.js';
import { createPollsResource, type PollsResource } from './resources/polls.js';
import {
  createLibrariesResource,
  type LibrariesResource,
} from './resources/libraries.js';
import {
  createNotificationsResource,
  type NotificationsResource,
} from './resources/notifications.js';
import {
  createPrivacyResource,
  type PrivacyResource,
} from './resources/privacy.js';
import {
  createReactionsResource,
  type ReactionsResource,
} from './resources/reactions.js';
import {
  createReadingsResource,
  type ReadingsResource,
} from './resources/readings.js';
import {
  createRatingsResource,
  type RatingsResource,
} from './resources/ratings.js';
import {
  createReportsResource,
  type ReportsResource,
} from './resources/reports.js';
import { createUsersResource, type UsersResource } from './resources/users.js';
import { createTransport, type TransportConfig } from './transport.js';

export type TowelBooksClientConfig = TransportConfig;

export type TowelBooksClient = {
  admin: AdminResource;
  adminCatalogEdit: AdminCatalogEditResource;
  adminCatalogEditionDeletion: AdminCatalogEditionDeletionResource;
  activityEvents: ActivityEventsResource;
  auth: AuthResource;
  catalogReviews: CatalogReviewsResource;
  catalog: CatalogResource;
  collections: CollectionsResource;
  comments: CommentsResource;
  rooms: RoomsResource;
  community: CommunityResource;
  discussions: DiscussionsResource;
  polls: PollsResource;
  ratings: RatingsResource;
  reports: ReportsResource;
  inAppMessages: InAppMessagesResource;
  invites: InvitesResource;
  libraries: LibrariesResource;
  notifications: NotificationsResource;
  privacy: PrivacyResource;
  reactions: ReactionsResource;
  readings: ReadingsResource;
  users: UsersResource;
};

export function createTowelBooksClient(
  config: TowelBooksClientConfig,
): TowelBooksClient {
  const transport = createTransport(config);

  return {
    admin: createAdminResource(transport),
    adminCatalogEdit: createAdminCatalogEditResource(transport),
    adminCatalogEditionDeletion:
      createAdminCatalogEditionDeletionResource(transport),
    activityEvents: createActivityEventsResource(transport),
    auth: createAuthResource(transport),
    catalogReviews: createCatalogReviewsResource(transport),
    catalog: createCatalogResource(transport),
    collections: createCollectionsResource(transport),
    comments: createCommentsResource(transport),
    rooms: createRoomsResource(transport),
    community: createCommunityResource(transport),
    discussions: createDiscussionsResource(transport),
    polls: createPollsResource(transport),
    ratings: createRatingsResource(transport),
    reports: createReportsResource(transport),
    inAppMessages: createInAppMessagesResource(transport),
    invites: createInvitesResource(transport),
    libraries: createLibrariesResource(transport),
    notifications: createNotificationsResource(transport),
    privacy: createPrivacyResource(transport),
    reactions: createReactionsResource(transport),
    readings: createReadingsResource(transport),
    users: createUsersResource(transport),
  };
}
