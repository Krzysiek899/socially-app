import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NotificationProvider } from './shared/components/index.ts';
import ReactGA from 'react-ga4';
import { store } from './redux/store.ts';
import { AuthGuard } from './pages/auth/AuthGuard.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import { RegistrationPage } from './pages/auth/RegistrationPage.tsx';
import { DiscoverPage } from './pages/discover/DiscoverPage.tsx';
import { EventDetailsPage } from './pages/discover/EventDetailsPage.tsx';
import { CreateEventPage } from './pages/event-management/CreateEventPage.tsx';
import { ManageEventPage } from './pages/event-management/ManageEventPage.tsx';
import { MyEventsPage } from './pages/event-management/MyEventsPage.tsx';
import { GroupDetailsPage } from './pages/groups/GroupDetailsPage.tsx';
import { MyProfilePage } from './pages/profile/MyProfilePage.tsx';
import { NotificationCenterPage } from './pages/notification-center/NotificationCenterPage.tsx';
import { PublicProfilePage } from './pages/profile/PublicProfilePage.tsx';
import { authSessionRestored, sessionPersistencePreferenceRestored } from './redux/auth/authSlice.ts';
import {
  loadAuthSession,
  loadSessionPersistencePreference,
  saveAuthSession,
  saveSessionPersistencePreference,
} from './pages/auth/domain/authSession.ts';

// Komponent śledzący przejścia pomiędzy ścieżkami w SPA
const PageTracker = () => {
  const location = useLocation();

  React.useEffect(() => {
    // Wysłanie zdarzenia pageview z aktualną ścieżką oraz parametrami query (np. ?search=...)
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]); // Uruchamia się przy montowaniu komponentu oraz przy każdej zmianie lokacji

  return null; // Komponent nie renderuje niczego w warstwie wizualnej
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />
    <Route element={<AuthGuard />}>
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/events/:eventId" element={<EventDetailsPage />} />
      <Route path="/events/create" element={<CreateEventPage />} />
      <Route path="/my-events" element={<MyEventsPage />} />
      <Route path="/my-events/:eventId/manage" element={<ManageEventPage />} />
      <Route path="/notifications" element={<NotificationCenterPage />} />
      <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
      <Route path="/profile" element={<MyProfilePage />} />
      <Route path="/users/:userId" element={<PublicProfilePage />} />
    </Route>
    <Route path="/" element={<Navigate to="/discover" replace />} />
    <Route path="*" element={<Navigate to="/discover" replace />} />
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
          <PageTracker />
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;