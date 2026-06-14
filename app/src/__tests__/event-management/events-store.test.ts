import { getDiscoverEventById, joinEventForUser, upsertKnownUser } from '../../mocks/events/store.ts';

describe('events store', () => {
  it('uses upserted display name for joined attendees', () => {
    const userId = `firebase-user-${Date.now()}`;
    upsertKnownUser(userId, { displayName: 'Jan Kowalski' });

    const result = joinEventForUser(userId, 'event-krakow-jazz-night');
    expect(result).toEqual({ type: 'ok', state: 'joined' });

    const event = getDiscoverEventById('event-krakow-jazz-night');
    const attendee = event?.attendees.find((entry) => entry.id === userId);

    expect(attendee?.displayName).toBe('Jan Kowalski');
  });
});
