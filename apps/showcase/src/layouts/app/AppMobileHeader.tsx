import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { type MobileSearchRouteConfig } from './mobileHeaderRoutes';
import { resolveMobileHeaderTitle } from './mobileHeaderTitle';
import { useAppMobileHeaderSearch } from './useAppMobileHeaderSearch';
import { useSyncMobileHeaderSearchMode } from './MobileHeaderSearchModeContext';
import { HeaderScrim } from '../../components/layout';
import { HeaderBackCapsule } from '../../components/overlay/HeaderBackCapsule';
import {
  CapsuleActionGroup,
  type CapsuleActionButtonProps,
  type CapsuleActionTone,
  type IconName,
} from '../../components/primitives';
import { pageTitleChangeEventName } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

interface AppMobileHeaderButtonAction {
  ariaLabel: string;
  badgeCount?: number;
  badgeMax?: number;
  className?: string;
  disabled?: boolean;
  iconName: IconName;
  onClick: () => void;
  tone?: CapsuleActionTone;
}

interface AppMobileHeaderSearchAction {
  ariaLabel: string;
  kind: 'search';
  search: MobileSearchRouteConfig | null;
}

interface AppMobileHeaderButtonPrimaryAction extends AppMobileHeaderButtonAction {
  kind: 'button';
}

interface AppMobileHeaderTitleAction {
  ariaLabel: string;
  onClick: () => void;
}

export interface AppMobileHeaderConfig {
  leadingAction?: AppMobileHeaderButtonAction | null;
  primaryAction?:
    AppMobileHeaderSearchAction | AppMobileHeaderButtonPrimaryAction | null;
  title?: string;
  titleAction?: AppMobileHeaderTitleAction | null;
  trailingAction?: AppMobileHeaderButtonAction | null;
}

interface AppMobileHeaderProps {
  config?: AppMobileHeaderConfig;
  embedded?: boolean;
}

const defaultMobileHeaderConfig: AppMobileHeaderConfig = {};

export function AppMobileHeader({
  config = defaultMobileHeaderConfig,
  embedded = false,
}: AppMobileHeaderProps) {
  const location = useLocation();

  return (
    <AppMobileHeaderContent
      key={location.pathname}
      config={config}
      embedded={embedded}
    />
  );
}

