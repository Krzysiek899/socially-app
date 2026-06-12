import React from 'react';
import { Bell } from 'lucide-react';
import { Avatar } from '../Avatar/Avatar.tsx';
import { Button } from '../Button/Button.tsx';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle.tsx';
import { TopNav } from '../TopNav/TopNav.tsx';
import { t } from '../../../i18n/index.ts';

type AppNavKey = 'discover' | 'my-events' | 'profile';

export interface AppNavbarProps {
  active?: AppNavKey;
}

export function AppNavbar({ active = 'discover' }: AppNavbarProps): React.JSX.Element {
  return (
    <TopNav>
      <TopNav.Brand>Socially</TopNav.Brand>
      <TopNav.NavLink href="/app" active={active === 'discover'}>{t('discover.nav.discover')}</TopNav.NavLink>
      <TopNav.NavLink href="#my-events" active={active === 'my-events'}>{t('discover.nav.my_events')}</TopNav.NavLink>
      <TopNav.NavLink href="/app/profile" active={active === 'profile'}>{t('discover.nav.profile')}</TopNav.NavLink>
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
        <Avatar name={t('discover.nav.profile')} size="sm" />
        <ThemeToggle />
      </TopNav.Actions>
    </TopNav>
  );
}