import {
  isEventStartingWithinMinutes,
  isWithinRadiusKm,
  type GeoCoordinates,
} from '../../pages/discover/domain/hereNow.ts';

describe('Here & Now utilities', () => {
  const now = '2026-06-14T10:00:00.000Z';

  it('returns true when event starts inside 120-minute window', () => {
    expect(isEventStartingWithinMinutes('2026-06-14T11:30:00.000Z', now, 120)).toBe(true);
  });

  it('returns false when event starts outside 120-minute window', () => {
    expect(isEventStartingWithinMinutes('2026-06-14T12:30:01.000Z', now, 120)).toBe(false);
  });

  it('returns false for past events', () => {
    expect(isEventStartingWithinMinutes('2026-06-14T09:59:59.000Z', now, 120)).toBe(false);
  });

  it('returns true for point inside 5 km radius', () => {
    const user: GeoCoordinates = { lat: 52.2297, lng: 21.0122 };
    const event: GeoCoordinates = { lat: 52.2326, lng: 20.9842 };
    expect(isWithinRadiusKm(user, event, 5)).toBe(true);
  });

  it('returns false for point outside 5 km radius', () => {
    const user: GeoCoordinates = { lat: 52.2297, lng: 21.0122 };
    const event: GeoCoordinates = { lat: 52.4064, lng: 16.9252 };
    expect(isWithinRadiusKm(user, event, 5)).toBe(false);
  });
});
