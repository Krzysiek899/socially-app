import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth/authSlice.ts';
import { discoverReducer } from './discover/discoverSlice.ts';
import { eventManagementReducer } from './eventManagement/eventManagementSlice.ts';
import { groupsReducer } from './groups/groupsSlice.ts';
import { profileReducer } from './profile/profileSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discover: discoverReducer,
    eventManagement: eventManagementReducer,
    groups: groupsReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
