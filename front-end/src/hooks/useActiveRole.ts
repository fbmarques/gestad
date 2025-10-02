import { useState, useEffect } from 'react';

type ActiveRole = 'admin' | 'docente' | 'discente' | null;

const ACTIVE_ROLE_KEY = 'gestad-active-role';

export function useActiveRole() {
  const [activeRole, setActiveRoleState] = useState<ActiveRole>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
    return (stored as ActiveRole) || null;
  });

  const setActiveRole = (role: ActiveRole) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
    } else {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
  };

  const clearActiveRole = () => {
    setActiveRoleState(null);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  };

  const getDashboardRoute = (): string => {
    if (activeRole === 'admin') return '/administrativo';
    if (activeRole === 'docente') return '/docente';
    if (activeRole === 'discente') return '/discente';
    return '/selecao'; // fallback
  };

  return {
    activeRole,
    setActiveRole,
    clearActiveRole,
    getDashboardRoute,
  };
}
