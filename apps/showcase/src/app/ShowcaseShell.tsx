import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Avatar, Button, Icon, type IconName } from '@towelbooks/ui';
import { useI18n } from '../i18n';
import type { CopyKey } from '../i18n/copy';
import { useDemo } from '../demo/DemoContext';
const navigation: { to: string; key: CopyKey; icon: IconName }[] = [
  { to: '/demo', key: 'home', icon: 'nav-home' },
  { to: '/demo/catalog', key: 'catalog', icon: 'nav-books' },
  { to: '/demo/library', key: 'library', icon: 'library-glyph' },
  { to: '/demo/collections', key: 'collections', icon: 'bookmark' },
  { to: '/demo/rooms', key: 'rooms', icon: 'users-glyph' },
];
export function ShowcaseShell() {
  const { ui } = useI18n();
  const { theme, setTheme } = useDemo();
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0);
      main.current?.focus();
      previousPath.current = pathname;
    }
  }, [pathname]);
  return (
    <div className={`showcase-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">
        {ui('explore')}
      </a>
      <aside className="showcase-sidebar">
        <Link to="/" className="sidebar-brand" aria-label="TowelBooks">
          <img src="/assets/brand/mark.svg" alt="" width="30" height="36" />
          <span>TowelBooks</span>
        </Link>
        <Button
          className="sidebar-collapse"
          variant="icon"
          icon={collapsed ? 'panel-left-open' : 'panel-left-close'}
          aria-label={ui(collapsed ? 'expandSidebar' : 'collapseSidebar')}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        />
        <nav aria-label={ui('explore')} className="sidebar-navigation">
          {navigation.map((item) => (
            <NavLink
              end={item.to === '/demo'}
              to={item.to}
              key={item.key}
              title={ui(item.key)}
            >
              <Icon name={item.icon} size={23} />
              <span>{ui(item.key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/demo/states" title={ui('previews')}>
            <Icon name="layout-grid" size={21} />
            <span>{ui('previews')}</span>
          </NavLink>
          <NavLink to="/demo/settings" title={ui('settings')}>
            <Icon name="settings" size={21} />
            <span>{ui('settings')}</span>
          </NavLink>
          <NavLink
            to="/demo/profile"
            className="sidebar-profile"
            title={ui('profile')}
          >
            <Avatar initial="M" size="sm" />
            <span>
              Marina Costa<small>@marina.demo</small>
            </span>
          </NavLink>
        </div>
      </aside>
      <header className="mobile-header">
        <Link to="/" aria-label="TowelBooks">
          <img src="/assets/brand/mark.svg" alt="" width="26" height="30" />
        </Link>
        <Link to="/demo/profile">Marina</Link>
        <Link to="/demo/settings" aria-label={ui('settings')}>
          <Icon name="settings" size={22} />
        </Link>
        <Button
          icon={theme === 'light' ? 'moon' : 'sun'}
          variant="icon"
          aria-label={ui(theme === 'light' ? 'dark' : 'light')}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </header>
      <main
        id="main-content"
        ref={main}
        tabIndex={-1}
        className="showcase-main"
      >
        <Outlet />
      </main>
      <nav className="mobile-navigation" aria-label={ui('explore')}>
        {navigation.map((item) => (
          <NavLink end={item.to === '/demo'} to={item.to} key={item.key}>
            <Icon name={item.icon} size={22} />
            <span>{ui(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
