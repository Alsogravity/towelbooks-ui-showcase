import type { PublicLegalDocument, PublicLegalLocale } from '../types.js';
import {
  CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
  CURRENT_PRIVACY_POLICY_VERSION,
  FIRST_PUBLIC_LEGAL_EFFECTIVE_AT,
  FIRST_PUBLIC_LEGAL_VERSION,
  PUBLIC_LEGAL_DOCUMENT_METADATA,
} from '../constants.js';
import {
  formatPrivacyChangelogEntryTitle,
  formatPublicLegalLastUpdatedLabel,
} from '../format-labels.js';

const metadata = PUBLIC_LEGAL_DOCUMENT_METADATA.privacyChangelog;
const PREVIOUS_CURRENT_PRIVACY_POLICY_VERSION = '2026-08-22';
const PREVIOUS_CURRENT_PRIVACY_POLICY_EFFECTIVE_AT = '2026-08-22T00:00:00.000Z';
const PREVIOUS_PRIVACY_POLICY_VERSION = '2026-08-20';
const PREVIOUS_PRIVACY_POLICY_EFFECTIVE_AT = '2026-08-20T00:00:00.000Z';

export const privacyChangelogDocuments: Record<
  PublicLegalLocale,
  PublicLegalDocument
> = {
  en: {
    eyebrow: 'Privacy changelog',
    effectiveDateLabel: formatPublicLegalLastUpdatedLabel(
      'en',
      metadata.effectiveAt,
    ),
    sections: [
      {
        bullets: [
          'Clarified that public profile pages may be discoverable through external search engines, while making a profile private immediately marks its TowelBooks-controlled page as non-indexable.',
          'Clarified that previously indexed or cached third-party results may take additional time to update or remove, and that TowelBooks does not control or guarantee a fixed de-indexing deadline.',
          'Clarified that user catalog contributions may become shared global catalog records, that account deletion does not automatically remove retained bibliographic records or factual metadata, and that original catalog content is governed by a catalog-specific license while it remains in the catalog.',
          'Clarified that public or restricted profile, activity, and room contexts own the audience for published content and interactions, including comments, replies, reactions, reviews, notes, and discussions; a private profile does not make an interaction private when it is published in a public context.',
          'Distinguished private library and ownership notes from social reading-session notes, which may include full note content and reading context and may be published through profile activity with attached social interactions.',
          'Disclosed that provider-managed security challenges may be used when needed to protect the Services.',
          'Clarified that TowelBooks sends only a transient challenge token for server-side validation, does not retain the token, and does not add a separate cookie-consent category for this security processing.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'en',
          CURRENT_PRIVACY_POLICY_VERSION,
          CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
        ),
      },
      {
        bullets: [
          'Clarified that public profile pages may be discoverable through external search engines, while making a profile private immediately marks its TowelBooks-controlled page as non-indexable.',
          'Clarified that previously indexed or cached third-party results may take additional time to update or remove, and that TowelBooks does not control or guarantee a fixed de-indexing deadline.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'en',
          PREVIOUS_CURRENT_PRIVACY_POLICY_VERSION,
          PREVIOUS_CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
        ),
      },
      {
        bullets: [
          'Clarified the limited security-correlation and access-record design: HMAC-SHA256 identifiers are pseudonymized rather than anonymized; restricted CloudWatch access records hold only a timestamp, canonical client IP, and bounded request ID; and AWS and Cloudflare infrastructure logs are provider-managed.',
          'Added purpose limitation, masked-by-default restricted access, finite retention of up to six months for application access records, lifecycle deletion, and confirmation that these records are not available through public APIs or self-service exports.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'en',
          PREVIOUS_PRIVACY_POLICY_VERSION,
          PREVIOUS_PRIVACY_POLICY_EFFECTIVE_AT,
        ),
      },
      {
        bullets: [
          'Initial public Privacy Policy, Terms of Service, and Cookie Notice for MVP launch.',
          'The launch documents describe the service providers, international transfer posture, privacy rights, account deletion, cookies, optional analytics, and external links used by the initial product.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'en',
          FIRST_PUBLIC_LEGAL_VERSION,
          FIRST_PUBLIC_LEGAL_EFFECTIVE_AT,
        ),
      },
    ],
    title: 'Privacy changelog',
  },
  'pt-BR': {
    eyebrow: 'Histórico de privacidade',
    effectiveDateLabel: formatPublicLegalLastUpdatedLabel(
      'pt-BR',
      metadata.effectiveAt,
    ),
    sections: [
      {
        bullets: [
          'Esclarecido que páginas de perfis públicos podem ser descobertas por mecanismos de busca externos, enquanto tornar um perfil privado marca imediatamente sua página controlada pela TowelBooks como não indexável.',
          'Esclarecido que resultados de terceiros já indexados ou armazenados em cache podem levar tempo adicional para serem atualizados ou removidos, e que a TowelBooks não controla nem garante um prazo fixo para a desindexação.',
          'Esclarecido que contribuições de pessoas usuárias podem tornar-se registros do catálogo global compartilhado, que a exclusão da conta não remove automaticamente registros bibliográficos ou metadados factuais retidos e que o conteúdo original do catálogo é regido por uma licença específica enquanto permanecer no catálogo.',
          'Esclarecido que contextos públicos ou restritos de perfil, atividade e sala definem o público do conteúdo e das interações publicados, incluindo comentários, respostas, reações, avaliações, anotações e discussões; um perfil privado não torna privada uma interação publicada em um contexto público.',
          'Diferenciadas as notas privadas de biblioteca e propriedade das anotações sociais de sessões de leitura, que podem incluir o conteúdo completo e o contexto da leitura e ser publicadas por meio de atividade de perfil com interações sociais anexadas.',
          'Divulgado que desafios de segurança gerenciados por provedores podem ser usados quando necessário para proteger os Serviços.',
          'Esclarecido que a TowelBooks envia apenas um token de desafio transitório para validação no servidor, não retém o token e não adiciona uma categoria separada de consentimento de cookies para esse tratamento de segurança.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'pt-BR',
          CURRENT_PRIVACY_POLICY_VERSION,
          CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
        ),
      },
      {
        bullets: [
          'Esclarecido que páginas de perfis públicos podem ser descobertas por mecanismos de busca externos, enquanto tornar um perfil privado marca imediatamente sua página controlada pela TowelBooks como não indexável.',
          'Esclarecido que resultados de terceiros já indexados ou armazenados em cache podem levar tempo adicional para serem atualizados ou removidos, e que a TowelBooks não controla nem garante um prazo fixo para a desindexação.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'pt-BR',
          PREVIOUS_CURRENT_PRIVACY_POLICY_VERSION,
          PREVIOUS_CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
        ),
      },
      {
        bullets: [
          'Esclarecida a estrutura limitada de identificadores de correlação de segurança e registros de acesso: identificadores HMAC-SHA256 são pseudonimizados, e não anonimizados; registros restritos do CloudWatch contêm apenas horário, IP canônico do cliente e um request ID limitado; e logs de infraestrutura da AWS e da Cloudflare são gerenciados pelos provedores.',
          'Adicionadas limitação de finalidade, acesso restrito mascarado por padrão, retenção finita de até seis meses para registros de acesso do aplicativo, exclusão pelo ciclo de vida e confirmação de que esses registros não estão disponíveis por APIs públicas ou exports em autoatendimento.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'pt-BR',
          PREVIOUS_PRIVACY_POLICY_VERSION,
          PREVIOUS_PRIVACY_POLICY_EFFECTIVE_AT,
        ),
      },
      {
        bullets: [
          'Publicação inicial da Política de Privacidade, dos Termos de Serviço e do Aviso de Cookies para o lançamento do MVP.',
          'Os documentos de lançamento descrevem os prestadores de serviço, a postura de transferências internacionais, os direitos de privacidade, a exclusão de conta, os cookies, o analytics opcional e os links externos usados pelo produto inicial.',
        ],
        title: formatPrivacyChangelogEntryTitle(
          'pt-BR',
          FIRST_PUBLIC_LEGAL_VERSION,
          FIRST_PUBLIC_LEGAL_EFFECTIVE_AT,
        ),
      },
    ],
    title: 'Histórico de privacidade',
  },
};
