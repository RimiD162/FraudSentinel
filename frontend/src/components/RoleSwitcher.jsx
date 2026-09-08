import React from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { ShieldCheck, UserCheck, Eye, ChevronDown } from 'lucide-react';

/**
 * RoleSwitcher Component
 * 
 * DEMO AFFORDANCE NOTICE:
 * This component provides an interactive role switcher for presentation and demonstration
 * purposes. It simulates different organizational permission levels (Admin, Fraud Analyst, Viewer)
 * strictly within client-side React state. It does NOT represent a real security boundary or authentication.
 */
export default function RoleSwitcher({ compact = false }) {
  const { role, setRole, roles } = useRole();

  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />;
      case 'analyst':
        return <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor="role-selector"
        className={`text-[11px] font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 ${
          compact ? 'max-[900px]:sr-only' : ''
        }`}
      >
        <span>Viewing as:</span>
        <span className="text-xs normal-case px-1.5 py-0.5 rounded bg-[#282E3E] text-blue-300 font-medium ml-auto">
          Demo
        </span>
      </label>

      <div className="relative">
        <select
          id="role-selector"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full appearance-none bg-[#161A22] hover:bg-[#1C212B] text-white border border-[#222734] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer pr-8"
          aria-label="Switch User Role (Demo)"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id} className="bg-[#161A22] text-white py-1">
              {r.label} ({r.badge})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
