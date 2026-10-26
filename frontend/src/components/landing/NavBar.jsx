import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

import { useRole } from '../../context/RoleContext.jsx';

/**
 * NavBar Component
 * Clean top navigation bar with brand logo and gold CTA in White & Gold theme.
 */
export default function NavBar() {
  const { currentUser, role } = useRole();
  const currentRole = (currentUser?.role || role || '').toLowerCase();
  const isAdmin = Boolean(currentUser && currentRole === 'admin');
  const isLoggedIn = Boolean(currentUser);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBE3D0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#1A1612] hover:opacity-90 transition-opacity"
          aria-label="FraudSentinel Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <span className="font-extrabold tracking-tight">
            Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">Sentinel</span>
          </span>
        </Link>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold transition-all shadow-md shadow-amber-500/25"
            >
              <Shield className="w-4 h-4 text-white" />
              Admin Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isLoggedIn ? (
            <Link
              to="/dashboard/user"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold transition-all shadow-md shadow-amber-500/25"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/admin/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Admin Portal
              </Link>
              <Link
                to="/login/user"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
