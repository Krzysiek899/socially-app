import * as React from 'react';
import { CalendarDays, Eye, MapPinned, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppNavbar, Avatar, Badge, Button, DateTimeField, Dropdown, Modal, TextField } from '../../shared/components/index.ts';
import { Cluster, Page, Section, Split, Stack } from '../../shared/layout/index.tsx';
import { t } from '../../i18n/index.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import {
  fetchAuthoredEvent,
  handleJoinRequestAction,
  updateAuthoredEvent,
  updateJoinRules,
} from '../../redux/eventManagement/eventManagementSlice.ts';
import type { JoinVisibility } from './domain/eventManagementModels.ts';
import './ManageEventPage.css';

type PriceMode = 'free' | 'paid';

type EditFormState = {
  title: string;
  description: string;
  dateTime: string;
  city: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  priceMode: PriceMode;
  priceAmount: string;
  capacityValue: string;
  unlimitedCapacity: boolean;
};

const INITIAL_EDIT_FORM: EditFormState = {
  title: '',
  description: '',
  dateTime: '',
  city: '',
  street: '',
  buildingNumber: '',
  postalCode: '',
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

export const ManageEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    selectedItem,
    selectedStatus,
    selectedErrorKey,
    updateStatus,
    updateErrorKey,
    rulesStatus,
    rulesErrorKey,
    requestActionStatus,
    requestActionErrorKey,
  } = useAppSelector((state) => state.eventManagement);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState<EditFormState>(INITIAL_EDIT_FORM);
  const [rulesForm, setRulesForm] = React.useState<{ visibility: JoinVisibility; approvalRequired: boolean }>({
    visibility: 'PUBLIC',
    approvalRequired: true,
  });
  const [localErrorKey, setLocalErrorKey] = React.useState<string | null>(null);

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
      city: selectedItem.address.city,
      street: selectedItem.address.street,
      buildingNumber: selectedItem.address.buildingNumber,
      postalCode: selectedItem.address.postalCode ?? '',
      priceMode: selectedItem.price.isFree ? 'free' : 'paid',
      priceAmount: selectedItem.price.isFree ? '0' : String(selectedItem.price.amount),
      capacityValue: selectedItem.management.capacity === null ? '' : String(selectedItem.management.capacity),
      unlimitedCapacity: selectedItem.management.capacity === null,
    });

    setRulesForm({
      visibility: selectedItem.management.joinRules.visibility,
      approvalRequired: selectedItem.management.joinRules.approvalRequired,
    });
  }, [selectedItem]);

  const handleEditInputChange = (key: keyof EditFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setEditForm((current) => ({ ...current, [key]: nextValue }));
  };

  const handlePriceModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMode = event.target.value === 'paid' ? 'paid' : 'free';
    setEditForm((current) => ({
      ...current,
      priceMode: nextMode,
      priceAmount: nextMode === 'free' ? '0' : current.priceAmount === '0' ? '' : current.priceAmount,
    }));
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
      setLocalErrorKey('eventManagement.validation.title');
      return;
    }
    if (editForm.description.trim().length < 10) {
      setLocalErrorKey('eventManagement.validation.description');
      return;
    }
    if (!editForm.city.trim() || !editForm.street.trim() || !editForm.buildingNumber.trim()) {
      setLocalErrorKey('eventManagement.validation.address_required');
      return;
    }

    const dateTime = toIsoDateTime(editForm.dateTime);
    if (!dateTime) {
      setLocalErrorKey('eventManagement.validation.date_time');
      return;
    }

    const priceAmount = editForm.priceMode === 'free' ? 0 : Number(editForm.priceAmount);
    if (editForm.priceMode === 'paid' && (!Number.isFinite(priceAmount) || priceAmount <= 0)) {
      setLocalErrorKey('eventManagement.validation.price_amount');
      return;
    }

    let capacity: number | null = null;
    if (!editForm.unlimitedCapacity) {
      const parsedCapacity = Number(editForm.capacityValue);
      if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        setLocalErrorKey('eventManagement.manage.validation.capacity');
        return;
      }
      if (selectedItem.management.capacity !== null && parsedCapacity < selectedItem.management.capacity) {
        setLocalErrorKey('eventManagement.manage.validation.capacity_increase_only');
        return;
      }
      capacity = parsedCapacity;
    }

    setLocalErrorKey(null);
    await dispatch(updateAuthoredEvent({
      eventId,
      payload: {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        dateTime,
        address: {
          city: editForm.city.trim(),
          street: editForm.street.trim(),
          buildingNumber: editForm.buildingNumber.trim(),
          postalCode: editForm.postalCode.trim() || undefined,
        },
        price: {
          amount: priceAmount,
          currency: 'PLN',
          isFree: editForm.priceMode === 'free',
        },
        capacity,
      },
    }));
    setIsEditModalOpen(false);
  };

  const handleSaveRules = async () => {
    if (!eventId) {
      return;
    }

    await dispatch(updateJoinRules({
      eventId,
      payload: rulesForm,
    }));
    setIsRulesModalOpen(false);
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!eventId) {
      return;
    }

    await dispatch(handleJoinRequestAction({
      eventId,
      requestId,
      action,
    }));
  };

  return (
    <main className="manage-event-page">
      <AppNavbar active="my-events" />

      <Page maxWidth="xl">
        <Section spacing="sm">
          <Stack gap="3">
            <h1 className="manage-event-page__title">{t('eventManagement.manage.title')}</h1>

            {selectedStatus === 'loading' && <p>{t('eventManagement.manage.loading')}</p>}
            {selectedStatus === 'failed' && <p role="alert">{t(selectedErrorKey ?? 'eventManagement.errors.fetch_failed')}</p>}

            {selectedStatus === 'succeeded' && selectedItem && (
              <Split fraction="2/3" gap="3">
                <article className="manage-event-page__card">
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
                              : `${selectedItem.management.capacity} osób`}
                          </p>
                        </div>
                      </div>
                      <div className="manage-event-page__meta-item">
                        <span className="manage-event-page__meta-label">{t('eventManagement.manage.meta.cost')}</span>
                        <p>{formatPrice(selectedItem.price)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="manage-event-page__description-label">{t('eventManagement.form.description')}</h3>
                      <p className="manage-event-page__description">{selectedItem.description}</p>
                    </div>

                    <Cluster gap="2">
                      <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                        {t('eventManagement.manage.actions.edit')}
                      </Button>
                      <Button type="button" onClick={() => setIsRulesModalOpen(true)}>
                        {t('eventManagement.manage.actions.rules')}
                      </Button>
                    </Cluster>
                  </Stack>
                </article>

                <aside className="manage-event-page__column">
                  <article className="manage-event-page__card">
                    <Stack gap="2">
                      <Cluster justify="space-between" align="center">
                        <h2 className="manage-event-page__list-title">{t('eventManagement.manage.participants.title')}</h2>
                        <Badge size="sm" variant="neutral">{String(selectedItem.management.participants.length)}</Badge>
                      </Cluster>

                      <Stack gap="2">
                        {selectedItem.management.participants.map((participant) => (
                          <Cluster key={participant.id} justify="space-between" align="center">
                            <Cluster gap="2" align="center">
                              <Avatar name={participant.displayName} src={participant.avatarUrl} size="sm" />
                              <span>{participant.displayName}</span>
                            </Cluster>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/app/users/${participant.id}`)}
                            >
                              {t('profile.actions.view_public')}
                            </Button>
                          </Cluster>
                        ))}
                      </Stack>
                    </Stack>
                  </article>

                  <article className="manage-event-page__card">
                    <Stack gap="2">
                      <Cluster justify="space-between" align="center">
                        <h2 className="manage-event-page__list-title">{t('eventManagement.manage.requests.title')}</h2>
                        <Badge size="sm" variant="warning">{String(selectedItem.management.joinRequests.length)}</Badge>
                      </Cluster>

                      <Stack gap="2">
                        {selectedItem.management.joinRequests.length === 0 && (
                          <p className="manage-event-page__empty">{t('eventManagement.manage.requests.empty')}</p>
                        )}
                        {selectedItem.management.joinRequests.map((request) => (
                          <Cluster key={request.id} justify="space-between" align="center">
                            <Cluster gap="2" align="center">
                              <Avatar name={request.displayName} src={request.avatarUrl} size="sm" />
                              <div>
                                <p className="manage-event-page__request-name">{request.displayName}</p>
                                <p className="manage-event-page__request-time">{t('eventManagement.manage.requests.pending')}</p>
                              </div>
                            </Cluster>
                            <Cluster gap="1">
                              <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                onClick={() => handleRequestAction(request.id, 'reject')}
                                disabled={requestActionStatus === 'submitting'}
                              >
                                {t('eventManagement.manage.requests.reject')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ok"
                                onClick={() => handleRequestAction(request.id, 'approve')}
                                disabled={requestActionStatus === 'submitting'}
                              >
                                {t('eventManagement.manage.requests.approve')}
                              </Button>
                            </Cluster>
                          </Cluster>
                        ))}
                      </Stack>
                    </Stack>
                  </article>
                </aside>
              </Split>
            )}

            {(localErrorKey || updateErrorKey || rulesErrorKey || requestActionErrorKey) && (
              <p className="manage-event-page__error" role="alert">
                {t(localErrorKey ?? updateErrorKey ?? rulesErrorKey ?? requestActionErrorKey ?? 'eventManagement.errors.fetch_failed')}
              </p>
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
          <Cluster gap="2">
            <TextField id="manage-edit-city" label={t('eventManagement.form.city')} value={editForm.city} onChange={handleEditInputChange('city')} />
            <TextField id="manage-edit-street" label={t('eventManagement.form.street')} value={editForm.street} onChange={handleEditInputChange('street')} />
          </Cluster>
          <Cluster gap="2">
            <TextField id="manage-edit-building-number" label={t('eventManagement.form.building_number')} value={editForm.buildingNumber} onChange={handleEditInputChange('buildingNumber')} />
            <TextField id="manage-edit-postal-code" label={t('eventManagement.form.postal_code')} value={editForm.postalCode} onChange={handleEditInputChange('postalCode')} />
          </Cluster>
          <Cluster gap="2">
            <Dropdown
              id="manage-edit-price-mode"
              label={t('eventManagement.form.price_mode')}
              options={[
                { value: 'free', label: t('eventManagement.form.price_mode.free') },
                { value: 'paid', label: t('eventManagement.form.price_mode.paid') },
              ]}
              value={editForm.priceMode}
              onChange={handlePriceModeChange}
            />
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
          </Cluster>
          <label className="manage-event-page__toggle-row" htmlFor="manage-edit-unlimited-capacity">
            <input
              id="manage-edit-unlimited-capacity"
              type="checkbox"
              checked={editForm.unlimitedCapacity}
              onChange={(event) => {
                const checked = event.target.checked;
                setEditForm((current) => ({
                  ...current,
                  unlimitedCapacity: checked,
                  capacityValue: checked ? '' : current.capacityValue,
                }));
              }}
            />
            <span>{t('eventManagement.manage.capacity.unlimited_toggle')}</span>
          </label>
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
          <TextField id="manage-edit-description" label={t('eventManagement.form.description')} value={editForm.description} onChange={handleEditInputChange('description')} />
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
          <label className="manage-event-page__toggle-row" htmlFor="manage-rules-approval">
            <input
              id="manage-rules-approval"
              type="checkbox"
              checked={rulesForm.approvalRequired}
              onChange={(event) => {
                setRulesForm((current) => ({
                  ...current,
                  approvalRequired: event.target.checked,
                }));
              }}
            />
            <span>{t('eventManagement.manage.rules.approval_required')}</span>
          </label>
        </Stack>
      </Modal>
    </main>
  );
};
