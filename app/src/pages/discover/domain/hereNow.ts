export type GeoCoordinates = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number): number => (value * Math.PI) / 180;

export const isEventStartingWithinMinutes = (
  eventDateTime: string,
  nowIso: string,
  windowMinutes: number,
): boolean => {
  const eventMs = Date.parse(eventDateTime);
  const nowMs = Date.parse(nowIso);
  const diffMs = eventMs - nowMs;

  return diffMs >= 0 && diffMs <= windowMinutes * 60_000;
};

export const distanceKm = (from: GeoCoordinates, to: GeoCoordinates): number => {
  const latDiff = toRadians(to.lat - from.lat);
  const lngDiff = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const haversine = Math.sin(latDiff / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDiff / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
};

export const isWithinRadiusKm = (
  from: GeoCoordinates,
  to: GeoCoordinates,
  radiusKm: number,
): boolean => distanceKm(from, to) <= radiusKm;
