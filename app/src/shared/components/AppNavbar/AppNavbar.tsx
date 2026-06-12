import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Avatar/Avatar.tsx';
import { Button } from '../Button/Button.tsx';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle.tsx';
import { TopNav } from '../TopNav/TopNav.tsx';
import { t } from '../../../i18n/index.ts';
import './AppNavbar.css';

type AppNavKey = 'discover' | 'my-events' | 'profile';

export interface AppNavbarProps {
  active?: AppNavKey;
}

export function AppNavbar({ active = 'discover' }: AppNavbarProps): React.JSX.Element {
  const navigate = useNavigate();
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isProfileMenuOpen]);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((current) => !current);
  };

  const handleOpenProfile = () => {
    setIsProfileMenuOpen(false);
    navigate('/app/profile');
  };

  return (
    <TopNav>
      <TopNav.Brand>Socially</TopNav.Brand>
      <TopNav.NavLink href="/app" active={active === 'discover'}>{t('discover.nav.discover')}</TopNav.NavLink>
      <TopNav.NavLink href="#my-events" active={active === 'my-events'}>{t('discover.nav.my_events')}</TopNav.NavLink>
      <TopNav.Actions>
        <Button type="button" size="sm">{t('discover.nav.create_event')}</Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label={t('discover.nav.notifications')}
        >
          <Bell size={16} />
        </Button>
        <div className="app-navbar__profile-menu" ref={menuRef}>
          <button
            type="button"
            className="app-navbar__profile-trigger"
            aria-label={t('profile.menu.toggle')}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={toggleProfileMenu}
          >
            <Avatar name={t('discover.nav.profile')} size="sm" />
          </button>
          {isProfileMenuOpen ? (
            <div className="app-navbar__profile-dropdown" role="menu">
              <div className="app-navbar__profile-dropdown-actions">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="app-navbar__profile-menu-action"
                  onClick={handleOpenProfile}
                >
                  {t('profile.actions.view_profile')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="app-navbar__profile-menu-action"
                >
                  {t('profile.actions.logout')}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <ThemeToggle />
      </TopNav.Actions>
    </TopNav>
  );
}