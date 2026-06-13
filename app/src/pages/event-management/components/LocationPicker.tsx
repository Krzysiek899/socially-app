import * as React from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, TextField } from '../../../shared/components/index.ts';
import { Cluster, Stack } from '../../../shared/layout/index.tsx';
import { t } from '../../../i18n/index.ts';
import { configureLeafletIcons } from '../../discover/leafletSetup.ts';
import type { GeocodeResult } from '../domain/eventManagementModels.ts';
import './LocationPicker.css';

configureLeafletIcons();

const DEFAULT_CENTER: [number, number] = [52.2297, 21.0122];
const DEFAULT_ZOOM = 6;

type MapClickHandlerProps = {
  onPickLocation: (location: { lat: number; lng: number }) => void;
};

const MapClickHandler = ({ onPickLocation }: MapClickHandlerProps) => {
  useMapEvents({
    click: (event) => {
      onPickLocation({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

export type LocationPickerProps = {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchResults: GeocodeResult[];
  searchStatus: 'idle' | 'loading' | 'failed';
  searchErrorKey: string | null;
  selectedLocation: { lat: number; lng: number } | null;
  onSearch: () => void;
  onSelectResult: (resultId: string) => void;
  onPickLocation: (location: { lat: number; lng: number }) => void;
};

export const LocationPicker = ({
  searchValue,
  onSearchValueChange,
  searchResults,
  searchStatus,
  searchErrorKey,
  selectedLocation,
  onSearch,
  onSelectResult,
  onPickLocation,
}: LocationPickerProps) => (
  <section className="location-picker" aria-label={t('eventManagement.form.location_picker')}>
    <Stack gap="2">
      <Cluster align="end" gap="2">
        <TextField
          id="event-location-search"
          label={t('eventManagement.form.location_search')}
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
        />
        <Button type="button" variant="secondary" onClick={onSearch} disabled={searchStatus === 'loading'}>
          {t('eventManagement.form.location_search_action')}
        </Button>
      </Cluster>

      {searchStatus === 'failed' && searchErrorKey && (
        <p className="location-picker__error" role="alert">
          {t(searchErrorKey)}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="location-picker__results">
          {searchResults.map((result) => (
            <Button key={result.id} type="button" size="sm" variant="ghost" onClick={() => onSelectResult(result.id)}>
              {result.label}
            </Button>
          ))}
        </div>
      )}

      <MapContainer
        className="location-picker__map"
        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : DEFAULT_CENTER}
        zoom={selectedLocation ? 14 : DEFAULT_ZOOM}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPickLocation={onPickLocation} />
        {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]} />}
      </MapContainer>
      <p className="location-picker__hint">{t('eventManagement.form.location_hint')}</p>
    </Stack>
  </section>
);
