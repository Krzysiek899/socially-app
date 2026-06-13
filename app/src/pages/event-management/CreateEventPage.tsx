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
import { searchEventAddressRequest } from './api/eventManagementApi.ts';
import './CreateEventPage.css';

const LocationPicker = React.lazy(async () => import('./components/LocationPicker.tsx').then((module) => ({ default: module.LocationPicker })));

type PriceMode = 'free' | 'paid';

type FormState = {
  title: string;
  description: string;
  dateTime: string;
  category: string;
  city: string;
  street: string;
  buildingNumber: string;
  postalCode: string;
  priceMode: PriceMode;
  priceAmount: string;
};

type FormErrors = Partial<Record<
  'title' | 'description' | 'dateTime' | 'category' | 'city' | 'street' | 'buildingNumber' | 'priceAmount' | 'location',
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
  city: '',
  street: '',
  buildingNumber: '',
  postalCode: '',
  priceMode: 'free',
  priceAmount: '0',
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

  if (form.city.trim().length === 0) {
    errors.city = 'eventManagement.validation.city';
  }

  if (form.street.trim().length === 0) {
    errors.street = 'eventManagement.validation.street';
  }

  if (form.buildingNumber.trim().length === 0) {
    errors.buildingNumber = 'eventManagement.validation.building_number';
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

  return errors;
};

const toPayload = (
  form: FormState,
  selectedLocation: { lat: number; lng: number } | null,
): CreateEventPayload => {
  const dateTime = toIsoDateTime(form.dateTime);
  if (!dateTime || !isCategoryCode(form.category) || !selectedLocation) {
    throw new Error('eventManagement.errors.request_invalid');
  }

  const amount = form.priceMode === 'free' ? 0 : Number(form.priceAmount);

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    dateTime,
    category: form.category,
    address: {
      city: form.city.trim(),
      street: form.street.trim(),
      buildingNumber: form.buildingNumber.trim(),
      postalCode: form.postalCode.trim() || undefined,
    },
    location: selectedLocation,
    price: {
      amount,
      currency: 'PLN',
      isFree: form.priceMode === 'free',
    },
  };
};

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { createStatus, createErrorKey } = useAppSelector((state) => state.eventManagement);
  const token = useAppSelector((state) => state.auth.session?.token);
  const [form, setForm] = React.useState<FormState>(initialFormState);
  const [submitted, setSubmitted] = React.useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = React.useState('');
  const [locationSearchStatus, setLocationSearchStatus] = React.useState<'idle' | 'loading' | 'failed'>('idle');
  const [locationSearchErrorKey, setLocationSearchErrorKey] = React.useState<string | null>(null);
  const [locationSearchResults, setLocationSearchResults] = React.useState<GeocodeResult[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number; lng: number } | null>(null);

  const errors = React.useMemo(() => validateForm(form, selectedLocation), [form, selectedLocation]);
  const showValidation = submitted;

  const handleInputChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
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

  const handleSearchLocation = async () => {
    if (!token) {
      setLocationSearchStatus('failed');
      setLocationSearchErrorKey('eventManagement.errors.unauthorized');
      return;
    }

    const controller = new AbortController();
    setLocationSearchStatus('loading');
    setLocationSearchErrorKey(null);
    try {
      const results = await searchEventAddressRequest(locationSearchQuery, token, controller.signal);
      setLocationSearchResults(results);
      setLocationSearchStatus('idle');
      if (results.length === 0) {
        setLocationSearchErrorKey('eventManagement.errors.location_not_found');
      }
    } catch (error) {
      setLocationSearchResults([]);
      setLocationSearchStatus('failed');
      if (error instanceof Error) {
        setLocationSearchErrorKey(error.message);
      } else {
        setLocationSearchErrorKey('eventManagement.errors.fetch_failed');
      }
    }
  };

  const handleSelectSearchResult = (resultId: string) => {
    const selectedResult = locationSearchResults.find((result) => result.id === resultId);
    if (!selectedResult) {
      return;
    }

    setForm((current) => ({
      ...current,
      city: selectedResult.address.city,
      street: selectedResult.address.street,
      buildingNumber: selectedResult.address.buildingNumber,
      postalCode: selectedResult.address.postalCode ?? '',
    }));
    setSelectedLocation(selectedResult.location);
  };

  const handlePickLocation = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = toPayload(form, selectedLocation);
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
                <TextField
                  id="event-city"
                  label={t('eventManagement.form.city')}
                  value={form.city}
                  onChange={handleInputChange('city')}
                  required
                  variant={showValidation && errors.city ? 'error' : 'default'}
                  errorText={showValidation && errors.city ? t(errors.city) : undefined}
                />
                <TextField
                  id="event-street"
                  label={t('eventManagement.form.street')}
                  value={form.street}
                  onChange={handleInputChange('street')}
                  required
                  variant={showValidation && errors.street ? 'error' : 'default'}
                  errorText={showValidation && errors.street ? t(errors.street) : undefined}
                />
                <TextField
                  id="event-building-number"
                  label={t('eventManagement.form.building_number')}
                  value={form.buildingNumber}
                  onChange={handleInputChange('buildingNumber')}
                  required
                  variant={showValidation && errors.buildingNumber ? 'error' : 'default'}
                  errorText={showValidation && errors.buildingNumber ? t(errors.buildingNumber) : undefined}
                />
                <TextField
                  id="event-postal-code"
                  label={t('eventManagement.form.postal_code')}
                  value={form.postalCode}
                  onChange={handleInputChange('postalCode')}
                />
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

              <React.Suspense fallback={<p>{t('eventManagement.form.location_picker_loading')}</p>}>
                <LocationPicker
                  searchValue={locationSearchQuery}
                  onSearchValueChange={setLocationSearchQuery}
                  searchResults={locationSearchResults}
                  searchStatus={locationSearchStatus}
                  searchErrorKey={locationSearchErrorKey}
                  selectedLocation={selectedLocation}
                  onSearch={handleSearchLocation}
                  onSelectResult={handleSelectSearchResult}
                  onPickLocation={handlePickLocation}
                />
              </React.Suspense>

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
