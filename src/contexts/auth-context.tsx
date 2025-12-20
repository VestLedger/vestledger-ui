'use client'

import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginRequested,
  logoutRequested,
  switchRoleRequested,
} from '@/store/slices/authSlice';
import type { User, UserRole } from '@/types/auth';
import { PERSONA_CONFIG } from '@/types/auth';

export type { User, UserRole };
export { PERSONA_CONFIG };

interface AuthContextType {
  hydrated: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  user: User | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const login = useCallback<AuthContextType['login']>(
    (email, password, role = 'gp') => {
      dispatch(loginRequested({ email, password, role }));
    },
    [dispatch]
  );

  const logout = useCallback<AuthContextType['logout']>(() => {
    dispatch(logoutRequested());
  }, [dispatch]);

  const switchRole = useCallback<AuthContextType['switchRole']>(
    (role) => {
      dispatch(switchRoleRequested(role));
    },
    [dispatch]
  );

  return { hydrated, isAuthenticated, login, logout, switchRole, user };
}
