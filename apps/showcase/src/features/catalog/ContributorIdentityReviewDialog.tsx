import type {
  ContributorMatchDecision,
  ContributionPossibleContributorMatch,
} from '@towelbooks/schemas';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

type ContributorIdentityReviewDialogProps = {
  decisions: ReadonlyMap<string, ContributorMatchDecision>;
  matches: readonly ContributionPossibleContributorMatch[];
  onClose: () => void;
  onConfirm: () => void;
  onDecision: (matchId: string, decision: ContributorMatchDecision) => void;
};

function contributorNames(
  match: ContributionPossibleContributorMatch['left'],
): string {
  const names = [...new Set(match.members.map((member) => member.name))];
  return names.join(' · ');
}

function contributorSources(
  match: ContributionPossibleContributorMatch['left'],
): string[] {
  const sources = new Set<string>();

  for (const member of match.members) {
    if (member.source) {
      sources.add(member.source);
    }

    if (member.externalIdentity) {
      sources.add(
        `${member.externalIdentity.provider}:${member.externalIdentity.id}`,
      );
    }
  }

  return [...sources].sort();
}

export function ContributorIdentityReviewDialog({
  decisions,
  matches,
  onClose,
  onConfirm,
  onDecision,
}: ContributorIdentityReviewDialogProps) {
  const { t } = useI18n();
  const allMatchesReviewed = matches.every((match) => decisions.has(match.id));

  if (matches.length === 0) {
    return null;
  }

  return (
    <Dialog
      closeButtonLabel={t('common.close')}
      onClose={onClose}
      showCloseButton
      size="lg"
      title={t('catalog.contribution.contributorReview.title')}
    >
      <DialogBody>
        <p className="app-text-supporting-copy m-0 text-ink-3">
          {t('catalog.contribution.contributorReview.description')}
        </p>
        <div className="divide-y divide-rule/60 rounded-md border border-rule/60">
          {matches.map((match) => {
            const decision = decisions.get(match.id);
            const leftSources = contributorSources(match.left);
            const rightSources = contributorSources(match.right);

            return (
              <section
                className="space-y-4 p-4"
                key={match.id}
                aria-labelledby={`${match.id}-label`}
              >
                <div>
                  <h3
                    className="app-text-row-title m-0 text-ink"
                    id={`${match.id}-label`}
                  >
                    {contributorNames(match.left)}{' '}
                    <span aria-hidden="true">↔</span>{' '}
                    {contributorNames(match.right)}
                  </h3>
                  {leftSources.length > 0 || rightSources.length > 0 ? (
                    <p className="app-text-caption m-0 mt-1 break-words text-ink-3">
                      {[...new Set([...leftSources, ...rightSources])].join(
                        ' · ',
                      )}
                    </p>
                  ) : null}
                </div>
                <div
                  aria-label={t(
                    'catalog.contribution.contributorReview.choiceLabel',
                  )}
                  className="flex flex-wrap gap-2"
                  role="group"
                >
                  <Button
                    aria-pressed={decision === 'same_person'}
                    onClick={() => onDecision(match.id, 'same_person')}
                    size="sm"
                    type="button"
                    variant={
                      decision === 'same_person' ? 'primary' : 'secondary'
                    }
                  >
                    {t('catalog.contribution.contributorReview.samePerson')}
                  </Button>
                  <Button
                    aria-pressed={decision === 'keep_separate'}
                    onClick={() => onDecision(match.id, 'keep_separate')}
                    size="sm"
                    type="button"
                    variant={
                      decision === 'keep_separate' ? 'primary' : 'secondary'
                    }
                  >
                    {t('catalog.contribution.contributorReview.keepSeparate')}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} type="button" variant="ghost">
          {t('common.cancel')}
        </Button>
        <Button
          disabled={!allMatchesReviewed}
          onClick={onConfirm}
          type="button"
        >
          {t('catalog.contribution.contributorReview.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
