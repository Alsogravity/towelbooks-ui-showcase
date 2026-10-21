import type { PublicLegalDocument, PublicLegalLocale } from '../types.js';
import {
  COPYRIGHT_NOTICE_EMAIL,
  PRIVACY_CONTACT_EMAIL,
  PUBLIC_LEGAL_DOCUMENT_METADATA,
} from '../constants.js';
import {
  formatPublicLegalEffectiveDateLabel,
  formatPublicLegalTitle,
} from '../format-labels.js';

const termsMetadata = PUBLIC_LEGAL_DOCUMENT_METADATA.terms;

export const termsDocuments: Record<PublicLegalLocale, PublicLegalDocument> = {
  en: {
    eyebrow: 'Terms of Service',
    effectiveDateLabel: formatPublicLegalEffectiveDateLabel(
      'en',
      termsMetadata.effectiveAt,
    ),
    sections: [
      {
        paragraphs: [
          'These Terms of Service ("Terms") are a legally binding agreement between you and Rafael Moraes, an independent developer operating under the TowelBooks brand, governing access to and use of the Services.',
          'By accessing or using the Services, creating an account, or accepting these Terms when prompted in the product, you confirm that you have read, understood, and agree to be bound by these Terms and by the <a href="/legal/privacy">Privacy Policy</a>, which forms part of the applicable legal framework.',
          'If you do not agree to these Terms, you must not access or use the Services. If you already have an account and no longer agree, you must stop using the Services and may delete your account as described in these Terms and the Privacy Policy.',
          'TowelBooks may update these Terms from time to time as described in General Terms. Material changes that adversely impact you will be communicated in advance through the channels described in Electronic communications.',
        ],
        title: 'Acceptance of the Terms',
      },
      {
        paragraphs: [
          'For the purposes of these Terms, "Services" means the websites, applications, APIs, integrations, features, and any other digital products or channels that TowelBooks makes available now or in the future under the TowelBooks brand, primarily at <strong>towelbooks.com</strong> and related official channels.',
          'Additional sites, apps, APIs, integrations, or features that TowelBooks makes available later are also covered by these Terms, unless different terms apply to a specific offering.',
          'TowelBooks is under continuous improvement. Features may be added, modified, or removed over time to improve the experience, strengthen security, meet legal requirements, or support the ongoing operation of the Services, as further described in Service evolution and Service availability.',
        ],
        title: 'Scope',
      },
      {
        paragraphs: [
          'TowelBooks is a digital platform for organizing, tracking, and sharing individual and group reading experiences.',
          'The Services may include, among other features:',
        ],
        bullets: [
          'creating and managing personal libraries;',
          'tracking reading progress;',
          'publishing reviews, comments, and reflections on books;',
          'publishing reading-session notes through profile activity and interacting with contextual content;',
          'creating and managing reading rooms;',
          'participating in reading rooms;',
          'social interaction between users;',
          'other features made available by TowelBooks as the platform evolves.',
        ],
        title: 'Purpose of the Services',
      },
      {
        paragraphs: [
          'When you create or contribute information about a book, edition, author, or other catalog record, that contribution may become part of the TowelBooks shared global catalog.',
          'Catalog records are not private records owned or controlled by the user who originally contributed them. TowelBooks may maintain, correct, enrich, combine, reorganize, archive, or remove catalog records as reasonably necessary to operate and maintain the catalog.',
          'TowelBooks may review, correct, edit, merge, enrich, reject, archive, restrict, or remove contributions when reasonably necessary to address duplicate records, inaccurate information, abuse, infringement, catalog integrity, or other issues affecting the Services. Contributing a record does not give the contributor an exclusive right to control its future contents, presentation, or continued availability.',
          'Users may contribute information about books, editions, authors, and bibliographic metadata, such as titles, publication details, identifiers, languages, publishers, imprints, and contributor information.',
          'If you upload a cover image or other image to a catalog record, you represent that you have the rights, permissions, or other lawful basis necessary to make that image available through TowelBooks. The existence of a book, ISBN, edition, or catalog record does not itself grant permission to reproduce or upload copyrighted cover artwork or other protected material.',
          'Contributing a record does not by itself give you permission to upload, reproduce, distribute, or otherwise make available a book, PDF, scan, excerpt, or other copyrighted or protected material. You must contribute only material that you are authorized to provide, and you must not use the catalog to facilitate infringement.',
          'To the extent that you have rights in factual bibliographic metadata, you grant TowelBooks a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, process, organize, maintain, correct, combine, and use that metadata as reasonably necessary to operate, maintain, improve, and make the shared catalog available. This license does not transfer ownership to TowelBooks, and TowelBooks does not claim ownership of facts or of any original rights you hold in the material you contribute.',
          'Some catalog contributions may include original content, such as descriptions, summaries, synopses, notes, or other text written by you. You retain any rights you hold in that content. By submitting it as part of a shared catalog record, you grant TowelBooks a non-exclusive, worldwide, royalty-free, sublicensable license to host, store, reproduce, display, process, adapt for formatting, and distribute that content as reasonably necessary to operate, maintain, improve, and make the shared catalog available.',
          'This license continues for as long as the contributed content remains part of the shared catalog, including after deletion of your account, unless the content is removed from the catalog or applicable law requires otherwise. This does not authorize TowelBooks to use the content for purposes unrelated to operating, protecting, maintaining, or promoting the Services.',
          'TowelBooks may later identify contribution history using labels such as “Added by” or “Updated by” when a corresponding product feature is introduced. This language reserves that option and does not promise that such an attribution feature exists or that every contribution will receive attribution.',
        ],
        title: 'Community Catalog Contributions',
      },
      {
        paragraphs: [
          'By creating an account with TowelBooks, you agree to the following conditions:',
        ],
        bullets: [
          'TowelBooks is designed for adults only. By creating or keeping an account, you confirm that you are at least 18 years old.',
          'To create an account, you must provide a valid email address and choose a username.',
          'You must provide accurate, current, and complete information during registration and keep it updated.',
          'Your account is personal, individual, and non-transferable. Unless expressly authorized by TowelBooks, you may not share access credentials, assign, sell, rent, lend, or transfer your account to third parties.',
          'You are responsible for maintaining the confidentiality of your credentials and for all activities carried out through your account.',
          'TowelBooks may suspend or terminate your account if you violate these Terms.',
        ],
        paragraphsAfterBullets: [
          'The Services may allow you to sign in using a third-party account (for example, Sign in with Google). If you sign in exclusively through a third-party provider and lose access to that third-party account, you may lose access to your TowelBooks account. We recommend adding a password to your account in your settings as a fallback sign-in method.',
          'TowelBooks may review accounts that have remained inactive for two consecutive years. This does not automatically delete an account when two years have passed. If TowelBooks decides to delete an inactive account, it will first send a warning to the registered email address and provide an opportunity to sign in or contact us before deletion.',
        ],
        title: 'Account',
      },
      {
        paragraphs: [
          'Subject to these Terms, TowelBooks grants you a limited, personal, revocable, non-transferable, and non-exclusive license to access and use the Services for their intended purpose.',
          'This license does not authorize you to copy, modify, adapt, translate, reverse engineer (except where permitted by applicable law), sublicense, sell, rent, lease, distribute, or otherwise exploit the Services or any part of them for commercial purposes not expressly allowed under these Terms.',
          'All rights not expressly granted to you remain reserved to TowelBooks.',
        ],
        title: 'License to use the Services',
      },
      {
        paragraphs: [
          'Some features of the Services may be under active development, released gradually, or made available only to part of the user base for a period of time.',
          'During that process, a feature may have temporary limitations, behave differently from its final form, or become unavailable for maintenance, security, or product reasons.',
          'TowelBooks will use reasonable efforts to improve features over time and to address issues that affect the stability and usefulness of the Services, subject to applicable law.',
        ],
        title: 'Feature availability',
      },
      {
        paragraphs: [
          'TowelBooks may send you service-related communications, including account and operational notifications, changes to these Terms, security notices, and other messages related to the Services.',
          'These communications may be delivered by email and/or within the platform.',
          'By using the Services, you agree to receive these communications in electronic form.',
        ],
        title: 'Electronic communications',
      },
      {
        paragraphs: [
          'TowelBooks aims to maintain a safe, respectful, and appropriate environment for the community. By using the Services, you agree to act in good faith and to respect applicable law, the rights of third parties, and these Terms of Service.',
          'It is prohibited to use the Services for, among other conduct:',
        ],
        bullets: [
          'engaging in unlawful, fraudulent, or deceptive activities;',
          'publishing, transmitting, or sharing content that infringes copyright, trademarks, personality rights, privacy, or any other rights of third parties;',
          'harassing, intimidating, threatening, stalking, or bullying others;',
          'promoting, encouraging, or spreading discrimination, hate speech, violence, or harassment against individuals or groups based on race, color, ethnicity, nationality, origin, religion, disability, age, sex, gender identity, sexual orientation, or any other characteristic protected by applicable law;',
          'disclosing personal information of third parties without authorization or in violation of applicable law;',
          'using the Services to send spam, unsolicited communications, scams, phishing, or any malicious content;',
          'attempting to gain unauthorized access to accounts, systems, data, or resources of TowelBooks or third parties;',
          'interfering with the security, integrity, availability, or functioning of the Services, including through abusive automation, exploitation of vulnerabilities, reverse engineering where prohibited by applicable law, or any other use incompatible with the purpose of the platform;',
          'scraping, crawling, harvesting, mining, or systematically collecting data, content, or information from the Services through bots, spiders, crawlers, scrapers, or any other automated means, except as expressly permitted through official TowelBooks APIs or prior written authorization from TowelBooks;',
          'using unauthorized automations, scripts, or tools to access, interact with, extract data from, or overload the Services;',
          'using the Services in a way that harms the experience, security, or rights of other users;',
          'engaging in any other conduct incompatible with these Terms or applicable law.',
        ],
        paragraphsAfterBullets: [
          'TowelBooks may review reports, review content, and take measures to protect the community, the Services, and compliance with these Terms.',
          'You may report accessible profiles, reading rooms, catalog works, and comments through the reporting tools made available in the Services. A report is a review signal and does not automatically remove, restrict, or change the reported target or sanction an account.',
          'Knowingly submitting false, abusive, repetitive, or fraudulent reports, or using the reporting tools to harass another person, violates these Terms and may result in account or feature restrictions.',
          "When TowelBooks identifies, or has reasonable grounds to believe, that a violation of these Terms, applicable law, or third-party rights has occurred, TowelBooks may, depending on the nature and severity of the situation: remove or restrict access to content; temporarily limit certain account features; issue warnings; temporarily or permanently suspend the user's account; or permanently terminate access to the Services.",
          'The choice of applicable measures will take into account, whenever possible, factors such as the severity of the conduct, prior violations, the potential harm to the community, the Services, or third parties, and the circumstances of the specific case.',
          'Serious violations may result in immediate suspension or termination of the account without prior warning, especially when involving unlawful activity, fraud, security risks to the platform, repeated infringement of third-party rights, abusive exploitation of the Services, or conduct that may put others at risk.',
          'TowelBooks may retain records, content, and other information related to internal investigations, requests from competent authorities, or the regular exercise of rights, subject to applicable law and the Privacy Policy.',
          'The adoption of moderation measures by TowelBooks does not imply an obligation to proactively monitor all content published by users nor does it represent automatic assumption of liability for third-party content.',
        ],
        title: 'Acceptable Use of Services and Moderation',
      },
      {
        paragraphs: [
          'TowelBooks provides a platform for organizing reading activities, interaction between users, and management of reading rooms.',
          'When users enter into agreements, negotiations, charges, payments, exchanges of goods or services, in-person or virtual events, subscription programs, or any other relationships directly between themselves, these relationships will occur exclusively between the parties involved.',
          'TowelBooks does not act as an intermediary, representative, agent, guarantor, or party to these relationships, except when expressly indicated in a specific feature of the Services.',
          'Each user is fully responsible for fulfilling the obligations they assume towards third parties.',
          "TowelBooks does not verify, certify, or guarantee the identity, reputation, qualifications, legitimacy, or reliability of users. Interactions between users occur at each party's own risk. You are solely responsible for exercising appropriate caution when interacting with other users, including offline meetings, payments, or commercial arrangements arranged outside the Services.",
        ],
        title: 'Relationships between users',
      },
      {
        paragraphs: [
          'Reading rooms may be private or public. Private rooms are not discoverable in public search and membership is controlled through invites or manager action. Public rooms may appear in authenticated discovery for readers who are not yet members.',
          'For public rooms, managers choose how new members may enter: invite-only, request-to-join with manager review, or open self-join where enabled. Private rooms always remain invite-only regardless of other settings.',
          'If you request to join a public room, you agree that room managers authorized to review requests may see your public profile identity details needed to decide whether to admit you. Join requests do not include a free-text message field.',
          'Room managers may accept or decline pending join requests. Declining or cancelling a pending request removes it without creating a permanent declined-history record in the product.',
          'Room invite links and invite emails remain available for any join policy and do not replace manager responsibility for the room community.',
          'By participating in a room, you remain responsible for your conduct and for complying with these Terms and the room rules set by its managers.',
        ],
        title: 'Reading room participation',
      },
      {
        paragraphs: [
          'The availability of reading rooms, courses, mentorships, events, subscriptions, or other services offered by users through the Services does not represent approval, certification, endorsement, or partnership by TowelBooks.',
          'Each user remains solely responsible for the commercial activities they organize, promote, or provide.',
        ],
        title: 'Commercial use by users',
      },
      {
        paragraphs: [
          'TowelBooks does not participate in, process, control, or guarantee payments made directly between users through means external to the Services.',
          'Charges for participation in rooms, reading groups, events, mentorship, consulting, sale of products, subscriptions, or any other activities organized by users are the sole responsibility of the parties involved.',
          'Any disputes related to prices, payments, refunds, cancellations, default, delivery of products, or provision of services must be resolved directly between the parties involved, without prejudice to the measures provided for under applicable law.',
        ],
        title: 'Payments made outside the platform',
      },
      {
        paragraphs: [
          'TowelBooks may display first-party banners, recommendations, and other internal promotional placements for books, features, or content. Some of these placements may link to affiliate purchase links. Displaying such a placement does not mean that Amazon or another third-party seller sponsors, controls, or endorses TowelBooks.',
          'The Platform may display links to third-party websites, stores, or services. Some of those links may use affiliate programs through which TowelBooks may receive a commission when a qualifying purchase is made, at no additional cost to the user.',
          'The use of affiliate links does not affect the price paid by the user and does not represent a guarantee, sponsorship, or exclusive recommendation of any supplier. All purchases made on third-party sites are governed by the respective terms, policies, and conditions of those third parties.',
          'TowelBooks does not operate Google AdSense or another third-party display-ad network under the current implementation. Any future third-party ad technology requires review of the legal documents, processor registry, content-security-policy and provider governance, and consent controls before activation.',
          'Users may also publish their own external links on profiles and reading rooms. Those links are user-published content: TowelBooks does not endorse the destination, does not operate click tracking or a redirect for them, and is not responsible for the content, availability, or practices of third-party sites linked by users, subject to applicable law and the moderation rules in these Terms.',
          'Catalog edition cover images are displayed as a visual aid to help identify a work. They are fetched directly from the Open Library Covers API (covers.openlibrary.org) in your browser. TowelBooks does not store, proxy, or re-host those image bytes. The display of cover images is subject to Open Library\u2019s own terms and usage policies.',
        ],
        title: 'Third-party links and affiliate programs',
      },
      {
        paragraphs: [
          'The software, source code, APIs, brand, visual identity, databases, layout, design, documentation, and other platform assets are owned by TowelBooks or its licensors and are protected by applicable intellectual property laws.',
          'Except for the limited license expressly granted under these Terms, no right, title, or interest in these assets is transferred to you.',
          'Any use outside the scope of that license is not authorized.',
        ],
        title: 'Platform intellectual property',
      },
      {
        paragraphs: [
          'The Services allow users to publish comments, replies, reactions, reviews, reflections, reading-session notes, lists, recommendations, external links on profiles and reading rooms, and other content.',
          'This content is produced exclusively by their respective authors.',
          'You retain ownership of the content you publish on TowelBooks and are responsible for having the rights, authorizations, or permissions necessary to make it available.',
          'Except for original content submitted as part of a shared catalog record, which is governed by Community Catalog Contributions, by publishing or otherwise making content available through the Services, you grant TowelBooks a non-exclusive, worldwide, royalty-free, sublicensable license to host, store, reproduce, display, process, transmit, and distribute that content solely as needed to operate, provide, secure, promote, and improve the Services, including technical processing such as backups, caching, indexing, and content delivery.',
          'This license ends when you remove the content from the Services or when your account is deleted, except for residual copies retained for a reasonable period for legal, security, backup, audit, or continuity purposes, as described in the Privacy Policy and applicable law.',
          'Publishing content that infringes copyright, intellectual property rights, or any third-party rights is prohibited. External links you publish must not be used for phishing, malware, spam, or other unlawful or abusive purposes.',
          'TowelBooks does not guarantee the accuracy, completeness, timeliness, legality, or fitness for any particular purpose of user-published content, although it may adopt moderation measures when it becomes aware of violations of these Terms or applicable law.',
          'Reports submitted through the Services may be retained and reviewed as described in the Privacy Policy. Reviewing a report does not transfer ownership of the reported content or create an obligation to take a particular action.',
          'This section concerns original content published by users outside shared catalog records. Original text and images submitted as part of a catalog record are governed by Community Catalog Contributions, its catalog-specific license, and its account-deletion effect. Factual catalog metadata is addressed separately in Community Catalog Contributions. Reviews, non-catalog descriptions, reading-session notes, comments, replies, reactions, and other uploaded images remain original content under this section. Personal library notes and ownership notes are private library and ownership metadata and are distinct from a reading-session note published through profile activity.',
        ],
        title: 'Content published by users',
      },
      {
        paragraphs: [
          'Content and interactions published in a public area of TowelBooks are public within the audience made available by that profile, activity, room, or other context. “Public” in these Terms does not promise anonymous access or visibility outside the access policy that applies to that TowelBooks context.',
          'Comments, replies, reactions, reviews, notes, discussions, and similar contributions inherit the audience of the content or area where they are published. Publishing from a private profile does not make an interaction private when you choose to publish it on a public profile activity or another public context. Restricted activities and rooms limit visibility to their authorized viewers.',
          'You are responsible for content and interactions you intentionally publish in a public or restricted context, including ensuring that you have the rights and permissions needed to publish them and that they do not disclose another person’s information unlawfully.',
        ],
        bullets: [
          'A private-profile user’s comment on a public profile activity is visible within that activity’s audience, while the user’s profile remains governed by its own privacy settings.',
          'A reaction on a public profile activity is visible within that activity’s audience; an interaction on a restricted activity follows that activity’s authorization boundary.',
        ],
        title: 'Contextual visibility and user responsibility',
      },
      {
        paragraphs: [
          'TowelBooks respects the intellectual property rights of others and expects its users to do the same.',
          `If you believe that any content made available through the Services infringes copyright, trademark rights, or other intellectual property rights, please send a notification to ${COPYRIGHT_NOTICE_EMAIL}.`,
          'Whenever possible, the notification should include:',
        ],
        bullets: [
          'identification of the rights holder or their representative;',
          'description of the right allegedly infringed;',
          'sufficient identification of the disputed content, including its link or other information that allows its location;',
          'description of the reasons why the content would be considered infringing;',
          'contact information for follow-up;',
          'a statement that the information provided is true and that the reporting party believes in good faith that they have standing to submit the request.',
        ],
        paragraphsAfterBullets: [
          'TowelBooks may request additional information when necessary to review the notice.',
          'Upon receiving a notice, TowelBooks may review the case and, when appropriate, remove the content, restrict access to it, request clarifications from the involved parties, or take other measures consistent with these Terms and applicable law.',
          'Submitting a notice does not imply automatic removal of the content.',
          'Accounts that engage in repeated infringement of intellectual property rights may be suspended or terminated.',
          'TowelBooks may decline to act on notices that are manifestly unfounded, abusive, or submitted in bad faith.',
        ],
        title: 'Copyright and intellectual property infringement notices',
      },
      {
        paragraphs: [
          `We welcome suggestions and problem reports that help us improve TowelBooks. You may send product feedback to ${COPYRIGHT_NOTICE_EMAIL} or use the contact channels made available in the product when applicable.`,
          'If you send TowelBooks feedback, suggestions, ideas, proposals, or other comments about the Services, TowelBooks may use, reproduce, modify, and incorporate them to develop, improve, operate, and promote the Services, without any obligation to compensate you, attribute authorship, or keep such feedback confidential, subject to applicable law and to the Privacy Policy with respect to personal data.',
        ],
        title: 'Feedback',
      },
      {
        paragraphs: [
          'Privacy handling, cookies, and data-rights flows are described in the <a href="/legal/privacy">Privacy Policy</a> and <a href="/legal/cookies">Cookie Notice</a>. Those documents form part of the current legal framework applicable to the Services.',
          'TowelBooks does not sell personal information and does not operate behavioral advertising as currently offered.',
        ],
        title: 'Privacy and related documents',
      },
      {
        paragraphs: [
          'TowelBooks adopts reasonable technical and organizational measures to protect the Services and the personal data processed.',
          'However, no computerized system can be considered completely free from failures, vulnerabilities, or unauthorized access.',
          'You are also responsible for adopting appropriate measures to protect your access credentials and devices.',
        ],
        title: 'Security',
      },
      {
        paragraphs: [
          'If you delete your account, TowelBooks sends a confirmation email, disables the account after confirmation, and starts a documented 30-day grace window during which you may cancel deletion. During that window you may restore the account through the emailed cancellation link, by signing in with your password and confirming reactivation, or by reauthenticating through your linked Google account. All restoration actions are logged for security.',
          'After the grace window, your account becomes eligible for finalization and is completed by the next scheduled maintenance cycle. Finalization removes or anonymizes direct identifiers, deletes personal-library and wishlist data, and may retain minimal audit, legal, and room-continuity records—and, if you used paid features provided by TowelBooks, minimal payment records—as described in the Privacy Policy.',
          'Deleting your account does not automatically remove bibliographic records or factual metadata that have already been incorporated into the shared catalog. Where applicable, the association between a catalog contribution and your account may be removed, anonymized, or retained in a limited form in accordance with the Privacy Policy, applicable law, and legitimate audit, moderation, or catalog-integrity requirements.',
          'Original content contributed to the catalog, such as descriptions, summaries, synopses, notes, or other text, may remain under the catalog-specific license for as long as it remains part of the shared catalog, unless the content is removed from the catalog or applicable law requires otherwise.',
          'Deleting your account does not erase every legal, audit, or shared-room continuity record, or every payment-support record when paid features were used, if those records are required for support, reconciliation, dispute handling, or domain integrity.',
        ],
        title: 'Account deletion and residual content',
      },
      {
        paragraphs: [
          'TowelBooks may suspend accounts, restrict features, or terminate access for operational, legal, or commercial reasons, including to preserve platform integrity and comply with legal obligations.',
          'When reasonably possible, TowelBooks will provide prior notice through the channels described in Electronic communications.',
          'This section does not limit measures taken for violations of these Terms or applicable law under Account or Acceptable Use of Services and Moderation, nor does it replace discontinuation of the Services as described in Discontinuation of Services.',
        ],
        title: 'Operational suspension and termination',
      },
      {
        paragraphs: [
          'TowelBooks uses reasonable efforts to keep the Services available, secure, and functioning properly. Although we aim to provide a stable and reliable experience, we do not guarantee that the Services will be continuously available, uninterrupted, or free from errors.',
          'Interruptions, errors, performance degradation, or temporary unavailability may occur, including during the early period of operation, for reasons such as:',
        ],
        bullets: [
          'preventive or corrective maintenance;',
          'updates, security fixes, or product improvements;',
          'evolution or temporary limitation of features;',
          'technical failures;',
          'security incidents;',
          'unavailability of third-party services;',
          'events of force majeure or acts of God.',
        ],
        paragraphsAfterBullets: [
          'When reasonably possible, TowelBooks will take measures to minimize impacts and restore normal operation.',
          'Some features of the Services depend on products or services operated by third parties, such as infrastructure, hosting, storage, email delivery, and—when paid features are offered by TowelBooks—payment processing.',
          "The availability of these services may influence the functioning of TowelBooks, without this representing the platform's exclusive liability for events arising from the actions of these third parties, subject to applicable law.",
        ],
        title: 'Service availability',
      },
      {
        paragraphs: [
          'TowelBooks is a platform under continuous evolution. During development and after launch, we may add, modify, replace, or remove features, fix issues, run controlled improvements, and implement changes intended to strengthen security, usability, and the overall quality of the Services.',
          'As a result, certain features may have temporary limitations, unexpected behavior, or short periods of unavailability. TowelBooks will use reasonable efforts to address identified problems and to improve the user experience over time.',
          'TowelBooks may make these changes without obligation to maintain previous versions of every feature or of the Services as a whole, subject to applicable law and to any separate conditions that apply to paid offerings, if any.',
        ],
        title: 'Service evolution',
      },
      {
        paragraphs: [
          'TowelBooks may, for commercial, technical, operational, legal, or strategic reasons, discontinue the Services, certain features, or parts of the platform, temporarily or permanently.',
          'Whenever reasonably possible, and except in urgent situations, legal requirements, security reasons, or force majeure, TowelBooks will seek to notify users in advance through the channels described in Electronic communications.',
          'When applicable, the communication may inform:',
        ],
        bullets: [
          'the expected discontinuation date;',
          'affected features;',
          'any available period for data export or retrieval;',
          'guidance on ceasing use of the Services;',
          'information related to subscriptions or paid services, if any.',
        ],
        paragraphsAfterBullets: [
          'If the discontinuation involves paid Services provided directly by TowelBooks, amounts corresponding to prepaid and unused periods will be refunded when required by applicable law or by the specific conditions of the contracted plan, on a proportional basis where applicable.',
          'The discontinuation of the Services does not affect the application of provisions of these Terms that, by their nature, should remain in effect, including those related to intellectual property, data protection, limitations of liability, dispute resolution, and compliance with legal obligations.',
        ],
        title: 'Discontinuation of Services',
      },
      {
        paragraphs: [
          "To the fullest extent permitted by applicable law, TowelBooks' liability is limited to the provision of the Services described in these Terms.",
          'Although TowelBooks uses reasonable efforts to keep the Services operating properly, TowelBooks does not guarantee uninterrupted operation or that the Services will be free from errors, interruptions, or temporary degradation, except where such a guarantee is required by applicable law.',
          'TowelBooks shall not be liable for:',
        ],
        bullets: [
          'negotiations carried out directly between users;',
          'obligations assumed by third parties;',
          'payments made outside the Services;',
          'conduct, statements, or content published by users or third parties;',
          'unavailability, interruptions, errors, or performance degradation described in Service availability and Service evolution, including those arising from third-party services, force majeure, or acts of God;',
          'indirect damages, lost profits, loss of revenue, or consequential damages.',
        ],
        paragraphsAfterBullets: [
          'Nothing in this clause limits or excludes liabilities that cannot be disclaimed under applicable law.',
        ],
        title: 'Limitation of liability',
      },
      {
        paragraphs: [
          'You may not assign or transfer any rights or obligations under these Terms. Any attempt to do so will be void. TowelBooks may assign its rights or obligations under these Terms to any affiliate, subsidiary, or successor in interest of any business associated with the Services.',
          'TowelBooks continuously works to develop and improve the Services and may update these Terms or the Services from time to time. For example, TowelBooks may make changes to these Terms or the Services due to:',
        ],
        bullets: [
          'changes to the law or regulatory requirements;',
          'security or safety reasons;',
          "circumstances beyond TowelBooks' reasonable control;",
          'changes made in the usual course of developing the Services;',
          'adaptation to new technologies.',
        ],
        paragraphsAfterBullets: [
          'TowelBooks will give you at least 30 days advance notice of changes to these Terms that materially adversely impact you, through the channels described in Electronic communications. All other changes will be effective as soon as TowelBooks posts them on the TowelBooks website. If you do not agree to the changes, you must stop using the Services.',
          "TowelBooks' failure to enforce a provision is not a waiver of its right to do so later. If any portion of these Terms is determined to be invalid or unenforceable, that portion will be enforced to the maximum extent permissible and it will not affect the enforceability of any other terms.",
        ],
        title: 'General Terms',
      },
      {
        paragraphs: [
          'TowelBooks may transfer, assign, or novate the ownership of the Services, these Terms of Service, or the rights and obligations arising from them in the event of a sale of the project, acquisition, merger, consolidation, spin-off, corporate reorganization, business succession, or any other form of transfer of its assets or operations.',
          'In such cases, the successor entity will assume the rights and obligations of TowelBooks towards users, subject to applicable law.',
          'If the transfer results in material changes to the way Services are provided, the processing of personal data, or the rights of users, TowelBooks or its successor will take reasonable measures to communicate such changes through official channels.',
        ],
        title: 'Assignment of Services and these Terms',
      },
      {
        paragraphs: [
          'These Terms of Service are governed by and construed in accordance with the laws of the Federative Republic of Brazil.',
          'To the fullest extent permitted by applicable law, disputes arising from these Terms or from use of the Services shall be submitted to the courts of the Judicial District of Palmas, State of Tocantins.',
          'Nothing in this clause limits or displaces mandatory jurisdiction rules provided under applicable law, including those intended to protect consumers, where applicable.',
        ],
        title: 'Applicable law and jurisdiction',
      },
      {
        paragraphs: [
          `Questions about these Terms or the privacy posture can be sent to ${PRIVACY_CONTACT_EMAIL}.`,
        ],
        title: 'Contact',
      },
    ],
    title: formatPublicLegalTitle('Terms of Service'),
  },
  'pt-BR': {
    eyebrow: 'Termos de Serviço',
    effectiveDateLabel: formatPublicLegalEffectiveDateLabel(
      'pt-BR',
      termsMetadata.effectiveAt,
    ),
    sections: [
      {
        paragraphs: [
          'Estes Termos de Serviço ("Termos") constituem um acordo juridicamente vinculante entre você e Rafael Moraes, desenvolvedor independente que opera sob a marca TowelBooks, regendo o acesso e o uso dos Serviços.',
          'Ao acessar ou utilizar os Serviços, criar uma conta ou aceitar estes Termos quando solicitado no produto, você confirma que leu, compreendeu e concorda em se vincular a estes Termos e à <a href="/legal/privacy">Política de Privacidade</a>, que integra o arcabouço jurídico aplicável.',
          'Se você não concordar com estes Termos, não deve acessar nem utilizar os Serviços. Se já tiver uma conta e deixar de concordar, deve interromper o uso dos Serviços e poderá excluir sua conta conforme descrito nestes Termos e na Política de Privacidade.',
          'A TowelBooks poderá atualizar estes Termos periodicamente, conforme descrito em Disposições Gerais. Alterações materiais que impactem você de forma adversa serão comunicadas com antecedência pelos canais descritos em Comunicações eletrônicas.',
        ],
        title: 'Aceitação dos Termos',
      },
      {
        paragraphs: [
          'Para os fins destes Termos, "Serviços" significa os sites, aplicativos, APIs, integrações, funcionalidades e quaisquer outros produtos ou canais digitais que a TowelBooks disponibilize agora ou no futuro sob a marca TowelBooks, principalmente em <strong>towelbooks.com</strong> e canais oficiais relacionados.',
          'Sites, aplicativos, APIs, integrações ou funcionalidades que a TowelBooks venha a disponibilizar posteriormente também estão abrangidos por estes Termos, salvo se condições específicas se aplicarem a determinada oferta.',
          'A TowelBooks está em evolução contínua. Funcionalidades poderão ser adicionadas, alteradas ou removidas ao longo do tempo para melhorar a experiência, reforçar a segurança, atender exigências legais ou sustentar a operação dos Serviços, conforme detalhado em Evolução dos Serviços e Disponibilidade do serviço.',
        ],
        title: 'Escopo',
      },
      {
        paragraphs: [
          'A TowelBooks é uma plataforma digital destinada à organização, acompanhamento e compartilhamento de experiências de leitura individual e em conjunto.',
          'Os Serviços podem incluir, entre outras funcionalidades:',
        ],
        bullets: [
          'criação e gerenciamento de bibliotecas pessoais;',
          'registro do progresso de leitura;',
          'publicação de avaliações, comentários e reflexões sobre obras;',
          'criação e gerenciamento de salas de leituras;',
          'participação em salas de leitura;',
          'interação social entre pessoas usuárias;',
          'demais funcionalidades disponibilizadas pela TowelBooks ao longo da evolução da plataforma.',
        ],
        title: 'Objeto dos Serviços',
      },
      {
        paragraphs: [
          'Quando você cria ou contribui com informações sobre um livro, edição, autor ou outro registro do catálogo, essa contribuição poderá tornar-se parte do catálogo global compartilhado da TowelBooks.',
          'Os registros do catálogo não são registros privados de propriedade ou sob controle da pessoa que os contribuiu originalmente. A TowelBooks poderá manter, corrigir, enriquecer, combinar, reorganizar, arquivar ou remover registros do catálogo conforme razoavelmente necessário para operar e manter o catálogo.',
          'A TowelBooks poderá revisar, corrigir, editar, mesclar, enriquecer, rejeitar, arquivar, restringir ou remover contribuições quando razoavelmente necessário para tratar de registros duplicados, informações incorretas, abuso, violações, integridade do catálogo ou outros problemas que afetem os Serviços. Contribuir com um registro não dá à pessoa contribuidora direito exclusivo de controlar seu conteúdo futuro, sua apresentação ou sua disponibilidade contínua.',
          'As pessoas usuárias podem contribuir com informações sobre livros, edições, autores e metadados bibliográficos, como títulos, dados de publicação, identificadores, idiomas, editoras, selos editoriais e informações sobre colaboradores.',
          'Se você carregar uma imagem de capa ou outra imagem em um registro do catálogo, declara que possui os direitos, permissões ou outra base legal necessária para disponibilizar essa imagem por meio da TowelBooks. A existência de um livro, ISBN, edição ou registro de catálogo, por si só, não concede permissão para reproduzir ou carregar arte de capa protegida por direitos autorais ou outro material protegido.',
          'Contribuir com um registro, por si só, não dá a você permissão para enviar, reproduzir, distribuir ou de outra forma disponibilizar um livro, PDF, digitalização, trecho ou outro material protegido por direitos autorais ou por outra proteção legal. Você deve contribuir apenas com material que esteja autorizado a fornecer e não deve utilizar o catálogo para facilitar violações de direitos.',
          'Na medida em que você detenha direitos sobre metadados bibliográficos factuais, concede à TowelBooks uma licença não exclusiva, mundial e gratuita para hospedar, armazenar, reproduzir, exibir, processar, organizar, manter, corrigir, combinar e utilizar esses metadados conforme razoavelmente necessário para operar, manter, aprimorar e disponibilizar o catálogo compartilhado. Essa licença não transfere a titularidade para a TowelBooks, e a TowelBooks não reivindica a titularidade sobre fatos nem sobre quaisquer direitos originais que você detenha em relação ao material contribuído.',
          'Algumas contribuições para o catálogo podem incluir conteúdo original, como descrições, resumos, sinopses, anotações ou outro texto escrito por você. Você mantém quaisquer direitos que detenha sobre esse conteúdo. Ao enviá-lo como parte de um registro compartilhado do catálogo, concede à TowelBooks uma licença não exclusiva, mundial, gratuita e sublicenciável para hospedar, armazenar, reproduzir, exibir, processar, adaptar para formatação e distribuir esse conteúdo conforme razoavelmente necessário para operar, manter, aprimorar e disponibilizar o catálogo compartilhado.',
          'Essa licença continua enquanto o conteúdo contribuído permanecer parte do catálogo compartilhado, inclusive após a exclusão da sua conta, salvo se o conteúdo for removido do catálogo ou se a legislação aplicável exigir o contrário. Isso não autoriza a TowelBooks a utilizar o conteúdo para finalidades não relacionadas a operar, proteger, manter ou promover os Serviços.',
          'A TowelBooks poderá futuramente identificar o histórico de contribuições usando rótulos como “Adicionado por” ou “Atualizado por” quando uma funcionalidade correspondente for implementada. Essa disposição reserva essa opção e não promete que tal funcionalidade de atribuição exista ou que toda contribuição receberá atribuição.',
        ],
        title: 'Contribuições para o catálogo da comunidade',
      },
      {
        paragraphs: [
          'Ao criar uma conta na TowelBooks, você concorda com as seguintes condições:',
        ],
        bullets: [
          'A TowelBooks foi desenhada para maiores de idade. Ao criar ou manter uma conta, você confirma que tem pelo menos 18 anos.',
          'Para criar uma conta, é necessário fornecer um endereço de e-mail válido e escolher um nome de usuário.',
          'Você deve fornecer informações precisas, atuais e completas durante o registro e mantê-las atualizadas.',
          'Sua conta é pessoal, individual e intransferível. Salvo quando expressamente autorizado pela TowelBooks, não é permitido compartilhar credenciais de acesso, ceder, vender, alugar, emprestar ou transferir a conta para terceiros.',
          'Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas por meio de sua conta.',
          'A TowelBooks pode suspender ou encerrar sua conta em caso de violação destes Termos.',
        ],
        paragraphsAfterBullets: [
          'Os Serviços podem permitir que você acesse sua conta utilizando uma conta de terceiro (por exemplo, Entrar com Google). Se você entrar exclusivamente por meio de um provedor terceiro e perder o acesso a essa conta de terceiro, poderá perder o acesso à sua conta TowelBooks. Recomendamos adicionar uma senha à sua conta nas configurações como método de acesso alternativo.',
          'A TowelBooks poderá revisar contas que permanecerem inativas por dois anos consecutivos. Isso não exclui automaticamente uma conta quando esse período termina. Se a TowelBooks decidir excluir uma conta inativa, primeiro enviará um aviso para o endereço de e-mail cadastrado e dará a oportunidade de entrar na conta ou entrar em contato conosco antes da exclusão.',
        ],
        title: 'Conta',
      },
      {
        paragraphs: [
          'Sujeito a estes Termos, a TowelBooks concede a você uma licença limitada, pessoal, revogável, intransferível e não exclusiva para acessar e utilizar os Serviços conforme sua finalidade.',
          'Essa licença não autoriza copiar, modificar, adaptar, traduzir, realizar engenharia reversa (salvo quando permitido pela legislação aplicável), sublicenciar, vender, alugar, arrendar, distribuir ou explorar de qualquer outra forma os Serviços ou parte deles para fins comerciais não expressamente permitidos nestes Termos.',
          'Todos os direitos não expressamente concedidos permanecem reservados à TowelBooks.',
        ],
        title: 'Licença de uso dos Serviços',
      },
      {
        paragraphs: [
          'Algumas funcionalidades dos Serviços poderão estar em desenvolvimento, ser disponibilizadas gradualmente ou ficar disponíveis apenas para parte das pessoas usuárias durante determinado período.',
          'Nesse processo, uma funcionalidade poderá ter limitações temporárias, comportar-se de forma diferente da versão final ou ficar indisponível por manutenção, segurança ou razões de produto.',
          'A TowelBooks empregará esforços razoáveis para aprimorar as funcionalidades ao longo do tempo e tratar questões que afetem a estabilidade e a utilidade dos Serviços, observada a legislação aplicável.',
        ],
        title: 'Disponibilidade de funcionalidades',
      },
      {
        paragraphs: [
          'A TowelBooks pode enviar comunicações relacionadas aos Serviços, incluindo notificações operacionais e de conta, alterações destes Termos, avisos de segurança e outras mensagens vinculadas à utilização da plataforma.',
          'Essas comunicações podem ser entregues por e-mail e/ou dentro da plataforma.',
          'Ao utilizar os Serviços, você concorda em receber essas comunicações em formato eletrônico.',
        ],
        title: 'Comunicações eletrônicas',
      },
      {
        paragraphs: [
          'A TowelBooks busca manter um ambiente seguro, respeitoso e adequado para a comunidade. Ao utilizar os Serviços, você concorda em agir de boa-fé, respeitar a legislação aplicável, os direitos de terceiros e estes Termos de Serviço.',
          'É proibido utilizar os Serviços para, entre outras condutas:',
        ],
        bullets: [
          'praticar atividades ilícitas, fraudulentas ou enganosas;',
          'publicar, transmitir ou compartilhar conteúdo que viole direitos autorais, marcas, direitos de personalidade, privacidade ou quaisquer outros direitos de terceiros;',
          'assediar, intimidar, ameaçar, perseguir ou constranger outras pessoas;',
          'promover, incentivar ou divulgar discriminação, discurso de ódio, violência ou perseguição contra pessoas ou grupos em razão de raça, cor, etnia, nacionalidade, origem, religião, deficiência, idade, sexo, identidade de gênero, orientação sexual ou qualquer outra característica protegida pela legislação aplicável;',
          'divulgar informações pessoais de terceiros sem autorização ou em desacordo com a legislação aplicável;',
          'utilizar os Serviços para enviar spam, comunicações não solicitadas, golpes, phishing ou qualquer conteúdo malicioso;',
          'tentar obter acesso não autorizado a contas, sistemas, dados ou recursos da TowelBooks ou de terceiros;',
          'interferir na segurança, integridade, disponibilidade ou funcionamento dos Serviços, inclusive por meio de automação abusiva, exploração de vulnerabilidades, engenharia reversa quando vedada pela legislação aplicável, ou qualquer outra forma de uso incompatível com a finalidade da plataforma;',
          'realizar scraping, crawling, coleta sistemática, mineração ou extração automatizada de dados, conteúdos ou informações dos Serviços por meio de bots, spiders, crawlers, scrapers ou quaisquer outros meios automatizados, exceto quando expressamente permitido por APIs oficiais da TowelBooks ou mediante autorização prévia e por escrito da TowelBooks;',
          'utilizar automações, scripts ou ferramentas não autorizadas para acessar, interagir com, extrair dados dos Serviços ou sobrecarregá-los;',
          'utilizar os Serviços de maneira que prejudique a experiência, a segurança ou os direitos de outras pessoas usuárias;',
          'praticar qualquer outra conduta incompatível com estes Termos ou com a legislação aplicável.',
        ],
        paragraphsAfterBullets: [
          'A TowelBooks poderá analisar denúncias, revisar conteúdos e adotar medidas para proteger a comunidade, os Serviços e o cumprimento destes Termos.',
          'Você pode denunciar perfis acessíveis, salas de leitura, itens do catálogo e comentários por meio das ferramentas de denúncia disponibilizadas nos Serviços. Uma denúncia é um sinal para análise e não remove, restringe ou altera automaticamente o alvo denunciado nem sanciona uma conta.',
          'Enviar conscientemente denúncias falsas, abusivas, repetitivas ou fraudulentas, ou usar as ferramentas de denúncia para assediar outra pessoa, viola estes Termos e pode resultar em restrições à conta ou a funcionalidades.',
          'Quando identificar, ou possuir fundamentos razoáveis para acreditar, que houve violação destes Termos, da legislação aplicável ou de direitos de terceiros, a TowelBooks poderá, conforme a natureza e a gravidade da situação: remover ou restringir o acesso a conteúdos; limitar temporariamente determinadas funcionalidades da conta; emitir advertências; suspender temporária ou permanentemente a conta da pessoa usuária; ou encerrar definitivamente o acesso aos Serviços.',
          'A escolha da medida aplicável levará em consideração, sempre que possível, fatores como a gravidade da conduta, a existência de reincidência, o potencial de dano à comunidade, aos Serviços ou a terceiros e as circunstâncias do caso concreto.',
          'Violações graves poderão resultar na suspensão ou no encerramento imediato da conta, sem necessidade de advertência prévia, especialmente quando envolverem atividades ilícitas, fraude, riscos à segurança da plataforma, violações reiteradas de direitos de terceiros, exploração abusiva dos Serviços ou condutas que possam colocar outras pessoas em risco.',
          'A TowelBooks poderá preservar registros, conteúdos e demais informações relacionados a investigações internas, solicitações de autoridades competentes ou ao exercício regular de direitos, observada a legislação aplicável e a Política de Privacidade.',
          'A adoção de medidas de moderação pela TowelBooks não implica obrigação de monitoramento prévio de todo o conteúdo publicado pelas pessoas usuárias nem representa assunção de responsabilidade automática pelo conteúdo gerado por terceiros.',
        ],
        title: 'Uso aceitável dos Serviços e moderação',
      },
      {
        paragraphs: [
          'A TowelBooks disponibiliza uma plataforma para organização de leituras, interação entre pessoas usuárias e administração de salas de leitura.',
          'Quando pessoas usuárias realizarem acordos, negociações, cobranças, pagamentos, trocas de bens ou serviços, eventos presenciais ou virtuais, programas de assinatura ou quaisquer outras relações diretamente entre si, essas relações ocorrerão exclusivamente entre as partes envolvidas.',
          'A TowelBooks não atua como intermediadora, representante, mandatária, agente, garantidora ou parte dessas relações, salvo quando expressamente indicado em funcionalidade própria dos Serviços.',
          'Cada pessoa usuária é integralmente responsável por cumprir as obrigações que assumir perante terceiros.',
          'A TowelBooks não verifica, certifica ou garante a identidade, reputação, qualificação, legitimidade ou idoneidade das pessoas usuárias. As interações entre pessoas usuárias ocorrem por conta e risco das partes envolvidas. Você é o único responsável por adotar as precauções adequadas ao interagir com outras pessoas usuárias, inclusive em encontros presenciais, pagamentos ou arranjos comerciais realizados fora dos Serviços.',
        ],
        title: 'Relações entre pessoas usuárias',
      },
      {
        paragraphs: [
          'As salas de leitura podem ser privadas ou públicas. Salas privadas não aparecem em buscas públicas e a participação é controlada por convites ou ação das pessoas que gerenciam a sala. Salas públicas podem aparecer na descoberta autenticada para leitores que ainda não são membros.',
          'Em salas públicas, as pessoas que gerenciam a sala escolhem como novos membros podem entrar: somente por convite, por solicitação com análise da gestão ou por autoentrada quando habilitada. Salas privadas permanecem somente por convite, independentemente de outras configurações.',
          'Se você solicitar entrada em uma sala pública, concorda que as pessoas autorizadas a analisar solicitações poderão ver os dados públicos do seu perfil necessários para decidir a admissão. Solicitações de entrada não incluem campo de mensagem livre.',
          'As pessoas que gerenciam a sala podem aceitar ou recusar solicitações pendentes. Recusar ou cancelar uma solicitação pendente remove o registro sem criar histórico permanente de recusa no produto.',
          'Links e e-mails de convite para salas continuam disponíveis em qualquer política de entrada e não substituem a responsabilidade da gestão pela comunidade da sala.',
          'Ao participar de uma sala, você permanece responsável pela sua conduta e pelo cumprimento destes Termos e das regras definidas pelas pessoas que gerenciam a sala.',
        ],
        title: 'Participação em salas de leitura',
      },
      {
        paragraphs: [
          'A disponibilização de salas de leitura, cursos, mentorias, eventos, assinaturas ou outros serviços por pessoas usuárias por meio dos Serviços não representa aprovação, certificação, endosso ou parceria da TowelBooks.',
          'Cada pessoa usuária permanece integralmente responsável pelas atividades comerciais que organizar, promover ou prestar.',
        ],
        title: 'Uso comercial por usuários',
      },
      {
        paragraphs: [
          'A TowelBooks não participa, processa, controla ou garante pagamentos realizados diretamente entre pessoas usuárias por meios externos aos Serviços.',
          'Cobranças para participação em salas, grupos de leitura, eventos, mentorias, consultorias, venda de produtos, assinaturas ou quaisquer outras atividades organizadas por pessoas usuárias são de responsabilidade exclusiva das partes envolvidas.',
          'Eventuais disputas relacionadas a preços, pagamentos, reembolsos, cancelamentos, inadimplemento, entrega de produtos ou prestação de serviços deverão ser resolvidas diretamente entre as pessoas envolvidas, sem prejuízo das medidas previstas na legislação aplicável.',
        ],
        title: 'Pagamentos realizados fora da plataforma',
      },
      {
        paragraphs: [
          'A TowelBooks pode exibir banners, recomendações e outros espaços promocionais internos próprios para livros, funcionalidades ou conteúdo. Alguns desses espaços podem apontar para links de compra afiliados. A exibição de um espaço assim não significa que a Amazon ou outro vendedor terceiro patrocine, controle ou endosse a TowelBooks.',
          'A Plataforma poderá exibir links para sites, lojas ou serviços de terceiros. Alguns desses links poderão utilizar programas de afiliados, pelos quais o TowelBooks poderá receber uma comissão quando uma compra qualificada for realizada, sem qualquer custo adicional para o usuário.',
          'A eventual utilização de links de afiliados não influencia o preço pago pelo usuário nem representa garantia, patrocínio ou recomendação exclusiva de qualquer fornecedor. Todas as compras realizadas em sites de terceiros são regidas pelos respectivos termos, políticas e condições desses terceiros.',
          'A TowelBooks não opera Google AdSense nem outra rede de anúncios gráficos de terceiros na implementação atual. Qualquer tecnologia futura de anúncios de terceiros exige revisão dos documentos legais, do registro de operadores, da política de segurança de conteúdo e da governança de provedores, bem como dos controles de consentimento, antes da ativação.',
          'As pessoas usuárias também podem publicar seus próprios links externos em perfis e salas de leitura. Esses links são conteúdo publicado pela pessoa usuária: a TowelBooks não endossa o destino, não opera rastreamento de cliques nem redirecionamento para eles e não é responsável pelo conteúdo, disponibilidade ou práticas dos sites de terceiros vinculados por pessoas usuárias, observada a legislação aplicável e as regras de moderação destes Termos.',
          'As imagens de capa são exibidas como auxílio visual para identificação da obra. Elas são carregadas diretamente da Open Library Covers API (covers.openlibrary.org) no seu navegador. A TowelBooks não armazena, faz proxy ou re-hospeda esses bytes de imagem. A exibição das capas está sujeita aos próprios termos e políticas de uso da Open Library.',
        ],
        title: 'Links para terceiros e programas de afiliados',
      },
      {
        paragraphs: [
          'O software, o código-fonte, as APIs, a marca, a identidade visual, os bancos de dados, o layout, o design, a documentação e demais ativos da plataforma pertencem à TowelBooks ou a seus licenciadores e são protegidos pelas leis de propriedade intelectual aplicáveis.',
          'Salvo a licença limitada expressamente concedida nestes Termos, nenhum direito, titularidade ou interesse sobre esses ativos é transferido a você.',
          'Qualquer uso fora do escopo dessa licença não é autorizado.',
        ],
        title: 'Propriedade intelectual da plataforma',
      },
      {
        paragraphs: [
          'Os Serviços permitem que pessoas usuárias publiquem comentários, respostas, reações, avaliações, reflexões, anotações de sessões de leitura, listas, recomendações, links externos em perfis e salas de leitura e outros conteúdos.',
          'Esses conteúdos são produzidos exclusivamente por seus respectivos autores.',
          'Você permanece titular dos direitos sobre o conteúdo que publica na TowelBooks, responsabilizando-se por possuir os direitos, autorizações ou permissões necessários para sua disponibilização.',
          'Com exceção do conteúdo original enviado como parte de um registro compartilhado do catálogo, que é regido pela seção Contribuições para o catálogo da comunidade, ao publicar ou de outra forma disponibilizar conteúdo por meio dos Serviços, você concede à TowelBooks uma licença não exclusiva, mundial, gratuita e sublicenciável para hospedar, armazenar, reproduzir, exibir, processar, transmitir e distribuir esse conteúdo exclusivamente na medida necessária para operar, prestar, proteger, promover e aprimorar os Serviços, inclusive para processamento técnico como backups, cache, indexação e entrega de conteúdo.',
          'Essa licença termina quando você remove o conteúdo dos Serviços ou quando sua conta é excluída, ressalvadas cópias residuais retidas por período razoável para fins legais, de segurança, backup, auditoria ou continuidade, conforme descrito na Política de Privacidade e na legislação aplicável.',
          'É proibida a publicação de conteúdo que viole direitos autorais, direitos de propriedade intelectual ou quaisquer direitos de terceiros. Links externos que você publicar não podem ser usados para phishing, malware, spam ou outras finalidades ilícitas ou abusivas.',
          'A TowelBooks não garante a exatidão, integridade, atualidade, legalidade ou adequação a qualquer finalidade específica do conteúdo publicado por pessoas usuárias, embora possa adotar medidas de moderação quando tomar conhecimento de violações destes Termos ou da legislação aplicável.',
          'As denúncias enviadas pelos Serviços podem ser retidas e analisadas conforme descrito na Política de Privacidade. A análise de uma denúncia não transfere a titularidade do conteúdo denunciado nem cria obrigação de adotar uma medida específica.',
          'Esta seção trata do conteúdo original publicado pelas pessoas usuárias fora dos registros compartilhados do catálogo. Textos e imagens originais enviados como parte de um registro do catálogo são regidos por Contribuições para o catálogo da comunidade, sua licença específica e seu efeito sobre a exclusão da conta. Os metadados factuais do catálogo são tratados separadamente em Contribuições para o catálogo da comunidade. Avaliações, descrições não catalográficas, anotações de sessões de leitura, comentários, respostas, reações e outras imagens carregadas continuam sendo conteúdo original nos termos desta seção. Notas pessoais de biblioteca e notas de propriedade são metadados privados de biblioteca e propriedade, distintos de uma anotação de sessão de leitura publicada por meio de uma atividade de perfil.',
        ],
        title: 'Conteúdo publicado pelas pessoas usuárias',
      },
      {
        paragraphs: [
          'Conteúdos e interações publicados em uma área pública da TowelBooks são públicos dentro do público disponibilizado por aquele perfil, atividade, sala ou outro contexto. “Público”, nestes Termos, não promete acesso anônimo nem visibilidade fora da política de acesso aplicável àquele contexto da TowelBooks.',
          'Comentários, respostas, reações, avaliações, anotações, discussões e contribuições semelhantes herdam o público do conteúdo ou da área em que são publicados. Publicar a partir de um perfil privado não torna uma interação privada quando você escolhe publicá-la em uma atividade de perfil pública ou em outro contexto público. Atividades e salas restritas limitam a visibilidade às pessoas autorizadas.',
          'Você é responsável pelos conteúdos e interações que publicar intencionalmente em um contexto público ou restrito, inclusive por garantir que possui os direitos e permissões necessários e que não divulga ilegalmente informações de outra pessoa.',
        ],
        bullets: [
          'O comentário de uma pessoa com perfil privado em uma atividade de perfil pública fica visível dentro do público daquela atividade, enquanto o perfil da pessoa continua sujeito às próprias configurações de privacidade.',
          'Uma reação em uma atividade de perfil pública fica visível dentro do público daquela atividade; uma interação em uma atividade restrita segue a autorização daquela atividade.',
        ],
        title: 'Visibilidade contextual e responsabilidade da pessoa usuária',
      },
      {
        paragraphs: [
          'A TowelBooks respeita os direitos de propriedade intelectual de terceiros e espera que as pessoas usuárias façam o mesmo.',
          `Se você acredita que algum conteúdo disponibilizado por meio dos Serviços viola direitos autorais, direitos de marca ou outros direitos de propriedade intelectual, envie uma notificação para ${COPYRIGHT_NOTICE_EMAIL}.`,
          'Sempre que possível, a notificação deverá conter:',
        ],
        bullets: [
          'identificação da pessoa titular do direito ou de seu representante;',
          'descrição do direito supostamente violado;',
          'identificação suficiente do conteúdo questionado, incluindo seu link ou outra informação que permita sua localização;',
          'descrição dos motivos pelos quais o conteúdo seria considerado infrator;',
          'informações de contato para retorno;',
          'declaração de que as informações fornecidas são verdadeiras e de que a pessoa denunciante acredita, de boa-fé, que possui legitimidade para apresentar a solicitação.',
        ],
        paragraphsAfterBullets: [
          'A TowelBooks poderá solicitar informações complementares quando necessário para analisar a denúncia.',
          'Após receber uma denúncia, a TowelBooks poderá analisar o caso e, quando entender apropriado, remover o conteúdo, restringir seu acesso, solicitar esclarecimentos às partes envolvidas ou adotar outras medidas compatíveis com estes Termos e com a legislação aplicável.',
          'A apresentação de uma denúncia não implica a remoção automática do conteúdo.',
          'Contas que pratiquem violações reiteradas de direitos de propriedade intelectual poderão ser suspensas ou encerradas.',
          'A TowelBooks poderá deixar de atender solicitações manifestamente infundadas, abusivas ou apresentadas de má-fé.',
        ],
        title: 'Denúncias de violação de propriedade intelectual',
      },
      {
        paragraphs: [
          `Valorizamos sugestões e relatos de problemas que nos ajudem a melhorar a TowelBooks. Você pode enviar feedback de produto para ${COPYRIGHT_NOTICE_EMAIL} ou usar os canais de contato disponibilizados no produto, quando aplicável.`,
          'Se você enviar à TowelBooks feedback, sugestões, ideias, propostas ou outros comentários sobre os Serviços, a TowelBooks poderá utilizá-los, reproduzi-los, modificá-los e incorporá-los para desenvolver, aprimorar, operar e promover os Serviços, sem qualquer obrigação de remuneração, atribuição de autoria ou de manter tal feedback em confidencialidade, observada a legislação aplicável e a Política de Privacidade no que se refere a dados pessoais.',
        ],
        title: 'Feedback',
      },
      {
        paragraphs: [
          'O tratamento de privacidade, cookies e fluxos de direitos de dados é descrito na <a href="/legal/privacy">Política de Privacidade</a> e no <a href="/legal/cookies">Aviso de Cookies</a>. Esses documentos integram o arcabouço jurídico atualmente aplicável aos Serviços.',
          'A TowelBooks não vende informações pessoais e não opera publicidade comportamental na forma atualmente oferecida.',
        ],
        title: 'Privacidade e documentos relacionados',
      },
      {
        paragraphs: [
          'A TowelBooks adota medidas técnicas e organizacionais razoáveis para proteger os Serviços e os dados pessoais tratados.',
          'Entretanto, nenhum sistema informatizado pode ser considerado completamente livre de falhas, vulnerabilidades ou acessos não autorizados.',
          'Você também é responsável por adotar medidas adequadas para proteger suas credenciais de acesso e seus dispositivos.',
        ],
        title: 'Segurança',
      },
      {
        paragraphs: [
          'Se você excluir sua conta, a TowelBooks envia um email de confirmação, desativa a conta após a confirmação e inicia uma janela documentada de 30 dias durante a qual você pode cancelar a exclusão. Durante essa janela, você pode restaurar a conta pelo link de cancelamento no email, entrando com sua senha e confirmando a reativação ou refazendo a autenticação pela sua conta Google vinculada. Todas as ações de restauração são registradas para segurança.',
          'Após a janela, sua conta torna-se elegível para finalização e é concluída no próximo ciclo agendado de manutenção. A finalização remove ou anonimiza identificadores diretos, exclui dados de biblioteca pessoal e wishlist, e pode reter registros mínimos de auditoria, jurídicos e de continuidade de salas — e, se você tiver usado recursos pagos oferecidos pela TowelBooks, registros mínimos de pagamento — conforme descrito na Política de Privacidade.',
          'Excluir sua conta não remove automaticamente registros bibliográficos ou metadados factuais que já tenham sido incorporados ao catálogo compartilhado. Quando aplicável, a associação entre uma contribuição para o catálogo e sua conta poderá ser removida, anonimizada ou mantida de forma limitada de acordo com a Política de Privacidade, a legislação aplicável e requisitos legítimos de auditoria, moderação ou integridade do catálogo.',
          'Conteúdo original contribuído para o catálogo, como descrições, resumos, sinopses, anotações ou outro texto, poderá permanecer sob a licença específica do catálogo enquanto continuar parte do catálogo compartilhado, salvo se o conteúdo for removido do catálogo ou se a legislação aplicável exigir o contrário.',
          'Excluir sua conta não apaga todo registro jurídico, de auditoria ou de continuidade de sala compartilhada, nem todo registro de suporte a pagamentos quando recursos pagos tiverem sido usados, se esses registros forem necessários para suporte, reconciliação, disputas ou integridade do domínio.',
        ],
        title: 'Exclusão de conta e conteúdo residual',
      },
      {
        paragraphs: [
          'A TowelBooks pode suspender contas, restringir funcionalidades ou encerrar o acesso por razões operacionais, legais ou comerciais, inclusive para preservar a integridade da plataforma e cumprir obrigações legais.',
          'Quando razoavelmente possível, a TowelBooks comunicará previamente por meio dos canais descritos em Comunicações eletrônicas.',
          'Esta seção não limita medidas adotadas por violação destes Termos ou da legislação aplicável nas seções Conta ou Uso aceitável dos Serviços e moderação, nem substitui a descontinuação dos Serviços descrita em Descontinuação dos Serviços.',
        ],
        title: 'Encerramento operacional',
      },
      {
        paragraphs: [
          'A TowelBooks emprega esforços razoáveis para manter os Serviços disponíveis, seguros e em adequado funcionamento. Embora busquemos oferecer uma experiência estável e confiável, não garantimos que os Serviços estarão disponíveis de forma contínua, ininterrupta ou livre de erros.',
          'Poderão ocorrer interrupções, erros, degradação de desempenho ou indisponibilidade temporária, inclusive durante o período inicial de operação, por motivos como:',
        ],
        bullets: [
          'manutenção preventiva ou corretiva;',
          'atualizações, correções de segurança ou melhorias de produto;',
          'evolução ou limitação temporária de funcionalidades;',
          'falhas técnicas;',
          'incidentes de segurança;',
          'indisponibilidade de serviços de terceiros;',
          'caso fortuito ou força maior.',
        ],
        paragraphsAfterBullets: [
          'Quando razoavelmente possível, a TowelBooks adotará medidas para minimizar impactos e restabelecer o funcionamento normal.',
          'Algumas funcionalidades dos Serviços dependem de produtos ou serviços operados por terceiros, como infraestrutura, hospedagem, armazenamento, envio de e-mails e — quando a TowelBooks oferecer recursos pagos — processamento de pagamentos.',
          'A disponibilidade desses serviços poderá influenciar o funcionamento da TowelBooks, sem que isso represente responsabilidade exclusiva da plataforma pelos eventos decorrentes da atuação desses terceiros, observada a legislação aplicável.',
        ],
        title: 'Disponibilidade do serviço',
      },
      {
        paragraphs: [
          'A TowelBooks é uma plataforma em constante evolução. Durante seu desenvolvimento e após o lançamento, poderemos adicionar, modificar, substituir ou remover funcionalidades, corrigir falhas, realizar melhorias controladas e implementar mudanças destinadas a reforçar a segurança, a usabilidade e a qualidade geral dos Serviços.',
          'Como consequência, determinadas funcionalidades poderão apresentar limitações temporárias, comportamentos inesperados ou ficar temporariamente indisponíveis. Empregaremos esforços razoáveis para corrigir problemas identificados e aprimorar continuamente a experiência das pessoas usuárias.',
          'A TowelBooks poderá realizar essas alterações sem obrigação de manter versões anteriores de cada funcionalidade ou dos Serviços como um todo, observada a legislação aplicável e quaisquer condições específicas de ofertas pagas, se existentes.',
        ],
        title: 'Evolução dos Serviços',
      },
      {
        paragraphs: [
          'A TowelBooks poderá, por motivos comerciais, técnicos, operacionais, legais ou estratégicos, descontinuar os Serviços, determinadas funcionalidades ou parte da plataforma, de forma temporária ou definitiva.',
          'Sempre que razoavelmente possível, e ressalvadas situações de urgência, determinação legal, segurança ou força maior, a TowelBooks procurará comunicar previamente as pessoas usuárias por meio dos canais descritos em Comunicações eletrônicas.',
          'Quando aplicável, a comunicação poderá informar:',
        ],
        bullets: [
          'a data prevista para descontinuação;',
          'funcionalidades afetadas;',
          'eventual período para exportação ou recuperação dos dados disponíveis;',
          'orientações sobre o encerramento da utilização dos Serviços;',
          'informações relacionadas a assinaturas ou serviços pagos, quando existentes.',
        ],
        paragraphsAfterBullets: [
          'Caso a descontinuação envolva Serviços pagos prestados diretamente pela TowelBooks, valores correspondentes a períodos pré-pagos e não utilizados serão reembolsados quando exigido pela legislação aplicável ou pelas condições do plano contratado, de forma proporcional quando aplicável.',
          'A descontinuação dos Serviços não afasta a aplicação das disposições destes Termos que, por sua natureza, devam permanecer vigentes, incluindo aquelas relacionadas à propriedade intelectual, proteção de dados, limitações de responsabilidade, resolução de disputas e cumprimento de obrigações legais.',
        ],
        title: 'Descontinuação dos Serviços',
      },
      {
        paragraphs: [
          'Na máxima extensão permitida pela legislação aplicável, a responsabilidade da TowelBooks limita-se à prestação dos Serviços descritos nestes Termos.',
          'Embora a TowelBooks empregue esforços razoáveis para manter os Serviços em adequado funcionamento, a TowelBooks não garante operação ininterrupta nem que os Serviços estarão livres de erros, interrupções ou degradação temporária de desempenho, salvo quando tal garantia for exigida pela legislação aplicável.',
          'A TowelBooks não será responsável por:',
        ],
        bullets: [
          'negociações realizadas diretamente entre pessoas usuárias;',
          'obrigações assumidas por terceiros;',
          'pagamentos efetuados fora dos Serviços;',
          'condutas, declarações ou conteúdos publicados por pessoas usuárias ou terceiros;',
          'indisponibilidades, interrupções, erros ou degradação de desempenho descritos em Disponibilidade do serviço e Evolução dos Serviços, inclusive aqueles decorrentes de serviços de terceiros, caso fortuito ou força maior;',
          'danos indiretos, lucros cessantes, perda de receita ou danos consequenciais.',
        ],
        paragraphsAfterBullets: [
          'Nada nesta cláusula limita ou exclui responsabilidades que não possam ser afastadas pela legislação aplicável.',
        ],
        title: 'Limitação de responsabilidade',
      },
      {
        paragraphs: [
          'Você não pode ceder ou transferir quaisquer direitos ou obrigações previstos nestes Termos. Qualquer tentativa de fazê-lo será nula. A TowelBooks poderá ceder seus direitos ou obrigações previstos nestes Termos a qualquer afiliada, subsidiária ou sucessora de qualquer negócio associado aos Serviços.',
          'A TowelBooks desenvolve continuamente os Serviços e poderá atualizar estes Termos ou os Serviços de tempos em tempos. Por exemplo, a TowelBooks poderá fazer alterações nestes Termos ou nos Serviços devido a:',
        ],
        bullets: [
          'alterações na lei ou em requisitos regulatórios;',
          'razões de segurança;',
          'circunstâncias fora do controle razoável da TowelBooks;',
          'alterações realizadas no curso normal do desenvolvimento dos Serviços;',
          'adaptação a novas tecnologias.',
        ],
        paragraphsAfterBullets: [
          'A TowelBooks fornecerá aviso prévio de pelo menos 30 dias sobre alterações nestes Termos que impactem você de forma material e adversa, por meio dos canais descritos em Comunicações eletrônicas. Todas as outras alterações entrarão em vigor assim que publicadas no site da TowelBooks. Se você não concordar com as alterações, deve parar de utilizar os Serviços.',
          'A não aplicação de uma disposição destes Termos pela TowelBooks não constitui renúncia ao direito de aplicá-la posteriormente. Se qualquer parte destes Termos for considerada inválida ou inexequível, essa parte será aplicada na máxima extensão permitida e não afetará a exequibilidade das demais disposições.',
        ],
        title: 'Disposições Gerais',
      },
      {
        paragraphs: [
          'A TowelBooks poderá transferir, ceder ou suceder a titularidade dos Serviços, destes Termos de Serviço ou dos direitos e obrigações deles decorrentes em caso de venda do projeto, aquisição, fusão, incorporação, cisão, reorganização societária, sucessão empresarial ou qualquer outra forma de transferência de seus ativos ou operações.',
          'Nessas hipóteses, a pessoa física ou jurídica sucessora passará a assumir os direitos e obrigações da TowelBooks perante as pessoas usuárias, observada a legislação aplicável.',
          'Caso a transferência resulte em alterações relevantes na forma de prestação dos Serviços, no tratamento de dados pessoais ou nos direitos das pessoas usuárias, a TowelBooks ou sua sucessora adotará medidas razoáveis para comunicar tais alterações por meio dos canais oficiais.',
        ],
        title: 'Transferência dos Serviços e destes Termos',
      },
      {
        paragraphs: [
          'Estes Termos de Serviço são regidos e interpretados de acordo com as leis da República Federativa do Brasil.',
          'Na máxima extensão permitida pela legislação aplicável, as controvérsias decorrentes destes Termos ou da utilização dos Serviços serão submetidas ao foro da Comarca de Palmas, Estado do Tocantins.',
          'Nada nesta cláusula limita ou afasta hipóteses de competência obrigatória previstas na legislação aplicável, inclusive aquelas destinadas à proteção das pessoas consumidoras, quando cabíveis.',
        ],
        title: 'Lei aplicável e foro',
      },
      {
        paragraphs: [
          `Dúvidas sobre estes Termos ou sobre a postura de privacidade podem ser enviadas para ${PRIVACY_CONTACT_EMAIL}.`,
        ],
        title: 'Contato',
      },
    ],
    title: formatPublicLegalTitle('Termos de Serviço'),
  },
};
