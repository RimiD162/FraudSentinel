import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext.jsx';
import { Shield } from 'lucide-react';

/**
 * AdminGuard Component
 * 
 * Strictly ensures that admin routes and views ONLY show after logging in as an Administrator.
 * Otherwise, the admin route will NOT show:
 * - If unauthenticated or non-admin -> redirects to `/admin/login`
 */
export default function AdminGuard({ children }) {
  const { role, currentUser, authLoading } = useRole();
  const location = useLocation();

  // Show luxury loader while session is being verified
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#FCFAF5] to-[#F5EFE0] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-amber-500/25">
            <Shield className="w-6 h-6 fill-white/20 text-white" />
          </div>
          <span className="text-xs font-bold text-[#8C8270] tracking-wider uppercase">
            Verifying Administrator Clearance...
          </span>
        </div>
      </div>
    );
  }

  // 1. If not authenticated at all -> redirect to dedicated Admin Login
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 2. If authenticated, but NOT with verified administrator role -> redirect to dedicated Admin Login
  const currentRole = (currentUser.role || role || '').toLowerCase();
  if (currentRole !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. User is authenticated and verified as an administrator -> render admin route
  return children;
}
