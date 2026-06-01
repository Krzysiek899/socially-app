import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loginRequest } from './authApi.ts';
import type { AuthSession } from './authSession.ts';

type AuthState = {
  session: AuthSession | null;
  status: 'idle' | 'loading' | 'failed';
  errorKey: string | null;
};

const initialState: AuthState = {
  session: null,
  status: 'idle',
  errorKey: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }) => loginRequest(payload),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSessionRestored: (state, action: PayloadAction<AuthSession | null>) => {
      state.session = action.payload;
    },
    logout: (state) => {
      state.session = null;
      state.status = 'idle';
      state.errorKey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.errorKey = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'idle';
        state.errorKey = null;
      })
      .addCase(login.rejected, (state) => {
        state.status = 'failed';
        state.errorKey = 'auth.login.invalid_credentials';
      });
  },
});

export const { authSessionRestored, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
