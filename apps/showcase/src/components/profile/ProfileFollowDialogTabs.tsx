import { type KeyboardEvent, useRef } from 'react';

import { useI18n } from '../../i18n';
import { type ProfileFollowDialogTab } from './profileFollowDialogShared';

export function ProfileFollowDialogTabs({
  activeKey,
  onChange,
}: {
  activeKey: ProfileFollowDialogTab;
  onChange: (key: ProfileFollowDialogTab) => void;
}) {
  const { t } = useI18n();
  const followersRef = useRef<HTMLButtonElement>(null);
  const followingRef = useRef<HTMLButtonElement>(null);
  const tabs: { key: ProfileFollowDialogTab; label: string }[] = [
    { key: 'followers', label: t('profile.stats.followers') },
    { key: 'following', label: t('profile.stats.following') },
  ];

  const focusTab = (key: ProfileFollowDialogTab) => {
    const target =
      key === 'followers' ? followersRef.current : followingRef.current;

    target?.focus();
  };

  const selectTab = (key: ProfileFollowDialogTab) => {
    onChange(key);
    focusTab(key);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    key: ProfileFollowDialogTab,
  ) => {
    const nextKey = key === 'followers' ? 'following' : 'followers';

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        selectTab(nextKey);
        break;
      case 'Home':
        event.preventDefault();
        selectTab('followers');
        break;
      case 'End':
        event.preventDefault();
        selectTab('following');
        break;
      default:
        break;
    }
  };

  return (
    <div className="mx-auto h-full w-full max-w-[12rem] border-b border-rule">
      <div
        role="tablist"
        aria-label={t('profile.followDialog.tabsLabel')}
        aria-orientation="horizontal"
        className="flex h-full w-full"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;

          return (
            <button
              key={tab.key}
              id={`profile-follow-dialog-tab-${tab.key}`}
              ref={tab.key === 'followers' ? followersRef : followingRef}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`profile-follow-dialog-tab-${tab.key}-panel`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(event) => handleKeyDown(event, tab.key)}
              onClick={() => onChange(tab.key)}
              className={[
                'flex h-full flex-1 items-center justify-center border-b-2 text-center text-sm font-medium leading-5 tracking-wide transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 focus-visible:rounded-sm',
                isActive
                  ? 'border-brick text-brick'
                  : 'border-transparent text-ink-3 hover:text-ink',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
