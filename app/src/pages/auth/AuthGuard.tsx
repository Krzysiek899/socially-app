import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks.ts';
import { buildReturnTo } from './authNavigation.ts';

export const AuthGuard = () => {
  const session = useAppSelector((state) => state.auth.session);
  const bootstrapped = useAppSelector((state) => state.auth.bootstrapped);
  const location = useLocation();

  if (!bootstrapped) {
    return null;
  }

  if (!session) {
    const returnTo = buildReturnTo(location.pathname, location.search, location.hash);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
};
