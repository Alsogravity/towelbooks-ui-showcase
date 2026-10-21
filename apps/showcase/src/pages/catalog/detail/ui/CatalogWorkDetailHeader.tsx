import { useEffect } from 'react';

import { BackLink } from '../../../../components/layout';
import { useRegisterPageHeaderBackAction } from '../../../../components/layout/PageHeaderBackActionContext';
import { useI18n } from '../../../../i18n';

const backToCatalog = '/catalog';

export function CatalogWorkDetailHeader() {
  const { t } = useI18n();
  const registerBackAction = useRegisterPageHeaderBackAction();
  const backLabel = t('catalog.works.backToCatalog');

  useEffect(() => {
    registerBackAction({ label: backLabel, to: backToCatalog });
    return () => registerBackAction(null);
  }, [backLabel, registerBackAction]);

  return <BackLink label={backLabel} to={backToCatalog} />;
}
