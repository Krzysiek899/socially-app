import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NotificationProvider } from './shared/components/index.ts';
import ReactGA from 'react-ga4';
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
    <Route path="/playground" element={<Playground />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />
    <Route element={<AuthGuard />}>
      <Route path="/app" element={<DiscoverPage />} />
      <Route path="/app/events/:eventId" element={<EventDetailsPage />} />
      <Route path="/app/events/create" element={<CreateEventPage />} />
      <Route path="/app/my-events" element={<MyEventsPage />} />
      <Route path="/app/my-events/:eventId/manage" element={<ManageEventPage />} />
      <Route path="/app/notifications" element={<NotificationCenterPage />} />
      <Route path="/app/groups/:groupId" element={<GroupDetailsPage />} />
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
          <PageTracker />
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;