import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';
import { useRole } from '../context/RoleContext.jsx';
import { ShieldCheck, Eye, Home, LogOut, Cpu } from 'lucide-react';

/**
 * DashboardLayout Component
 * Luxury White & Gold two-column root layout with fixed sidebar,
 * top navigation bar with live telemetry badges, and scrollable main container.
 */
export default function DashboardLayout() {
  const { role, currentUser, apiStatus, logout } = useRole();
  const location = useLocation();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Admin Console
          </span>
        );
      case 'analyst':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            Fraud Analyst
          </span>
        );
    }
  };


  const getApiStatusBadge = () => {
    if (apiStatus === 'online') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shadow-2xs"
          title="Backend FastAPI connected"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          API Live
        </span>
      );
    }
    if (apiStatus === 'connecting') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-mono shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          Connecting...
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 font-mono shadow-2xs"
        title="Backend FastAPI offline"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        API Offline
      </span>
    );
  };

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
            {/* Live API status badge */}
            <div className="hidden sm:block">
              {getApiStatusBadge()}
            </div>

            {/* Active role pill badge */}
            <div className="hidden sm:block">
              {getRoleBadge()}
            </div>

            {/* Mobile / Compact Role Switcher */}
            <div className="min-[901px]:hidden w-36">
              <RoleSwitcher compact />
            </div>

            {/* Sign Out Button */}
            <Link
              to={role === 'admin' ? '/login/admin' : '/login/analyst'}
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