function AppMobileHeaderContent({
  config,
  embedded,
}: Required<AppMobileHeaderProps>) {
  const { t } = useI18n();
  const appName = t('app.name', { fallback: 'TowelBooks' });
  const searchPrimaryAction =
    config.primaryAction?.kind === 'search' ? config.primaryAction : null;
  const searchRouteConfig = searchPrimaryAction?.search ?? null;
  const [pageTitle, setPageTitle] = useState(() =>
    resolveMobileHeaderTitle(document.title, appName),
  );
  const titleRegionRef = useRef<HTMLDivElement>(null);
  const capsuleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSearchEnabled = searchPrimaryAction !== null;
  const {
    closeSearch,
    isCapsuleExpanded,
    openSearch,
    searchValue,
    setSearchDraft,
  } = useAppMobileHeaderSearch({
    inputRef,
    capsuleRef,
    searchRouteConfig,
    isSearchEnabled,
  });
  useSyncMobileHeaderSearchMode(isCapsuleExpanded);
  const shouldRenderActionGroup =
    config.leadingAction != null ||
    config.primaryAction != null ||
    config.trailingAction != null;
  const titleAction = config.titleAction ?? null;
  const hasTitleAction = titleAction != null;
  const isTitleActionInteractive = hasTitleAction && !isCapsuleExpanded;

  useLayoutEffect(() => {
    const syncPageTitle = () => {
      setPageTitle(resolveMobileHeaderTitle(document.title, appName));
    };

    syncPageTitle();

    window.addEventListener(pageTitleChangeEventName, syncPageTitle);

    return () => {
      window.removeEventListener(pageTitleChangeEventName, syncPageTitle);
    };
  }, [appName]);

  const blurHeaderControlAfterTouch = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse') {
        return;
      }

      const target = event.currentTarget;
      window.requestAnimationFrame(() => {
        target.blur();
      });
    },
    [],
  );

  useLayoutEffect(() => {
    const titleRegion = titleRegionRef.current;

    if (titleRegion === null) {
      return;
    }

    if (isCapsuleExpanded) {
      titleRegion.setAttribute('inert', '');

      return () => {
        titleRegion.removeAttribute('inert');
      };
    }

    titleRegion.removeAttribute('inert');
  }, [isCapsuleExpanded]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSearch();
    }
  };

  let primaryActionButtonProps: CapsuleActionButtonProps | undefined;
  let primaryIconName: IconName | undefined;

  if (config.primaryAction?.kind === 'search') {
    primaryActionButtonProps = {
      'aria-label': config.primaryAction.ariaLabel,
      onPointerUp: blurHeaderControlAfterTouch,
      onClick: openSearch,
    };
    primaryIconName = 'search';
  } else if (config.primaryAction?.kind === 'button') {
    primaryActionButtonProps = {
      'aria-label': config.primaryAction.ariaLabel,
      disabled: config.primaryAction.disabled,
      onPointerUp: blurHeaderControlAfterTouch,
      onClick: config.primaryAction.onClick,
    };
    primaryIconName = config.primaryAction.iconName;
  }

  const trailingActionButtonProps =
    config.trailingAction == null
      ? undefined
      : {
          'aria-label': config.trailingAction.ariaLabel,
          onPointerUp: blurHeaderControlAfterTouch,
          onClick: config.trailingAction.onClick,
        };

  const leadingActionButtonProps =
    config.leadingAction == null || isCapsuleExpanded
      ? undefined
      : {
          'aria-label': config.leadingAction.ariaLabel,
          disabled: config.leadingAction.disabled,
          onPointerUp: blurHeaderControlAfterTouch,
          onClick: config.leadingAction.onClick,
        };

  const visibleTitle = config.title ?? pageTitle;
  const HeaderContainer = embedded ? 'div' : 'header';

  return (
    <HeaderContainer
      className={[
        'app-mobile-header',
        embedded
          ? 'sticky inset-x-0 top-0 z-20 lg:hidden'
          : 'fixed inset-x-0 top-0 z-20 lg:hidden',
        'pt-[env(safe-area-inset-top)]',
      ].join(' ')}
    >
      {embedded ? null : <HeaderScrim />}
      <div
        className={[
          'relative z-30 flex h-[var(--app-mobile-header-height)] items-center px-4 sm:px-3 lg:px-4 transition-[gap] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
          isCapsuleExpanded ? 'gap-0' : 'gap-3',
        ].join(' ')}
      >
        <div
          ref={titleRegionRef}
          aria-hidden={isCapsuleExpanded}
          className={[
            'min-w-0 overflow-visible transition-[opacity,transform,flex] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            isCapsuleExpanded
              ? 'pointer-events-none flex-[0_1_0%] -translate-x-2 scale-[0.85] opacity-0'
              : 'pointer-events-auto flex-[1_1_0%] translate-x-0 scale-100 opacity-100',
          ].join(' ')}
        >
          <span className="flex min-w-0 items-center app-text-mobile-header-title text-ink">
            <span
              className={[
                'flex min-w-0 items-center transition-[gap] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                hasTitleAction ? 'gap-1' : 'gap-0',
              ].join(' ')}
            >
              <span
                aria-hidden={!hasTitleAction}
                className={[
                  'inline-flex shrink-0 items-center justify-center overflow-visible transition-[width,opacity,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                  hasTitleAction
                    ? 'h-10 w-10 translate-x-0 opacity-100'
                    : 'h-0 w-0 -translate-x-2 opacity-0',
                  isTitleActionInteractive
                    ? ''
                    : hasTitleAction
                      ? 'pointer-events-none opacity-0'
                      : '',
                ].join(' ')}
              >
                {hasTitleAction ? (
                  <HeaderBackCapsule
                    ariaLabel={titleAction.ariaLabel}
                    className="app-mobile-header__actions app-mobile-header__back-capsule app-mobile-header__settings-back-button"
                    disabled={!isTitleActionInteractive}
                    tabIndex={isTitleActionInteractive ? undefined : -1}
                    onClick={titleAction.onClick}
                  />
                ) : null}
              </span>
              <span className="min-w-0 truncate">{visibleTitle}</span>
            </span>
          </span>
        </div>
        <div
          className={[
            'flex min-w-0 items-center justify-end gap-2 transition-[flex] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
            isCapsuleExpanded ? 'flex-[1_1_0%]' : 'flex-[0_0_auto]',
          ].join(' ')}
        >
          {shouldRenderActionGroup ? (
            <CapsuleActionGroup
              ref={capsuleRef}
              className={[
                'app-mobile-header__actions',
                isCapsuleExpanded ? 'w-full' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              expanded={isCapsuleExpanded}
              inputRef={inputRef}
              leadingButtonProps={leadingActionButtonProps}
              leadingIconName={config.leadingAction?.iconName}
              leadingTone={
                config.leadingAction == null
                  ? undefined
                  : (config.leadingAction.tone ?? 'destructive')
              }
              primaryBadgeCount={
                config.primaryAction?.kind === 'button'
                  ? config.primaryAction.badgeCount
                  : undefined
              }
              primaryBadgeMax={
                config.primaryAction?.kind === 'button'
                  ? config.primaryAction.badgeMax
                  : undefined
              }
              primaryIconName={primaryIconName}
              searchButtonProps={primaryActionButtonProps}
              searchInputProps={
                isSearchEnabled
                  ? {
                      'aria-label': t('shell.action.search'),
                      placeholder: t('shell.action.searchPlaceholder'),
                      value: searchValue,
                      onChange: (event) => setSearchDraft(event.target.value),
                      onKeyDown: handleInputKeyDown,
                    }
                  : undefined
              }
              previewButtonProps={trailingActionButtonProps}
              previewIconName={config.trailingAction?.iconName}
              cancelButtonProps={
                isSearchEnabled
                  ? {
                      'aria-label': t('shell.action.closeSearch'),
                      onPointerUp: blurHeaderControlAfterTouch,
                      onClick: closeSearch,
                    }
                  : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </HeaderContainer>
  );
}
