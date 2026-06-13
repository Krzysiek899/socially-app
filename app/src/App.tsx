import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from './shared/components/index.ts';
import { store } from './redux/store.ts';
import { Playground } from './playground/Playground.tsx';
import { AuthGuard } from './pages/auth/AuthGuard.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegistrationPage } from './pages/auth/RegistrationPage.tsx';
import { DiscoverPage } from './pages/discover/DiscoverPage.tsx';
import { EventDetailsPage } from './pages/discover/EventDetailsPage.tsx';
import { CreateEventPage } from './pages/event-management/CreateEventPage.tsx';
import { ManageEventPage } from './pages/event-management/ManageEventPage.tsx';
import { MyEventsPage } from './pages/event-management/MyEventsPage.tsx';
import { MyProfilePage } from './pages/profile/MyProfilePage.tsx';
import { PublicProfilePage } from './pages/profile/PublicProfilePage.tsx';
import { authSessionRestored, sessionPersistencePreferenceRestored } from './redux/auth/authSlice.ts';
import {
  loadAuthSession,
  loadSessionPersistencePreference,
  saveAuthSession,
  saveSessionPersistencePreference,
} from './pages/auth/domain/authSession.ts';

const AppRoutes = () => (
  <Routes>
    <Route path="/playground" element={<Playground />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />
    <Route element={<AuthGuard />}>
      <Route path="/app" element={<DiscoverPage />} />
      <Route path="/app/events/:eventId" element={<EventDetailsPage />} />
      <Route path="/app/events/create" element={<CreateEventPage />} />
      <Route path="/app/my-events" element={<MyEventsPage />} />
      <Route path="/app/my-events/:eventId/manage" element={<ManageEventPage />} />
      <Route path="/app/profile" element={<MyProfilePage />} />
      <Route path="/app/users/:userId" element={<PublicProfilePage />} />
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
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;
