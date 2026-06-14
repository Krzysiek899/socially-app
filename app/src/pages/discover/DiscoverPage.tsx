import React, { useMemo, useRef } from 'react';
import { CalendarDays, MapPinned, Search, SlidersHorizontal, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { Accordion, AppNavbar, Avatar, Badge, Button, DateField, Dropdown, TextField, useNotifications } from '../../shared/components/index.ts';
import { t } from '../../i18n/index.ts';
import { Cluster, Grid, Page, Section, Split, Stack } from '../../shared/layout/index.tsx';
import { DiscoverMap } from './DiscoverMap.tsx';
import {
  categoriesSet,
  dateFromSet,
  dateToSet,
  fetchDiscoverEvents,
  geolocationFailed,
  geolocationRequestStarted,
  geolocationResolved,
  hereNowToggled,
  priceFilterSet,
  searchQuerySet,
  selectedEventSet,
} from '../../redux/discover/discoverSlice.ts';
import type { DiscoverCategoryCode, DiscoverEvent } from './domain/discoverModels.ts';
import { DISCOVER_CATEGORY_CODES } from './domain/discoverModels.ts';
import './DiscoverPage.css';

const CATEGORY_OPTIONS = DISCOVER_CATEGORY_CODES.map((category) => ({
  value: category,
  label: t(`discover.category.${category}`),
}));

const PRICE_OPTIONS = [
  { value: 'all', label: t('discover.filters.price.all') },
  { value: 'free', label: t('discover.filters.price.free') },
  { value: 'paid', label: t('discover.filters.price.paid') },
] as const;

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

const formatDateTime = (isoDateTime: string): string =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDateTime));

const formatAddress = (event: DiscoverEvent): string => {
  const postalCode = event.address.postalCode ? `${event.address.postalCode} ` : '';
  return `${event.address.street} ${event.address.buildingNumber}, ${postalCode}${event.address.city}`;
};

const getDisplayedAttendees = (attendees: DiscoverEvent['attendees']) => attendees.slice(0, 8);

