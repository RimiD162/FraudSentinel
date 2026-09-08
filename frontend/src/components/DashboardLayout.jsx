import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';
import { useRole } from '../context/RoleContext.jsx';
import { ShieldCheck, ShieldAlert, Eye, Home } from 'lucide-react';

/**
 * DashboardLayout Component
 * Two-column root layout with fixed sidebar, mobile top-bar with role controls,
 * and responsive scrollable main container.
 */
export default function DashboardLayout() {
  const { role, roleMeta } = useRole();
  const location = useLocation();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Mode
          </span>
        );
      case 'analyst':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Fraud Analyst
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Eye className="w-3.5 h-3.5" />
            Viewer (Read-Only)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[240px] max-[900px]:ml-[72px] flex flex-col min-h-screen overflow-y-auto transition-all duration-200">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#222734] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-white font-medium capitalize">
              {location.pathname.replace('/dashboard/', '').replace('/dashboard', 'Overview') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Active role pill badge */}
            <div className="hidden sm:block">
              {getRoleBadge()}
            </div>

            {/* Mobile / Compact Role Switcher */}
            <div className="min-[901px]:hidden w-40">
              <RoleSwitcher compact />
            </div>
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
