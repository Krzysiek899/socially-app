import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks.ts';
import { buildReturnTo } from './authNavigation.ts';

export const AuthGuard = () => {
  const session = useAppSelector((state) => state.auth.session);
  const location = useLocation();

  if (!session) {
    const returnTo = buildReturnTo(location.pathname, location.search, location.hash);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
};
