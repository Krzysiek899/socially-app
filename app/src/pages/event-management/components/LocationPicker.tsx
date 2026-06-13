import * as React from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '../../../shared/components/index.ts';
import { Stack } from '../../../shared/layout/index.tsx';
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
  searchResults: GeocodeResult[];
  searchStatus: 'idle' | 'loading' | 'failed';
  searchErrorKey: string | null;
  selectedLocation: { lat: number; lng: number } | null;
  onSelectResult: (resultId: string) => void;
  onPickLocation: (location: { lat: number; lng: number }) => void;
};

export const LocationPicker = ({
  searchResults,
  searchStatus,
  searchErrorKey,
  selectedLocation,
  onSelectResult,
  onPickLocation,
}: LocationPickerProps) => (
  <section className="location-picker" aria-label={t('eventManagement.form.location_picker')}>
    <Stack gap="2">
      {searchStatus === 'loading' && <p className="location-picker__hint">{t('eventManagement.form.location_search_loading')}</p>}
      {searchStatus === 'failed' && searchErrorKey && (
        <p className="location-picker__error" role="alert">
          {t(searchErrorKey)}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="location-picker__results" role="listbox" aria-label={t('eventManagement.form.location_search_results')}>
          {searchResults.map((result) => (
            <Button key={result.id} type="button" size="sm" variant="secondary" onClick={() => onSelectResult(result.id)}>
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
