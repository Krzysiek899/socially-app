import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import { fetchNotificationsRequest, markAsReadRequest } from '../../pages/notification-center/api/notificationCenterApi.ts';
import type { AppNotification } from '../../pages/notification-center/domain/notificationModels.ts';

type NotificationStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type NotificationResourceState = {
  items: AppNotification[];
  status: NotificationStatus;
  errorKey: string | null;
  currentRequestId: string | null;
};

type NotificationCenterState = {
  notifications: NotificationResourceState;
};

const initialState: NotificationCenterState = {
  notifications: {
    items: [],
    status: 'idle',
    errorKey: null,
    currentRequestId: null,
  },
};

const getErrorKey = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
};

export const fetchNotifications = createAsyncThunk<
  AppNotification[],
  void,
  { state: RootState; rejectValue: string }
>('notificationCenter/fetchNotifications', async (_, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('notifications.errors.unauthorized');
  }

  try {
    return await fetchNotificationsRequest(token, thunkApi.signal);
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'notifications.errors.fetch_failed'));
  }
});

export const markNotificationAsRead = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>('notificationCenter/markNotificationAsRead', async (notificationId, thunkApi) => {
  const token = thunkApi.getState().auth.session?.token;

  if (!token) {
    return thunkApi.rejectWithValue('notifications.errors.unauthorized');
  }

  try {
    await markAsReadRequest(notificationId, token, thunkApi.signal);
    return notificationId;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorKey(error, 'notifications.errors.update_failed'));
  }
});

const notificationCenterSlice = createSlice({
  name: 'notificationCenter',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state, action) => {
        state.notifications.status = 'loading';
        state.notifications.errorKey = null;
        state.notifications.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        if (state.notifications.currentRequestId !== action.meta.requestId) return;

        state.notifications.items = action.payload;
        state.notifications.status = 'succeeded';
        state.notifications.errorKey = null;
        state.notifications.currentRequestId = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        if (state.notifications.currentRequestId !== action.meta.requestId) return;
        if (action.meta.aborted) return;

        state.notifications.status = 'failed';
        state.notifications.errorKey = action.payload ?? action.error.message ?? 'notifications.errors.fetch_failed';
        state.notifications.currentRequestId = null;
      })
      
      // Mark as Read (Optimistic Update)
      .addCase(markNotificationAsRead.pending, (state, action) => {
        const notification = state.notifications.items.find(n => n.id === action.meta.arg);
        if (notification) {
          notification.isRead = true; // Optimistic update
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        // Revert optimistic update if failed
        const notification = state.notifications.items.find(n => n.id === action.meta.arg);
        if (notification) {
          notification.isRead = false;
        }
      });
  },
});

export const notificationCenterReducer = notificationCenterSlice.reducer;