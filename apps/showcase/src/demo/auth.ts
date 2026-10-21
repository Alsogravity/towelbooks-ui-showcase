import type { AppLocale } from '../i18n';
import { demoUser } from './fixtures';

// Public dummy form values, never credentials for a service.
const demoPassword = 'demo-password-1234';

export const demoLoginDefaults = {
  identifier: demoUser.email,
  password: demoPassword,
};

export const demoRegisterDefaults = {
  email: demoUser.email,
  handle: demoUser.username ?? 'peter_parker',
  password: demoPassword,
  adultConfirmed: true,
  termsAccepted: true,
  privacyPolicyAcknowledged: true,
};

export function demoAuthDescription(locale: AppLocale): string {
  return locale === 'pt-BR'
    ? 'Demonstração de portfólio. Os dados fictícios já estão preenchidos; nenhuma conta é criada e nada digitado aqui é enviado ou salvo.'
    : 'Portfolio demo. Fictional details are prefilled; no account is created and nothing entered here is sent or saved.';
}

export function enterDemo(): void {
  window.location.replace('/demo');
}
