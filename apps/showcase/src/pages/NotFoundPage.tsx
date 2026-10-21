import { Link } from 'react-router';
import { Page } from '../components/Page';
import { useI18n } from '../i18n';
export function NotFoundPage() {
  const { ui } = useI18n();
  return (
    <Page title={ui('notFound')}>
      <Link to="/demo">← {ui('home')}</Link>
    </Page>
  );
}
