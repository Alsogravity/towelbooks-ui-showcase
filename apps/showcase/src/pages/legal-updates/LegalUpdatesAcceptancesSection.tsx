import { AppSubsection } from '../../components/application';
import { Button, Checkbox } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { legalDocumentVersionPath } from '../../lib/origins';

import type {
  RequiredLegalAcceptance,
  RequiredLegalAcceptanceType,
} from '@towelbooks/schemas';

const legalLinkClassName =
  'underline decoration-current/40 underline-offset-4 transition hover:decoration-current';

function renderAcceptanceCopy(
  acceptance: RequiredLegalAcceptance,
  t: ReturnType<typeof useI18n>['t'],
) {
  const { type } = acceptance;
  if (type === 'adult_attestation') {
    return <span>{t('auth.register.adultConfirmed')}</span>;
  }

  if (!acceptance.legalDocument) {
    return <span>{t('errors.page.legalDocumentsUnavailable.body')}</span>;
  }

  if (type === 'terms_acceptance') {
    return (
      <span>
        {t('auth.register.acceptTerms.before')}
        <a
          className={legalLinkClassName}
          href={legalDocumentVersionPath(
            'terms',
            acceptance.legalDocument.version,
          )}
        >
          {t('auth.register.acceptTerms.link')}
        </a>
        {t('auth.register.acceptTerms.after')}
      </span>
    );
  }

  return (
    <span>
      {t('auth.register.acknowledgePrivacy.before')}
      <a
        className={legalLinkClassName}
        href={legalDocumentVersionPath(
          'privacy',
          acceptance.legalDocument.version,
        )}
      >
        {t('auth.register.acknowledgePrivacy.link')}
      </a>
      {t('auth.register.acknowledgePrivacy.after')}
    </span>
  );
}

export function LegalUpdatesAcceptancesSection({
  allSelected,
  isSubmitting,
  onAcceptanceChange,
  onCancel,
  onSubmit,
  pendingAcceptances,
  selectedTypes,
}: {
  allSelected: boolean;
  isSubmitting: boolean;
  onAcceptanceChange: (
    type: RequiredLegalAcceptanceType,
    checked: boolean,
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
  pendingAcceptances: RequiredLegalAcceptance[];
  selectedTypes: Partial<Record<RequiredLegalAcceptanceType, boolean>>;
}) {
  const { t } = useI18n();

  return (
    <>
      <AppSubsection
        title={t('settings.legalUpdates.documents.title')}
        description={t('settings.legalUpdates.description')}
      >
        <div className="space-y-3 rounded-xl border border-rule bg-paper p-4">
          <p className="supporting-copy text-ink-2">
            {t('settings.legalUpdates.documents.body')}
          </p>
          {pendingAcceptances.map((acceptance) => (
            <label
              key={acceptance.type}
              className="supporting-copy flex items-start gap-3 text-ink-2"
            >
              <Checkbox
                checked={selectedTypes[acceptance.type] === true}
                onCheckedChange={(checked) =>
                  onAcceptanceChange(acceptance.type, checked)
                }
              />
              {renderAcceptanceCopy(acceptance, t)}
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {t('settings.legalUpdates.cancel')}
          </Button>
          <Button
            disabled={!allSelected}
            isLoading={isSubmitting}
            loadingLabel={t('settings.legalUpdates.submitting')}
            onClick={onSubmit}
          >
            {t('settings.legalUpdates.submit')}
          </Button>
        </div>
      </AppSubsection>
    </>
  );
}
