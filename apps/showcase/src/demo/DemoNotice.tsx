import { useEffect, useRef } from 'react';
import { useToast } from '../components/feedback';
import { useI18n } from '../i18n';
export function DemoNotice() {
  const shown = useRef(false);
  const { pushToast } = useToast();
  const { locale } = useI18n();
  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    pushToast({
      title:
        locale === 'pt-BR'
          ? 'Projeto de portfólio · dados fictícios'
          : 'Portfolio project · fictional data',
      variant: 'info',
      durationMs: 6000,
    });
  }, [locale, pushToast]);
  return null;
}
