import {
  formatCatalogLanguageLabel,
  type CatalogItem,
} from '@towelbooks/schemas';

import { buildCatalogEditionCoverSources } from './catalogWorkDetailHelpers';
import {
  CatalogWorkDetailPlaceholderList,
  CatalogWorkDetailScalarField,
  CatalogWorkDetailSection,
} from './CatalogWorkDetailSection';
import { renderSynopsisContent } from './catalogWorkDetailSynopsis';
import { PurchaseLinkCta } from '../../../../components/affiliate/PurchaseLinkCta';
import { CatalogCoverMedia } from '../../../../entities/reading/ui';
import { useI18n } from '../../../../i18n';

export function CatalogWorkDetailOverviewPanel({
  author,
  item,
  synopsis,
  workTypeLabel,
}: {
  author: string;
  item: CatalogItem;
  synopsis: string;
  workTypeLabel: string;
}) {
  return (
    <>
      <CatalogWorkDetailSection id="synopsis">
        <div className="app-text-body text-ink-2">
          {renderSynopsisContent(synopsis)}
        </div>
      </CatalogWorkDetailSection>

      <CatalogEditionsSection
        author={author}
        item={item}
        workTypeLabel={workTypeLabel}
      />
    </>
  );
}

function CatalogEditionsSection({
  author,
  item,
  workTypeLabel,
}: {
  author: string;
  item: CatalogItem;
  workTypeLabel: string;
}) {
  const { formatNumber, locale, t } = useI18n();
  const hasAffiliatePurchaseLink = item.catalogEditions.some(
    (edition) => edition.purchaseLink?.isAffiliate === true,
  );

  return (
    <CatalogWorkDetailSection
      id="editions"
      title={t('catalog.workDetail.sections.editions')}
    >
      {hasAffiliatePurchaseLink ? (
        <p className="app-text-caption text-ink-3">
          {t('catalog.workDetail.purchaseCta.affiliateDisclosure')}
        </p>
      ) : null}
      {item.catalogEditions.length === 0 ? (
        <CatalogWorkDetailPlaceholderList
          message={t('catalog.workDetail.value.noEditions')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {item.catalogEditions.map((edition) => {
            const editionTitle =
              edition.title || t('catalog.workDetail.value.untitledEdition');
            const editionContributors =
              edition.contributors.join(', ') || author;
            const coverAlt = t('catalog.workDetail.coverAlt', {
              values: { title: editionTitle, workType: workTypeLabel },
            });

            return (
              <div
                key={edition.id}
                className="rounded-4 border border-rule bg-paper-2 p-6 shadow-2"
              >
                <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-6 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-x-6 lg:grid-cols-[112px_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="relative overflow-hidden rounded-sm bg-vellum/20 shadow-sm">
                    <CatalogCoverMedia
                      alt={coverAlt}
                      author={editionContributors}
                      coverDelivery={{
                        loading: 'lazy',
                        preferredVariant: 'detail',
                      }}
                      size="fluid"
                      sources={buildCatalogEditionCoverSources(item, edition)}
                      theme={edition.id.charCodeAt(0)}
                      title={editionTitle}
                      typographic={{
                        'aria-label': coverAlt,
                        className: 'w-full rounded-sm',
                        role: 'img',
                      }}
                    />
                  </div>

                  <div className="flex h-full min-w-0 flex-col justify-between">
                    <div className="min-w-0">
                      <h3 className="app-text-card-title text-ink">
                        {editionTitle}
                      </h3>
                      <p className="app-text-metadata mt-1 text-ink-3">
                        {editionContributors}
                      </p>
                    </div>
                    {edition.purchaseLink ? (
                      <div className="mt-3 flex justify-start">
                        <PurchaseLinkCta
                          className="items-start"
                          placement="book_detail_secondary"
                          purchaseLink={edition.purchaseLink}
                          showDisclosure={false}
                        />
                      </div>
                    ) : null}
                  </div>

                  <dl className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-4 lg:col-span-1 lg:col-start-3 lg:row-start-1">
                    <CatalogWorkDetailScalarField
                      label={t('catalog.workDetail.labels.publisher')}
                      value={
                        edition.publisher ??
                        t('catalog.workDetail.value.unavailable')
                      }
                    />
                    <CatalogWorkDetailScalarField
                      label={t('catalog.workDetail.labels.isbn13')}
                      value={
                        edition.isbn13 ??
                        t('catalog.workDetail.value.unavailable')
                      }
                    />
                    <CatalogWorkDetailScalarField
                      label={t('catalog.workDetail.labels.language')}
                      value={
                        formatCatalogLanguageLabel(edition.language, locale) ??
                        t('catalog.workDetail.value.unavailable')
                      }
                    />
                    <CatalogWorkDetailScalarField
                      label={t('catalog.workDetail.labels.pages')}
                      value={
                        edition.pageCount === null
                          ? t('catalog.workDetail.value.unavailable')
                          : formatNumber(edition.pageCount)
                      }
                    />
                  </dl>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CatalogWorkDetailSection>
  );
}
