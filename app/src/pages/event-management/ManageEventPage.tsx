import * as React from 'react';
import { CalendarDays, ChevronRight, Eye, MapPinned, Users, ArrowLeft, Wallet } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppNavbar, Avatar, Badge, Button, DateTimeField, Dropdown, Modal, SegmentedToggle, TextArea, TextField, useNotifications } from '../../shared/components/index.ts';
import { Cluster, Page, Section, Split, Stack } from '../../shared/layout/index.tsx';
import { t } from '../../i18n/index.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import {
  fetchAuthoredEvent,
  handleJoinRequestAction,
  updateAuthoredEvent,
  updateJoinRules,
} from '../../redux/eventManagement/eventManagementSlice.ts';
import { reverseEventAddressRequest, searchEventAddressRequest } from './api/eventManagementApi.ts';
import type { GeocodeResult, JoinVisibility } from './domain/eventManagementModels.ts';
import { useSmartBack } from '../../shared/hooks/useSmartBack.ts'; 
import './ManageEventPage.css';

const LocationPicker = React.lazy(async () => import('./components/LocationPicker.tsx').then((module) => ({ default: module.LocationPicker })));

type PriceMode = 'free' | 'paid';

type EditFormState = {
  title: string;
  description: string;
  dateTime: string;
  addressQuery: string;
  priceMode: PriceMode;
  priceAmount: string;
  capacityValue: string;
  unlimitedCapacity: boolean;
};

const INITIAL_EDIT_FORM: EditFormState = {
  title: '',
  description: '',
  dateTime: '',
  addressQuery: '',
  priceMode: 'free',
  priceAmount: '0',
  capacityValue: '',
  unlimitedCapacity: true,
};

