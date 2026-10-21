import { type CatalogPurchaseLink } from '@towelbooks/schemas';

import { trackAffiliateLinkClicked } from '../../features/analytics';
import type { AffiliatePlacement } from '../../features/analytics';
import { useEffectiveTheme } from '../../features/theme/ThemeContext';
import { type AppLocale, useI18n } from '../../i18n';
import { getSafeExternalUrl } from '../../lib/safeExternalUrl';

const AMAZON_BADGE_WIDTH_PX = 140;
const AMAZON_BADGE_WIDTH_CLASS = 'w-[140px]';

const AMAZON_BADGE_SRC: Record<AppLocale, string> = {
  'pt-BR': '/assets/brand/amazon/available-at-amazon-pt-br.png',
  'en-US': '/assets/brand/amazon/available-at-amazon-en.png',
};

const AMAZON_BADGE_SRC_WHITE: Record<AppLocale, string> = {
  'pt-BR': '/assets/brand/amazon/available-at-amazon-pt-br-white.png',
  'en-US': '/assets/brand/amazon/available-at-amazon-en-white.png',
};

export function getAmazonBadgeSrc(
  locale: AppLocale,
  theme: 'dark' | 'light',
): string {
  const badges = theme === 'dark' ? AMAZON_BADGE_SRC_WHITE : AMAZON_BADGE_SRC;

  return badges[locale];
}

type PurchaseLinkCtaProps = {
  placement: AffiliatePlacement;
  purchaseLink: CatalogPurchaseLink | null | undefined;
  className?: string;
  disclosureClassName?: string;
  showBadge?: boolean;
  showDisclosure?: boolean;
};

export function PurchaseLinkCta({
  placement,
  purchaseLink,
  className,
  disclosureClassName,
  showBadge = true,
  showDisclosure = true,
}: PurchaseLinkCtaProps) {
  const { locale, t } = useI18n();
  const effectiveTheme = useEffectiveTheme();
  const safeUrl = purchaseLink ? getSafeExternalUrl(purchaseLink.url) : null;

  if (!safeUrl) {
    return null;
  }

  const shouldShowBadge = showBadge;
  const shouldShowDisclosure = showDisclosure && purchaseLink?.isAffiliate;

  if (!shouldShowBadge && !shouldShowDisclosure) {
    return null;
  }

  return (
    <div
      className={[
        'inline-flex w-fit max-w-full flex-col items-start',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {shouldShowBadge ? (
        <a
          href={safeUrl}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          aria-label={t('catalog.workDetail.purchaseCta.amazon')}
          onClick={() => trackAffiliateLinkClicked('amazon_br', placement)}
          className={`inline-flex ${AMAZON_BADGE_WIDTH_CLASS} max-w-full rounded-md no-underline transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2`}
        >
          <img
            src={getAmazonBadgeSrc(locale, effectiveTheme)}
            alt={t('catalog.workDetail.purchaseCta.amazonBadgeAlt')}
            width={AMAZON_BADGE_WIDTH_PX}
            className="block h-auto w-full"
          />
        </a>
      ) : null}
      {shouldShowDisclosure ? (
        <p
          className={[
            shouldShowBadge ? 'mt-2' : '',
            'text-xs leading-5 text-ink-3 whitespace-nowrap',
            disclosureClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {t('catalog.workDetail.purchaseCta.affiliateDisclosure')}
        </p>
      ) : null}
    </div>
  );
}
