export type AnalyticsEvent =
  | 'page_view_v1'
  | 'signup_completed_v1'
  | 'login_v1'
  | 'search_v1'
  | 'book_opened_v1'
  | 'affiliate_link_clicked_v1';

export type AnalyticsRouteName =
  | 'landing'
  | 'login'
  | 'register'
  | 'catalog_search'
  | 'book_detail'
  | 'room_detail'
  | 'settings_privacy'
  | 'legal_privacy'
  | 'legal_cookies'
  | 'legal_terms'
  | 'not_found';

export type CatalogWorkOpenSource =
  'catalog_search' | 'library' | 'room' | 'direct_navigation';

export type AffiliateProvider = 'amazon_br';

export type AffiliatePlacement =
  | 'book_detail_primary'
  | 'book_detail_secondary'
  | 'reading_section'
  | 'library_item_header';

export type AnalyticsReferrerCategory = 'internal' | 'external' | 'direct';

export interface AnalyticsEventMap {
  page_view_v1: {
    route_name: AnalyticsRouteName;
    referrer_category: AnalyticsReferrerCategory;
  };
  signup_completed_v1: Record<string, never>;
  login_v1: Record<string, never>;
  search_v1: {
    query_length: number;
    result_count: number;
  };
  book_opened_v1: {
    source: CatalogWorkOpenSource;
  };
  affiliate_link_clicked_v1: {
    provider: AffiliateProvider;
    placement: AffiliatePlacement;
  };
}