export const DiscoverPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const { items, status, errorKey, selectedEventId, filters } = useAppSelector((state) => state.discover);
  const prevSearchRef = useRef(filters.searchQuery);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = React.useState(false);

  React.useEffect(() => {
    const searchChanged = prevSearchRef.current !== filters.searchQuery;
    prevSearchRef.current = filters.searchQuery;

    const delay = searchChanged ? 300 : 0;
    const timer = window.setTimeout(() => {
      void dispatch(fetchDiscoverEvents());
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    dispatch,
    filters.categories,
    filters.dateFrom,
    filters.dateTo,
    filters.price,
    filters.searchQuery,
  ]);

  React.useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    const selectedItem = itemRefs.current.get(selectedEventId);
    selectedItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedEventId]);

  const toggleCategory = (category: DiscoverCategoryCode) => {
    if (filters.categories.includes(category)) {
      dispatch(categoriesSet(filters.categories.filter((value) => value !== category)));
      return;
    }

    dispatch(categoriesSet([...filters.categories, category]));
  };

  const registerItemRef = (eventId: string) => (element: HTMLLIElement | null) => {
    if (element) {
      itemRefs.current.set(eventId, element);
      return;
    }

    itemRefs.current.delete(eventId);
  };

  const requestUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      dispatch(geolocationFailed());
      notify({ variant: 'error', message: t('discover.here_now.toast.unavailable') });
      void dispatch(fetchDiscoverEvents());
      return;
    }

    dispatch(geolocationRequestStarted());
    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(geolocationResolved({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        void dispatch(fetchDiscoverEvents());
      },
      (error) => {
        dispatch(geolocationFailed());
        notify({
          variant: 'error',
          message: error.code === error.PERMISSION_DENIED
            ? t('discover.here_now.toast.permission_denied')
            : t('discover.here_now.toast.error'),
        });
        void dispatch(fetchDiscoverEvents());
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 60000 },
    );
  }, [dispatch, notify]);

  const accordionItems = useMemo(
    () =>
      items.map((event) => {
        const displayedAttendees = getDisplayedAttendees(event.attendees);
        const overflow = event.attendees.length - displayedAttendees.length;

        return {
          id: event.id,
          heading: (
            <div className="discover-accordion__heading">
              <strong>{event.title}</strong>
              <span><CalendarDays size={14} aria-hidden="true" />{formatDateTime(event.dateTime)}</span>
              <span>{formatPrice(event)}</span>
              <span><Users size={14} aria-hidden="true" />{event.attendeesCount}</span>
            </div>
          ),
          content: (
            <Stack gap="2" align="stretch" as="div" style={{ width: '100%' }}>
              <p>{event.description}</p>
              <div className="discover-card__meta">
                <Stack gap="2">
                  <span><MapPinned size={14} aria-hidden="true" />{formatAddress(event)}</span>
                </Stack>
              </div>
              <div className="discover-card__organizer">
                <Cluster gap="2" align="center">
                  <Avatar name={event.organizer.displayName} src={event.organizer.avatarUrl} size="sm" />
                  <span>{event.organizer.displayName}</span>
                  <Badge variant="info" size="sm">{t(`discover.category.${event.category}`)}</Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/app/users/${event.organizer.id}`)}
                  >
                    {t('profile.actions.view_public')}
                  </Button>
                </Cluster>
              </div>
              <div className="discover-card__attendees" aria-label={t('discover.card.attendees')}>
                <Cluster gap="1" align="center">
                  {displayedAttendees.map((attendee) => (
                    <Avatar
                      key={attendee.id}
                      name={attendee.displayName}
                      src={attendee.avatarUrl}
                      size="sm"
                    />
                  ))}
                  {overflow > 0 && <Badge size="sm">+{overflow}</Badge>}
                </Cluster>
              </div>
              <div className="discover-card__actions">
                <Cluster justify="flex-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => navigate(`/app/events/${event.id}`)}
                  >
                    {t('discover.card.join')}
                  </Button>
                </Cluster>
              </div>
            </Stack>
          ),
        };
      }),
    [items],
  );
  const accordionItemsById = useMemo(
    () => new Map(accordionItems.map((item) => [item.id, item])),
    [accordionItems],
  );

  return (
    <main className="discover">
      <AppNavbar active="discover" />

      <Page maxWidth="full">
        <Section spacing="sm">
        <div className="discover__layout">
          <Split fraction="2/3" gap="3">
            <aside className="discover__map-panel" aria-label={t('discover.map.label')}>
              <DiscoverMap
                events={items}
                selectedEventId={selectedEventId}
                onSelectEvent={(eventId) => dispatch(selectedEventSet(eventId))}
              />
            </aside>

            <section className="discover__list-column">
              <Stack gap="2">
                <header className="discover__header">
                  <h1 id="discover-title">{t('discover.title')}</h1>
                </header>

                <section className="discover__filters" aria-label={t('discover.filters.label')}>
                  <Grid columns={3} gap="2">
                    <TextField
                      id="discover-search"
                      label={t('discover.filters.search')}
                      value={filters.searchQuery}
                      placeholder={t('discover.filters.search.placeholder')}
                      leadingIcon={<Search size={16} />}
                      onChange={(event) => dispatch(searchQuerySet(event.target.value))}
                    />
                    <Dropdown
                      id="discover-price"
                      label={t('discover.filters.price')}
                      options={PRICE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                      value={filters.price}
                      onChange={(event) => dispatch(priceFilterSet(event.target.value as 'all' | 'free' | 'paid'))}
                    />
                    <Cluster align="end" justify="flex-start">
                      <Button
                        type="button"
                        size="sm"
                        variant={advancedFiltersVisible ? 'primary' : 'secondary'}
                        onClick={() => setAdvancedFiltersVisible((value) => !value)}
                        aria-label={t('discover.filters.advanced')}
                      >
                        <SlidersHorizontal size={16} />
                      </Button>
                    </Cluster>
                  </Grid>
                  {advancedFiltersVisible && (
                    <Grid columns={2} gap="2">
                      <DateField
                        id="discover-date-from"
                        label={t('discover.filters.date.from')}
                        value={filters.dateFrom}
                        max={filters.dateTo || undefined}
                        onChange={(event) => dispatch(dateFromSet(event.target.value))}
                      />
                      <DateField
                        id="discover-date-to"
                        label={t('discover.filters.date.to')}
                        value={filters.dateTo}
                        min={filters.dateFrom || undefined}
                        onChange={(event) => dispatch(dateToSet(event.target.value))}
                      />
                    </Grid>
                  )}
                  <label className="discover__here-now-toggle">
                    <input
                      type="checkbox"
                      checked={filters.hereNowEnabled}
                      onChange={(event) => {
                        const enabled = event.target.checked;
                        dispatch(hereNowToggled(enabled));
                        if (enabled) {
                          requestUserLocation();
                          return;
                        }

                        void dispatch(fetchDiscoverEvents());
                      }}
                    />
                    {t('discover.filters.here_now')}
                  </label>
                  <div className="discover__categories-label">{t('discover.filters.category')}</div>
                  <div className="discover__category-chips" aria-label={t('discover.filters.category')}>
                    <Cluster gap="1">
                      {CATEGORY_OPTIONS.map((option) => {
                        const selected = filters.categories.includes(option.value as DiscoverCategoryCode);
                        return (
                          <Button
                            key={option.value}
                            type="button"
                            size="sm"
                            variant={selected ? 'primary' : 'secondary'}
                            onClick={() => toggleCategory(option.value as DiscoverCategoryCode)}
                            aria-label={option.label}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => dispatch(categoriesSet([]))}
                        disabled={filters.categories.length === 0}
                      >
                        {t('discover.filters.category.clear')}
                      </Button>
                    </Cluster>
                  </div>
                </section>

                <section className="discover__list" aria-live="polite" aria-busy={status === 'loading'}>
                  {status === 'loading' && <p className="discover__state">{t('discover.state.loading')}</p>}
                  {status === 'failed' && (
                    <p className="discover__state discover__state--error" role="alert">
                      {t(errorKey ?? 'discover.errors.fetch_failed')}
                    </p>
                  )}
                  {status === 'succeeded' && items.length === 0 && (
                    <p className="discover__state">
                      {filters.hereNowEnabled
                        ? t('discover.state.empty_here_now')
                        : t('discover.state.empty')}
                    </p>
                  )}
                  {items.length > 0 && (
                    <ul className="discover__cards">
                      {items.map((event) => {
                        const accordionItem = accordionItemsById.get(event.id);
                        if (!accordionItem) {
                          return null;
                        }

                        return (
                          <li key={event.id} ref={registerItemRef(event.id)}>
                            <Accordion
                              items={[accordionItem]}
                              expanded={selectedEventId === event.id ? [event.id] : []}
                              onChange={(expandedIds) => {
                                const nextId = expandedIds[0];
                                if (nextId) {
                                  dispatch(selectedEventSet(nextId));
                                }
                              }}
                              aria-label={event.title}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </Stack>
            </section>
          </Split>
        </div>
        </Section>
      </Page>
    </main>
  );
};
