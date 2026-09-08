import React, { createContext, useContext, useState, useMemo } from 'react';
import { ROLE_PERMISSIONS, ROLES } from '../config/permissions.js';

const RoleContext = createContext(null);

/**
 * RoleProvider Component
 * 
 * NOTE: Role switching in this application is an interactive demo affordance
 * to test and preview role-based UI behavior without requiring a backend or real authentication.
 */
export function RoleProvider({ children }) {
  // Default role configured via VITE_DEFAULT_ROLE env variable or 'admin'
  const defaultRole = (import.meta.env?.VITE_DEFAULT_ROLE || 'admin').toLowerCase();
  const [role, setRole] = useState(ROLE_PERMISSIONS[defaultRole] ? defaultRole : 'admin');

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
      getPermission,
      isViewOnly,
      isAllowed,
      isFull,
    };
  }, [role]);

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
