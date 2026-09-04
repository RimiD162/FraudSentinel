import React from 'react';
import {
  Home,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, active: true },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, active: false },
  { id: 'alerts', label: 'Alerts', icon: Bell, active: false },
  { id: 'reports', label: 'Reports', icon: BarChart3, active: false },
  { id: 'settings', label: 'Settings', icon: Settings, active: false },
];

/**
 * Sidebar Component
 * Fixed dark sidebar (~240px wide) collapsing to an icon rail below ~900px.
 */
export default function Sidebar({ activeNav = 'dashboard', onNavClick }) {
  const handleNav = (id, e) => {
    e.preventDefault();
    if (onNavClick) onNavClick(id);
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[240px] max-[900px]:w-[72px] bg-[#0B0E14] border-r border-[#222734] flex flex-col justify-between p-4 z-40 transition-all duration-200 select-none"
      aria-label="Sidebar Navigation"
    >
      {/* Top Brand & Navigation */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-2 h-10 px-2 mb-6 max-[900px]:justify-center">
          <span
            className="text-lg font-bold text-white tracking-tight flex items-center gap-2"
            title="FraudSentinel"
          >
            <span className="max-[900px]:hidden">FraudSentinel</span>
            <span className="text-xl" role="img" aria-label="Shield">🛡️</span>
          </span>
        </div>

        {/* Nav List */}
        <nav aria-label="Main Navigation">
          <ul className="space-y-1.5 list-none p-0 m-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeNav;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={(e) => handleNav(item.id, e)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    title={item.label}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none max-[900px]:justify-center max-[900px]:px-0 ${
                      isActive
                        ? 'bg-white text-gray-950 font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-[#161A22]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gray-950' : 'text-gray-400'}`} />
                    <span className="max-[900px]:hidden truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Pinned Area */}
      <div className="pt-4 border-t border-[#222734]/60 flex flex-col gap-3">
        {/* New Transaction Button */}
        <button
          type="button"
          aria-label="New Transaction"
          title="New Transaction"
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none max-[900px]:p-2.5"
        >
          <Plus className="w-4 h-4 hidden max-[900px]:inline-block" />
          <span className="max-[900px]:hidden">New Transaction</span>
        </button>

        {/* Help and Docs Link */}
        <a
          href="#help"
          onClick={(e) => e.preventDefault()}
          aria-label="Help and Docs"
          title="Help and Docs"
          className="text-xs text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1.5 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
        >
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
          <span className="max-[900px]:hidden">Help and Docs</span>
        </a>
      </div>
    </aside>
  );
}
