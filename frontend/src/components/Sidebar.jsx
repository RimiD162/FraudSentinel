import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  CreditCard,
  Bell,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { useRole } from '../context/RoleContext.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';

/**
 * Navigation Items Registry
 * Defines all 8 sections mapped to their respective permission keys and paths.
 */
const NAV_ITEMS = [
  {
    id: 'dashboard',
    permissionKey: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'analyze',
    permissionKey: 'analyzeTransaction',
    label: 'Analyze Transaction',
    path: '/dashboard/analyze',
    icon: Cpu,
  },
  {
    id: 'transactions',
    permissionKey: 'transactions',
    label: 'Transactions',
    path: '/dashboard/transactions',
    icon: CreditCard,
  },
  {
    id: 'alerts',
    permissionKey: 'fraudAlerts',
    label: 'Fraud Alerts',
    path: '/dashboard/alerts',
    icon: Bell,
  },
  {
    id: 'analytics',
    permissionKey: 'analytics',
    label: 'Analytics',
    path: '/dashboard/analytics',
    icon: TrendingUp,
  },
  {
    id: 'reports',
    permissionKey: 'reports',
    label: 'Reports',
    path: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    id: 'users',
    permissionKey: 'userManagement',
    label: 'User Management',
    path: '/dashboard/users',
    icon: Users,
  },
  {
    id: 'settings',
    permissionKey: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    icon: Settings,
  },
];

/**
 * Sidebar Component
 * Fixed dark navigation sidebar (~240px wide) collapsing to an icon rail below ~900px.
 * Reads permission matrix to dynamically filter navigation items based on current role.
 */
export default function Sidebar() {
  const { getPermission, role } = useRole();

  // Filter items dynamically using centralized permission table — no hardcoded scattered checks
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => getPermission(item.permissionKey) !== 'hidden'
  );

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[240px] max-[900px]:w-[72px] bg-[#0B0E14] border-r border-[#222734] flex flex-col justify-between p-4 z-40 transition-all duration-200 select-none"
      aria-label="Sidebar Navigation"
    >
      {/* Top Brand & Navigation */}
      <div className="flex flex-col overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-2 h-10 px-2 mb-5 max-[900px]:justify-center">
          <Link
            to="/"
            className="text-lg font-bold text-white tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="Return to Landing Page"
          >
            <span className="max-[900px]:hidden">FraudSentinel</span>
            <span className="text-xl" role="img" aria-label="Shield">🛡️</span>
          </Link>
        </div>

        {/* Nav List */}
        <nav aria-label="Main Navigation">
          <ul className="space-y-1 list-none p-0 m-0">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isViewOnlySection = getPermission(item.permissionKey) === 'view';

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none max-[900px]:justify-center max-[900px]:px-0 ${
                        isActive
                          ? 'bg-white text-gray-950 font-semibold shadow-sm'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-[#161A22]'
                      }`
                    }
                    title={
                      isViewOnlySection
                        ? `${item.label} (View-Only Access)`
                        : item.label
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-gray-950' : 'text-gray-400'
                          }`}
                        />
                        <span className="max-[900px]:hidden truncate flex-1 text-left">
                          {item.label}
                        </span>
                        {isViewOnlySection && (
                          <span
                            className={`max-[900px]:hidden text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isActive
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-[#222734] text-amber-400'
                            }`}
                            title="View-only access for current role"
                          >
                            Read
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Pinned Area */}
      <div className="pt-3 border-t border-[#222734]/80 flex flex-col gap-3">
        {/* Role Switcher Demo Control */}
        <div className="max-[900px]:hidden">
          <RoleSwitcher />
        </div>

        {/* Compact Role Switcher Indicator for collapsed screen (<900px) */}
        <div className="hidden max-[900px]:flex justify-center">
          <div
            className="w-8 h-8 rounded-full bg-[#161A22] border border-[#222734] flex items-center justify-center text-xs font-bold text-blue-400"
            title={`Active Demo Role: ${role}`}
          >
            {role.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Back to Landing Page Link */}
        <Link
          to="/"
          className="text-xs text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#161A22]/50 hover:bg-[#161A22] border border-[#222734] transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
          <span className="max-[900px]:hidden">Exit to Landing</span>
        </Link>
      </div>
    </aside>
  );
}
