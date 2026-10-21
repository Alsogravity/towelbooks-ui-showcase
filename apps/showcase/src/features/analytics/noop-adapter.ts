import type { AnalyticsEvent, AnalyticsEventMap } from './types';
import type { AnalyticsService } from './interface';

export class NoOpAnalyticsService implements AnalyticsService {
  track<T extends AnalyticsEvent>(
    _event: T,
    _params: AnalyticsEventMap[T],
  ): void {
    /* no-op */
  }
}
