import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  CreditCard,
  Bell,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
} from 'lucide-react';
import { useRole } from '../context/RoleContext.jsx';

/**
 * Navigation Items Registry
 * Defines all sections mapped to their respective permission keys and paths.
 */
const NAV_ITEMS = [
  {
    id: 'dashboard',
    permissionKey: 'dashboard',
    label: 'Dashboard',
    basePath: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'analyze',
    permissionKey: 'analyzeTransaction',
    label: 'Analyze Transaction',
    basePath: '/analyze',
    icon: Cpu,
  },
  {
    id: 'transactions',
    permissionKey: 'transactions',
    label: 'Transactions',
    basePath: '/transactions',
    icon: CreditCard,
  },
  {
    id: 'alerts',
    permissionKey: 'fraudAlerts',
    label: 'Fraud Alerts',
    basePath: '/alerts',
    icon: Bell,
  },
  {
    id: 'analytics',
    permissionKey: 'analytics',
    label: 'Analytics',
    basePath: '/analytics',
    icon: TrendingUp,
  },
  {
    id: 'reports',
    permissionKey: 'reports',
    label: 'Reports',
    basePath: '/reports',
    icon: BarChart3,
  },
  {
    id: 'users',
    permissionKey: 'userManagement',
    label: 'User Management',
    basePath: '/users',
    icon: Users,
  },
];

/**
 * Sidebar Component
 * Luxury White & Gold fixed navigation sidebar (~240px wide) collapsing to an icon rail below ~900px.
 * Reads permission matrix to dynamically filter navigation items based on current role.
 */
export default function Sidebar() {
  const { role, currentUser, getPermission } = useRole();
  const location = useLocation();
  // STRICT AUTHENTICATED ADMIN VERIFICATION:
  // Admin navigation routes ONLY show after successfully logging in as an administrator!
  const currentRole = (currentUser?.role || role || '').toLowerCase();
  const isAdmin = Boolean(currentUser && currentRole === 'admin');
  const roleSegment = isAdmin ? 'admin' : 'user';

  const checkIsActive = (item) => {
    const cur = location.pathname;
    if (item.id === 'dashboard') {
      return (
        cur === item.path ||
        (isAdmin
          ? cur === '/admin/dashboard' || cur === '/dashboard/admin' || cur === '/admin'
          : cur === '/user/dashboard' || cur === '/dashboard/user' || cur === '/dashboard')
      );
    }
    if (item.id === 'users') {
      return cur.startsWith('/users') || cur.startsWith('/admin/users');
    }
    return (
      cur === item.path ||
      cur === `${item.basePath}/${roleSegment}` ||
      cur === `/${roleSegment}${item.basePath}`
    );
  };

  // Filter items dynamically: if not logged in as admin, NEVER show admin-only routes!
  const visibleNavItems = NAV_ITEMS
    .filter((item) => {
      if (!isAdmin && (item.id === 'analytics' || item.id === 'reports' || item.id === 'users')) {
        return false;
      }
      return getPermission(item.permissionKey) !== 'hidden';
    })
    .map((item) => {
      if (item.id === 'dashboard') {
        return {
          ...item,
          path: isAdmin ? '/admin/dashboard' : '/dashboard/user',
          label: isAdmin ? 'Admin Dashboard' : 'Dashboard',
        };
      }
      if (item.id === 'analyze') {
        return {
          ...item,
          path: `/analyze/${roleSegment}`,
          label: isAdmin ? 'Model Calibration' : 'Analyze Transaction',
        };
      }
      if (item.id === 'transactions') {
        return {
          ...item,
          path: `/transactions/${roleSegment}`,
          label: isAdmin ? 'Audit Ledger' : 'Transactions',
        };
      }
      if (item.id === 'alerts') {
        return {
          ...item,
          path: `/alerts/${roleSegment}`,
          label: isAdmin ? 'Threat Ops & Alerts' : 'Fraud Alerts',
        };
      }
      if (item.id === 'analytics') {
        return {
          ...item,
          path: '/admin/analytics',
          label: 'Executive Telemetry',
        };
      }
      if (item.id === 'reports') {
        return {
          ...item,
          path: '/admin/reports',
          label: 'Regulatory & SAR',
        };
      }
      if (item.id === 'users') {
        return {
          ...item,
          path: '/admin/users',
          label: 'User Management',
        };
      }
      return {
        ...item,
        path: `${item.basePath}/${roleSegment}`,
      };
    });

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[240px] max-[900px]:w-[72px] bg-white/95 backdrop-blur-md border-r border-[#E5DCBE] flex flex-col justify-between p-4 z-40 transition-all duration-200 select-none shadow-xs"
      aria-label="Sidebar Navigation"
    >
      {/* Top Brand & Navigation */}
      <div className="flex flex-col overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 h-12 px-2 mb-5 max-[900px]:justify-center">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-base font-bold text-[#1A1612] tracking-tight hover:opacity-90 transition-opacity"
            title="Return to Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <Shield className="w-4.5 h-4.5 fill-white/20 text-white" />
            </div>
            <span className="max-[900px]:hidden font-extrabold tracking-tight text-[#1A1612]">
              Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">Sentinel</span>
            </span>
          </Link>
        </div>

        {/* Nav List */}
        <nav aria-label="Main Navigation">
          <ul className="space-y-1.5 list-none p-0 m-0">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isViewOnlySection = getPermission(item.permissionKey) === 'view';

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) => {
                      const active = isActive || checkIsActive(item);
                      return `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none max-[900px]:justify-center max-[900px]:px-0 ${
                        active
                          ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md shadow-amber-500/25'
                          : 'text-[#5C5648] hover:text-[#1A1612] hover:bg-amber-50/70 border border-transparent hover:border-amber-200/50'
                      }`;
                    }}
                    title={
                      isViewOnlySection
                        ? `${item.label} (View-Only Access)`
                        : item.label
                    }
                  >
                    {({ isActive }) => {
                      const active = isActive || checkIsActive(item);
                      return (
                        <>
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              active ? 'text-white' : 'text-amber-600'
                            }`}
                          />
                          <span className="max-[900px]:hidden truncate flex-1 text-left">
                            {item.label}
                          </span>
                          {isViewOnlySection && (
                            <span
                              className={`max-[900px]:hidden text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                active
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                              title="View-only access for current role"
                            >
                              Read
                            </span>
                          )}
                        </>
                      );
                    }}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
