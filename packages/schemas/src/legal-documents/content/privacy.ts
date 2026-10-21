import type { PublicLegalDocument, PublicLegalLocale } from '../types.js';
import {
  CURRENT_PRIVACY_POLICY_EFFECTIVE_AT,
  PRIVACY_CONTACT_EMAIL,
} from '../constants.js';
import {
  formatPublicLegalEffectiveDateLabel,
  formatPublicLegalTitle,
} from '../format-labels.js';

const privacyMetadata = { effectiveAt: CURRENT_PRIVACY_POLICY_EFFECTIVE_AT };

export const privacyDocuments: Record<PublicLegalLocale, PublicLegalDocument> =
  {
    en: {
      eyebrow: 'Privacy Policy',
      effectiveDateLabel: formatPublicLegalEffectiveDateLabel(
        'en',
        privacyMetadata.effectiveAt,
      ),
      sections: [
        {
          paragraphs: [
            'TowelBooks is an independently developed and maintained reading platform operated by Rafael Moraes, an independent developer. For the purposes of applicable privacy law, Rafael Moraes is the controller of personal data processed through the TowelBooks Services under the TowelBooks brand.',
            `Contact for privacy questions and data-subject requests: ${PRIVACY_CONTACT_EMAIL}. The Services are operated with Brazil as the primary legal jurisdiction; applicable law and venue are described in the <a href="/legal/terms">Terms of Service</a>.`,
          ],
          title: 'Who controls your data and how to contact us',
        },
        {
          paragraphs: [
            "Simply put, 'personal data' is any information that directly identifies you (like your name or email address) or helps to identify you in some way.",
          ],
          title: 'What is personal data?',
        },
        {
          paragraphs: [
            'TowelBooks services are provided through the domain towelbooks.com and related official subdomains.',
            'You can also manage your privacy preferences directly in the application settings, under <span class="font-semibold">Settings → Privacy & Data</span>.',
          ],
          title: 'Where TowelBooks operates',
        },
        {
          paragraphs: [
            'To provide a pleasant and secure reading experience, we collect and care for specific types of data, organized into the following categories:',
          ],
          bullets: [
            '<strong>Account and profile details</strong>: your email address (including technical formats used to prevent duplicate accounts and enhance system security), display name, username, profile picture (avatar), cover photo (banner), biography, optional external links you add to your profile (title and HTTPS URL), language preference, and profile settings.',
            '<strong>Session and security details</strong>: information required for you to log in securely, keep your active session running safely, prevent fraud, and maintain basic security logs (audit trails), including technical signals such as hashed IP identifiers and coarse device/browser context where needed for session security.',
            '<strong>Your reading activity</strong>: the reading rooms you create or join, invitations you send, optional external links you add to a reading room (title and HTTPS URL), books read, your personal library, wishlist, reviews, reflections, reactions, discussions, and other records created to support your reading workflows and social interactions.',
            '<strong>Catalog contributions</strong>: information you submit about books, editions, authors, and other catalog records, including bibliographic metadata, original descriptions, summaries, synopses, notes, and catalog images you upload. These contributions may become part of the shared global catalog.',
            '<strong>Reading-session notes and contextual social content</strong>: reading-session note content, optional page or page-range context, reading-session association, timestamps, profile ActivityEvents, and attached comments, replies, and reactions. Personal library notes and ownership notes are different private library and ownership metadata; they do not create profile activity.',
            '<strong>Notifications and preferences</strong>: in-app notification records and your channel preferences needed to deliver essential product alerts.',
            '<strong>Room invite details</strong>: if a room manager requests TowelBooks to send an invite email to you, we process that email address in a protected format (such as cryptographic hashes and masks) to track delivery status and respect your preference if you choose not to receive future invites.',
            '<strong>Room join requests</strong>: when you request to join a public reading room or when someone requests to join a room you manage, we store the pending request, timestamps, and limited identity details needed to review it (such as avatar, display name, username, and bio). Join requests do not include a free-text message field.',
            '<strong>Reports and moderation review</strong>: when you report an accessible profile, room, catalog work, or comment, we store the selected reason, any bounded details you provide, the reported target/resource reference, submission timestamp, moderation status, and review metadata. The reporter account linkage is retained while applicable, and authorized reviewers may see limited reporter, reviewer, and target context needed to investigate the report.',
            '<strong>Your privacy choices</strong>: we retain the history of your agreement to our terms, your privacy preferences, and records of your privacy requests.',
          ],
          title: 'What data we collect',
        },
        {
          paragraphs: [
            'We use your data only for specific, legitimate purposes to ensure transparency. Here is how:',
          ],
          bullets: [
            '<strong>To run the application (Contract performance)</strong>: account registration, secure login, email verification, password resets, and session renewal. We process this data because it is essential to deliver our services to you.',
            '<strong>To support your reading workflows and social reading</strong>: setting up private rooms, organizing your library, saving private library and ownership metadata, reviews, and wishlists, managing reading sessions and reading-session notes, publishing authorized profile activity, and enabling contextual comments, replies, reactions, reviews, and collaboration between readers.',
            '<strong>To operate the shared catalog</strong>: receiving, resolving, curating, displaying, maintaining, improving, and protecting shared bibliographic records and original catalog content, including correcting duplicates and inaccurate information.',
            '<strong>To manage room access</strong>: processing invites, public-room join requests, open self-join where enabled, and manager review of pending requests.',
            '<strong>For safety and moderation</strong>: receiving and reviewing contextual reports, investigating possible abuse or policy violations, and protecting the community and Services. A report is a review signal and does not automatically remove or change the reported target.',
            '<strong>For account lifecycle management</strong>: we may review account activity after two consecutive years without sign-in or meaningful use and, after warning you at your registered email address, decide whether account deletion is appropriate.',
            '<strong>To send room invitations</strong>: these emails are strictly transactional, include options for recipients to opt out of future room invites, and do not sign you up for marketing lists.',
            '<strong>For updates and improvements</strong>: we only send marketing emails or analyze optional product usage with your prior, explicit consent.',
            '<strong>For legal compliance</strong>: we retain records of legal agreement versions and your privacy choices to meet our regulatory obligations.',
          ],
          title: 'Why we use this data',
        },
        {
          paragraphs: [
            'TowelBooks uses the audience of the place where content is published as the authority for that content and its interactions. Content and interactions published in a public area are public within the audience made available by that TowelBooks context; this does not promise anonymous access or visibility beyond the applicable profile, activity, or room policy.',
            'Comments, replies, reactions, reviews, notes, discussions, and similar contributions inherit the audience of the content or area where they are published. A private profile does not make an interaction private when the person chooses to publish it on a public profile activity or another public context. A restricted activity or room limits the interaction to viewers authorized for that context.',
          ],
          bullets: [
            '<strong>Example</strong>: a person with a private profile who comments on a public profile activity publishes that comment to the activity audience; the person’s profile remains subject to its own privacy settings.',
            '<strong>Reading-session notes</strong>: a note published through profile activity may include its full note content, optional page or page-range context, reading-session association, timestamps, and the profile activity’s authorized social interactions.',
          ],
          title: 'Contextual visibility and social interactions',
        },
        {
          paragraphs: [
            'We believe in simplicity and privacy. We do not use cookies for behavioral advertising or tracking.',
            "We use a single strictly necessary refresh-token cookie to keep your authenticated session active and secure. We also store a small set of non-sensitive layout preferences (like light or dark mode) in your browser's local storage to improve your visual experience.",
            'Optional product analytics is disabled by default. Google Analytics / Tag Manager can run only after explicit consent — through the privacy settings for authenticated users, or through the sitewide visitor consent banner — and no Google request is made before that grant is resolved. The approved event catalog contains only route/category enums and bounded counts; it excludes account identifiers, raw URLs, queries, referrers, and user-entered text. Cloudflare Web Analytics is a separate provider-managed, cookie-less performance dashboard: its automatic beacon may collect limited page-performance telemetry, such as navigation timing and Core Web Vitals, independently of the Google product-analytics consent choice. It does not receive TowelBooks product events or account data.',
            'When needed to protect the Services, a provider-managed security challenge may be presented in the browser. TowelBooks sends only the resulting single-use challenge token for server-side validation, does not persist the token, and does not use this security processing for behavioral advertising, product analytics, or a separate cookie-consent category.',
          ],
          title: 'Cookies and browser storage',
        },
        {
          paragraphs: [
            'We use narrowly limited security telemetry to protect the Services, prevent abuse, and investigate security incidents. This processing is not used for advertising, profiling, or public analytics.',
            'HMAC-SHA256 security-correlation identifiers used in application security and audit records are pseudonymized identifiers. They are not anonymized: a protected secret can allow the Services to recognize the same input again, so we treat them as restricted security telemetry.',
            'Separately, a restricted CloudWatch access-record boundary receives only an ISO-8601 timestamp, canonical client IP, and bounded request ID for trusted API ingress. AWS and Cloudflare also operate their own infrastructure logs under their provider-managed logging services. These are separate from application audit records.',
            'A provider-managed security challenge may process browser security signals. TowelBooks receives only the validation result needed to protect the Services and does not retain the challenge token or provider response.',
          ],
          bullets: [
            '<strong>Purpose limitation</strong>: access records are used only for security operations, fraud and abuse prevention, and incident investigation.',
            '<strong>Restricted access and masking</strong>: access records are masked by default and available only to specifically authorized operators; exceptional unmasking is subject to the documented investigation procedure.',
            '<strong>Finite retention and deletion</strong>: application access records are retained for up to six months and then deleted by the logging lifecycle. Provider-managed infrastructure logs follow the applicable provider setting and retention process.',
            '<strong>No public access</strong>: neither raw access records nor security-correlation identifiers are available through public APIs, self-service exports, or ordinary support requests.',
          ],
          title: 'Security-correlation identifiers and access records',
        },
        {
          paragraphs: [
            'We do not sell your personal data. We only share the minimum necessary data with trusted service providers who help us run TowelBooks. These providers act on our instructions under confidentiality and security obligations compatible with applicable privacy law.',
            'Current launch service providers include:',
          ],
          bullets: [
            '<strong>AWS</strong>: application hosting, database, private storage, and operational logging (primarily in the United States, region <code>us-east-1</code>).',
            '<strong>Cloudflare</strong>: edge proxy, DNS/security controls, static web hosting, public asset delivery, provider-managed Web Analytics performance telemetry, and optional provider-managed security challenges (global edge network). Edge and challenge processing may include IP address, user agent, request metadata needed to deliver and protect the Services, provider-managed browser security signals, transient challenge tokens, and limited page-performance telemetry such as navigation timing and Core Web Vitals.',
            '<strong>Amazon SES</strong>: transactional email delivery (for example verification, password reset, security, account-lifecycle, and room-invite messages).',
            '<strong>Google</strong>: when the optional Google sign-in feature is enabled, you may choose to sign in, register, or connect your account with Google (Google Identity / OAuth 2.0). If you continue with Google, your browser is redirected to Google and, after your consent, Google shares with us your Google account identifier, verified email address, and basic profile information (such as your name) so we can authenticate you. Google processes your data under its own terms and privacy policy.',
            "<strong>Google Analytics / Tag Manager</strong>: when you give explicit consent (through the privacy settings or the sitewide visitor consent banner), and only after the approved provider manifest is enabled, these services help us understand product usage. The sanitized catalog sends only route/category enums, bounded search counts, finite source/provider/placement values, and event names. It does not send email, name, account identifiers, raw URLs, queries, referrers, or user-entered text. Data is processed under Google's data processing terms and privacy policy.",
          ],
          paragraphsAfterBullets: [
            "Where available, TowelBooks may display Amazon affiliate links on book pages and in TowelBooks-controlled internal promotional placements. We generate these plain outbound links from local catalog metadata, such as an ASIN or ISBN, together with the TowelBooks Amazon Associate tag. We may receive a commission from qualifying purchases at no additional cost to you. Purchases take place on Amazon and are governed by Amazon's terms and privacy policy. TowelBooks does not receive your Amazon purchase history through this implementation, and it does not embed Amazon scripts or SDKs on its pages.",
            'We may also use non-production tooling (for example CI systems) that must not process production personal data.',
          ],
          title: 'Sharing and service providers',
        },
        {
          paragraphs: [
            "Because we use global cloud infrastructure, some of your data may be processed outside Brazil, including in the United States and on Cloudflare's global edge network, as described in Sharing and service providers.",
            'Whenever this happens, we require contractual and technical safeguards compatible with applicable privacy regulations (such as data-processing terms and standard contractual clauses or equivalent mechanisms where required) to keep your information protected.',
          ],
          title: 'International data transfers',
        },
        {
          paragraphs: [
            'We retain your data only for as long as necessary to fulfill the purposes described in this policy, protect system security, and meet legal requirements.',
            'To ensure transparency, we enforce the following cleanup rules:',
          ],
          bullets: [
            '<strong>Verification and reset links</strong>: temporary email links expire and are permanently deleted 7 days after use or expiration.',
            '<strong>Active sessions</strong>: once you log out or a session expires, temporary access records are deleted after 30 days.',
            '<strong>Inactive accounts</strong>: we may review accounts with no sign-in or meaningful use for two consecutive years. The two-year period does not trigger automatic deletion. If we decide deletion is appropriate, we will warn you at your registered email address before proceeding.',
            '<strong>Shared catalog records</strong>: bibliographic records and factual metadata already incorporated into the shared catalog are not automatically removed when an account is deleted. Where applicable, the contribution’s account association may be removed, anonymized, or retained in a limited form under this Policy, applicable law, and legitimate audit, moderation, or catalog-integrity requirements. Original catalog content may remain under the catalog-specific license while it remains part of the shared catalog.',
            '<strong>Room invite records</strong>: after a room invitation expires or is revoked, related allowlist and delivery records are deleted within 90 days. Invite redemption records are deleted after 180 days. If you opt out of invites, we keep a protected email hash while needed to honor your choice and prevent future invites.',
            '<strong>Pending room join requests</strong>: when a request is accepted, declined, or cancelled, the pending row is deleted. We do not keep a permanent history of declined or cancelled join requests.',
            '<strong>Reports</strong>: open reports remain while they are actionable. Resolved and dismissed reports are deleted 365 days after review, unless a longer period is required by applicable law or an existing legal hold in the retention framework.',
            '<strong>Security and audit logs</strong>: basic records for fraud prevention and incident investigation are kept for up to 730 days, with progressive reduction or anonymization.',
            '<strong>Legal and privacy records</strong>: history of legal agreements and privacy requests are kept for compliance windows (5 years for privacy request history) after account closure.',
          ],
          title: 'How long we keep your information',
        },
        {
          paragraphs: [
            `Under applicable privacy law (including Brazil's LGPD), you may exercise rights over your personal data. Some of these rights are subject to the conditions, limits, and exceptions provided for under applicable law.`,
            `Within TowelBooks you can use the controls below; for rights that are not fully self-service, use the in-app privacy request flow under <span class="font-semibold">Settings → Privacy & Data</span> or email ${PRIVACY_CONTACT_EMAIL}. We may need to confirm your identity before fulfilling a request, so we can protect your account and personal data.`,
          ],
          bullets: [
            '<strong>Confirmation</strong>: you may request confirmation as to whether we process personal data relating to you.',
            '<strong>Access</strong>: you may request access to your personal data and information about how it is processed. You can also download a structured JSON export of the data categories currently included in self-service export from privacy settings. Categories not yet included in that export can be requested through the privacy request flow or by email.',
            '<strong>Portability</strong>: you may request portability of your personal data, where applicable. This right is subject to ANPD regulation and the limits set by applicable law. The self-service JSON export supports part of this right for the categories currently available in the product.',
            '<strong>Correction</strong>: you can update your profile details directly in account settings. If a particular field cannot be changed there, contact us through the support or privacy channels to request a correction, subject to applicable security measures.',
            '<strong>Anonymization, blocking, or deletion</strong>: under applicable law, you may request anonymization, blocking, or deletion of unnecessary or excessive personal data, or of data processed in non-compliance with the law. Separately, you may permanently delete your account through self-service settings (see Account deletion lifecycle). Account deletion is a product feature that ends your access and starts the documented erasure process; it does not automatically replace every legal anonymization, blocking, restriction, or objection request, which you can submit through the privacy request flow.',
            '<strong>Consent controls</strong>: you choose whether to opt in to marketing updates or optional product analytics, and you may withdraw consent later without affecting processing based on other lawful grounds.',
            '<strong>Information about sharing</strong>: you may request information about public and private entities with which we share data. The current service-provider list and information about international data transfers are described in this Policy under Sharing and service providers and International data transfers.',
            "<strong>Complaint to a supervisory authority</strong>: you may lodge a complaint with Brazil's ANPD (Autoridade Nacional de Proteção de Dados) or another competent authority where applicable. You are also welcome to contact us first if you prefer; we are available to help resolve privacy questions and requests.",
          ],
          title: 'Your rights and controls',
        },
        {
          paragraphs: [
            'We want you to feel in complete control. That is why account deletion is structured in three clear stages:',
            '1. <strong>The request and cooling-off period</strong>: deletion is self-service and initiated by you in settings. After confirming through the link sent to your email, your account enters a 30-day grace window (a secure waiting period) before final deletion.',
            '2. <strong>Optional cancellation</strong>: during these 30 days, you can restore your account by using the cancellation link in the confirmation email, by signing in with your password and confirming reactivation, or by reauthenticating through your linked Google account. All restoration paths are logged for security so we can tell which channel restored the account. Restoration must be completed before the scheduled expiration time.',
            '3. <strong>Final deletion</strong>: after the grace window, the permanent deletion will be processed in accordance with our operational procedures. This will revoke remaining access, delete personal libraries and wishlists, and anonymize direct account identifiers.',
            'Certain regulatory, compliance, and room-continuity records—and, if you have used paid features provided by TowelBooks, minimal payment records—may remain attached to an anonymized account record that cannot be used to sign in, ensuring domain integrity.',
          ],
          title: 'Account deletion lifecycle',
        },
        {
          paragraphs: [
            'Upon finalization, all direct account identifiers and profile data are removed or anonymized. However, to preserve the community experience and fulfill legal duties, a few records may persist:',
            "<strong>Community continuity</strong>: to keep reading rooms functioning, comments, reviews, or book reflections you shared in public or shared rooms remain visible but are reassigned to an anonymous placeholder profile (e.g., 'Deleted Reader'). Profile activity sourced from a reading-session note is not an independent copy of the note: the note and its source-owned activity follow the account-deletion and source-lifecycle rules, while retained social content follows the documented anonymized continuity path.",
            '<strong>Shared catalog records</strong>: bibliographic records and factual metadata already incorporated into the shared catalog may remain after account deletion. Where applicable, the association between a catalog contribution and your account may be removed, anonymized, or retained in a limited form under this Policy, applicable law, and legitimate audit, moderation, or catalog-integrity requirements. Original catalog content may remain under the catalog-specific license while it remains part of the shared catalog.',
            '<strong>Legal and support compliance</strong>: legal acceptances, privacy-request history, and—if applicable—records related to paid features or payment support may be retained securely for regulatory compliance, reconciliation, or dispute resolution. They can never be used to log in or recreate your profile.',
            '<strong>Security logs</strong>: incident investigation logs may reference an anonymous internal user ID until the audit retention window expires.',
            '<strong>Moderation reports</strong>: when an account is finalized, reporter and reviewer links are detached from retained reports. The report reason, bounded details, lifecycle evidence, and soft target reference may remain for moderation accountability until the terminal-report retention window expires; no deleted account is assigned as a report identity.',
          ],
          title: 'What remains after account deletion',
        },
        {
          paragraphs: [
            'You can set your profile to private from your privacy settings (<span class="font-semibold">Settings → Privacy & Data</span>). Here is how it works:',
          ],
          bullets: [
            '<strong>Basic identity is visible</strong>: even with a private profile, your photo (avatar), cover (banner), display name, username, bio, and any external profile links you choose to publish remain public so others can recognize you and send a follow request.',
            '<strong>Aggregated content is hidden</strong>: a private profile hides your detailed reading stats, library content, custom profile sections, and follower/following lists.',
            '<strong>Public activity</strong>: reviews, comments, and memberships in shared rooms follow the visibility rules of those specific areas. Room links are visible to people who can already view that room.',
            '<strong>Follower requests</strong>: pending follow requests do not grant access to follower-only content until you review and accept them.',
            '<strong>Shared personal libraries</strong>: personal libraries are created as shared; you do not control separate library visibility in the current MVP.',
            '<strong>Who can see your library</strong>: public profiles allow any signed-in reader to open your library; private profiles allow only accepted followers. Others cannot see your library list or books.',
            '<strong>Private library metadata</strong>: authorized profile visitors do not see your personal library notes or ownership notes through the profile library surface. These remain private library and ownership metadata.',
            '<strong>Reading-session notes are different</strong>: a reading-session note may be published through profile activity. Authorized viewers of that activity may see its full note content, optional page or page-range context, reading-session association, timestamps, and attached comments, replies, or reactions according to the activity audience.',
            '<strong>External links</strong>: when you add links to your profile or a room, we store the title and HTTPS URL you provide, include them in self-service privacy export when applicable, and open them in the browser without click tracking or a TowelBooks redirect. Destination sites are outside our control and follow their own terms and privacy practices.',
            '<strong>External search indexing</strong>: a public profile page may be discoverable through external search engines according to these visibility rules. When you change your profile to private, TowelBooks marks that profile page as non-indexable from the moment the change takes effect on our side; this does not make private profile content public.',
            "<strong>Third-party update time</strong>: search engines and other third parties may take additional time to update or remove previously indexed or cached profile results. That timing is outside TowelBooks' direct control, and we do not promise a fixed de-indexing deadline.",
          ],
          title: 'Profile visibility',
        },
        {
          paragraphs: [
            'To create a friendly, connected community, we manage social requests as follows:',
          ],
          bullets: [
            '<strong>Reviewing requests</strong>: when someone requests to follow your private profile, you can see their public avatar, name, and bio to decide whether to accept them.',
            '<strong>Read receipts</strong>: we only record if you have seen a pending request to prevent showing duplicate notifications. Viewing a request does not accept or decline it.',
            '<strong>Follower access</strong>: accepting a request allows the follower to view your follower-only private profile content.',
            '<strong>Declines and cancellations</strong>: declining a request or if the sender cancels it removes it from the list. We do not keep a permanent history of declined/canceled rows once deleted.',
            '<strong>Essential alerts</strong>: notification preferences do not disable essential visual indicators in the app needed for core account and follow request functionality.',
            '<strong>Room invite emails</strong>: if you receive a room invite by email and no longer want invite messages of that kind, use the one-click refusal link in the message footer to block future room invite emails to your address. This does not affect essential security, account, or legal communications.',
          ],
          title: 'Follow requests and notifications',
        },
        {
          paragraphs: [
            'Public reading rooms may allow people to join directly, request access, or enter only through invites, depending on the room settings chosen by its managers. Private rooms remain invite-only regardless of other settings.',
          ],
          bullets: [
            '<strong>Reviewing requests</strong>: when someone requests to join a public room you manage, you can see their public avatar, display name, username, and bio to decide whether to accept them. Join requests do not include a free-text message.',
            '<strong>Read receipts</strong>: for manager-facing review, we only record whether you have seen a pending join request so the app can stop treating it as new. Viewing a request does not approve or decline it.',
            '<strong>Declines and cancellations</strong>: declining a request or cancelling your own pending request removes the row. We do not keep a permanent history of declined or cancelled join requests once deleted.',
            '<strong>Invites still apply</strong>: room invite links and invite emails continue to work for any join policy. Public discovery and join requests are separate from the invite flow.',
            '<strong>Essential indicators</strong>: notification preferences do not disable essential in-app indicators needed for core room join-request functionality.',
          ],
          title: 'Room join requests',
        },
        {
          paragraphs: [
            'Your security is our top priority. TowelBooks adopts technical and organizational measures to protect personal data, including encryption in transit and at rest where applicable, strict access controls for production systems, rate limiting to reduce abuse, and ongoing monitoring for suspicious activity to help prevent unauthorized access.',
          ],
          title: 'Security',
        },
        {
          paragraphs: [
            'If the ownership of TowelBooks is transferred to another entity as a result of a sale, merger, consolidation, succession, or equivalent transaction, personal data may be transferred to the new controller to ensure the continuity of the Services, subject to applicable law and the rights of data subjects as set out in this Policy.',
          ],
          title: 'Change of controller',
        },
        {
          paragraphs: [
            'This policy may be updated periodically. When material changes occur, we will notify users through appropriate means, such as by email or through an in-app notice.',
          ],
          title: 'Policy updates',
        },
        {
          paragraphs: [
            `Questions about this Privacy Policy or our privacy posture can be sent to ${PRIVACY_CONTACT_EMAIL}.`,
          ],
          title: 'Contact',
        },
      ],
      title: formatPublicLegalTitle('Privacy Policy'),
    },
    'pt-BR': {
      eyebrow: 'Política de Privacidade',
      effectiveDateLabel: formatPublicLegalEffectiveDateLabel(
        'pt-BR',
        privacyMetadata.effectiveAt,
      ),
      sections: [
        {
          paragraphs: [
            'O TowelBooks é uma plataforma de leitura desenvolvida e mantida de forma independente por Rafael Moraes, desenvolvedor independente. Para fins da legislação de proteção de dados aplicável, Rafael Moraes é o controlador dos dados pessoais tratados por meio dos Serviços da TowelBooks sob a marca TowelBooks.',
            `Canal de contato para dúvidas de privacidade e solicitações de titulares: ${PRIVACY_CONTACT_EMAIL}. Os Serviços são operados com o Brasil como jurisdição jurídica principal; a lei aplicável e o foro estão descritos nos <a href="/legal/terms">Termos de Serviço</a>.`,
          ],
          title: 'Quem cuida dos seus dados e como nos encontrar',
        },
        {
          paragraphs: [
            'De forma simples, dados pessoais são qualquer informação que possa identificar você diretamente (como seu nome ou e-mail) ou ajudar a identificar você de alguma forma.',
          ],
          title: 'O que consideramos dados pessoais?',
        },
        {
          paragraphs: [
            'Os serviços do TowelBooks são disponibilizados por meio do domínio towelbooks.com e de subdomínios oficiais relacionados.',
            'Você também pode gerenciar suas preferências de privacidade diretamente nas configurações do aplicativo, em <span class="font-semibold">Configurações → Privacidade e dados</span>.',
          ],
          title: 'Onde o TowelBooks funciona',
        },
        {
          paragraphs: [
            'Para oferecer uma experiência de leitura agradável e segura, nós coletamos e cuidamos de alguns dados específicos. Eles estão divididos nas seguintes categorias:',
          ],
          bullets: [
            '<strong>Informações da sua conta e perfil</strong>: seu e-mail (incluindo versões técnicas para evitar contas duplicadas e reforçar a segurança), nome de exibição, nome de usuário, foto de perfil (avatar), imagem de capa (banner), biografia, links externos opcionais que você adiciona ao perfil (título e URL HTTPS), sua preferência de idioma e configurações do perfil.',
            '<strong>Segurança e conexões</strong>: dados necessários para você fazer login com segurança, manter sua sessão ativa, evitar fraudes e guardar registros básicos de segurança (auditoria), inclusive sinais técnicos como identificadores de IP em formato protegido (hash) e contexto grosseiro de dispositivo/navegador quando necessário à segurança da sessão.',
            '<strong>Sua atividade de leitura</strong>: as salas de leitura virtuais que você cria ou participa, convites que envia, links externos opcionais que você adiciona a uma sala (título e URL HTTPS), livros lidos, sua biblioteca pessoal, lista de desejos (wishlist), avaliações, reflexões, reações, discussões e outras atividades pensadas para os seus fluxos de leitura e interação.',
            '<strong>Contribuições para o catálogo</strong>: informações que você envia sobre livros, edições, autores e outros registros do catálogo, incluindo metadados bibliográficos, descrições originais, resumos, sinopses, anotações e imagens de catálogo carregadas por você. Essas contribuições poderão tornar-se parte do catálogo global compartilhado.',
            '<strong>Anotações de sessões de leitura e conteúdo social contextual</strong>: conteúdo de anotações de sessões de leitura, contexto opcional de página ou intervalo de páginas, associação à sessão de leitura, registros de data/hora, atividades de perfil e comentários, respostas e reações anexados. Notas pessoais de biblioteca e notas de propriedade são metadados privados de biblioteca e propriedade diferentes; eles não criam atividade de perfil.',
            '<strong>Notificações e preferências</strong>: registros de notificações no aplicativo e preferências de canal necessárias para entregar alertas essenciais do produto.',
            '<strong>E-mails de convite para salas</strong>: se uma pessoa que gerencia uma sala pedir para enviarmos um convite por e-mail para você, processamos esse endereço de e-mail apenas de forma protegida (como códigos criptografados e máscaras), acompanhando o status do envio e respeitando se você preferir não receber novos convites.',
            '<strong>Solicitações de entrada em salas</strong>: quando você pede para entrar em uma sala pública ou quando alguém solicita entrada em uma sala que você gerencia, armazenamos a solicitação pendente, os registros de data/hora e os dados limitados de identidade necessários para análise (como avatar, nome de exibição, nome de usuário e biografia). Solicitações de entrada não incluem campo de mensagem livre.',
            '<strong>Denúncias e análise de moderação</strong>: quando você denuncia um perfil, uma sala, um item do catálogo ou um comentário acessível, armazenamos o motivo escolhido, eventuais detalhes limitados fornecidos por você, a referência do recurso denunciado, o horário de envio, o status de moderação e os metadados de análise. O vínculo com a conta denunciante é mantido enquanto aplicável, e pessoas autorizadas a revisar denúncias podem ver o contexto limitado de denunciante, revisor e alvo necessário para investigar a denúncia.',
            '<strong>Suas escolhas de privacidade</strong>: guardamos o histórico de quando você aceitou nossos termos, suas preferências de privacidade e o registro de eventuais solicitações feitas a nós.',
          ],
          title: 'Quais dados nós coletamos?',
        },
        {
          paragraphs: [
            'Usamos os seus dados apenas para fins específicos e legítimos, garantindo que o serviço funcione de forma transparente. Veja os detalhes:',
          ],
          bullets: [
            '<strong>Para fazer o aplicativo funcionar (Execução de contrato)</strong>: criar sua conta, permitir que você faça login, verificar seu e-mail, redefinir senhas e manter o sistema seguro. Usamos essas informações porque elas são essenciais para cumprir o nosso acordo de serviço com você.',
            '<strong>Para viabilizar seus fluxos de leitura e a leitura social</strong>: criar salas privadas, organizar sua biblioteca, salvar metadados privados de biblioteca e propriedade, comentários, avaliações e listas de desejos, gerenciar sessões e anotações de sessões de leitura, publicar atividades autorizadas de perfil e permitir comentários, respostas, reações e colaboração contextuais entre leitores.',
            '<strong>Para operar o catálogo compartilhado</strong>: receber, resolver, fazer curadoria, exibir, manter, aprimorar e proteger registros bibliográficos compartilhados e conteúdo original do catálogo, inclusive corrigindo duplicidades e informações incorretas.',
            '<strong>Para gerenciar o acesso às salas</strong>: processar convites, solicitações de entrada em salas públicas, autoentrada quando habilitada e a análise de solicitações pendentes pelas pessoas que gerenciam a sala.',
            '<strong>Para segurança e moderação</strong>: receber e analisar denúncias contextuais, investigar possíveis abusos ou violações de políticas e proteger a comunidade e os Serviços. Uma denúncia é um sinal para análise e não remove nem altera automaticamente o alvo denunciado.',
            '<strong>Para gerenciar o ciclo de vida da conta</strong>: podemos revisar a atividade da conta após dois anos consecutivos sem login ou uso significativo e, depois de avisar você no endereço de e-mail cadastrado, decidir se a exclusão da conta é apropriada.',
            '<strong>Para enviar convites de salas</strong>: esses e-mails são puramente informativos e relacionados ao uso do sistema. Eles sempre incluem uma opção para você recusar futuros convites e nunca são usados para enviar propagandas sem permissão.',
            '<strong>Comunicações de novidades (Marketing) e melhorias do produto</strong>: só enviamos e-mails de marketing ou fazemos análises de uso do aplicativo se você nos der sua autorização expressa (consentimento) antes disso.',
            '<strong>Para obrigações legais e conformidade</strong>: guardamos registros das versões de documentos que você aceitou e de suas escolhas de privacidade para estarmos em conformidade com as leis aplicáveis.',
          ],
          title: 'Como usamos os seus dados?',
        },
        {
          paragraphs: [
            'A TowelBooks usa o público do local onde o conteúdo é publicado como autoridade para esse conteúdo e suas interações. Conteúdos e interações publicados em uma área pública são públicos dentro do público disponibilizado por aquele contexto da TowelBooks; isso não promete acesso anônimo nem visibilidade além da política aplicável ao perfil, à atividade ou à sala.',
            'Comentários, respostas, reações, avaliações, anotações, discussões e contribuições semelhantes herdam o público do conteúdo ou da área em que são publicados. Um perfil privado não torna privada uma interação quando a pessoa escolhe publicá-la em uma atividade de perfil pública ou em outro contexto público. Uma atividade ou sala restrita limita a interação às pessoas autorizadas para aquele contexto.',
          ],
          bullets: [
            '<strong>Exemplo</strong>: o comentário de uma pessoa com perfil privado em uma atividade de perfil pública é publicado para o público daquela atividade; o perfil da pessoa continua sujeito às próprias configurações de privacidade.',
            '<strong>Anotações de sessões de leitura</strong>: uma anotação publicada por meio de uma atividade de perfil pode incluir o conteúdo completo da anotação, o contexto opcional de página ou intervalo de páginas, a associação à sessão de leitura, registros de data/hora e as interações sociais autorizadas pela atividade.',
          ],
          title: 'Visibilidade contextual e interações sociais',
        },
        {
          paragraphs: [
            'Nós valorizamos a simplicidade e a sua privacidade. Por isso, não usamos cookies para rastreamento de anúncios ou publicidade comportamental.',
            'Usamos apenas um único cookie técnico essencial para manter você conectado com segurança (cookie de renovação de sessão). Além dele, guardamos no seu navegador algumas preferências simples de visualização (como a escolha de tema claro ou escuro) para melhorar sua experiência visual.',
            'O analytics opcional de produto fica desativado por padrão. O Google Analytics / Tag Manager só pode funcionar após consentimento explícito — nas configurações de privacidade para pessoas autenticadas ou no banner de consentimento para visitantes disponível em todo o site — e nenhuma requisição ao Google é feita antes de essa concessão ser resolvida. O catálogo aprovado contém apenas enums de rota/categoria e contagens limitadas; exclui identificadores de conta, URLs brutas, pesquisas, referenciadores e texto digitado. O Cloudflare Web Analytics é um painel separado, gerenciado pelo provedor e sem cookies: seu beacon automático pode coletar telemetria limitada de desempenho da página, como tempo de navegação e Core Web Vitals, independentemente da escolha de consentimento do analytics de produto do Google. Ele não recebe eventos de produto nem dados de conta da TowelBooks.',
            'Quando necessário para proteger os Serviços, um desafio de segurança gerenciado por provedor poderá ser apresentado no navegador. A TowelBooks envia apenas o token de desafio de uso único resultante para validação no servidor, não armazena o token e não usa esse tratamento de segurança para publicidade comportamental, analytics de produto ou uma categoria separada de consentimento de cookies.',
          ],
          title: 'Cookies e tecnologias no seu navegador',
        },
        {
          paragraphs: [
            'Usamos telemetria de segurança estritamente limitada para proteger os Serviços, prevenir abusos e investigar incidentes de segurança. Esse tratamento não é usado para publicidade, criação de perfis ou analytics público.',
            'Os identificadores de correlação de segurança HMAC-SHA256 usados nos registros de segurança e auditoria do aplicativo são identificadores pseudonimizados. Eles não são anonimizados: um segredo protegido pode permitir que os Serviços reconheçam novamente a mesma entrada, por isso os tratamos como telemetria de segurança restrita.',
            'Separadamente, uma fronteira restrita de registros de acesso no CloudWatch recebe apenas um horário ISO-8601, o IP canônico do cliente e um request ID limitado para a entrada confiável da API. AWS e Cloudflare também operam seus próprios logs de infraestrutura nos respectivos serviços de logging gerenciados pelo provedor. Esses registros são distintos dos registros de auditoria do aplicativo.',
            'Um desafio de segurança gerenciado por provedor pode processar sinais de segurança do navegador. A TowelBooks recebe apenas o resultado da validação necessário para proteger os Serviços e não retém o token de desafio nem a resposta do provedor.',
          ],
          bullets: [
            '<strong>Limitação de finalidade</strong>: os registros de acesso são usados somente para operações de segurança, prevenção a fraude e abuso e investigação de incidentes.',
            '<strong>Acesso restrito e mascaramento</strong>: os registros de acesso são mascarados por padrão e ficam disponíveis apenas para operadores especificamente autorizados; o desmascaramento excepcional segue o procedimento de investigação documentado.',
            '<strong>Retenção finita e exclusão</strong>: os registros de acesso do aplicativo são mantidos por até seis meses e depois excluídos pelo ciclo de vida de logs. Os logs de infraestrutura gerenciados pelo provedor seguem a configuração e o processo de retenção aplicáveis do provedor.',
            '<strong>Sem acesso público</strong>: nem os registros de acesso brutos nem os identificadores de correlação de segurança ficam disponíveis por APIs públicas, exports em autoatendimento ou solicitações comuns de suporte.',
          ],
          title:
            'Identificadores de correlação de segurança e registros de acesso',
        },
        {
          paragraphs: [
            'Não vendemos os seus dados. Compartilhamos apenas as informações estritamente necessárias com prestadores de serviço que nos ajudam a manter o TowelBooks no ar. Esses prestadores atuam segundo nossas instruções e sob obrigações de confidencialidade e segurança compatíveis com a legislação de proteção de dados aplicável.',
            'Os prestadores de serviço atuais no lançamento incluem:',
          ],
          bullets: [
            '<strong>AWS</strong>: hospedagem da aplicação, banco de dados, armazenamento privado e logs operacionais (principalmente nos Estados Unidos, região <code>us-east-1</code>).',
            '<strong>Cloudflare</strong>: proxy de borda, DNS/controles de segurança, hospedagem web estática, entrega de ativos públicos, telemetria de desempenho Web Analytics gerenciada pelo provedor e desafios de segurança opcionais gerenciados pelo provedor (rede de edge global). O processamento de borda e dos desafios pode incluir endereço IP, user agent, metadados de requisição necessários para entregar e proteger os Serviços, sinais de segurança do navegador gerenciados pelo provedor, tokens de desafio transitórios e telemetria limitada de desempenho da página, como tempo de navegação e Core Web Vitals.',
            '<strong>Amazon SES</strong>: envio de e-mails transacionais (por exemplo verificação, redefinição de senha, segurança, ciclo de vida da conta e convites de salas).',
            '<strong>Google</strong>: quando o login opcional com Google estiver habilitado, você poderá optar por entrar, se cadastrar ou conectar sua conta com o Google (Google Identity / OAuth 2.0). Se você continuar com o Google, seu navegador será redirecionado para o Google e, após o seu consentimento, o Google compartilhará conosco o identificador da sua conta Google, seu e-mail verificado e informações básicas de perfil (como seu nome) para que possamos autenticar você. O Google trata seus dados segundo os próprios termos e política de privacidade.',
            '<strong>Google Analytics / Tag Manager</strong>: quando você dá consentimento explícito (nas configurações de privacidade ou no banner de consentimento para visitantes disponível em todo o site), e somente depois que o manifest aprovado do provedor for habilitado, esses serviços ajudam a entender o uso do produto. O catálogo sanitizado envia apenas enums de rota/categoria, contagens limitadas de busca, valores finitos de origem/provedor/posição e nomes de eventos. Não envia e-mail, nome, identificadores de conta, URLs brutas, pesquisas, referenciadores ou texto digitado. Os dados são processados de acordo com os termos de processamento de dados e a política de privacidade do Google.',
          ],
          paragraphsAfterBullets: [
            'Quando disponíveis, a TowelBooks pode exibir links de afiliado da Amazon em páginas de livros e em espaços promocionais internos controlados pela TowelBooks. Geramos esses links externos simples a partir de metadados locais do catálogo, como ASIN ou ISBN, junto com a tag Amazon Associate da TowelBooks. Podemos receber comissão por compras qualificadas sem custo adicional para você. As compras acontecem na Amazon e são regidas pelos termos e pela política de privacidade da Amazon. A TowelBooks não recebe seu histórico de compras na Amazon por meio desta implementação e não incorpora scripts ou SDKs da Amazon em suas páginas.',
            'Também podemos usar ferramentas não produtivas (por exemplo sistemas de CI) que não devem processar dados pessoais de produção.',
          ],
          title: 'Com quem compartilhamos seus dados?',
        },
        {
          paragraphs: [
            'Como utilizamos infraestrutura global de nuvem, alguns de seus dados podem ser processados fora do Brasil, inclusive nos Estados Unidos e na rede de edge global da Cloudflare, conforme descrito em Com quem compartilhamos seus dados?.',
            'Sempre que isso acontece, exigimos salvaguardas contratuais e técnicas compatíveis com a legislação de proteção de dados aplicável (como termos de processamento de dados e cláusulas contratuais padrão ou mecanismos equivalentes, quando exigidos) para manter suas informações protegidas.',
          ],
          title: 'Seus dados fora do país de origem',
        },
        {
          paragraphs: [
            'Nós guardamos seus dados apenas pelo tempo necessário para cumprir o que foi prometido nesta Política, para garantir a segurança do sistema e para cumprir obrigações legais.',
            'Para que tudo aconteça de forma transparente, definimos prazos específicos de exclusão:',
          ],
          bullets: [
            '<strong>Convites e links de verificação/senha</strong>: os links temporários de e-mail expiram e são totalmente apagados após 7 dias de uso ou expiração.',
            '<strong>Sessões ativas e conexões</strong>: quando você faz logout ou uma sessão expira, esses dados de acesso temporários são removidos permanentemente em 30 dias.',
            '<strong>Contas inativas</strong>: podemos revisar contas sem login ou uso significativo por dois anos consecutivos. O período de dois anos não aciona uma exclusão automática. Se decidirmos que a exclusão é apropriada, avisaremos você no endereço de e-mail cadastrado antes de prosseguir.',
            '<strong>Registros do catálogo compartilhado</strong>: registros bibliográficos e metadados factuais já incorporados ao catálogo compartilhado não são removidos automaticamente quando uma conta é excluída. Quando aplicável, a associação da contribuição com a conta poderá ser removida, anonimizada ou mantida de forma limitada nos termos desta Política, da legislação aplicável e de requisitos legítimos de auditoria, moderação ou integridade do catálogo. Conteúdo original do catálogo poderá permanecer sob a licença específica do catálogo enquanto continuar parte do catálogo compartilhado.',
            '<strong>Registros de convites de salas</strong>: depois que um convite de sala expirar ou for revogado, os registros relacionados de allowlist e entrega são excluídos em até 90 dias. Os registros de resgate de convites são excluídos após 180 dias. Se você recusar convites, guardamos um hash protegido do e-mail enquanto for necessário para respeitar sua escolha e impedir novos convites.',
            '<strong>Solicitações pendentes de entrada em salas</strong>: quando uma solicitação é aceita, recusada ou cancelada, o registro pendente é excluído. Não mantemos histórico permanente de solicitações recusadas ou canceladas.',
            '<strong>Denúncias</strong>: denúncias abertas permanecem enquanto exigirem análise. Denúncias resolvidas ou descartadas são excluídas 365 dias após a análise, salvo se um prazo maior for exigido pela legislação aplicável ou por uma retenção legal existente na estrutura de retenção.',
            '<strong>Segurança e auditoria</strong>: registros básicos para prevenção a fraudes e incidentes podem ser guardados por até 730 dias, passando por um processo de anonimização ou redução ao longo do tempo.',
            '<strong>Registros legais e solicitações</strong>: o histórico de quando você aceitou nossos termos e suas escolhas de privacidade são retidos para nossa segurança jurídica por prazos regulatórios pós-exclusão, e solicitações de privacidade são arquivadas por 5 anos após serem concluídas.',
          ],
          title: 'Por quanto tempo guardamos suas informações?',
        },
        {
          paragraphs: [
            'Nos termos da legislação de proteção de dados aplicável (incluindo a LGPD), você pode exercer direitos sobre seus dados pessoais. Alguns desses direitos estão sujeitos às condições, limites e exceções previstos na legislação aplicável.',
            `No TowelBooks você usa os controles abaixo; para direitos que ainda não sejam totalmente autosserviço, use o fluxo de solicitação de privacidade em <span class="font-semibold">Configurações → Privacidade e dados</span> ou o e-mail ${PRIVACY_CONTACT_EMAIL}. Poderá ser necessária a confirmação da sua identidade antes do atendimento das solicitações, para proteger sua conta e seus dados pessoais.`,
          ],
          bullets: [
            '<strong>Confirmação</strong>: você pode solicitar a confirmação da existência de tratamento de dados pessoais a seu respeito.',
            '<strong>Acesso</strong>: você pode solicitar acesso aos seus dados pessoais e informações sobre como eles são tratados. Também pode baixar um export estruturado em JSON das categorias de dados atualmente incluídas no export autosserviço nas configurações de privacidade. Categorias ainda não incluídas nesse export podem ser solicitadas pelo fluxo de privacidade ou por e-mail.',
            '<strong>Portabilidade</strong>: você pode solicitar a portabilidade dos seus dados pessoais, quando aplicável. Esse direito está sujeito à regulamentação da ANPD e às limitações da legislação aplicável. O export autosserviço em JSON atende parte desse direito para as categorias atualmente disponíveis no produto.',
            '<strong>Correção</strong>: você pode atualizar os dados do seu perfil diretamente nas configurações da conta. Caso não seja possível alterar determinada informação, entre em contato conosco pelos canais de suporte ou privacidade para solicitar a correção, observadas as medidas de segurança aplicáveis.',
            '<strong>Anonimização, bloqueio ou eliminação</strong>: nos termos da legislação aplicável, você pode solicitar a anonimização, o bloqueio ou a eliminação de dados pessoais desnecessários, excessivos ou tratados em desconformidade com a lei. De forma distinta, você pode excluir permanentemente sua conta pelas configurações (veja Ciclo de exclusão de conta). A exclusão da conta é uma funcionalidade do produto que encerra seu acesso e inicia o processo documentado de apagamento; ela não substitui automaticamente todo pedido legal de anonimização, bloqueio, restrição ou oposição, que pode ser apresentado pelo fluxo de privacidade.',
            '<strong>Gerenciamento de consentimentos</strong>: você escolhe se quer receber e-mails de novidades e se aceita análises opcionais de uso do produto, e pode retirar o consentimento depois, sem prejudicar tratamentos baseados em outras hipóteses legais.',
            '<strong>Informação sobre compartilhamento</strong>: você pode solicitar informações sobre as entidades públicas e privadas com as quais compartilhamos dados. A lista atual de prestadores e as informações sobre transferências internacionais de dados estão descritas nesta Política nas seções Com quem compartilhamos seus dados? e Seus dados fora do país de origem.',
            '<strong>Reclamação à autoridade</strong>: você pode apresentar reclamação à ANPD (Autoridade Nacional de Proteção de Dados) ou a outra autoridade competente, quando aplicável. Se preferir, também pode nos contatar antes; estamos disponíveis para ajudar a esclarecer dúvidas e atender solicitações de privacidade.',
          ],
          title: 'Seus direitos e controles',
        },
        {
          paragraphs: [
            'Queremos que você se sinta no controle total do seu cadastro. Por isso, a exclusão da conta acontece de forma transparente e em três etapas:',
            '1. <strong>O pedido e o tempo de reflexão</strong>: a exclusão é iniciada por você nas configurações de perfil. Após confirmar a ação através de um link enviado ao seu e-mail, sua conta entrará em uma janela documentada de 30 dias (um período de espera seguro) antes de ser excluída definitivamente.',
            '2. <strong>Cancelamento opcional</strong>: durante esses 30 dias, se você mudar de ideia, poderá reativar sua conta pelo link de cancelamento no e-mail de confirmação, entrando com sua senha e confirmando a reativação ou refazendo a autenticação pela sua conta Google vinculada. Todos os caminhos de restauração são registrados para segurança, para que possamos identificar por qual canal a conta foi restaurada. Esse cancelamento só pode ser feito antes do horário-limite previsto.',
            '3. <strong>Exclusão definitiva</strong>: após o término da janela de espera, a exclusão definitiva será processada conforme nossos procedimentos operacionais. Isso significa que seu acesso será revogado, suas bibliotecas pessoais, listas de desejos e leituras manuais privadas órfãs serão apagadas, e os identificadores que ligam seu perfil a você serão anonimizados.',
            'Alguns registros regulatórios, de conformidade e de continuidade de salas — e, se você tiver usado recursos pagos oferecidos pela TowelBooks, registros mínimos de pagamento — podem permanecer vinculados a um registro de conta anonimizado, sem possibilidade de novo login, para preservar a integridade do domínio.',
          ],
          title: 'Ciclo de exclusão de conta',
        },
        {
          paragraphs: [
            'Quando a exclusão for concluída, tudo o que puder identificar você diretamente será removido ou transformado em dados anônimos. No entanto, para manter a experiência de outras pessoas leitoras e cumprir obrigações legais, alguns registros secundários podem permanecer:',
            "<strong>Preservação da comunidade</strong>: para que as salas de leitura continuem funcionando bem, comentários, avaliações e reflexões que você publicou em salas compartilhadas podem continuar visíveis, mas agora associados a um perfil anônimo (ex: 'Leitor Excluído'). A atividade de perfil originada de uma anotação de sessão de leitura não é uma cópia independente da anotação: a anotação e a atividade pertencente à fonte seguem as regras de exclusão da conta e do ciclo de vida da fonte, enquanto o conteúdo social retido segue o caminho documentado de continuidade anonimizada.",
            '<strong>Registros do catálogo compartilhado</strong>: registros bibliográficos e metadados factuais já incorporados ao catálogo compartilhado poderão permanecer após a exclusão da conta. Quando aplicável, a associação entre uma contribuição para o catálogo e sua conta poderá ser removida, anonimizada ou mantida de forma limitada nos termos desta Política, da legislação aplicável e de requisitos legítimos de auditoria, moderação ou integridade do catálogo. Conteúdo original do catálogo poderá permanecer sob a licença específica do catálogo enquanto continuar parte do catálogo compartilhado.',
            '<strong>Conformidade legal e de suporte</strong>: aceites legais, histórico de solicitações de privacidade e — se aplicável — registros relacionados a recursos pagos ou suporte de pagamento podem ser mantidos de forma segura para auditoria, disputas ou cumprimento de obrigações legais. Eles nunca poderão ser usados para recriar o seu perfil.',
            '<strong>Investigações de segurança</strong>: logs técnicos de auditoria podem citar um número identificador interno anonimizado associado à antiga conta apenas para fins de prevenção a fraudes, até que o prazo regulatório expire.',
            '<strong>Denúncias de moderação</strong>: quando uma conta é finalizada, os vínculos de denunciante e revisor são removidos das denúncias retidas. O motivo, os detalhes limitados, as evidências do ciclo de análise e a referência flexível do alvo podem permanecer para responsabilidade de moderação até o fim do prazo de retenção de denúncias; nenhuma conta excluída é atribuída como identidade de denúncia.',
          ],
          title: 'O que pode permanecer após a exclusão da conta',
        },
        {
          paragraphs: [
            'Você pode escolher tornar seu perfil privado nas configurações de privacidade (<span class="font-semibold">Configurações → Privacidade e dados</span>). No entanto, é importante entender o que isso significa na prática:',
          ],
          bullets: [
            '<strong>Seu cartão de viagem permanece</strong>: mesmo em modo privado, sua foto (avatar), capa (banner), nome de exibição, nome de usuário, biografia e quaisquer links externos de perfil que você optar por publicar continuam visíveis. Isso serve para que seus amigos e outros leitores possam reconhecer você e pedir para acompanhar suas leituras.',
            '<strong>O conteúdo sensível é bloqueado</strong>: o modo privado esconde suas estatísticas detalhadas, histórico de leituras, seções personalizadas e as listas de quem você segue ou de quem segue você.',
            '<strong>Participações e comentários</strong>: se você deixar um comentário público, uma avaliação ou participar de uma sala de leitura, sua assinatura continuará aparecendo nessas atividades conforme as regras da própria sala. Links de sala ficam visíveis para quem já puder ver aquela sala.',
            '<strong>Controle de seguidores</strong>: novos pedidos para seguir você ficarão pendentes até que você os analise e decida aceitar ou recusar.',
            '<strong>Bibliotecas pessoais compartilhadas</strong>: bibliotecas pessoais são criadas como compartilháveis; no MVP atual você não controla a visibilidade da biblioteca separadamente.',
            '<strong>Quem pode ver sua biblioteca</strong>: perfis públicos permitem que qualquer leitor autenticado abra sua biblioteca; perfis privados permitem apenas seguidores aceitos. Outras pessoas não veem sua lista nem seus livros.',
            '<strong>Metadados privados da biblioteca</strong>: visitantes autorizados do perfil não veem suas notas pessoais de biblioteca ou notas de propriedade na superfície da biblioteca do perfil. Esses dados continuam sendo metadados privados de biblioteca e propriedade.',
            '<strong>Anotações de sessões de leitura são diferentes</strong>: uma anotação de sessão de leitura pode ser publicada por meio de uma atividade de perfil. As pessoas autorizadas a ver essa atividade podem ver o conteúdo completo da anotação, o contexto opcional de página ou intervalo de páginas, a associação à sessão de leitura, os registros de data/hora e os comentários, respostas ou reações anexados, de acordo com o público da atividade.',
            '<strong>Links externos</strong>: quando você adiciona links ao perfil ou a uma sala, armazenamos o título e a URL HTTPS informados, incluímos esses dados no export de privacidade em autoatendimento quando aplicável e abrimos o destino no navegador sem rastreamento de cliques ou redirecionamento da TowelBooks. Os sites de destino estão fora do nosso controle e seguem os próprios termos e práticas de privacidade.',
            '<strong>Indexação em mecanismos externos</strong>: uma página de perfil público pode ser descoberta por mecanismos de busca externos, conforme essas regras de visibilidade. Quando você tornar seu perfil privado, a TowelBooks marca a página do perfil como não indexável assim que a alteração passa a valer no nosso lado; isso não torna público o conteúdo do perfil privado.',
            '<strong>Tempo de atualização de terceiros</strong>: mecanismos de busca e outros terceiros podem levar tempo adicional para atualizar ou remover resultados do perfil que já tenham sido indexados ou armazenados em cache. Esse prazo está fora do controle direto da TowelBooks, e não prometemos um prazo fixo para a desindexação.',
          ],
          title: 'Visibilidade do perfil',
        },
        {
          paragraphs: [
            'Para criar um ambiente amigável e interativo, nós gerenciamos as conexões da seguinte forma:',
          ],
          bullets: [
            '<strong>Revisando novos seguidores</strong>: ao receber um pedido para seguir seu perfil privado, você poderá ver o avatar, nome e bio de quem fez o pedido para decidir se quer aceitar.',
            '<strong>Visualização rápida</strong>: registramos apenas se você já visualizou uma solicitação pendente para evitar enviar alertas repetidos no aplicativo. Visualizar o pedido não significa aceitá-lo automaticamente.',
            '<strong>Acesso ao perfil</strong>: ao aceitar o pedido, aquela pessoa passa a fazer parte da sua lista de seguidores autorizados e poderá ver seu conteúdo privado.',
            '<strong>Recusas e cancelamentos</strong>: se você recusar um pedido ou o remetente cancelar a solicitação, ela desaparecerá das listas. Nós não mantemos um histórico dessas recusas ou cancelamentos no sistema após a exclusão do registro.',
            '<strong>Avisos essenciais</strong>: suas escolhas de canais de notificação (como silenciar e-mails) não desabilitam os indicadores visuais essenciais do aplicativo que são necessários para o funcionamento correto das solicitações e da conta.',
            '<strong>E-mails de convite para salas</strong>: se receber um convite de sala por e-mail e não quiser mais mensagens desse tipo, use o link de recusa no rodapé da mensagem para bloquear futuros e-mails de convite de salas para o seu endereço. Isso não afeta comunicações essenciais de segurança, conta ou obrigações legais.',
          ],
          title: 'Solicitações de seguir e notificações',
        },
        {
          paragraphs: [
            'Salas de leitura públicas podem permitir entrada direta, solicitação de acesso ou entrada apenas por convite, conforme as configurações escolhidas pelas pessoas que gerenciam a sala. Salas privadas permanecem somente por convite, independentemente de outras configurações.',
          ],
          bullets: [
            '<strong>Análise de solicitações</strong>: quando alguém pede para entrar em uma sala pública que você gerencia, você pode ver o avatar público, nome de exibição, nome de usuário e biografia dessa pessoa para decidir se aceita. Solicitações de entrada não incluem mensagem livre.',
            '<strong>Visualização registrada</strong>: para análise pelas pessoas que gerenciam a sala, registramos apenas se você já visualizou uma solicitação pendente para que o aplicativo pare de tratá-la como nova. Visualizar a solicitação não aprova nem recusa automaticamente.',
            '<strong>Recusas e cancelamentos</strong>: recusar uma solicitação ou cancelar a sua solicitação pendente remove o registro. Não mantemos histórico permanente de solicitações recusadas ou canceladas após a exclusão.',
            '<strong>Convites continuam válidos</strong>: links e e-mails de convite para salas continuam funcionando em qualquer política de entrada. Descoberta pública e solicitações de entrada são fluxos distintos do convite.',
            '<strong>Indicadores essenciais</strong>: preferências de notificação não desativam indicadores essenciais do aplicativo necessários ao funcionamento das solicitações de entrada em salas.',
          ],
          title: 'Solicitações de entrada em salas',
        },
        {
          paragraphs: [
            'Sua segurança é nossa prioridade. O TowelBooks adota medidas técnicas e organizacionais para proteger dados pessoais, incluindo criptografia em trânsito e em repouso quando aplicável, controle estrito de acesso a sistemas de produção, limitação de taxa de requisições para reduzir abusos e monitoramento contínuo de atividades suspeitas para ajudar a impedir acessos não autorizados.',
          ],
          title: 'Segurança',
        },
        {
          paragraphs: [
            'Caso a titularidade da TowelBooks seja transferida para outra pessoa física ou jurídica em razão de venda, fusão, incorporação, sucessão ou operação equivalente, os dados pessoais poderão ser transferidos à nova controladora para assegurar a continuidade dos Serviços, observada a legislação aplicável e os direitos das pessoas titulares previstos nesta Política.',
          ],
          title: 'Mudança de controladora',
        },
        {
          paragraphs: [
            'Esta política poderá ser atualizada periodicamente. Quando houver alterações relevantes, notificaremos os usuários pelos meios apropriados, como por e-mail ou por meio de aviso no aplicativo.',
          ],
          title: 'Atualizações da política',
        },
        {
          paragraphs: [
            `Dúvidas sobre esta Política de Privacidade ou sobre a postura de privacidade podem ser enviadas para ${PRIVACY_CONTACT_EMAIL}.`,
          ],
          title: 'Contato',
        },
      ],
      title: formatPublicLegalTitle('Política de Privacidade'),
    },
  };
