import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/redux/authSlice.ts';
import { discoverReducer } from '../features/discover/redux/discoverSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discover: discoverReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
