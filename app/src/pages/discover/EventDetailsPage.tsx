import React from 'react';
import { CalendarDays, CircleUserRound, Heart, MapPinned, Share2, Users, Wallet, ArrowLeft } from 'lucide-react'; 
import { useNavigate, useParams } from 'react-router-dom';
import { AppNavbar, Avatar, Badge, Button } from '../../shared/components/index.ts';
import { useAppSelector } from '../../redux/hooks.ts';
import { fetchDiscoverEventByIdRequest } from './api/discoverApi.ts';
import type { DiscoverEvent } from './domain/discoverModels.ts';
import { Cluster, Grid, Page, Section, Split, Stack } from '../../shared/layout/index.tsx';
import { t } from '../../i18n/index.ts';
import { useSmartBack } from '../../shared/hooks/useSmartBack.ts'; 
import './EventDetailsPage.css';

type LoadStatus = 'loading' | 'succeeded' | 'failed';

const formatDateTime = (isoDateTime: string): string =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDateTime));

const formatAddress = (event: DiscoverEvent): string => {
  const postalCode = event.address.postalCode ? `${event.address.postalCode} ` : '';
  return `${event.address.street} ${event.address.buildingNumber}, ${postalCode}${event.address.city}`;
};

const formatPrice = (event: DiscoverEvent): string => {
  if (event.price.isFree) {
    return t('discover.card.price.free');
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: event.price.currency,
    maximumFractionDigits: 0,
  }).format(event.price.amount);
};

const getDisplayAttendees = (event: DiscoverEvent) => event.attendees.slice(0, 6);

type MetaCardProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

const MetaCard = ({ icon, label, value }: MetaCardProps) => (
  <article className="event-details__meta-card">
    <span className="event-details__meta-icon" aria-hidden="true">{icon}</span>
    <div>
      <p className="event-details__meta-label">{label}</p>
      <p className="event-details__meta-value">{value}</p>
    </div>
  </article>
);

export const EventDetailsPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const token = useAppSelector((state) => state.auth.session?.token);
  const currentUserId = useAppSelector((state) => state.auth.session?.userId);
  const [status, setStatus] = React.useState<LoadStatus>('loading');
  const [errorKey, setErrorKey] = React.useState<string | null>(null);
  const [event, setEvent] = React.useState<DiscoverEvent | null>(null);
  const displayAttendees = React.useMemo(() => (event ? getDisplayAttendees(event) : []), [event]);
  const hiddenAttendeesCount = event ? Math.max(event.attendeesCount - displayAttendees.length, 0) : 0;

  const goBack = useSmartBack('/app');

  React.useEffect(() => {
    if (!eventId || !token) {
      setStatus('failed');
      setErrorKey('discover.errors.unauthorized');
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      setErrorKey(null);

      try {
        const response = await fetchDiscoverEventByIdRequest(eventId, token, controller.signal);
        setEvent(response);
        setStatus('succeeded');
      } catch (error) {
        setStatus('failed');
        if (error instanceof Error) {
          setErrorKey(error.message);
          return;
        }

        setErrorKey('discover.errors.fetch_failed');
      }
    };

    void load();

    return () => controller.abort();
  }, [eventId, token]);

  return (
    <main className="event-details">
      <AppNavbar active="discover" />

      <Page maxWidth="xl">
        <Section spacing="sm">
          <Stack gap="4">
            <Cluster justify="space-between" align="center" gap="2">
              <Button type="button" variant="secondary" size="sm" onClick={goBack}>
                <ArrowLeft size={16} style={{ marginRight: '6px' }} />
                {t('discover.details.back')}
              </Button>
              
              <Cluster gap="2">
                {event && currentUserId === event.organizer.id && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/app/my-events/${event.id}/manage`)}
                  >
                    {t('eventManagement.my_events.manage')}
                  </Button>
                )}
                <Button type="button" variant="secondary" size="sm" aria-label="Udostępnij wydarzenie">
                  <Share2 size={16} />
                </Button>
                <Button type="button" variant="secondary" size="sm" aria-label="Dodaj do ulubionych">
                  <Heart size={16} />
                </Button>
              </Cluster>
            </Cluster>

            {status === 'loading' && <p>{t('discover.details.loading')}</p>}
            {status === 'failed' && <p role="alert">{t(errorKey ?? 'discover.errors.fetch_failed')}</p>}
            
            {status === 'succeeded' && event && (
              <Stack gap="4">
                <header className="event-details__header">
                  <Badge variant="info">{t(`discover.category.${event.category}`)}</Badge>
                  <h1>{event.title}</h1>
                </header>

                {event.photoUrl && (
                  <Split fraction="2/3" gap="2">
                    <img src={event.photoUrl} alt={event.title} className="event-details__image event-details__image--primary" />
                    <img src={event.photoUrl} alt={event.title} className="event-details__image event-details__image--secondary" />
                  </Split>
                )}

                <Grid columns={4} gap="2">
                  <MetaCard
                    icon={<CalendarDays size={16} />}
                    label={t('eventManagement.manage.meta.when')}
                    value={formatDateTime(event.dateTime)}
                  />
                  <MetaCard
                    icon={<MapPinned size={16} />}
                    label={t('eventManagement.manage.meta.where')}
                    value={formatAddress(event)}
                  />
                  <MetaCard
                    icon={<Wallet size={16} />}
                    label={t('eventManagement.manage.meta.cost')}
                    value={formatPrice(event)}
                  />
                  <MetaCard
                    icon={<CircleUserRound size={16} />}
                    label={t('discover.details.organizer')}
                    value={(
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/app/users/${event.organizer.id}`)}
                      >
                        {event.organizer.displayName}
                      </Button>
                    )}
                  />
                </Grid>

                <Split fraction="2/3" gap="3">
                  <article className="event-details__description-card">
                    <Stack gap="3">
                      <h2>{t('eventManagement.form.description')}</h2>
                      <p className="event-details__description">{event.description}</p>
                    </Stack>
                  </article>

                  <aside className="event-details__attendees-card" aria-label={t('discover.card.attendees')}>
                    <Stack gap="3">
                      <Cluster justify="space-between" align="center">
                        <h2>{t('eventManagement.manage.participants.title')}</h2>
                        <Badge size="sm" variant="info">{displayAttendees.length}/{event.attendeesCount}</Badge>
                      </Cluster>

                      <Stack gap="2">
                        {displayAttendees.map((attendee) => (
                          <Cluster key={attendee.id} gap="2" align="center">
                            <Avatar name={attendee.displayName} src={attendee.avatarUrl} size="sm" />
                            <span className="event-details__attendee-name">{attendee.displayName}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/app/users/${attendee.id}`)}
                            >
                              {t('profile.actions.view_public')}
                            </Button>
                          </Cluster>
                        ))}
                        {hiddenAttendeesCount > 0 && (
                          <p className="event-details__attendees-overflow">+ {hiddenAttendeesCount} pozostałych uczestników</p>
                        )}
                        {displayAttendees.length === 0 && (
                          <p className="event-details__attendees-overflow">Brak uczestników</p>
                        )}
                      </Stack>
                    </Stack>
                  </aside>
                </Split>

                <footer className="event-details__footer">
                  <Button type="button" size="lg">
                    <Users size={16} />
                    {t('discover.details.join')}
                  </Button>
                </footer>
              </Stack>
            )}

          </Stack>
        </Section>
      </Page>
    </main>
  );
};