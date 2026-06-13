import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import {
  createAuthoredEventRequest,
  fetchAuthoredEventsRequest,
} from '../../pages/event-management/api/eventManagementApi.ts';
import type {
  AuthoredEvent,
  CreateEventPayload,
} from '../../pages/event-management/domain/eventManagementModels.ts';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
type CreateStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';

type EventManagementState = {
  authoredItems: AuthoredEvent[];
  authoredStatus: LoadStatus;
  authoredErrorKey: string | null;
  authoredRequestId: string | null;
  createStatus: CreateStatus;
  createErrorKey: string | null;
  createRequestId: string | null;
};

const initialState: EventManagementState = {
  authoredItems: [],
  authoredStatus: 'idle',
  authoredErrorKey: null,
  authoredRequestId: null,
  createStatus: 'idle',
  createErrorKey: null,
  createRequestId: null,
};

const getErrorKey = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
};

export const fetchAuthoredEvents = createAsyncThunk<
  AuthoredEvent[],
  void,
  { state: RootState; rejectValue: string }
>('eventManagement/fetchAuthoredEvents', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('eventManagement.errors.unauthorized');
  }

  try {
    return await fetchAuthoredEventsRequest(token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'eventManagement.errors.fetch_failed'));
  }
});

export const createAuthoredEvent = createAsyncThunk<
  AuthoredEvent,
  CreateEventPayload,
  { state: RootState; rejectValue: string }
>('eventManagement/createAuthoredEvent', async (payload, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('eventManagement.errors.unauthorized');
  }

  try {
    return await createAuthoredEventRequest(payload, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'eventManagement.errors.create_failed'));
  }
});

const eventManagementSlice = createSlice({
  name: 'eventManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthoredEvents.pending, (state, action) => {
        state.authoredStatus = 'loading';
        state.authoredErrorKey = null;
        state.authoredRequestId = action.meta.requestId;
      })
      .addCase(fetchAuthoredEvents.fulfilled, (state, action) => {
        if (state.authoredRequestId !== action.meta.requestId) {
          return;
        }

        state.authoredItems = action.payload;
        state.authoredStatus = 'succeeded';
        state.authoredErrorKey = null;
        state.authoredRequestId = null;
      })
      .addCase(fetchAuthoredEvents.rejected, (state, action) => {
        if (state.authoredRequestId !== action.meta.requestId) {
          return;
        }

        if (action.meta.aborted) {
          return;
        }

        state.authoredStatus = 'failed';
        state.authoredErrorKey = action.payload ?? action.error.message ?? 'eventManagement.errors.fetch_failed';
        state.authoredRequestId = null;
      })
      .addCase(createAuthoredEvent.pending, (state, action) => {
        state.createStatus = 'submitting';
        state.createErrorKey = null;
        state.createRequestId = action.meta.requestId;
      })
      .addCase(createAuthoredEvent.fulfilled, (state, action) => {
        if (state.createRequestId !== action.meta.requestId) {
          return;
        }

        const existingIndex = state.authoredItems.findIndex((event) => event.id === action.payload.id);
        if (existingIndex >= 0) {
          state.authoredItems[existingIndex] = action.payload;
        } else {
          state.authoredItems.unshift(action.payload);
        }

        state.authoredStatus = 'succeeded';
        state.authoredErrorKey = null;
        state.createStatus = 'succeeded';
        state.createErrorKey = null;
        state.createRequestId = null;
      })
      .addCase(createAuthoredEvent.rejected, (state, action) => {
        if (state.createRequestId !== action.meta.requestId) {
          return;
        }

        if (action.meta.aborted) {
          return;
        }

        state.createStatus = 'failed';
        state.createErrorKey = action.payload ?? action.error.message ?? 'eventManagement.errors.create_failed';
        state.createRequestId = null;
      });
  },
});

export const eventManagementReducer = eventManagementSlice.reducer;
