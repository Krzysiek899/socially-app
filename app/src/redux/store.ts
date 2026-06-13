import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth/authSlice.ts';
import { discoverReducer } from './discover/discoverSlice.ts';
import { eventManagementReducer } from './eventManagement/eventManagementSlice.ts';
import { profileReducer } from './profile/profileSlice.ts';
import { notificationCenterReducer } from './notification-center/notificationCenterSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discover: discoverReducer,
    eventManagement: eventManagementReducer,
    profile: profileReducer,
    notificationCenter: notificationCenterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;