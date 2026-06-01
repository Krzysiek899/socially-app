import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { store } from './app/store.ts';
import { Playground } from './playground/Playground.tsx';
import { AuthGuard } from './features/auth/AuthGuard.tsx';
import { AuthenticatedHomePage } from './features/auth/AuthenticatedHomePage.tsx';
import { LoginPage } from './features/auth/LoginPage.tsx';
import { RegistrationPage } from './features/auth/RegistrationPage.tsx';
import { authSessionRestored } from './features/auth/authSlice.ts';
import { loadAuthSession, saveAuthSession } from './features/auth/authSession.ts';

const AppRoutes = () => (
  <Routes>
    <Route path="/playground" element={<Playground />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />
    <Route element={<AuthGuard />}>
      <Route path="/app" element={<AuthenticatedHomePage />} />
    </Route>
    <Route path="/" element={<Navigate to="/app" replace />} />
    <Route path="*" element={<Navigate to="/app" replace />} />
  </Routes>
);

function App() {
  useEffect(() => {
    store.dispatch(authSessionRestored(loadAuthSession()));

    const unsubscribe = store.subscribe(() => {
      saveAuthSession(store.getState().auth.session);
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
