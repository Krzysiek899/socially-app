import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth/authSlice.ts';
import { discoverReducer } from './discover/discoverSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discover: discoverReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
