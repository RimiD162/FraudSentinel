import React, { createContext, useContext } from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { ShieldAlert, Lock, ArrowLeft, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ViewOnlyContext = createContext(false);

/**
 * Hook for components to check if they are in view-only mode
 */
export function useViewOnly() {
  return useContext(ViewOnlyContext);
}

/**
 * RoleGuard Component
 * 
 * Enforces role-based permissions:
 * - 'full': Renders children directly with complete interactivity.
 * - 'view': Renders children in read-only mode with a visible 'View-only access' banner and disabled controls.
 * - 'hidden': Displays a clear 'Access Denied: You don't have access to this page' screen with a CTA to return to the dashboard.
 */
export default function RoleGuard({ section, children }) {
  const { getPermission, roleMeta } = useRole();
  const permission = getPermission(section);

  // Hidden/Blocked: Show access denied screen
  if (permission === 'hidden') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-lg shadow-rose-950/20">
          <Lock className="w-8 h-8" />
        </div>
        
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-3">
          403 Restricted Access
        </span>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          You don't have access to this page
        </h1>
        
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Your current viewing role (<span className="text-white font-medium">{roleMeta.label}</span>) does not have permission to view the <span className="text-white font-medium capitalize">{section.replace(/([A-Z])/g, ' $1')}</span> section.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // View-Only: Render children with banner and disabled context
  if (permission === 'view') {
    return (
      <ViewOnlyContext.Provider value={true}>
        <div className="space-y-6 w-full">
          {/* Prominent View-Only Banner */}
          <div
            role="status"
            aria-live="polite"
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start sm:items-center justify-between gap-3 text-amber-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 flex-shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-amber-300">
                    View-only access
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                    {roleMeta.label}
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Interactive controls, modification actions, and form submissions are disabled for your role.
                </p>
              </div>
            </div>
          </div>

          {/* Child content with view-only context applied */}
          <div className="view-only-container">
            {children}
          </div>
        </div>
      </ViewOnlyContext.Provider>
    );
  }

  // Full Access: Render normally
  return (
    <ViewOnlyContext.Provider value={false}>
      {children}
    </ViewOnlyContext.Provider>
  );
}
