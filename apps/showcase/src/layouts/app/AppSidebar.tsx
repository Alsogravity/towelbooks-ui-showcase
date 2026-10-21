import { useRef } from 'react';

import { AppSidebarHeader } from './AppSidebarHeader';
import { AppSidebarNav } from './AppSidebarNav';
import { AppSidebarUserMenu } from './AppSidebarUserMenu';
import { useI18n } from '../../i18n';

import type {
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
} from 'react';

interface AppSidebarProps {
  enableNotifications?: boolean;
  isDocked: boolean;
  isCollapsed: boolean;
  onFocusWithinChange: (isFocusWithin: boolean) => void;
  onMenuOpenChange: (isOpen: boolean) => void;
  onMenuSelect: () => void;
  onLogout: () => void | Promise<void>;
  onMouseEnter: () => void;
  onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
}

export function AppSidebar({
  enableNotifications = true,
  isDocked,
  isCollapsed,
  onFocusWithinChange,
  onMenuOpenChange,
  onMenuSelect,
  onLogout,
  onMouseEnter,
  onMouseLeave,
}: AppSidebarProps) {
  const { t } = useI18n();
  const isKeyboardFocusRef = useRef(false);

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      !(nextFocusedElement instanceof Node) ||
      !event.currentTarget.contains(nextFocusedElement)
    ) {
      onFocusWithinChange(false);
    }
  };

  const handleFocusCapture = () => {
    if (!isKeyboardFocusRef.current) {
      return;
    }

    onFocusWithinChange(true);
  };

  const handleKeyDownCapture = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab') {
      isKeyboardFocusRef.current = true;
    }
  };

  return (
    <aside
      className={[
        'hidden flex-col overflow-x-visible px-3 py-5 transition-[width] transition-[background-color,border-color] duration-200 ease-in-out lg:flex',
        isDocked
          ? 'lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:shrink-0 lg:self-start lg:border-r lg:border-rule'
          : 'fixed inset-y-0 left-0 z-30 h-screen',
        isCollapsed
          ? 'w-[72px] bg-transparent border-r-transparent'
          : 'bg-paper lg:bg-paper/85 backdrop-blur-md w-[240px]',
      ].join(' ')}
      onBlurCapture={handleBlurCapture}
      onFocusCapture={handleFocusCapture}
      onKeyDownCapture={handleKeyDownCapture}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDownCapture={() => {
        isKeyboardFocusRef.current = false;
      }}
    >
      <AppSidebarHeader />

      <nav
        className="flex flex-1 flex-col justify-center gap-1"
        aria-label={t('shell.primaryNav')}
      >
        <AppSidebarNav
          enableNotifications={enableNotifications}
          isCollapsed={isCollapsed}
        />
      </nav>

      <AppSidebarUserMenu
        isCollapsed={isCollapsed}
        onMenuOpenChange={onMenuOpenChange}
        onMenuSelect={onMenuSelect}
        onLogout={onLogout}
      />
    </aside>
  );
}
