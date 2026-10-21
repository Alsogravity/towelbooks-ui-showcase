import {
  notificationPreferenceSchema,
  notificationPreferencesResponseSchema,
  paginatedNotificationsResponseSchema,
  unreadNotificationsCountResponseSchema,
  type ListNotificationsQuery,
  type NotificationPreference,
  type NotificationPreferencesResponse,
  type NotificationType,
  type PaginatedNotificationsResponse,
  type UnreadNotificationsCountResponse,
  type UpdateNotificationPreferenceRequest,
} from '@towelbooks/schemas';

import type { Transport } from '../transport.js';

export type NotificationsResource = {
  list(
    options?: ListNotificationsQuery,
  ): Promise<PaginatedNotificationsResponse>;
  unreadCount(): Promise<UnreadNotificationsCountResponse>;
  acknowledge(): Promise<UnreadNotificationsCountResponse>;
  getPreferences(): Promise<NotificationPreferencesResponse>;
  updatePreference(
    type: NotificationType,
    body: UpdateNotificationPreferenceRequest,
  ): Promise<NotificationPreference>;
};

export function createNotificationsResource(
  transport: Transport,
): NotificationsResource {
  return {
    list(options = {}) {
      return transport.request({
        method: 'GET',
        path: '/notifications',
        query: options,
        schema: paginatedNotificationsResponseSchema,
      });
    },
    unreadCount() {
      return transport.request({
        method: 'GET',
        path: '/notifications/unread-count',
        schema: unreadNotificationsCountResponseSchema,
      });
    },
    acknowledge() {
      return transport.request({
        method: 'POST',
        path: '/notifications/acknowledge',
        schema: unreadNotificationsCountResponseSchema,
      });
    },
    getPreferences() {
      return transport.request({
        method: 'GET',
        path: '/notifications/preferences',
        schema: notificationPreferencesResponseSchema,
      });
    },
    updatePreference(type, body) {
      return transport.request({
        method: 'PATCH',
        path: '/notifications/preferences/:type',
        pathParams: { type },
        body,
        schema: notificationPreferenceSchema,
      });
    },
  };
}
