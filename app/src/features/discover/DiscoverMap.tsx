import React, { useMemo } from 'react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { DiscoverEvent } from './domain/discoverModels.ts';
import { configureLeafletIcons } from './leafletSetup.ts';
import { t } from '../../i18n/index.ts';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

configureLeafletIcons();

type DiscoverMapProps = {
  events: DiscoverEvent[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
};

const DEFAULT_CENTER: [number, number] = [52.2297, 21.0122];
const DEFAULT_ZOOM = 6;
const FOCUSED_ZOOM = 13;

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

const FitToEvents = ({ events }: { events: DiscoverEvent[] }) => {
  const map = useMap();

  React.useEffect(() => {
    if (events.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(events.map((event) => [event.location.lat, event.location.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [events, map]);

  return null;
};

const FocusSelectedEvent = ({
  selectedEvent,
}: {
  selectedEvent: DiscoverEvent | undefined;
}) => {
  const map = useMap();

  React.useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    map.setView([selectedEvent.location.lat, selectedEvent.location.lng], Math.max(map.getZoom(), FOCUSED_ZOOM), {
      animate: true,
    });
  }, [map, selectedEvent]);

  return null;
};

const InvalidateMapSize = ({ dependencyKey }: { dependencyKey: string }) => {
  const map = useMap();

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
    });

    const onResize = () => map.invalidateSize({ pan: false });
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [dependencyKey, map]);

  return null;
};

export const DiscoverMap = ({ events, selectedEventId, onSelectEvent }: DiscoverMapProps) => {
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  );
  const invalidateKey = `${events.length}:${selectedEventId ?? 'none'}`;

  return (
    <MapContainer
      className="discover-map"
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <InvalidateMapSize dependencyKey={invalidateKey} />
      <FitToEvents events={events} />
      <FocusSelectedEvent selectedEvent={selectedEvent} />
      <MarkerClusterGroup chunkedLoading>
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            eventHandlers={{
              click: () => onSelectEvent(event.id),
            }}
          >
            <Popup>
              <div className="discover-map__popup">
                <strong>{event.title}</strong>
                <span>{formatPrice(event)}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};
