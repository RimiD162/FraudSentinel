import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { ROLE_PERMISSIONS, ROLES } from '../config/permissions.js';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient.js';
import {
  getMe,
  login as backendLogin,
  registerUser as backendRegister,
  getHealth,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from '../services/api.js';

const RoleContext = createContext(null);

export const ROLE_CREDENTIALS = {
  admin: { email: 'admin@fraudsentinel.com', password: 'admin123', name: 'System Administrator' },
  analyst: { email: 'analyst@fraudsentinel.com', password: 'analyst123', name: 'Lead Fraud Analyst' },
};

/**
 * RoleProvider Component
 * Manages active user authentication with Supabase and server-side RBAC authorization
 * with the FastAPI backend.
 *
 * Privileges are NEVER derived from client-supplied default roles or local state.
 */
export function RoleProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRoleState] = useState('viewer');
  const [apiStatus, setApiStatus] = useState('connecting'); // 'online' | 'connecting' | 'offline'
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session and restore user from Supabase or valid stored token
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      setAuthLoading(true);
      setAuthError(null);
      try {
        let token = null;

        if (isSupabaseConfigured && supabase) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) {
            console.warn('[RoleContext] Supabase session retrieval notice:', sessionErr.message);
          }
          if (sessionData?.session?.access_token) {
            token = sessionData.session.access_token;
          }
        }

        if (!token) {
          token = getAuthToken();
        }

        if (token) {
          setAuthToken(token);
          try {
            // Retrieve trusted server-side profile (role, account status, etc.)
            const profile = await getMe(token);
            if (isMounted && profile) {
              const cleanRole = (profile.role || 'viewer').toLowerCase();
              setCurrentUser({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                role: cleanRole,
                isActive: profile.is_active,
              });
              setRoleState(cleanRole);
              setApiStatus('online');
            }
          } catch (err) {
            console.warn('[RoleContext] Profile sync with backend notice:', err.message);
            clearAuthToken();
            if (isSupabaseConfigured && supabase) {
              try {
                await supabase.auth.signOut();
              } catch (_) {}
            }
            if (isMounted) {
              setCurrentUser(null);
              setRoleState('viewer');
            }
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
            setRoleState('viewer');
          }
        }
      } catch (err) {
        console.warn('[RoleContext] Auth init notice:', err.message);
        if (isMounted) {
          setCurrentUser(null);
          setRoleState('viewer');
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }

    initializeSession();

    // Listen for Supabase session changes (token refreshed, signed out)
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const sub = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.access_token) {
            setAuthToken(session.access_token);
            try {
              const profile = await getMe(session.access_token);
              if (isMounted && profile) {
                const cleanRole = (profile.role || 'viewer').toLowerCase();
                setCurrentUser({
                  id: profile.id,
                  email: profile.email,
                  fullName: profile.full_name,
                  role: cleanRole,
                  isActive: profile.is_active,
                });
                setRoleState(cleanRole);
                setApiStatus('online');
              }
            } catch (err) {
              console.warn('[RoleContext] AuthStateChange sync notice:', err.message);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuthToken();
          if (isMounted) {
            setCurrentUser(null);
            setRoleState('viewer');
          }
        }
      });
      authListener = sub.data?.subscription;
    }

    return () => {
      isMounted = false;
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Explicit login with email and password
  const loginWithCredentials = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      let token = null;

      if (isSupabaseConfigured && supabase) {
        // Real Supabase email/password authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data?.session?.access_token) {
          throw new Error('Supabase authentication did not return an active session.');
        }
        token = data.session.access_token;
      } else {
        // Direct FastAPI backend authentication (SQLite database verification)
        const backendRes = await backendLogin(email.trim(), password);
        if (!backendRes?.access_token) {
          throw new Error('Backend authentication did not return an access token.');
        }
        token = backendRes.access_token;
      }

      setAuthToken(token);

      // Retrieve trusted server-side profile (role, account status, full name)
      const profile = await getMe(token);
      if (!profile) {
        throw new Error('Failed to retrieve user profile after authentication.');
      }

      const cleanRole = (profile.role || 'viewer').toLowerCase();
      const userObj = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: cleanRole,
        isActive: profile.is_active,
      };

      setCurrentUser(userObj);
      setRoleState(cleanRole);
      setApiStatus('online');
      return userObj;
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Explicit register with email, password, full name, and role
  const registerWithCredentials = useCallback(
    async (email, password, fullName = '', targetRole = 'analyst') => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        let token = null;

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

          if (error) {
            throw new Error(error.message);
          }

          if (data?.session?.access_token) {
            token = data.session.access_token;
          } else {
            // Email confirmation required or pending
            return {
              status: 'confirmation_required',
              message: 'Registration successful! Please check your email to confirm your account.',
            };
          }
        } else {
          const normalizedRole = targetRole.toLowerCase() === 'admin' ? 'admin' : 'analyst';
          const backendRes = await backendRegister({
            email: email.trim(),
            password,
            full_name: fullName.trim(),
            role: normalizedRole,
          });
          token = backendRes?.access_token;
        }

        if (token) {
          setAuthToken(token);
          const profile = await getMe(token);
          const cleanRole = (profile?.role || 'analyst').toLowerCase();
          const userObj = {
            id: profile?.id,
            email: profile?.email || email.trim(),
            fullName: profile?.full_name || fullName.trim(),
            role: cleanRole,
            isActive: profile?.is_active ?? true,
          };
          setCurrentUser(userObj);
          setRoleState(cleanRole);
          setApiStatus('online');
          return userObj;
        }
      } catch (err) {
        setAuthError(err.message || 'Registration failed.');
        throw err;
      } finally {
        setAuthLoading(false);
      }
    },
    []
  );

  // Explicit logout
  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[RoleContext] Sign out notice:', err.message);
    } finally {
      clearAuthToken();
      setCurrentUser(null);
      setRoleState('viewer');
    }
  }, []);

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
    const enableDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
    if (!enableDemo) {
      // In production or non-demo mode, roles cannot be modified client-side
      return;
    }
    const normalized = newRole.toLowerCase();
    if (ROLE_PERMISSIONS[normalized]) {
      setRoleState(normalized);
    }
  };

  const value = useMemo(() => {
    const currentPermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;

    const getPermission = (section) => currentPermissions[section] || 'hidden';
    const isViewOnly = (section) => getPermission(section) === 'view';
    const isAllowed = (section) => getPermission(section) !== 'hidden';
    const isFull = (section) => getPermission(section) === 'full';

    const currentRoleMeta = ROLES.find((r) => r.id === role) || ROLES[2] || ROLES[0];

    return {
      role,
      setRole,
      roles: ROLES,
      roleMeta: currentRoleMeta,
      permissions: currentPermissions,
      currentUser,
      authUser: currentUser,
      authLoading,
      apiStatus,
      authError,
      isSupabaseConfigured,
      loginWithCredentials,
      registerWithCredentials,
      logout,
      getPermission,
      isViewOnly,
      isAllowed,
      isFull,
    };
  }, [
    role,
    currentUser,
    authLoading,
    apiStatus,
    authError,
    loginWithCredentials,
    registerWithCredentials,
    logout,
  ]);

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
