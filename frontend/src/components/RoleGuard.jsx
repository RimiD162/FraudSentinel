import React, { createContext, useContext } from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { Lock, ArrowLeft, Eye } from 'lucide-react';
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
 * - 'view': Renders children in read-only mode with a visible 'View-only access' banner.
 * - 'hidden': Displays a clear 'Access Denied' screen.
 */
export default function RoleGuard({ section, children }) {
  const { getPermission, roleMeta } = useRole();
  const permission = getPermission(section);

  // Hidden/Blocked: Show access denied screen
  if (permission === 'hidden') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6 shadow-md shadow-rose-500/10">
          <Lock className="w-8 h-8" />
        </div>
        
        <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 mb-3">
          403 Restricted Access
        </span>

        <h1 className="text-2xl font-extrabold text-[#1A1612] tracking-tight mb-2">
          You don't have access to this page
        </h1>
        
        <p className="text-sm text-[#5C5648] mb-6 leading-relaxed">
          Your current role (<span className="text-[#1A1612] font-bold">{roleMeta.label}</span>) does not have permission to access the <span className="text-[#1A1612] font-bold capitalize">{section.replace(/([A-Z])/g, ' $1')}</span> section.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold transition-all shadow-md shadow-amber-500/20"
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
            className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-amber-200 text-amber-600 flex-shrink-0 shadow-2xs">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1A1612]">
                    View-only access
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-amber-800 border border-amber-300">
                    {roleMeta.badge}
                  </span>
                </div>
                <p className="text-xs text-[#5C5648] mt-0.5">
                  You are viewing this section with read-only permissions. Mutation actions and parameter edits are disabled.
                </p>
              </div>
            </div>
          </div>

          {/* Children Components */}
          <div className="relative pointer-events-auto">
            {children}
          </div>
        </div>
      </ViewOnlyContext.Provider>
    );
  }

  // Full Access: Render interactive children
  return <>{children}</>;
}
