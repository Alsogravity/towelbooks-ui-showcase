import type { PublicLegalDocument, PublicLegalLocale } from '../types.js';
import {
  PRIVACY_CONTACT_EMAIL,
  PUBLIC_LEGAL_DOCUMENT_METADATA,
} from '../constants.js';
import {
  formatPublicLegalEffectiveDateLabel,
  formatPublicLegalTitle,
} from '../format-labels.js';

const cookiesMetadata = PUBLIC_LEGAL_DOCUMENT_METADATA.cookies;

export const cookiesDocuments: Record<PublicLegalLocale, PublicLegalDocument> =
  {
    en: {
      eyebrow: 'Cookie Notice',
      effectiveDateLabel: formatPublicLegalEffectiveDateLabel(
        'en',
        cookiesMetadata.effectiveAt,
      ),
      sections: [
        {
          paragraphs: [
            'TowelBooks keeps a minimal browser-storage posture. The current baseline uses one strictly necessary authentication cookie set by the TowelBooks API, no marketing cookies, and no advertising cookies. Optional product analytics is disabled until you give explicit consent through the privacy settings or visitor consent banner; no Google analytics request is made before that grant is resolved. Cloudflare Web Analytics is a separate provider-managed, cookie-less performance dashboard whose automatic beacon may collect limited page-performance telemetry, such as navigation timing and Core Web Vitals, independently of the Google product-analytics consent choice. It does not receive TowelBooks product events or account data.',
            'Infrastructure providers that deliver and protect the Services (described in the <a href="/legal/privacy">Privacy Policy</a>) may process technical request metadata such as IP address and user agent at the edge. If those providers set additional strictly necessary cookies on TowelBooks domains, this notice will be updated to list them.',
            `Questions about this notice or about browser storage can be sent to ${PRIVACY_CONTACT_EMAIL}.`,
          ],
          title: 'Current posture',
        },
        {
          table: {
            caption: 'Strictly necessary cookie inventory',
            headers: [
              'Name',
              'Purpose',
              'Where it is set',
              'Retention',
              'Notes',
            ],
            rows: [
              [
                '__Secure-refreshToken',
                'Renews short-lived access tokens for authenticated browser sessions.',
                'API auth refresh flow',
                'Until session expiry or revocation, then up to 30 days in retained session records before cleanup.',
                'HttpOnly, SameSite=Strict, Secure outside development, scoped to `/v1/auth` on the API origin (https://api.towelbooks.com); host-only and not shared across subdomains.',
              ],
              [
                'refreshToken',
                'Local development fallback for the same auth refresh flow on HTTP localhost only.',
                'API auth refresh flow in development',
                'Development only.',
                'Not accepted outside local development.',
              ],
            ],
          },
          title: 'Cookie inventory',
        },
        {
          table: {
            caption: 'Approved browser-readable storage keys',
            headers: ['Key', 'Value shape', 'Purpose', 'Notes'],
            rows: [
              [
                'towelbooks-locale',
                "'pt-BR' | 'en-US'",
                'Persists the selected product language for this browser.',
                'UI preference only; invalid values fall back to document or browser locale.',
              ],
              [
                'towelbooks-theme-preference',
                "'system' | 'light' | 'dark'",
                'Persists the selected theme for this browser.',
                'UI preference only; invalid values fall back safely.',
              ],
              [
                'towelbooks-sidebar-behavior-preference',
                "'collapsed' | 'expanded' | 'hover'",
                'Persists desktop sidebar presentation behavior.',
                'UI preference only; no account or reading data is stored.',
              ],
              [
                'towelbooks-analytics-consent',
                "{ analytics: 'granted' | 'denied' }",
                "Stores the current browser's optional product-analytics consent decision.",
                'Anonymous-browser signal only; it contains no account identifier, URL, query, referrer, or event data. Analytics remains disabled until the value is explicitly granted.',
              ],
            ],
          },
          paragraphs: [
            'TowelBooks keeps access tokens in memory only and does not persist refresh tokens, session identifiers, account metadata, libraries, rooms, readings, or other sensitive data in browser-readable storage.',
          ],
          title: 'Browser storage inventory',
        },
        {
          bullets: [
            'Marketing email and product analytics preferences default to withdrawn until you opt in.',
            'Google Analytics / Tag Manager is the approved product analytics provider, subject to the versioned provider manifests and sanitized event catalog in the engineering privacy controls. For visitors without an account, the sitewide visitor consent banner lets you accept or decline analytics before any Google request starts. For authenticated users, the account preference is authoritative and the service is loaded only after explicit consent.',
            'Cloudflare Web Analytics is a separate provider-managed performance dashboard. Its automatic beacon is limited to cookie-less page-performance telemetry, such as navigation timing and Core Web Vitals, and may operate independently of the Google product-analytics consent choice. It does not receive TowelBooks product events or account data.',
            'TowelBooks-controlled internal promotions and Amazon affiliate links do not use marketing or advertising cookies. TowelBooks does not operate Google AdSense or another third-party ad-network script under the current implementation. Before any third-party ad technology is activated, TowelBooks will update this notice, the processor registry, content-security-policy and provider governance, and consent controls.',
            'If additional analytics providers or tracking services are introduced later, TowelBooks will update this notice, the processor registry, and the transfer documentation before activation.',
          ],
          title: 'Consent and analytics',
        },
        {
          bullets: [
            'You can review the current privacy documents and export your data from the authenticated privacy settings area.',
            'You can change marketing-email and product-analytics preferences from the privacy settings page.',
            `You can contact the privacy channel at ${PRIVACY_CONTACT_EMAIL} for questions or rights requests that are not yet fully self-service.`,
          ],
          title: 'Your choices',
        },
      ],
      title: formatPublicLegalTitle('Cookie Notice'),
    },
    'pt-BR': {
      eyebrow: 'Aviso de Cookies',
      effectiveDateLabel: formatPublicLegalEffectiveDateLabel(
        'pt-BR',
        cookiesMetadata.effectiveAt,
      ),
      sections: [
        {
          paragraphs: [
            'A TowelBooks mantém uma postura mínima de armazenamento no navegador. A linha de base atual usa um único cookie de autenticação estritamente necessário definido pela API da TowelBooks, não usa cookies de marketing e não usa cookies de publicidade. O analytics opcional de produto permanece desativado até que você dê consentimento explícito nas configurações de privacidade ou no banner de consentimento do visitante; nenhuma requisição de analytics do Google é feita antes de essa concessão ser resolvida.',
            'Prestadores de infraestrutura que entregam e protegem os Serviços (descritos na <a href="/legal/privacy">Política de Privacidade</a>) podem processar metadados técnicos de requisição, como endereço IP e user agent, na borda. Se esses prestadores definirem cookies adicionais estritamente necessários nos domínios da TowelBooks, este aviso será atualizado para listá-los.',
            `Dúvidas sobre este aviso ou sobre armazenamento no navegador podem ser enviadas para ${PRIVACY_CONTACT_EMAIL}.`,
          ],
          title: 'Postura atual',
        },
        {
          table: {
            caption: 'Inventário de cookies estritamente necessários',
            headers: [
              'Nome',
              'Finalidade',
              'Onde é definido',
              'Retenção',
              'Observações',
            ],
            rows: [
              [
                '__Secure-refreshToken',
                'Renova access tokens de curta duração para sessões autenticadas no navegador.',
                'Fluxo de refresh de autenticação da API',
                'Até a expiração ou revogação da sessão e, depois disso, até 30 dias em registros de sessão retidos antes da limpeza.',
                'HttpOnly, SameSite=Strict, Secure fora de desenvolvimento, restrito a `/v1/auth` na origem da API (https://api.towelbooks.com); restrito ao host e não compartilhado entre subdomínios.',
              ],
              [
                'refreshToken',
                'Fallback de desenvolvimento local para o mesmo fluxo de refresh em localhost HTTP.',
                'Fluxo de refresh de autenticação da API em desenvolvimento',
                'Somente em desenvolvimento.',
                'Não é aceito fora do ambiente de desenvolvimento local.',
              ],
            ],
          },
          title: 'Inventário de cookies',
        },
        {
          table: {
            caption: 'Chaves aprovadas de armazenamento legível pelo navegador',
            headers: ['Chave', 'Formato do valor', 'Finalidade', 'Observações'],
            rows: [
              [
                'towelbooks-locale',
                "'pt-BR' | 'en-US'",
                'Persistir o idioma escolhido para este navegador.',
                'Somente preferência de interface; valores inválidos voltam para a localidade do documento ou do navegador.',
              ],
              [
                'towelbooks-theme-preference',
                "'system' | 'light' | 'dark'",
                'Persistir o tema escolhido neste navegador.',
                'Somente preferência de interface; valores inválidos voltam para um fallback seguro.',
              ],
              [
                'towelbooks-sidebar-behavior-preference',
                "'collapsed' | 'expanded' | 'hover'",
                'Persistir o comportamento de apresentação da barra lateral no desktop.',
                'Somente preferência de interface; nenhum dado de conta ou leitura é salvo.',
              ],
              [
                'towelbooks-analytics-consent',
                "{ analytics: 'granted' | 'denied' }",
                'Armazena a decisão de consentimento do analytics opcional de produto para o navegador atual.',
                'Sinal anônimo do navegador; não contém identificador de conta, URL, query, referenciador ou dados de evento. O analytics permanece desativado até uma concessão explícita.',
              ],
            ],
          },
          paragraphs: [
            'A TowelBooks mantém access tokens apenas em memória e não persiste refresh tokens, identificadores de sessão, metadados de conta, bibliotecas, salas, leituras ou outros dados sensíveis em armazenamento legível pelo navegador.',
          ],
          title: 'Inventário de armazenamento no navegador',
        },
        {
          bullets: [
            'As preferências de email de marketing e de analytics de produto começam retiradas até que você faça opt-in.',
            'O Google Analytics / Tag Manager é o provedor aprovado de analytics de produto, sujeito aos manifests versionados de provedor e ao catálogo de eventos sanitizados nos controles de privacidade de engenharia. Para visitantes sem conta, o banner de consentimento para visitantes disponível em todo o site permite aceitar ou recusar o analytics antes de qualquer requisição ao Google. Para pessoas autenticadas, a preferência da conta é autoritativa e o serviço só é carregado após consentimento explícito.',
            'O Cloudflare Web Analytics é um painel separado de desempenho, gerenciado pelo provedor. Seu beacon automático é limitado à telemetria sem cookies de desempenho da página, como tempo de navegação e Core Web Vitals, e pode operar independentemente da escolha de consentimento do analytics de produto do Google. Ele não recebe eventos de produto nem dados de conta da TowelBooks.',
            'Promoções internas controladas pela TowelBooks e links de afiliado da Amazon não usam cookies de marketing ou de publicidade. A TowelBooks não opera Google AdSense nem script de rede de anúncios de terceiros na implementação atual. Antes que qualquer tecnologia de anúncios de terceiros seja ativada, a TowelBooks atualizará este aviso, o registro de operadores, a política de segurança de conteúdo e a governança de provedores, bem como os controles de consentimento.',
            'Se provedores adicionais de analytics ou serviços de rastreamento forem introduzidos no futuro, a TowelBooks atualizará este aviso, o registro de operadores e a documentação de transferências antes da ativação.',
          ],
          title: 'Consentimento e analytics',
        },
        {
          bullets: [
            'Você pode revisar os documentos atuais de privacidade e exportar seus dados na área autenticada de privacidade.',
            'Você pode alterar as preferências de emails de marketing e analytics de produto na página de privacidade.',
            `Você pode contatar o canal de privacidade em ${PRIVACY_CONTACT_EMAIL} para dúvidas ou solicitações de direitos que ainda não sejam totalmente autosserviço.`,
          ],
          title: 'Suas escolhas',
        },
      ],
      title: formatPublicLegalTitle('Aviso de Cookies'),
    },
  };
