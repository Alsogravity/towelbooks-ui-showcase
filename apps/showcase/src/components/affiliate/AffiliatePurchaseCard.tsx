import { type CatalogPurchaseLink } from '@towelbooks/schemas';

import { getAmazonBadgeSrc } from './PurchaseLinkCta';
import { Icon } from '../../components/primitives';
import { trackAffiliateLinkClicked } from '../../features/analytics';
import type { AffiliatePlacement } from '../../features/analytics';
import { useEffectiveTheme } from '../../features/theme/ThemeContext';
import { useI18n } from '../../i18n';
import { getSafeExternalUrl } from '../../lib/safeExternalUrl';

const AMAZON_BADGE_WIDTH_PX = 180;

type AffiliatePurchaseCardProps = {
  placement: AffiliatePlacement;
  purchaseLink: CatalogPurchaseLink | null | undefined;
};

export function AffiliatePurchaseCard({
  placement,
  purchaseLink,
}: AffiliatePurchaseCardProps) {
  const { locale, t } = useI18n();
  const effectiveTheme = useEffectiveTheme();
  const safeUrl = purchaseLink ? getSafeExternalUrl(purchaseLink.url) : null;

  if (!safeUrl) {
    return null;
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      aria-label={t('catalog.workDetail.purchaseCta.amazon')}
      onClick={() => trackAffiliateLinkClicked('amazon_br', placement)}
      className="relative flex flex-col items-start gap-3 rounded-4 border border-rule bg-vellum p-6 shadow-2 transition-all hover:border-ink-4 hover:shadow-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
    >
      <span className="absolute right-4 top-4 text-ink-3">
        <Icon name="external-link" size={16} />
      </span>

      <img
        src={getAmazonBadgeSrc(locale, effectiveTheme)}
        alt={t('catalog.workDetail.purchaseCta.amazonBadgeAlt')}
        width={AMAZON_BADGE_WIDTH_PX}
        className="w-[180px]"
      />

      {purchaseLink?.isAffiliate ? (
        <p className="text-xs leading-5 text-ink-3">
          {t('catalog.workDetail.purchaseCta.affiliateDisclosure')}
        </p>
      ) : null}
    </a>
  );
}
