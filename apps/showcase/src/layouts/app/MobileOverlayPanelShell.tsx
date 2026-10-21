import { type ReactNode } from 'react';

import { MobilePanelShell } from '../../components/overlay';

import type { AppMobileHeaderConfig } from './AppMobileHeader';

export type MobileOverlayPanelShellProps = {
  children: ReactNode;
  contentClassName?: string;
  getReturnFocusElement?: () => HTMLElement | null;
  headerConfig: AppMobileHeaderConfig | null;
  onClose: () => void;
  title: ReactNode;
  titleId: string;
  ariaDescribedBy?: string;
};

function mapHeaderConfig(
  headerConfig: AppMobileHeaderConfig,
  onClose: () => void,
  closeLabel: string,
) {
  return {
    back: headerConfig.titleAction
      ? {
          ariaLabel: headerConfig.titleAction.ariaLabel,
          onBack: headerConfig.titleAction.onClick,
        }
      : undefined,
    closeLabel: headerConfig.trailingAction?.ariaLabel ?? closeLabel,
    onClose: headerConfig.trailingAction?.onClick ?? onClose,
    primaryAction:
      headerConfig.primaryAction?.kind === 'button'
        ? {
            ariaLabel: headerConfig.primaryAction.ariaLabel,
            badgeCount: headerConfig.primaryAction.badgeCount,
            badgeMax: headerConfig.primaryAction.badgeMax,
            iconName: headerConfig.primaryAction.iconName,
            onClick: headerConfig.primaryAction.onClick,
          }
        : undefined,
    title: headerConfig.title ?? '',
  };
}

export function MobileOverlayPanelShell({
  children,
  contentClassName,
  getReturnFocusElement,
  headerConfig,
  onClose,
  title,
  titleId,
  ariaDescribedBy,
}: MobileOverlayPanelShellProps) {
  const closeLabel = headerConfig?.trailingAction?.ariaLabel ?? 'Close';
  const resolvedHeader = headerConfig
    ? mapHeaderConfig(headerConfig, onClose, closeLabel)
    : null;

  return (
    <MobilePanelShell
      back={resolvedHeader?.back}
      closeLabel={resolvedHeader?.closeLabel ?? closeLabel}
      contentClassName={contentClassName}
      desktopVisibility="hidden"
      getReturnFocusElement={getReturnFocusElement}
      onClose={resolvedHeader?.onClose ?? onClose}
      primaryAction={resolvedHeader?.primaryAction}
      showHeader={resolvedHeader != null}
      title={resolvedHeader?.title ?? String(title)}
      titleId={titleId}
      viewport="app-shell"
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </MobilePanelShell>
  );
}
