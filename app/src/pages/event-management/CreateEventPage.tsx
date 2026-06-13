import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppNavbar,
  Button,
  DateTimeField,
  Dropdown,
  TextField,
} from '../../shared/components/index.ts';
import { Cluster, Grid, Page, Section, Stack } from '../../shared/layout/index.tsx';
import { t } from '../../i18n/index.ts';
import { DISCOVER_CATEGORY_CODES, type DiscoverCategoryCode } from '../discover/domain/discoverModels.ts';
import type { CreateEventPayload, GeocodeResult } from './domain/eventManagementModels.ts';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { createAuthoredEvent } from '../../redux/eventManagement/eventManagementSlice.ts';
import { reverseEventAddressRequest, searchEventAddressRequest } from './api/eventManagementApi.ts';
import './CreateEventPage.css';

const LocationPicker = React.lazy(async () => import('./components/LocationPicker.tsx').then((module) => ({ default: module.LocationPicker })));

type PriceMode = 'free' | 'paid';

type FormState = {
  title: string;
  description: string;
  dateTime: string;
  category: string;
  addressQuery: string;
  priceMode: PriceMode;
  priceAmount: string;
  unlimitedCapacity: boolean;
  capacityValue: string;
};

type FormErrors = Partial<Record<
  'title' | 'description' | 'dateTime' | 'category' | 'address' | 'priceAmount' | 'capacity' | 'location',
  string
>>;

const CATEGORY_OPTIONS = DISCOVER_CATEGORY_CODES.map((category) => ({
  value: category,
  label: t(`discover.category.${category}`),
}));

const PRICE_MODE_OPTIONS = [
  { value: 'free', label: t('eventManagement.form.price_mode.free') },
  { value: 'paid', label: t('eventManagement.form.price_mode.paid') },
];

const initialFormState: FormState = {
  title: '',
  description: '',
  dateTime: '',
  category: '',
  addressQuery: '',
  priceMode: 'free',
  priceAmount: '0',
  unlimitedCapacity: true,
  capacityValue: '',
};

const isCategoryCode = (value: string): value is DiscoverCategoryCode =>
  DISCOVER_CATEGORY_CODES.some((category) => category === value);

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

const validateForm = (
  form: FormState,
  selectedAddressResult: GeocodeResult | null,
  selectedLocation: { lat: number; lng: number } | null,
): FormErrors => {
  const errors: FormErrors = {};

  if (form.title.trim().length < 3) {
    errors.title = 'eventManagement.validation.title';
  }

  if (form.description.trim().length < 10) {
    errors.description = 'eventManagement.validation.description';
  }

  if (!toIsoDateTime(form.dateTime)) {
    errors.dateTime = 'eventManagement.validation.date_time';
  }

  if (!isCategoryCode(form.category)) {
    errors.category = 'eventManagement.validation.category';
  }

  if (form.addressQuery.trim().length < 3 || !selectedAddressResult) {
    errors.address = 'eventManagement.validation.address_required';
  }

  if (!selectedLocation) {
    errors.location = 'eventManagement.validation.location_required';
  }

  if (form.priceMode === 'paid') {
    const amount = Number(form.priceAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.priceAmount = 'eventManagement.validation.price_amount';
    }
  }

  if (!form.unlimitedCapacity) {
    const capacity = Number(form.capacityValue);
    if (!Number.isInteger(capacity) || capacity < 1) {
      errors.capacity = 'eventManagement.manage.validation.capacity';
    }
  }

  return errors;
};

