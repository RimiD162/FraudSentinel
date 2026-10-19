import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';
import { useRole } from '../context/RoleContext.jsx';
import { Home, LogOut } from 'lucide-react';

/**
 * DashboardLayout Component
 * Luxury White & Gold two-column root layout with fixed sidebar,
 * top navigation bar, and scrollable main container.
 */
export default function DashboardLayout() {
  const { role, logout } = useRole();
  const location = useLocation();

  const pathLabel = location.pathname.replace('/dashboard/', '').replace('/dashboard', 'Overview') || 'Overview';

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
            {/* Mobile / Compact Role Switcher */}
            <div className="min-[901px]:hidden w-36">
              <RoleSwitcher compact />
            </div>

            {/* Sign Out Button */}
            <Link
              to={role === 'admin' ? '/login/admin' : '/login/user'}
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-xs font-semibold text-[#5C5648] hover:text-amber-900 border border-[#E5DCBE] hover:border-amber-400 transition-colors shadow-2xs"
              title="Sign Out to Login Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Sign Out</span>
            </Link>
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
