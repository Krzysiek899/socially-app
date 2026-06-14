import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, logoutRequest, registerRequest } from '../../pages/auth/api/authApi.ts';
import type { AuthSession, SessionPersistencePreference } from '../../pages/auth/domain/authSession.ts';

type AuthState = {
  session: AuthSession | null;
  bootstrapped: boolean;
  sessionPersistencePreference: SessionPersistencePreference;
  status: 'idle' | 'loading' | 'failed';
  errorKey: string | null;
};

const initialState: AuthState = {
  session: null,
  bootstrapped: false,
  sessionPersistencePreference: 'persistent',
  status: 'idle',
  errorKey: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string; rememberMe: boolean }) =>
    loginRequest({ email: payload.email, password: payload.password, rememberMe: payload.rememberMe }),
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { fullName: string; email: string; password: string }) => registerRequest(payload),
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutRequest();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authSessionRestored: (state, action: PayloadAction<AuthSession | null>) => {
      state.session = action.payload;
      state.bootstrapped = true;
    },
    sessionPersistencePreferenceRestored: (state, action: PayloadAction<SessionPersistencePreference>) => {
      state.sessionPersistencePreference = action.payload;
    },
    sessionPersistencePreferenceSet: (state, action: PayloadAction<SessionPersistencePreference>) => {
      state.sessionPersistencePreference = action.payload;
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
        state.bootstrapped = true;
        state.status = 'idle';
        state.errorKey = null;
      })
      .addCase(login.rejected, (state) => {
        state.status = 'failed';
        state.errorKey = 'auth.login.invalid_credentials';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.errorKey = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.session = action.payload;
        state.bootstrapped = true;
        state.status = 'idle';
        state.errorKey = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.errorKey = (action.error.message ?? 'auth.registration.submit_failed');
      })
      .addCase(logout.fulfilled, (state) => {
        state.session = null;
        state.bootstrapped = true;
        state.status = 'idle';
        state.errorKey = null;
      });
  },
});

export const {
  authSessionRestored,
  sessionPersistencePreferenceRestored,
  sessionPersistencePreferenceSet,
} = authSlice.actions;
export const authReducer = authSlice.reducer;
