import type { AnalyticsEvent, AnalyticsEventMap } from './types';

export interface AnalyticsService {
  track<T extends AnalyticsEvent>(event: T, params: AnalyticsEventMap[T]): void;
}
