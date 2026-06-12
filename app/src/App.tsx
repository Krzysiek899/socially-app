import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { store } from './app/store.ts';
import { Playground } from './playground/Playground.tsx';
import { AuthGuard } from './features/auth/AuthGuard.tsx';
import { LoginPage } from './features/auth/LoginPage.tsx';
import { RegistrationPage } from './features/auth/RegistrationPage.tsx';
import { DiscoverPage } from './features/discover/DiscoverPage.tsx';
import { EventDetailsPage } from './features/discover/EventDetailsPage.tsx';
import { authSessionRestored, sessionPersistencePreferenceRestored } from './features/auth/redux/authSlice.ts';
import {
  loadAuthSession,
  loadSessionPersistencePreference,
  saveAuthSession,
  saveSessionPersistencePreference,
} from './features/auth/domain/authSession.ts';

const AppRoutes = () => (
  <Routes>
    <Route path="/playground" element={<Playground />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />
    <Route element={<AuthGuard />}>
      <Route path="/app" element={<DiscoverPage />} />
      <Route path="/app/events/:eventId" element={<EventDetailsPage />} />
    </Route>
    <Route path="/" element={<Navigate to="/app" replace />} />
    <Route path="*" element={<Navigate to="/app" replace />} />
  </Routes>
);

function App() {
  React.useEffect(() => {
    store.dispatch(authSessionRestored(loadAuthSession()));
    store.dispatch(sessionPersistencePreferenceRestored(loadSessionPersistencePreference()));

    const unsubscribe = store.subscribe(() => {
      const authState = store.getState().auth;
      saveAuthSession(authState.session, authState.sessionPersistencePreference);
      saveSessionPersistencePreference(authState.sessionPersistencePreference);
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
