import type { AnalyticsService } from './interface';
import { NoOpAnalyticsService } from './noop-adapter';

let current: AnalyticsService = new NoOpAnalyticsService();

export function getActiveService(): AnalyticsService {
  return current;
}

export function setActiveService(service: AnalyticsService): void {
  current = service;
}

export function resetActiveService(): void {
  current = new NoOpAnalyticsService();
}
