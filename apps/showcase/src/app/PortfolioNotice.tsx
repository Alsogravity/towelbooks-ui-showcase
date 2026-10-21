import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '@towelbooks/ui';
import { useDemo } from '../demo/DemoContext';
import { useI18n } from '../i18n';
export function PortfolioNotice() {
  const [visible, setVisible] = useState(true);
  const { notice, reset } = useDemo();
  const { ui, locale, setLocale } = useI18n();
  const { pathname } = useLocation();
  return (
    <>
      <div className="portfolio-tools">
        <label className="sr-only" htmlFor="portfolio-language">
          {ui('locale')}
        </label>
        <select
          id="portfolio-language"
          value={locale}
          onChange={(e) =>
            setLocale(e.target.value === 'en-US' ? 'en-US' : 'pt-BR')
          }
        >
          <option value="pt-BR">PT</option>
          <option value="en-US">EN</option>
        </select>
        <Button size="sm" variant="ghost" onClick={reset}>
          {ui('reset')}
        </Button>
        {!pathname.startsWith('/demo') && (
          <Link to="/demo">{ui('explore')} →</Link>
        )}
        {!visible && (
          <Button
            icon="info"
            variant="icon"
            aria-label={ui('demo')}
            onClick={() => setVisible(true)}
          />
        )}
      </div>
      {visible && (
        <aside className="portfolio-notice" aria-label={ui('demo')}>
          <span>{ui('demo')}</span>
          <Button
            icon="x"
            size="sm"
            variant="icon"
            aria-label={ui('close')}
            onClick={() => setVisible(false)}
          />
        </aside>
      )}
      <div className="demo-status" role="status" aria-live="polite">
        {notice}
      </div>
    </>
  );
}
