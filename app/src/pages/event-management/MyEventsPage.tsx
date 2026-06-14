import * as React from 'react';
import { CalendarDays, MapPinned, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppNavbar, Badge, Button, Card } from '../../shared/components/index.ts';
import { Cluster, Grid, Page, Section, Stack } from '../../shared/layout/index.tsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import {
  fetchAuthoredEvents,
  fetchParticipatingEvents,
  leaveEventParticipation,
} from '../../redux/eventManagement/eventManagementSlice.ts';
import type { AuthoredEvent } from './domain/eventManagementModels.ts';
import { t } from '../../i18n/index.ts';
import './MyEventsPage.css';

const formatDateTime = (isoDateTime: string): string =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDateTime));

const formatAddress = (event: AuthoredEvent): string => {
  const postalCode = event.address.postalCode ? `${event.address.postalCode} ` : '';
  return `${event.address.street} ${event.address.buildingNumber}, ${postalCode}${event.address.city}`;
};

const formatPrice = (event: AuthoredEvent): string => {
  if (event.price.isFree) {
    return t('discover.card.price.free');
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: event.price.currency,
    maximumFractionDigits: 0,
  }).format(event.price.amount);
};

export const MyEventsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    authoredItems,
    authoredStatus,
    authoredErrorKey,
    participatingItems,
    participatingStatus,
    participatingErrorKey,
  } = useAppSelector((state) => state.eventManagement);

  React.useEffect(() => {
    void dispatch(fetchAuthoredEvents());
    void dispatch(fetchParticipatingEvents());
  }, [dispatch]);

  return (
    <main className="my-events-page">
      <AppNavbar active="my-events" />

      <Page maxWidth="xl">
        <Section spacing="sm">
          <Stack gap="3">
            <header className="my-events-page__header">
              <h1>{t('eventManagement.my_events.title')}</h1>
              <p>{t('eventManagement.my_events.subtitle')}</p>
              <Cluster gap="2">
                <Button type="button" onClick={() => navigate('/events/create')}>
                  {t('eventManagement.my_events.create_cta')}
                </Button>
              </Cluster>
            </header>

            {authoredStatus === 'loading' && <p className="my-events-page__state">{t('eventManagement.state.loading')}</p>}
            {authoredStatus === 'failed' && (
              <p className="my-events-page__state my-events-page__state--error" role="alert">
                {t(authoredErrorKey ?? 'eventManagement.errors.fetch_failed')}
              </p>
            )}
            {authoredStatus === 'succeeded' && authoredItems.length === 0 && (
              <p className="my-events-page__state">{t('eventManagement.state.empty')}</p>
            )}

            <section aria-label={t('eventManagement.my_events.organized.title')}>
              <Stack gap="3">
                <h2 className="my-events-page__section-title">{t('eventManagement.my_events.organized.title')}</h2>
                {authoredItems.length > 0 && (
                  <Grid columns={2} gap="3">
                    {authoredItems.map((event) => (
                      <Card
                        key={event.id}
                        as="article"
                        variant="default"
                        header={(
                          <Stack gap="2">
                            <Cluster justify="space-between" align="center">
                              <h3 className="my-events-page__card-title">{event.title}</h3>
                              <Cluster gap="1" align="center">
                                <Badge size="sm" variant="info">{t(`discover.category.${event.category}`)}</Badge>
                                <Badge size="sm" variant={event.management.isActive ? 'success' : 'neutral'}>
                                  {event.management.isActive ? t('eventManagement.manage.status.active') : t('eventManagement.manage.status.inactive')}
                                </Badge>
                              </Cluster>
                            </Cluster>
                            <p className="my-events-page__description">{event.description}</p>
                          </Stack>
                        )}
                      >
                        <Stack gap="2">
                          <Cluster gap="2" align="center">
                            <CalendarDays size={14} />
                            <span>{formatDateTime(event.dateTime)}</span>
                          </Cluster>
                          <Cluster gap="2" align="center">
                            <MapPinned size={14} />
                            <span>{formatAddress(event)}</span>
                          </Cluster>
                          <Cluster gap="2" align="center">
                            <Users size={14} />
                            <span>{event.attendeesCount}</span>
                            <span>{formatPrice(event)}</span>
                          </Cluster>
                          <Cluster justify="flex-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              onClick={() => navigate(`/my-events/${event.id}/manage`)}
                            >
                              {t('eventManagement.my_events.manage')}
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => navigate(`/events/${event.id}`)}>
                              {t('eventManagement.my_events.details')}
                            </Button>
                          </Cluster>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                )}
              </Stack>
            </section>

            <section aria-label={t('eventManagement.my_events.participating.title')}>
              <Stack gap="3">
                <h2 className="my-events-page__section-title">{t('eventManagement.my_events.participating.title')}</h2>
                {participatingStatus === 'loading' && (
                  <p className="my-events-page__state">{t('eventManagement.my_events.participating.loading')}</p>
                )}
                {participatingStatus === 'failed' && (
                  <p className="my-events-page__state my-events-page__state--error" role="alert">
                    {t(participatingErrorKey ?? 'eventManagement.errors.fetch_failed')}
                  </p>
                )}
                {participatingStatus === 'succeeded' && participatingItems.length === 0 && (
                  <p className="my-events-page__state">{t('eventManagement.my_events.participating.empty')}</p>
                )}
                {participatingItems.length > 0 && (
                  <Grid columns={2} gap="3">
                    {participatingItems.map((event) => (
                      <Card
                        key={event.id}
                        as="article"
                        variant="default"
                        header={(
                          <Stack gap="2">
                            <Cluster justify="space-between" align="center">
                              <h3 className="my-events-page__card-title">{event.title}</h3>
                              <Cluster gap="1" align="center">
                                <Badge size="sm" variant="info">{t(`discover.category.${event.category}`)}</Badge>
                                <Badge size="sm" variant={event.participation.state === 'pending' ? 'warning' : 'success'}>
                                  {event.participation.state === 'pending'
                                    ? t('eventManagement.my_events.participation.pending')
                                    : t('eventManagement.my_events.participation.joined')}
                                </Badge>
                              </Cluster>
                            </Cluster>
                            <p className="my-events-page__description">{event.description}</p>
                          </Stack>
                        )}
                      >
                        <Stack gap="2">
                          <Cluster gap="2" align="center">
                            <CalendarDays size={14} />
                            <span>{formatDateTime(event.dateTime)}</span>
                          </Cluster>
                          <Cluster gap="2" align="center">
                            <MapPinned size={14} />
                            <span>{formatAddress(event)}</span>
                          </Cluster>
                          <Cluster gap="2" align="center">
                            <Users size={14} />
                            <span>{event.attendeesCount}</span>
                            <span>{formatPrice(event)}</span>
                          </Cluster>
                          <Cluster justify="flex-end">
                            <Button type="button" size="sm" variant="secondary" onClick={() => navigate(`/events/${event.id}`)}>
                              {t('eventManagement.my_events.details')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                void dispatch(leaveEventParticipation(event.id));
                              }}
                            >
                              {t('eventManagement.my_events.leave')}
                            </Button>
                          </Cluster>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                )}
              </Stack>
            </section>
          </Stack>
        </Section>
      </Page>
    </main>
  );
};
