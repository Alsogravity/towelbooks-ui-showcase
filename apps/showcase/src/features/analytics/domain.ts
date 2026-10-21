import { getActiveService } from './active-service';
import { referrerCategoryFromValue, routeNameFromPath } from './event-policy';
import type {
  AffiliatePlacement,
  AffiliateProvider,
  CatalogWorkOpenSource,
} from './types';

export function trackPageView(pathname: string, referrer?: string): void {
  getActiveService().track('page_view_v1', {
    referrer_category: referrerCategoryFromValue(referrer),
    route_name: routeNameFromPath(pathname),
  });
}

export function trackSignupCompleted(): void {
  getActiveService().track('signup_completed_v1', {});
}

export function trackLogin(): void {
  getActiveService().track('login_v1', {});
}

export function trackSearch(queryLength: number, resultCount: number): void {
  getActiveService().track('search_v1', {
    query_length: queryLength,
    result_count: resultCount,
  });
}

export function trackCatalogWorkOpened(source: CatalogWorkOpenSource): void {
  getActiveService().track('book_opened_v1', { source });
}

export function trackAffiliateLinkClicked(
  provider: AffiliateProvider,
  placement: AffiliatePlacement,
): void {
  getActiveService().track('affiliate_link_clicked_v1', {
    provider,
    placement,
  });
}
