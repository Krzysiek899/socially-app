import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import {
  createAuthoredEventRequest,
  fetchAuthoredEventRequest,
  fetchAuthoredEventsRequest,
  handleJoinRequestActionRequest,
  updateJoinRulesRequest,
  updateAuthoredEventRequest,
} from '../../pages/event-management/api/eventManagementApi.ts';
import type {
  AuthoredEvent,
  CreateEventPayload,
  JoinRequestAction,
  UpdateJoinRulesPayload,
  UpdateAuthoredEventPayload,
} from '../../pages/event-management/domain/eventManagementModels.ts';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
type CreateStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';
type MutationStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';

type EventManagementState = {
  authoredItems: AuthoredEvent[];
  authoredStatus: LoadStatus;
  authoredErrorKey: string | null;
  authoredRequestId: string | null;
  createStatus: CreateStatus;
  createErrorKey: string | null;
  createRequestId: string | null;
  selectedItem: AuthoredEvent | null;
  selectedStatus: LoadStatus;
  selectedErrorKey: string | null;
  selectedRequestId: string | null;
  updateStatus: MutationStatus;
  updateErrorKey: string | null;
  updateRequestId: string | null;
  rulesStatus: MutationStatus;
  rulesErrorKey: string | null;
  rulesRequestId: string | null;
  requestActionStatus: MutationStatus;
  requestActionErrorKey: string | null;
  requestActionRequestId: string | null;
};

const initialState: EventManagementState = {
  authoredItems: [],
  authoredStatus: 'idle',
  authoredErrorKey: null,
  authoredRequestId: null,
  createStatus: 'idle',
  createErrorKey: null,
  createRequestId: null,
  selectedItem: null,
  selectedStatus: 'idle',
  selectedErrorKey: null,
  selectedRequestId: null,
  updateStatus: 'idle',
  updateErrorKey: null,
  updateRequestId: null,
  rulesStatus: 'idle',
  rulesErrorKey: null,
  rulesRequestId: null,
  requestActionStatus: 'idle',
  requestActionErrorKey: null,
  requestActionRequestId: null,
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

export const fetchAuthoredEvent = createAsyncThunk<
  AuthoredEvent,
  string,
  { state: RootState; rejectValue: string }
>('eventManagement/fetchAuthoredEvent', async (eventId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('eventManagement.errors.unauthorized');
  }

  try {
    return await fetchAuthoredEventRequest(eventId, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'eventManagement.errors.fetch_failed'));
  }
});

export const updateAuthoredEvent = createAsyncThunk<
  AuthoredEvent,
  { eventId: string; payload: UpdateAuthoredEventPayload },
  { state: RootState; rejectValue: string }
>('eventManagement/updateAuthoredEvent', async ({ eventId, payload }, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('eventManagement.errors.unauthorized');
  }

  try {
    return await updateAuthoredEventRequest(eventId, payload, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'eventManagement.errors.update_failed'));
  }
});

export const updateJoinRules = createAsyncThunk<
  AuthoredEvent,
  { eventId: string; payload: UpdateJoinRulesPayload },
  { state: RootState; rejectValue: string }
>('eventManagement/updateJoinRules', async ({ eventId, payload }, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('eventManagement.errors.unauthorized');
  }

  try {
    return await updateJoinRulesRequest(eventId, payload, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'eventManagement.errors.rules_update_failed'));
  }
});

export const handleJoinRequestAction = createAsyncThunk<
  AuthoredEvent,
  { eventId: string; requestId: string; action: JoinRequestAction },
  { state: RootState; rejectValue: string }
>('eventManagement/handleJoinRequestAction', async ({ eventId, requestId, action }, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;
  if (!token) {
    return thunkApi.rejectWithValue('eventManagement.errors.unauthorized');
  }

  try {
    return await handleJoinRequestActionRequest(eventId, requestId, action, token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'eventManagement.errors.request_action_failed'));
  }
});

