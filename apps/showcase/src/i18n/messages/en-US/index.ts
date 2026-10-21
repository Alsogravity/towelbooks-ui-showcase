import { acknowledgementsMessages } from './acknowledgements';
import { authMessages } from './auth';
import { bannerMessages } from './banner';
import { catalogMessages } from './catalog';
import { roomsMessages } from './rooms';
import { commentsMessages } from './comments';
import { collectionsMessages } from './collections';
import * as commonCatalog from './common';
import { dashboardMessages } from './dashboard';
import { externalLinksMessages } from './externalLinks';
import { inAppMessagesMessages } from './inAppMessages';
import { invitesMessages } from './invites';
import { landingMessages } from './landing';
import { humanVerificationMessages } from './humanVerification';
import { libraryMessages } from './library';
import { pricingMessages } from './pricing';
import { mediaCropMessages } from './mediaCrop';
import { notificationsMessages } from './notifications';
import { profileMessages } from './profile';
import { readingsMessages } from './readings';
import { reportsMessages } from './reports';
import { settingsMessages } from './settings';
import { shellMessages } from './shell';

export const enMessages = {
  ...acknowledgementsMessages,
  ...authMessages,
  ...bannerMessages,
  ...catalogMessages,
  ...commonCatalog.commonMessages,
  ...dashboardMessages,
  ...externalLinksMessages,
  ...inAppMessagesMessages,
  ...landingMessages,
  ...humanVerificationMessages,
  ...libraryMessages,
  ...mediaCropMessages,
  ...roomsMessages,
  ...invitesMessages,
  ...commentsMessages,
  ...collectionsMessages,
  ...notificationsMessages,
  ...pricingMessages,
  ...profileMessages,
  ...readingsMessages,
  ...reportsMessages,
  ...settingsMessages,
  ...shellMessages,
} as const;
