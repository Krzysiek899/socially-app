import React from 'react';
import { CalendarDays, MapPinned, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, TopNav } from '../../components/index.ts';
import { useAppSelector } from '../../app/hooks.ts';
import { fetchDiscoverEventByIdRequest } from './discoverApi.ts';
import type { DiscoverEvent } from './discoverContracts.ts';
import { t } from '../../i18n/index.ts';
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

export const EventDetailsPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const token = useAppSelector((state) => state.auth.session?.token);
  const [status, setStatus] = React.useState<LoadStatus>('loading');
  const [errorKey, setErrorKey] = React.useState<string | null>(null);
  const [event, setEvent] = React.useState<DiscoverEvent | null>(null);

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
      <TopNav>
        <TopNav.Brand>Socially</TopNav.Brand>
        <TopNav.NavLink href="/app">{t('discover.nav.discover')}</TopNav.NavLink>
        <TopNav.NavLink href="#my-events">{t('discover.nav.my_events')}</TopNav.NavLink>
        <TopNav.Actions>
          <Button type="button" variant="secondary" onClick={() => navigate('/app')}>
            {t('discover.details.back')}
          </Button>
        </TopNav.Actions>
      </TopNav>

      <section className="event-details__content">
        {status === 'loading' && <p>{t('discover.details.loading')}</p>}
        {status === 'failed' && <p role="alert">{t(errorKey ?? 'discover.errors.fetch_failed')}</p>}
        {status === 'succeeded' && event && (
          <article className="event-details__card">
            {event.photoUrl && <img src={event.photoUrl} alt={event.title} className="event-details__image" />}
            <div className="event-details__header">
              <h1>{event.title}</h1>
              <Badge variant="info">{t(`discover.category.${event.category}`)}</Badge>
            </div>
            <p className="event-details__description">{event.description}</p>
            <div className="event-details__meta">
              <span><CalendarDays size={16} />{formatDateTime(event.dateTime)}</span>
              <span><MapPinned size={16} />{formatAddress(event)}</span>
              <span><Users size={16} />{event.attendeesCount}</span>
            </div>
            <div className="event-details__organizer">
              <Avatar name={event.organizer.displayName} src={event.organizer.avatarUrl} />
              <div>
                <strong>{event.organizer.displayName}</strong>
                <p>{formatPrice(event)}</p>
              </div>
            </div>
            <Button type="button">{t('discover.details.join')}</Button>
          </article>
        )}
      </section>
    </main>
  );
};
