import type { AnalyticsEvent, AnalyticsEventMap } from './types';
import type { AnalyticsService } from './interface';
import { sanitizeAnalyticsEvent } from './event-policy';

export class GTMAnalyticsService implements AnalyticsService {
  track<T extends AnalyticsEvent>(
    event: T,
    params: AnalyticsEventMap[T],
  ): void {
    const sanitized = sanitizeAnalyticsEvent(event, params);
    if (!sanitized) return;

    window.dataLayer?.push({
      event: 'analytics',
      analytics_event: sanitized.event,
      ...sanitized.params,
    });
  }
}
