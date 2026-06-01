import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/authSlice.ts';
import { discoverReducer } from '../features/discover/discoverSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discover: discoverReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
