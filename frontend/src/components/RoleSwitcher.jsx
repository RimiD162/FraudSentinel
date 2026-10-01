import React from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { ShieldCheck, UserCheck, Eye, ChevronDown } from 'lucide-react';

/**
 * RoleSwitcher Component
 * White & Gold theme role selection control.
 */
export default function RoleSwitcher({ compact = false }) {
  const { role, setRole, roles } = useRole();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor="role-selector"
        className={`text-[11px] font-bold tracking-wider text-[#8C8270] uppercase flex items-center gap-1.5 ${
          compact ? 'max-[900px]:sr-only' : ''
        }`}
      >
        <span>Viewing as:</span>
        <span className="text-[10px] normal-case px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold ml-auto">
          Role
        </span>
      </label>

      <div className="relative">
        <select
          id="role-selector"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full appearance-none bg-white hover:bg-amber-50/50 text-[#1A1612] border border-[#E5DCBE] hover:border-amber-400 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors cursor-pointer pr-8 shadow-2xs"
          aria-label="Switch User Role"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id} className="bg-white text-[#1A1612] py-1">
              {r.label} ({r.badge})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-amber-600">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