const toPayload = (
  form: FormState,
  selectedAddressResult: GeocodeResult | null,
  selectedLocation: { lat: number; lng: number } | null,
): CreateEventPayload => {
  const dateTime = toIsoDateTime(form.dateTime);
  if (!dateTime || !isCategoryCode(form.category) || !selectedLocation || !selectedAddressResult) {
    throw new Error('eventManagement.errors.request_invalid');
  }

  const amount = form.priceMode === 'free' ? 0 : Number(form.priceAmount);
  const capacity = form.unlimitedCapacity ? null : Number(form.capacityValue);

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    dateTime,
    category: form.category,
    address: {
      city: selectedAddressResult.address.city,
      street: selectedAddressResult.address.street,
      buildingNumber: selectedAddressResult.address.buildingNumber,
      postalCode: selectedAddressResult.address.postalCode,
    },
    location: selectedLocation,
    price: {
      amount,
      currency: 'PLN',
      isFree: form.priceMode === 'free',
    },
    capacity,
  };
};

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { createStatus, createErrorKey } = useAppSelector((state) => state.eventManagement);
  const token = useAppSelector((state) => state.auth.session?.token);
  const [form, setForm] = React.useState<FormState>(initialFormState);
  const [submitted, setSubmitted] = React.useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = React.useState(false);
  const [locationSearchStatus, setLocationSearchStatus] = React.useState<'idle' | 'loading' | 'failed'>('idle');
  const [locationSearchErrorKey, setLocationSearchErrorKey] = React.useState<string | null>(null);
  const [locationSearchResults, setLocationSearchResults] = React.useState<GeocodeResult[]>([]);
  const [selectedAddressResult, setSelectedAddressResult] = React.useState<GeocodeResult | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const reverseLookupRequestIdRef = React.useRef(0);

  const errors = React.useMemo(
    () => validateForm(form, selectedAddressResult, selectedLocation),
    [form, selectedAddressResult, selectedLocation],
  );
  const showValidation = submitted;

  const handleInputChange = (key: keyof Omit<FormState, 'addressQuery'>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleAddressQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setForm((current) => ({ ...current, addressQuery: nextValue }));
    setIsLocationPickerOpen(true);
    setSelectedAddressResult(null);
    setSelectedLocation(null);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((current) => ({ ...current, category: event.target.value }));
  };

  const handlePriceModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMode = event.target.value === 'paid' ? 'paid' : 'free';
    setForm((current) => ({
      ...current,
      priceMode: nextMode,
      priceAmount: nextMode === 'free' ? '0' : current.priceAmount === '0' ? '' : current.priceAmount,
    }));
  };

  React.useEffect(() => {
    if (!isLocationPickerOpen) {
      return;
    }

    const query = form.addressQuery.trim();
    if (query.length < 3) {
      setLocationSearchResults([]);
      setLocationSearchErrorKey(null);
      setLocationSearchStatus('idle');
      return;
    }

    if (!token) {
      setLocationSearchStatus('failed');
      setLocationSearchErrorKey('eventManagement.errors.unauthorized');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLocationSearchStatus('loading');
      setLocationSearchErrorKey(null);
      void searchEventAddressRequest(query, token, controller.signal)
        .then((results) => {
          setLocationSearchResults(results);
          setLocationSearchStatus('idle');
          if (results.length === 0) {
            setLocationSearchErrorKey('eventManagement.errors.location_not_found');
          }
        })
        .catch((error) => {
          if (controller.signal.aborted) {
            return;
          }
          setLocationSearchResults([]);
          setLocationSearchStatus('failed');
          if (error instanceof Error) {
            setLocationSearchErrorKey(error.message);
          } else {
            setLocationSearchErrorKey('eventManagement.errors.fetch_failed');
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.addressQuery, isLocationPickerOpen, token]);

  const handleSelectSearchResult = (resultId: string) => {
    const result = locationSearchResults.find((item) => item.id === resultId);
    if (!result) {
      return;
    }

    setSelectedAddressResult(result);
    setSelectedLocation(result.location);
    setForm((current) => ({ ...current, addressQuery: result.label }));
    setLocationSearchResults([]);
    setLocationSearchStatus('idle');
    setLocationSearchErrorKey(null);
    setIsLocationPickerOpen(false);
  };

  const handlePickLocation = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);

    if (!token) {
      setLocationSearchStatus('failed');
      setLocationSearchErrorKey('eventManagement.errors.unauthorized');
      return;
    }

    const requestId = reverseLookupRequestIdRef.current + 1;
    reverseLookupRequestIdRef.current = requestId;

    const controller = new AbortController();
    setLocationSearchStatus('loading');
    setLocationSearchErrorKey(null);

    void reverseEventAddressRequest(location, token, controller.signal)
      .then((result) => {
        if (reverseLookupRequestIdRef.current !== requestId) {
          return;
        }

        setSelectedAddressResult(result);
        setSelectedLocation(result.location);
        setForm((current) => ({ ...current, addressQuery: result.label }));
        setLocationSearchResults([]);
        setLocationSearchStatus('idle');
        setLocationSearchErrorKey(null);
        setIsLocationPickerOpen(false);
      })
      .catch((error) => {
        if (controller.signal.aborted || reverseLookupRequestIdRef.current !== requestId) {
          return;
        }

        setLocationSearchStatus('failed');
        if (error instanceof Error) {
          setLocationSearchErrorKey(error.message);
        } else {
          setLocationSearchErrorKey('eventManagement.errors.fetch_failed');
        }
      });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = toPayload(form, selectedAddressResult, selectedLocation);
    const result = await dispatch(createAuthoredEvent(payload));
    if (createAuthoredEvent.fulfilled.match(result)) {
      navigate('/app/my-events');
    }
  };

  return (
    <main className="create-event-page">
      <AppNavbar active="create-event" />

      <Page maxWidth="lg">
        <Section spacing="sm">
          <Stack gap="4">
            <header className="create-event-page__header">
              <h1>{t('eventManagement.create.title')}</h1>
              <p>{t('eventManagement.create.subtitle')}</p>
            </header>

            <form className="create-event-page__form" onSubmit={handleSubmit} noValidate>
              <Grid columns={2} gap="2">
                <TextField
                  id="event-title"
                  label={t('eventManagement.form.title')}
                  value={form.title}
                  onChange={handleInputChange('title')}
                  required
                  variant={showValidation && errors.title ? 'error' : 'default'}
                  errorText={showValidation && errors.title ? t(errors.title) : undefined}
                />
                <Dropdown
                  id="event-category"
                  label={t('eventManagement.form.category')}
                  options={CATEGORY_OPTIONS}
                  placeholder={t('eventManagement.form.category_placeholder')}
                  value={form.category}
                  onChange={handleCategoryChange}
                  required
                  variant={showValidation && errors.category ? 'error' : 'default'}
                  errorText={showValidation && errors.category ? t(errors.category) : undefined}
                />
                <DateTimeField
                  id="event-date-time"
                  label={t('eventManagement.form.date_time')}
                  value={form.dateTime}
                  onChange={handleInputChange('dateTime')}
                  required
                  variant={showValidation && errors.dateTime ? 'error' : 'default'}
                  errorText={showValidation && errors.dateTime ? t(errors.dateTime) : undefined}
                />
                <Dropdown
                  id="event-price-mode"
                  label={t('eventManagement.form.price_mode')}
                  options={PRICE_MODE_OPTIONS}
                  value={form.priceMode}
                  onChange={handlePriceModeChange}
                />
                <TextField
                  id="event-price-amount"
                  label={t('eventManagement.form.price_amount')}
                  type="number"
                  min={0}
                  step={1}
                  value={form.priceAmount}
                  onChange={handleInputChange('priceAmount')}
                  disabled={form.priceMode === 'free'}
                  required={form.priceMode === 'paid'}
                  variant={showValidation && errors.priceAmount ? 'error' : 'default'}
                  errorText={showValidation && errors.priceAmount ? t(errors.priceAmount) : undefined}
                />
                <div className="create-event-page__capacity-field">
                  <label className="create-event-page__toggle-row" htmlFor="event-unlimited-capacity">
                    <input
                      id="event-unlimited-capacity"
                      type="checkbox"
                      checked={form.unlimitedCapacity}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setForm((current) => ({
                          ...current,
                          unlimitedCapacity: checked,
                          capacityValue: checked ? '' : current.capacityValue,
                        }));
                      }}
                    />
                    <span>{t('eventManagement.manage.capacity.unlimited_toggle')}</span>
                  </label>
                  <TextField
                    id="event-capacity"
                    label={t('eventManagement.manage.capacity.label')}
                    type="number"
                    min={1}
                    step={1}
                    value={form.capacityValue}
                    onChange={handleInputChange('capacityValue')}
                    disabled={form.unlimitedCapacity}
                    variant={showValidation && errors.capacity ? 'error' : 'default'}
                    errorText={showValidation && errors.capacity ? t(errors.capacity) : undefined}
                  />
                </div>
                <div className="create-event-page__address-anchor">
                  <TextField
                    id="event-address"
                    label={t('eventManagement.form.address')}
                    value={form.addressQuery}
                    onChange={handleAddressQueryChange}
                    onFocus={() => setIsLocationPickerOpen(true)}
                    required
                    variant={showValidation && errors.address ? 'error' : 'default'}
                    errorText={showValidation && errors.address ? t(errors.address) : undefined}
                    placeholder={t('eventManagement.form.address_placeholder')}
                  />
                  {isLocationPickerOpen && (
                    <div className="create-event-page__address-popup">
                      <React.Suspense fallback={<p>{t('eventManagement.form.location_picker_loading')}</p>}>
                        <LocationPicker
                          searchResults={locationSearchResults}
                          searchStatus={locationSearchStatus}
                          searchErrorKey={locationSearchErrorKey}
                          selectedLocation={selectedLocation}
                          onSelectResult={handleSelectSearchResult}
                          onPickLocation={handlePickLocation}
                        />
                      </React.Suspense>
                    </div>
                  )}
                </div>
              </Grid>

              <TextField
                id="event-description"
                label={t('eventManagement.form.description')}
                value={form.description}
                onChange={handleInputChange('description')}
                required
                variant={showValidation && errors.description ? 'error' : 'default'}
                errorText={showValidation && errors.description ? t(errors.description) : undefined}
              />

              {(showValidation && errors.location) && (
                <p className="create-event-page__error" role="alert">
                  {t(errors.location)}
                </p>
              )}
              {createErrorKey && (
                <p className="create-event-page__error" role="alert">
                  {t(createErrorKey)}
                </p>
              )}

              <Cluster justify="flex-end" gap="2">
                <Button type="button" variant="secondary" onClick={() => navigate('/app/my-events')}>
                  {t('eventManagement.create.go_to_my_events')}
                </Button>
                <Button type="submit" disabled={createStatus === 'submitting'}>
                  {t('eventManagement.create.submit')}
                </Button>
              </Cluster>
            </form>
          </Stack>
        </Section>
      </Page>
    </main>
  );
};