const upsertAuthoredItem = (state: EventManagementState, updatedItem: AuthoredEvent) => {
  const existingIndex = state.authoredItems.findIndex((event) => event.id === updatedItem.id);
  if (existingIndex >= 0) {
    state.authoredItems[existingIndex] = updatedItem;
  } else {
    state.authoredItems.unshift(updatedItem);
  }
};

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

        upsertAuthoredItem(state, action.payload);

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
      })
      .addCase(fetchAuthoredEvent.pending, (state, action) => {
        state.selectedStatus = 'loading';
        state.selectedErrorKey = null;
        state.selectedRequestId = action.meta.requestId;
      })
      .addCase(fetchAuthoredEvent.fulfilled, (state, action) => {
        if (state.selectedRequestId !== action.meta.requestId) {
          return;
        }

        state.selectedItem = action.payload;
        state.selectedStatus = 'succeeded';
        state.selectedErrorKey = null;
        state.selectedRequestId = null;
        upsertAuthoredItem(state, action.payload);
      })
      .addCase(fetchAuthoredEvent.rejected, (state, action) => {
        if (state.selectedRequestId !== action.meta.requestId) {
          return;
        }
        if (action.meta.aborted) {
          return;
        }

        state.selectedStatus = 'failed';
        state.selectedErrorKey = action.payload ?? action.error.message ?? 'eventManagement.errors.fetch_failed';
        state.selectedRequestId = null;
      })
      .addCase(updateAuthoredEvent.pending, (state, action) => {
        state.updateStatus = 'submitting';
        state.updateErrorKey = null;
        state.updateRequestId = action.meta.requestId;
      })
      .addCase(updateAuthoredEvent.fulfilled, (state, action) => {
        if (state.updateRequestId !== action.meta.requestId) {
          return;
        }

        state.updateStatus = 'succeeded';
        state.updateErrorKey = null;
        state.updateRequestId = null;
        state.selectedItem = action.payload;
        upsertAuthoredItem(state, action.payload);
      })
      .addCase(updateAuthoredEvent.rejected, (state, action) => {
        if (state.updateRequestId !== action.meta.requestId) {
          return;
        }
        if (action.meta.aborted) {
          return;
        }

        state.updateStatus = 'failed';
        state.updateErrorKey = action.payload ?? action.error.message ?? 'eventManagement.errors.update_failed';
        state.updateRequestId = null;
      })
      .addCase(updateJoinRules.pending, (state, action) => {
        state.rulesStatus = 'submitting';
        state.rulesErrorKey = null;
        state.rulesRequestId = action.meta.requestId;
      })
      .addCase(updateJoinRules.fulfilled, (state, action) => {
        if (state.rulesRequestId !== action.meta.requestId) {
          return;
        }

        state.rulesStatus = 'succeeded';
        state.rulesErrorKey = null;
        state.rulesRequestId = null;
        state.selectedItem = action.payload;
        upsertAuthoredItem(state, action.payload);
      })
      .addCase(updateJoinRules.rejected, (state, action) => {
        if (state.rulesRequestId !== action.meta.requestId) {
          return;
        }
        if (action.meta.aborted) {
          return;
        }

        state.rulesStatus = 'failed';
        state.rulesErrorKey = action.payload ?? action.error.message ?? 'eventManagement.errors.rules_update_failed';
        state.rulesRequestId = null;
      })
      .addCase(handleJoinRequestAction.pending, (state, action) => {
        state.requestActionStatus = 'submitting';
        state.requestActionErrorKey = null;
        state.requestActionRequestId = action.meta.requestId;
      })
      .addCase(handleJoinRequestAction.fulfilled, (state, action) => {
        if (state.requestActionRequestId !== action.meta.requestId) {
          return;
        }

        state.requestActionStatus = 'succeeded';
        state.requestActionErrorKey = null;
        state.requestActionRequestId = null;
        state.selectedItem = action.payload;
        upsertAuthoredItem(state, action.payload);
      })
      .addCase(handleJoinRequestAction.rejected, (state, action) => {
        if (state.requestActionRequestId !== action.meta.requestId) {
          return;
        }
        if (action.meta.aborted) {
          return;
        }

        state.requestActionStatus = 'failed';
        state.requestActionErrorKey = action.payload ?? action.error.message ?? 'eventManagement.errors.request_action_failed';
        state.requestActionRequestId = null;
      });
  },
});

export const eventManagementReducer = eventManagementSlice.reducer;
