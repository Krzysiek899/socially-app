import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import { fetchDiscoverEventsRequest } from '../../pages/discover/api/discoverApi.ts';
import { isWithinRadiusKm } from '../../pages/discover/domain/hereNow.ts';
import type {
  DiscoverCategoryCode,
  DiscoverEvent,
  DiscoverFilters,
  DiscoverPriceFilter,
} from '../../pages/discover/domain/discoverModels.ts';

type DiscoverStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'error';

type DiscoverState = {
  items: DiscoverEvent[];
  status: DiscoverStatus;
  errorKey: string | null;
  selectedEventId: string | null;
  filters: DiscoverFilters;
  currentRequestId: string | null;
  geolocationStatus: GeolocationStatus;
  userLocation: { lat: number; lng: number } | null;
};

const initialState: DiscoverState = {
  items: [],
  status: 'idle',
  errorKey: null,
  selectedEventId: null,
  filters: {
    searchQuery: '',
    categories: [],
    price: 'all',
    dateFrom: '',
    dateTo: '',
    hereNowEnabled: false,
    startsWithinMinutes: null,
  },
  currentRequestId: null,
  geolocationStatus: 'idle',
  userLocation: null,
};

const getErrorKey = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
};

export const fetchDiscoverEvents = createAsyncThunk<
  DiscoverEvent[],
  void,
  { state: RootState; rejectValue: string }
>('discover/fetchDiscoverEvents', async (_, thunkApi) => {
  const state = thunkApi.getState();
  const session = state.auth.session;

  if (!session) {
    return thunkApi.rejectWithValue('discover.errors.unauthorized');
  }

  try {
    const apiItems = await fetchDiscoverEventsRequest(state.discover.filters, session.token, thunkApi.signal);

    const userLocation = state.discover.userLocation;
    if (state.discover.filters.hereNowEnabled && userLocation) {
      return apiItems.filter((event) => isWithinRadiusKm(userLocation, event.location, 5));
    }

    return apiItems;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'discover.errors.fetch_failed'));
  }
});

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    searchQuerySet: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    categoriesSet: (state, action: PayloadAction<DiscoverCategoryCode[]>) => {
      state.filters.categories = action.payload;
    },
    priceFilterSet: (state, action: PayloadAction<DiscoverPriceFilter>) => {
      state.filters.price = action.payload;
    },
    dateFromSet: (state, action: PayloadAction<string>) => {
      state.filters.dateFrom = action.payload;
    },
    dateToSet: (state, action: PayloadAction<string>) => {
      state.filters.dateTo = action.payload;
    },
    hereNowToggled: (state, action: PayloadAction<boolean>) => {
      state.filters.hereNowEnabled = action.payload;
      state.filters.startsWithinMinutes = action.payload ? 120 : null;
      if (!action.payload) {
        state.geolocationStatus = 'idle';
        state.userLocation = null;
      }
    },
    geolocationRequestStarted: (state) => {
      state.geolocationStatus = 'requesting';
    },
    geolocationResolved: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.geolocationStatus = 'granted';
      state.userLocation = action.payload;
    },
    geolocationFailed: (state) => {
      state.geolocationStatus = 'error';
      state.filters.hereNowEnabled = false;
      state.filters.startsWithinMinutes = null;
      state.userLocation = null;
    },
    selectedEventSet: (state, action: PayloadAction<string>) => {
      state.selectedEventId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscoverEvents.pending, (state, action) => {
        state.status = 'loading';
        state.errorKey = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchDiscoverEvents.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.items = action.payload;
        state.status = 'succeeded';
        state.errorKey = null;
        state.currentRequestId = null;
        if (action.payload.length === 0) {
          state.selectedEventId = null;
          return;
        }

        const selectedStillExists = state.selectedEventId
          ? action.payload.some((event) => event.id === state.selectedEventId)
          : false;

        if (!selectedStillExists) {
          state.selectedEventId = action.payload[0].id;
        }
      })
      .addCase(fetchDiscoverEvents.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        if (action.meta.aborted) {
          return;
        }

        state.status = 'failed';
        state.errorKey = action.payload ?? action.error.message ?? 'discover.errors.fetch_failed';
        state.currentRequestId = null;
      });
  },
});

export const {
  searchQuerySet,
  categoriesSet,
  priceFilterSet,
  dateFromSet,
  dateToSet,
  hereNowToggled,
  geolocationRequestStarted,
  geolocationResolved,
  geolocationFailed,
  selectedEventSet,
} = discoverSlice.actions;
export const discoverReducer = discoverSlice.reducer;
