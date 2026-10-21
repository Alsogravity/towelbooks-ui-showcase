import { Button } from '@towelbooks/ui';
import { Page, Section } from '../components/Page';
import { useI18n } from '../i18n';
import { useDemo } from '../demo/DemoContext';
export function SettingsPage() {
  const { ui, locale, setLocale } = useI18n();
  const { theme, setTheme, reset } = useDemo();
  return (
    <Page title={ui('settings')} description={ui('settingsBody')}>
      <Section title={ui('appearance')}>
        <div className="settings-row">
          <p>{ui('appearanceBody')}</p>
          <div className="filter-list">
            {(['light', 'dark'] as const).map((value) => (
              <Button
                key={value}
                variant={theme === value ? 'primary' : 'secondary'}
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                {ui(value)}
              </Button>
            ))}
          </div>
        </div>
      </Section>
      <Section title={ui('locale')}>
        <label className="settings-row">
          {ui('locale')}
          <select
            aria-label={ui('locale')}
            value={locale}
            onChange={(e) =>
              setLocale(e.target.value === 'en-US' ? 'en-US' : 'pt-BR')
            }
          >
            <option value="pt-BR">Português</option>
            <option value="en-US">English</option>
          </select>
        </label>
      </Section>
      <Section title={ui('demo')}>
        <Button variant="secondary" onClick={reset}>
          {ui('reset')}
        </Button>
      </Section>
    </Page>
  );
}
