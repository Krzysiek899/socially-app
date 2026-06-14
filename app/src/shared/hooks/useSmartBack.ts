// src/shared/hooks/useSmartBack.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSmartBack = (fallbackRoute: string = '/') => {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    const hasHistory = window.history.state && window.history.state.idx > 0;

    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallbackRoute, { replace: true });
    }
  }, [navigate, fallbackRoute]);

  return goBack;
};