const toLocalDateTimeValue = (isoDateTime: string): string => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoDateTime = (value: string): string | null => {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.length === 16 ? `${value}:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const formatDateTime = (isoDateTime: string): string =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDateTime));

const formatAddress = (address: {
  city: string;
  street: string;
  buildingNumber: string;
  postalCode?: string;
}): string => {
  const postalCode = address.postalCode ? `${address.postalCode} ` : '';
  return `${address.street} ${address.buildingNumber}, ${postalCode}${address.city}`;
};

const formatPrice = (price: { amount: number; currency: 'PLN'; isFree: boolean }) => {
  if (price.isFree) {
    return t('discover.card.price.free');
  }
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);
};

const getVisibilityLabel = (visibility: JoinVisibility) =>
  t(`eventManagement.manage.rules.visibility_option.${visibility.toLowerCase()}`);

const formatParticipantsCounter = (participantsCount: number, capacity: number | null): string => {
  if (capacity === null) {
    return String(participantsCount);
  }
  return `${participantsCount}/${capacity}`;
};

export const ManageEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notify } = useNotifications();
  const {
    selectedItem,
    selectedStatus,
    selectedErrorKey,
    updateStatus,
    rulesStatus,
    requestActionStatus,
  } = useAppSelector((state) => state.eventManagement);
  const token = useAppSelector((state) => state.auth.session?.token);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = React.useState(false);
  const [isEditLocationPickerOpen, setIsEditLocationPickerOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState<EditFormState>(INITIAL_EDIT_FORM);
  const [editLocationSearchStatus, setEditLocationSearchStatus] = React.useState<'idle' | 'loading' | 'failed'>('idle');
  const [editLocationSearchErrorKey, setEditLocationSearchErrorKey] = React.useState<string | null>(null);
  const [editLocationSearchResults, setEditLocationSearchResults] = React.useState<GeocodeResult[]>([]);
  const [editSelectedAddressResult, setEditSelectedAddressResult] = React.useState<GeocodeResult | null>(null);
  const [editSelectedLocation, setEditSelectedLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [rulesForm, setRulesForm] = React.useState<{ visibility: JoinVisibility; approvalRequired: boolean }>({
    visibility: 'PUBLIC',
    approvalRequired: true,
  });
  const reverseLookupRequestIdRef = React.useRef(0);

  const goBack = useSmartBack('/my-events');

  React.useEffect(() => {
    if (!eventId) {
      return;
    }
    void dispatch(fetchAuthoredEvent(eventId));
  }, [dispatch, eventId]);

  React.useEffect(() => {
    if (!selectedItem) {
      return;
    }

    setEditForm({
      title: selectedItem.title,
      description: selectedItem.description,
      dateTime: toLocalDateTimeValue(selectedItem.dateTime),
      addressQuery: formatAddress(selectedItem.address),
      priceMode: selectedItem.price.isFree ? 'free' : 'paid',
      priceAmount: selectedItem.price.isFree ? '0' : String(selectedItem.price.amount),
      capacityValue: selectedItem.management.capacity === null ? '' : String(selectedItem.management.capacity),
      unlimitedCapacity: selectedItem.management.capacity === null,
    });
    setEditSelectedAddressResult({
      id: `${selectedItem.id}-address`,
      label: formatAddress(selectedItem.address),
      location: selectedItem.location,
      address: {
        city: selectedItem.address.city,
        street: selectedItem.address.street,
        buildingNumber: selectedItem.address.buildingNumber,
        postalCode: selectedItem.address.postalCode,
      },
    });
    setEditSelectedLocation(selectedItem.location);
    setEditLocationSearchResults([]);
    setEditLocationSearchStatus('idle');
    setEditLocationSearchErrorKey(null);
    setIsEditLocationPickerOpen(false);

    setRulesForm({
      visibility: selectedItem.management.joinRules.visibility,
      approvalRequired: selectedItem.management.joinRules.approvalRequired,
    });
  }, [selectedItem]);

  const handleEditInputChange = (key: keyof EditFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextValue = event.target.value;
    setEditForm((current) => ({ ...current, [key]: nextValue }));
  };

  const handlePriceModeChange = (nextMode: PriceMode) => {
    setEditForm((current) => ({
      ...current,
      priceMode: nextMode,
      priceAmount: nextMode === 'free' ? '0' : current.priceAmount === '0' ? '' : current.priceAmount,
    }));
  };

  const handleEditAddressQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setEditForm((current) => ({ ...current, addressQuery: nextValue }));
    setEditSelectedAddressResult(null);
    setEditSelectedLocation(null);
    setIsEditLocationPickerOpen(true);
  };

  React.useEffect(() => {
    if (!isEditLocationPickerOpen || !token) {
      return;
    }

    const query = editForm.addressQuery.trim();
    if (query.length < 3) {
      setEditLocationSearchResults([]);
      setEditLocationSearchStatus('idle');
      setEditLocationSearchErrorKey(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setEditLocationSearchStatus('loading');
      setEditLocationSearchErrorKey(null);

      try {
        const results = await searchEventAddressRequest(query, token, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setEditLocationSearchResults(results);
        setEditLocationSearchStatus('idle');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : 'eventManagement.errors.fetch_failed';
        setEditLocationSearchStatus('failed');
        setEditLocationSearchErrorKey(message);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [editForm.addressQuery, isEditLocationPickerOpen, token]);

  const handleEditSelectSearchResult = (resultId: string) => {
    const selectedResult = editLocationSearchResults.find((result) => result.id === resultId);
    if (!selectedResult) {
      return;
    }

    setEditSelectedAddressResult(selectedResult);
    setEditSelectedLocation(selectedResult.location);
    setEditForm((current) => ({ ...current, addressQuery: selectedResult.label }));
    setEditLocationSearchResults([]);
    setEditLocationSearchStatus('idle');
    setEditLocationSearchErrorKey(null);
    setLocalErrorKey(null);
    setIsEditLocationPickerOpen(false);
  };

  const handleEditPickLocation = async (location: { lat: number; lng: number }) => {
    if (!token) {
      return;
    }

    setEditSelectedLocation(location);
    setLocalErrorKey(null);
    setEditLocationSearchErrorKey(null);
    const requestId = reverseLookupRequestIdRef.current + 1;
    reverseLookupRequestIdRef.current = requestId;
    setEditLocationSearchStatus('loading');
    const controller = new AbortController();

    try {
      const result = await reverseEventAddressRequest(location, token, controller.signal);
      if (reverseLookupRequestIdRef.current !== requestId) {
        return;
      }
      setEditSelectedAddressResult(result);
      setEditForm((current) => ({ ...current, addressQuery: result.label }));
      setEditLocationSearchResults([]);
      setEditLocationSearchStatus('idle');
      setEditLocationSearchErrorKey(null);
      setIsEditLocationPickerOpen(false);
    } catch (error) {
      if (reverseLookupRequestIdRef.current !== requestId) {
        return;
      }
      const message = error instanceof Error ? error.message : 'eventManagement.errors.fetch_failed';
      setEditLocationSearchStatus('failed');
      setEditLocationSearchErrorKey(message);
    }
  };

  const handleVisibilityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as JoinVisibility;
    if (value !== 'FRIENDS' && value !== 'GROUP' && value !== 'PUBLIC') {
      return;
    }
    setRulesForm((current) => ({ ...current, visibility: value }));
  };

  const handleSaveEdit = async () => {
    if (!eventId || !selectedItem) {
      return;
    }

    if (editForm.title.trim().length < 3) {
      notify({ variant: 'error', message: t('eventManagement.validation.title') });
      return;
    }
    if (editForm.description.trim().length < 10) {
      notify({ variant: 'error', message: t('eventManagement.validation.description') });
      return;
    }
    if (editForm.addressQuery.trim().length < 3 || !editSelectedAddressResult || !editSelectedLocation) {
      notify({ variant: 'error', message: t('eventManagement.validation.address_required') });
      return;
    }

    const dateTime = toIsoDateTime(editForm.dateTime);
    if (!dateTime) {
      notify({ variant: 'error', message: t('eventManagement.validation.date_time') });
      return;
    }

    const priceAmount = editForm.priceMode === 'free' ? 0 : Number(editForm.priceAmount);
    if (editForm.priceMode === 'paid' && (!Number.isFinite(priceAmount) || priceAmount <= 0)) {
      notify({ variant: 'error', message: t('eventManagement.validation.price_amount') });
      return;
    }

    let capacity: number | null = null;
    if (!editForm.unlimitedCapacity) {
      const parsedCapacity = Number(editForm.capacityValue);
      if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        notify({ variant: 'error', message: t('eventManagement.manage.validation.capacity') });
        return;
      }
      if (selectedItem.management.capacity !== null && parsedCapacity < selectedItem.management.capacity) {
        notify({ variant: 'error', message: t('eventManagement.manage.validation.capacity_increase_only') });
        return;
      }
      capacity = parsedCapacity;
    }

    try {
      await dispatch(updateAuthoredEvent({
        eventId,
        payload: {
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          dateTime,
          address: {
            city: editSelectedAddressResult.address.city,
            street: editSelectedAddressResult.address.street,
            buildingNumber: editSelectedAddressResult.address.buildingNumber,
            postalCode: editSelectedAddressResult.address.postalCode,
          },
          price: {
            amount: priceAmount,
            currency: 'PLN',
            isFree: editForm.priceMode === 'free',
          },
          capacity,
        },
      })).unwrap();
      setIsEditModalOpen(false);
      notify({ variant: 'success', message: t('eventManagement.success.updated') });
    } catch (updateError) {
      notify({
        variant: 'error',
        message: t(typeof updateError === 'string' ? updateError : 'eventManagement.errors.update_failed'),
      });
    }
  };

  const handleSaveRules = async () => {
    if (!eventId) {
      return;
    }

    try {
      await dispatch(updateJoinRules({
        eventId,
        payload: rulesForm,
      })).unwrap();
      setIsRulesModalOpen(false);
      notify({ variant: 'success', message: t('eventManagement.success.rules_updated') });
    } catch (rulesError) {
      notify({
        variant: 'error',
        message: t(typeof rulesError === 'string' ? rulesError : 'eventManagement.errors.rules_update_failed'),
      });
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!eventId) {
      return;
    }

    try {
      await dispatch(handleJoinRequestAction({
        eventId,
        requestId,
        action,
      })).unwrap();
      notify({
        variant: 'success',
        message: t(
          action === 'approve'
            ? 'eventManagement.success.request_approved'
            : 'eventManagement.success.request_rejected',
        ),
      });
    } catch (requestError) {
      notify({
        variant: 'error',
        message: t(typeof requestError === 'string' ? requestError : 'eventManagement.errors.request_action_failed'),
      });
    }
  };

  return (
    <main className="manage-event-page">
      <AppNavbar active="my-events" />

      <Page maxWidth="xl">
        <Section spacing="sm">
          <Stack gap="3">
            
            <div style={{ paddingBottom: '0.5rem' }}>
              <Button type="button" variant="secondary" size="sm" onClick={goBack}>
                <ArrowLeft size={16} style={{ marginRight: '6px' }} />
                {t('common.back')} 
              </Button>
            </div>

            <h1 className="manage-event-page__title">{t('eventManagement.manage.title')}</h1>

            {selectedStatus === 'loading' && <p>{t('eventManagement.manage.loading')}</p>}

            {selectedStatus === 'failed' && <p role="alert">{t(selectedErrorKey ?? 'eventManagement.errors.fetch_failed')}</p>}

            {selectedStatus === 'succeeded' && selectedItem && (
              <Split className="manage-event-page__layout" fraction="2/3" gap="3">
                <article className="manage-event-page__card manage-event-page__card--primary">
                  <Stack gap="3">
                    <Cluster justify="space-between" align="center">
                      <span className="manage-event-page__section-label">{t('eventManagement.manage.section.info')}</span>
                      <Badge size="sm" variant="success">{t('eventManagement.manage.status.active')}</Badge>
                    </Cluster>

                    <h2 className="manage-event-page__event-title">{selectedItem.title}</h2>

                    <div className="manage-event-page__meta-grid">
                      <div className="manage-event-page__meta-item">
                        <CalendarDays size={16} />
                        <div>
                          <span className="manage-event-page__meta-label">{t('eventManagement.manage.meta.when')}</span>
                          <p>{formatDateTime(selectedItem.dateTime)}</p>
                        </div>
                      </div>
                      <div className="manage-event-page__meta-item">
                        <MapPinned size={16} />
                        <div>
                          <span className="manage-event-page__meta-label">{t('eventManagement.manage.meta.where')}</span>
                          <p>{formatAddress(selectedItem.address)}</p>
                        </div>
                      </div>
                      <div className="manage-event-page__meta-item">
                        <Eye size={16} />
                        <div>
                          <span className="manage-event-page__meta-label">{t('eventManagement.manage.meta.rules')}</span>
                          <p>{getVisibilityLabel(selectedItem.management.joinRules.visibility)}</p>
                          <p>{selectedItem.management.joinRules.approvalRequired
                            ? t('eventManagement.manage.rules.approval_required_on')
                            : t('eventManagement.manage.rules.approval_required_off')}</p>
                        </div>
                      </div>
                      <div className="manage-event-page__meta-item">
                        <Users size={16} />
                        <div>
                          <span className="manage-event-page__meta-label">{t('eventManagement.manage.meta.limit')}</span>
                          <p>
                            {selectedItem.management.capacity === null
                              ? t('eventManagement.manage.capacity.unlimited')
                              : t('eventManagement.manage.capacity.value').replace('{value}', String(selectedItem.management.capacity))}
                          </p>
                        </div>
                      </div>
                      <div className="manage-event-page__meta-item">
                        <Wallet size={16} />
                        <div>
                          <span className="manage-event-page__meta-label">{t('eventManagement.manage.meta.cost')}</span>
                          <p>{formatPrice(selectedItem.price)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="manage-event-page__description-label">{t('eventManagement.form.description')}</h3>
                      <p className="manage-event-page__description">{selectedItem.description}</p>
                    </div>

                    <div className="manage-event-page__primary-actions">
                      <Cluster gap="2">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                          {t('eventManagement.manage.actions.edit')}
                        </Button>
                        <Button type="button" onClick={() => setIsRulesModalOpen(true)}>
                          {t('eventManagement.manage.actions.rules')}
                        </Button>
                      </Cluster>
                    </div>
                  </Stack>
                </article>

                <aside className="manage-event-page__column">
                  <article className="manage-event-page__card">
                    <Stack gap="2">
                      <div className="manage-event-page__title-row">
                        <h2 className="manage-event-page__list-title">{t('eventManagement.manage.participants.title')}</h2>
                        <span className="manage-event-page__count-chip">
                          {formatParticipantsCounter(selectedItem.management.participants.length, selectedItem.management.capacity)}
                        </span>
                      </div>

                      <Stack gap="2">
                        {selectedItem.management.participants.length === 0 && (
                          <p className="manage-event-page__empty">{t('eventManagement.manage.participants.empty')}</p>
                        )}
                        {selectedItem.management.participants.map((participant) => (
                          <button
                            key={participant.id}
                            type="button"
                            className="manage-event-page__person-row manage-event-page__person-row--button"
                            onClick={() => navigate(`/users/${participant.id}`)}
                          >
                            <Cluster gap="2" align="center">
                              <Avatar name={participant.displayName} src={participant.avatarUrl} size="sm" />
                              <span className="manage-event-page__person-name">{participant.displayName}</span>
                            </Cluster>
                            <ChevronRight size={16} aria-hidden="true" />
                          </button>
                        ))}
                      </Stack>
                    </Stack>
                  </article>

                  <article className="manage-event-page__card">
                    <Stack gap="2">
                      <div className="manage-event-page__title-row">
                        <h2 className="manage-event-page__list-title">{t('eventManagement.manage.requests.title')}</h2>
                        <span className="manage-event-page__count-chip">{String(selectedItem.management.joinRequests.length)}</span>
                      </div>

                      <Stack gap="2">
                        {selectedItem.management.joinRequests.length === 0 && (
                          <p className="manage-event-page__empty">{t('eventManagement.manage.requests.empty')}</p>
                        )}
                        {selectedItem.management.joinRequests.map((request) => (
                          <div
                            key={request.id}
                            role="button"
                            tabIndex={0}
                            className="manage-event-page__person-row manage-event-page__person-row--interactive"
                            onClick={() => navigate(`/users/${request.userId}`)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                navigate(`/users/${request.userId}`);
                              }
                            }}
                          >
                            <Cluster gap="2" align="center">
                              <Avatar name={request.displayName} src={request.avatarUrl} size="sm" />
                              <div>
                                <p className="manage-event-page__request-name">{request.displayName}</p>
                              </div>
                            </Cluster>
                            <Cluster gap="1" className="manage-event-page__request-actions">
                              <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRequestAction(request.id, 'reject');
                                }}
                                disabled={requestActionStatus === 'submitting'}
                              >
                                {t('eventManagement.manage.requests.reject')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ok"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRequestAction(request.id, 'approve');
                                }}
                                disabled={requestActionStatus === 'submitting'}
                              >
                                {t('eventManagement.manage.requests.approve')}
                              </Button>
                            </Cluster>
                          </div>
                        ))}
                      </Stack>
                    </Stack>
                  </article>
                </aside>
              </Split>
            )}

          </Stack>
        </Section>
      </Page>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('eventManagement.manage.dialog.edit.title')}
        footer={(
          <>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              {t('eventManagement.manage.dialog.cancel')}
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={updateStatus === 'submitting'}>
              {t('eventManagement.manage.dialog.save')}
            </Button>
          </>
        )}
      >
        <Stack gap="2">
          <TextField id="manage-edit-title" label={t('eventManagement.form.title')} value={editForm.title} onChange={handleEditInputChange('title')} />
          <DateTimeField id="manage-edit-date-time" label={t('eventManagement.form.date_time')} value={editForm.dateTime} onChange={handleEditInputChange('dateTime')} />
          <div className="manage-event-page__field">
            <TextField
              id="manage-edit-address"
              label={t('eventManagement.form.address')}
              value={editForm.addressQuery}
              onChange={handleEditAddressQueryChange}
              onFocus={() => setIsEditLocationPickerOpen(true)}
              placeholder={t('eventManagement.form.address_placeholder')}
            />
            {isEditLocationPickerOpen && (
              <div className="manage-event-page__address-picker">
                <React.Suspense fallback={<p>{t('eventManagement.form.location_picker_loading')}</p>}>
                  <LocationPicker
                    searchResults={editLocationSearchResults}
                    searchStatus={editLocationSearchStatus}
                    searchErrorKey={editLocationSearchErrorKey}
                    selectedLocation={editSelectedLocation}
                    onSelectResult={handleEditSelectSearchResult}
                    onPickLocation={handleEditPickLocation}
                  />
                </React.Suspense>
              </div>
            )}
          </div>

          <div className="manage-event-page__field">
            <p className="manage-event-page__field-label">{t('eventManagement.form.attendees_count')}</p>
            <SegmentedToggle
              ariaLabel={t('eventManagement.form.attendees_count')}
              value={editForm.unlimitedCapacity ? 'unlimited' : 'limited'}
              options={[
                { value: 'unlimited', label: t('eventManagement.manage.capacity.unlimited_short') },
                { value: 'limited', label: t('eventManagement.manage.capacity.label') },
              ]}
              onChange={(value) => {
                if (value === 'unlimited') {
                  setEditForm((current) => ({
                    ...current,
                    unlimitedCapacity: true,
                    capacityValue: '',
                  }));
                  return;
                }

                setEditForm((current) => ({
                  ...current,
                  unlimitedCapacity: false,
                }));
              }}
            />
          </div>

          <TextField
            id="manage-edit-capacity"
            label={t('eventManagement.manage.capacity.label')}
            type="number"
            min={1}
            step={1}
            value={editForm.capacityValue}
            onChange={handleEditInputChange('capacityValue')}
            disabled={editForm.unlimitedCapacity}
          />

          <div className="manage-event-page__field">
            <p className="manage-event-page__field-label">{t('eventManagement.form.price_mode')}</p>
            <SegmentedToggle
              ariaLabel={t('eventManagement.form.price_mode')}
              value={editForm.priceMode}
              options={[
                { value: 'free', label: t('eventManagement.form.price_mode.free') },
                { value: 'paid', label: t('eventManagement.form.price_mode.paid') },
              ]}
              onChange={(value) => handlePriceModeChange(value as PriceMode)}
            />
          </div>

          <TextField
            id="manage-edit-price-amount"
            label={t('eventManagement.form.price_amount')}
            type="number"
            min={0}
            step={1}
            value={editForm.priceAmount}
            onChange={handleEditInputChange('priceAmount')}
            disabled={editForm.priceMode === 'free'}
          />

          <TextArea
            id="manage-edit-description"
            label={t('eventManagement.form.description')}
            value={editForm.description}
            onChange={handleEditInputChange('description')}
            rows={5}
          />
        </Stack>
      </Modal>

      <Modal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        title={t('eventManagement.manage.dialog.rules.title')}
        footer={(
          <>
            <Button type="button" variant="secondary" onClick={() => setIsRulesModalOpen(false)}>
              {t('eventManagement.manage.dialog.cancel')}
            </Button>
            <Button type="button" onClick={handleSaveRules} disabled={rulesStatus === 'submitting'}>
              {t('eventManagement.manage.dialog.save')}
            </Button>
          </>
        )}
      >
        <Stack gap="2">
          <Dropdown
            id="manage-rules-visibility"
            label={t('eventManagement.manage.rules.visibility')}
            options={[
              { value: 'FRIENDS', label: t('eventManagement.manage.rules.visibility_option.friends') },
              { value: 'GROUP', label: t('eventManagement.manage.rules.visibility_option.group') },
              { value: 'PUBLIC', label: t('eventManagement.manage.rules.visibility_option.public') },
            ]}
            value={rulesForm.visibility}
            onChange={handleVisibilityChange}
          />
          <div className="manage-event-page__field">
            <p className="manage-event-page__field-label">{t('eventManagement.manage.rules.approval_required')}</p>
            <SegmentedToggle
              ariaLabel={t('eventManagement.manage.rules.approval_required')}
              value={rulesForm.approvalRequired ? 'required' : 'not-required'}
              options={[
                { value: 'required', label: t('eventManagement.manage.rules.approval_required.short_on') },
                { value: 'not-required', label: t('eventManagement.manage.rules.approval_required.short_off') },
              ]}
              onChange={(value) => {
                setRulesForm((current) => ({
                  ...current,
                  approvalRequired: value === 'required',
                }));
              }}
            />
          </div>
        </Stack>
      </Modal>
    </main>
  );
};