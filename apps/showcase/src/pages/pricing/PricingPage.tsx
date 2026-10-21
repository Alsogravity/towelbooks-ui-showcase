import { Link } from 'react-router';
import { PricingCard } from './PricingCard';
import { GuestSiteFooter } from '../landing/GuestSiteFooter';
import { useI18n } from '../../i18n';
import { usePageTitle } from '../../hooks/usePageTitle';
export function PricingPage() {
  const { t, ui } = useI18n();
  usePageTitle(ui('pricing'));
  return (
    <div className="pricing-page">
      <div className="pricing-content">
        <Link to="/">← {ui('pricingBack')}</Link>
        <header className="pricing-heading">
          <h1>{t('pricing.title')}</h1>
          <p>{ui('example')}</p>
        </header>
        <div className="pricing-grid">
          <PricingCard
            price={t('pricing.free.price')}
            description={t('pricing.free.description')}
            features={[1, 2, 3, 4, 5, 6, 7, 8].map((value) =>
              t(`pricing.free.feature.${value}`),
            )}
            cta={{ label: ui('explore'), to: '/demo' }}
          />
          <PricingCard
            price="Plus"
            description={t('pricing.pro.description')}
            features={[1, 2, 3].map((value) =>
              t(`pricing.pro.feature.${value}`),
            )}
            cta={{ label: ui('unreleased'), disabled: true }}
            badge={ui('unreleased')}
          />
        </div>
      </div>
      <GuestSiteFooter />
    </div>
  );
}
