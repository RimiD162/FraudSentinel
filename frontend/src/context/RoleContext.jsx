import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ROLE_PERMISSIONS, ROLES } from '../config/permissions.js';
import { loginRole, login, registerUser, getMe, getHealth, setAuthToken, clearAuthToken } from '../services/api.js';

const RoleContext = createContext(null);

export const ROLE_CREDENTIALS = {
  admin: { email: 'admin@fraudsentinel.com', password: 'admin123', name: 'System Administrator' },
  analyst: { email: 'analyst@fraudsentinel.com', password: 'analyst123', name: 'Lead Fraud Analyst' },
};


/**
 * RoleProvider Component
 * Manages active user role, permissions, and synchronizes JWT bearer authentication
 * with the FastAPI backend.
 */
export function RoleProvider({ children }) {
  const defaultRole = (import.meta.env?.VITE_DEFAULT_ROLE || 'analyst').toLowerCase();
  const [role, setRoleState] = useState(ROLE_PERMISSIONS[defaultRole] ? defaultRole : 'analyst');
  const [currentUser, setCurrentUser] = useState(null);
  const [apiStatus, setApiStatus] = useState('connecting'); // 'online' | 'connecting' | 'offline'
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Authenticate against backend on role change
  const syncRoleAuth = useCallback(async (targetRole) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const loginResp = await loginRole(targetRole);
      if (loginResp?.access_token) {
        setCurrentUser({
          id: loginResp.user_id,
          email: loginResp.email,
          fullName: loginResp.full_name,
          role: loginResp.role,
        });
        setApiStatus('online');
      }
    } catch (err) {
      console.warn(`[RoleContext] Backend auth notice for ${targetRole}:`, err.message);
      // Check health directly
      try {
        const h = await getHealth();
        if (h?.status === 'healthy' || h?.status === 'running') {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Explicit login with email and password
  const loginWithCredentials = useCallback(async (email, password) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await login(email, password);
      if (res?.access_token) {
        const userRole = (res.role || 'admin').toLowerCase();
        if (ROLE_PERMISSIONS[userRole]) {
          setRoleState(userRole);
        }
        setCurrentUser({
          id: res.user_id,
          email: res.email,
          fullName: res.full_name,
          role: res.role,
        });
        setApiStatus('online');
        return res;
      }
      throw new Error('No access token received from authentication server.');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Explicit register with email, password, full name, and role
  const registerWithCredentials = useCallback(async (email, password, fullName = '', targetRole = 'analyst') => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const normalizedRole = targetRole.toLowerCase() === 'admin' ? 'admin' : 'analyst';
      const res = await registerUser({ email, password, full_name: fullName, role: normalizedRole });
      if (res?.access_token) {
        const assignedRole = (res.role || normalizedRole).toLowerCase();
        setRoleState(assignedRole);
        setCurrentUser({
          id: res.user_id,
          email: res.email,
          fullName: res.full_name,
          role: res.role,
        });
        setApiStatus('online');
        return res;
      }
      throw new Error('Registration did not return an access token.');
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);


  // Explicit logout
  const logout = useCallback(() => {
    clearAuthToken();
    setCurrentUser(null);
    setRoleState('analyst');
  }, []);

  useEffect(() => {
    syncRoleAuth(role);
  }, [role, syncRoleAuth]);

  // Periodic health check every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const h = await getHealth();
        if (h?.status === 'healthy' || h?.status === 'running') {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const setRole = (newRole) => {
    const normalized = newRole.toLowerCase();
    if (ROLE_PERMISSIONS[normalized]) {
      setRoleState(normalized);
    }
  };

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
      currentUser,
      authUser: currentUser,
      authLoading: isAuthenticating,
      apiStatus,
      isAuthenticating,
      authError,
      syncRoleAuth,
      loginWithCredentials,
      registerWithCredentials,
      logout,
      getPermission,
      isViewOnly,
      isAllowed,
      isFull,
    };
  }, [role, currentUser, isAuthenticating, apiStatus, authError, syncRoleAuth, loginWithCredentials, registerWithCredentials, logout]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * Custom hook to access role permissions, user, and API state
 */
export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
