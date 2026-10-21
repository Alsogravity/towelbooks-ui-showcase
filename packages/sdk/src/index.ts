export {
  buildAmazonAffiliateUrl,
  DEFAULT_AMAZON_MARKETPLACE,
  isSupportedAmazonMarketplace,
  isValidAmazonAssociateTag,
  type AmazonAffiliateUrlInput,
} from './amazon-affiliate.js';
export {
  createTowelBooksClient,
  type TowelBooksClient,
  type TowelBooksClientConfig,
} from './client.js';
export { createAdminResource, type AdminResource } from './resources/admin.js';
export {
  createCollectionsResource,
  type CollectionsResource,
} from './resources/collections.js';
export {
  createAdminBookCatalogImportResource,
  type AdminBookCatalogImportResource,
} from './resources/admin-catalog-import.js';
export {
  createAdminBookCatalogBulkImportResource,
  type AdminBookCatalogBulkImportResource,
} from './resources/admin-book-catalog-bulk-import.js';
export {
  createAdminTaxonomyResource,
  type AdminTaxonomyResource,
} from './resources/admin-taxonomy.js';
export {
  createAdminCatalogEditResource,
  type AdminCatalogEditResource,
} from './resources/admin-catalog-edit.js';
export {
  createAdminCatalogEditionDeletionResource,
  type AdminCatalogEditionDeletionResource,
} from './resources/admin-catalog-edition-deletion.js';
export {
  createReportsResource,
  type ReportsResource,
} from './resources/reports.js';
export {
  ApiRequestError,
  type ApiProblemResponse,
  type FrontendErrorCode,
  type ParsedApiError,
  type ParsedApiErrorKind,
} from './errors/api-request-error.js';
export {
  getApiErrorCode,
  getApiErrorMessage,
  getApiProblemDetails,
  getApiValidationIssues,
} from './errors/helpers.js';
