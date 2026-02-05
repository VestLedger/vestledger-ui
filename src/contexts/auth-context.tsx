'use client'

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginRequested,
  logoutRequested,
  clearAuthError,
  type AuthStatus,
} from '@/store/slices/authSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { User, UserRole } from '@/types/auth';
import { PERSONA_CONFIG } from '@/types/auth';
import { useToast } from '@/ui';
import { getAuthErrorMessage } from '@/utils/auth-error-message';

export type { User, UserRole };
export { PERSONA_CONFIG };

interface AuthContextType {
  hydrated: boolean;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: NormalizedError | undefined;
  accessToken: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  clearError: () => void;
  user: User | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthErrorToast />
      {children}
    </>
  );
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const login = useCallback<AuthContextType['login']>(
    (email, password) => {
      dispatch(loginRequested({ email, password }));
    },
    [dispatch]
  );

  const logout = useCallback<AuthContextType['logout']>(() => {
    dispatch(logoutRequested());
  }, [dispatch]);

  const clearError = useCallback<AuthContextType['clearError']>(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return { hydrated, isAuthenticated, status, error, accessToken, login, logout, clearError, user };
}

function AuthErrorToast() {
  const toast = useToast();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!error || status !== 'failed') {
      if (!error) {
        lastMessageRef.current = null;
      }
      return;
    }

    const message = getAuthErrorMessage(error);

    if (lastMessageRef.current === message) {
      return;
    }

    toast.error(message, 'Sign-in failed');
    lastMessageRef.current = message;
  }, [error, status, toast]);

  return null;
}
