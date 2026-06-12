import React from 'react';
import { AppNavbar, Button } from '../../../shared/components/index.ts';
import { Page, Section, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import '../ProfilePage.css';

type ProfileSurfaceProps = {
  activeNav?: 'discover' | 'my-events' | 'profile';
  showAppNavbar?: boolean;
  heading?: string;
  isContentReady: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  errorKey: string | null;
  onRetry: () => void;
  children?: React.ReactNode;
};

export const ProfileSurface = ({
  activeNav = 'profile',
  showAppNavbar = true,
  heading,
  isContentReady,
  status,
  errorKey,
  onRetry,
  children,
}: ProfileSurfaceProps): React.JSX.Element => (
  <main className="profile-page">
    {showAppNavbar ? <AppNavbar active={activeNav} /> : null}

    <Page maxWidth="xl">
      <Section spacing="sm">
        <Stack gap="4">
          {heading ? <h1 className="profile-page__screen-title">{heading}</h1> : null}
          {status === 'loading' && (
            <p className="profile-page__state">{t('profile.state.loading')}</p>
          )}
          {status === 'failed' && (
            <section className="profile-page__state-card" aria-label={t('profile.state.error_title')}>
              <Stack gap="2">
                <h1>{t('profile.state.error_title')}</h1>
                <p role="alert">{t(errorKey ?? 'profile.errors.fetch_failed')}</p>
                <div>
                  <Button type="button" size="sm" onClick={onRetry}>
                    {t('profile.actions.retry')}
                  </Button>
                </div>
              </Stack>
            </section>
          )}
          {status === 'succeeded' && isContentReady ? children : null}
        </Stack>
      </Section>
    </Page>
  </main>
);
