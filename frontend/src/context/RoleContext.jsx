import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ROLE_PERMISSIONS, ROLES } from '../config/permissions.js';
import { login, setAuthToken } from '../services/api.js';

const RoleContext = createContext(null);

const ROLE_CREDENTIALS = {
  admin: { email: 'admin@fraudsentinel.com', password: 'admin123' },
  analyst: { email: 'analyst@fraudsentinel.com', password: 'analyst123' },
  viewer: { email: 'viewer@fraudsentinel.com', password: 'viewer123' },
};

/**
 * RoleProvider Component
 * Manages active role permissions and automatically synchronizes JWT authentication
 * with the FastAPI REST API backend.
 */
export function RoleProvider({ children }) {
  const defaultRole = (import.meta.env?.VITE_DEFAULT_ROLE || 'admin').toLowerCase();
  const [role, setRole] = useState(ROLE_PERMISSIONS[defaultRole] ? defaultRole : 'admin');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync active role with FastAPI JWT authentication backend
  useEffect(() => {
    let isMounted = true;
    async function syncBackendAuth() {
      const creds = ROLE_CREDENTIALS[role] || ROLE_CREDENTIALS.admin;
      setAuthLoading(true);
      try {
        const res = await login(creds.email, creds.password);
        if (isMounted && res && res.access_token) {
          setAuthUser(res);
        }
      } catch (err) {
        console.warn(`[RoleContext] Auto-auth for ${role} (${creds.email}):`, err.message);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    syncBackendAuth();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const value = useMemo(() => {
    const currentPermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.admin;

    const getPermission = (section) => currentPermissions[section] || 'hidden';
    const isViewOnly = (section) => getPermission(section) === 'view';
    const isAllowed = (section) => getPermission(section) !== 'hidden';
    const isFull = (section) => getPermission(section) === 'full';

    const currentRoleMeta = ROLES.find((r) => r.id === role) || ROLES[0];

    return {
      role,
      setRole,
      roles: ROLES,
      roleMeta: currentRoleMeta,
      permissions: currentPermissions,
      authUser,
      authLoading,
      getPermission,
      isViewOnly,
      isAllowed,
      isFull,
    };
  }, [role, authUser, authLoading]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * Custom hook to access role permissions and switcher state
 */
export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
