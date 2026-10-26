import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';
import { useRole } from '../context/RoleContext.jsx';
import { Home, LogOut, Shield, User } from 'lucide-react';

/**
 * DashboardLayout Component
 * Luxury White & Gold two-column root layout with fixed sidebar,
 * top navigation bar, authenticated session protection, and scrollable main container.
 */
export default function DashboardLayout() {
  const { role, roleMeta, currentUser, authLoading, logout } = useRole();
  const location = useLocation();

  // If restoring session from Supabase/backend, show non-blocking luxury loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#FCFAF5] to-[#F5EFE0] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-amber-500/25">
            <Shield className="w-6 h-6 fill-white/20 text-white" />
          </div>
          <span className="text-xs font-bold text-[#8C8270] tracking-wider uppercase">
            Verifying FraudSentinel Session...
          </span>
        </div>
      </div>
    );
  }

  const normalizedPath = (location.pathname || '').toLowerCase().replace(/\/+$/, '');
  const isAdminRoute = (
    normalizedPath === '/admin' ||
    normalizedPath.startsWith('/admin/') ||
    normalizedPath === '/dashboard/admin' ||
    normalizedPath.startsWith('/dashboard/admin/') ||
    normalizedPath.endsWith('/admin') ||
    normalizedPath === '/users' ||
    normalizedPath.startsWith('/users/') ||
    normalizedPath === '/dashboard/users' ||
    normalizedPath.startsWith('/dashboard/users/')
  );

  // 1. Enforce authentication on all dashboard routes
  if (!currentUser) {
    return <Navigate to={isAdminRoute ? '/admin/login' : '/login/user'} state={{ from: location }} replace />;
  }

  // 2. Strict Administrator Clearance:
  // Admin routes ONLY show after logging in as an administrator. Otherwise, redirect to Admin Login!
  const currentRole = (currentUser.role || role || '').toLowerCase();
  if (isAdminRoute && currentRole !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const formatPathLabel = (path) => {
    if (path.includes('/dashboard/admin') || path === '/admin/dashboard' || path === '/admin') return 'Admin Dashboard';
    if (path.includes('/dashboard/user') || path === '/user/dashboard') return 'User Dashboard';
    const clean = path.replace('/dashboard/', '').replace('/dashboard', '').replace('/admin/', '').replace('/user/', '').trim();
    if (!clean || clean === 'Overview') return 'Overview';
    return clean.replace(/([A-Z])/g, ' $1').replace('/', ' • ');
  };
  const pathLabel = formatPathLabel(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#FCFAF5] to-[#F5EFE0] text-[#1A1612] flex font-sans selection:bg-amber-400/30 selection:text-amber-950">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[240px] max-[900px]:ml-[72px] flex flex-col min-h-screen overflow-y-auto transition-all duration-200">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E5DCBE] px-6 lg:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#5C5648]">
            <Link
              to="/"
              className="hover:text-amber-800 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Home className="w-3.5 h-3.5 text-amber-600" />
              <span>Home</span>
            </Link>
            <span className="text-[#C4B99D]">/</span>
            <span className="text-[#1A1612] font-bold capitalize">
              {pathLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile & Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-[#1A1612] leading-none truncate max-w-[140px]">
                  {currentUser.fullName || currentUser.email}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 mt-0.5">
                  {roleMeta?.badge || role}
                </span>
              </div>
            </div>

            {/* Mobile / Compact Role display */}
            <div className="min-[901px]:hidden w-32">
              <RoleSwitcher compact />
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-xs font-semibold text-[#5C5648] hover:text-amber-900 border border-[#E5DCBE] hover:border-amber-400 transition-colors shadow-2xs cursor-pointer"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Outlet Body */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
