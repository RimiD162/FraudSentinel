import React from 'react';
import { useRole } from '../context/RoleContext.jsx';
import { ShieldCheck, Lock, ChevronDown } from 'lucide-react';

/**
 * RoleSwitcher Component
 * White & Gold theme role indicator.
 * When demo mode is disabled (default), displays the verified server-assigned role.
 */
export default function RoleSwitcher({ compact = false }) {
  const { role, setRole, roles, roleMeta } = useRole();
  const enableDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

  if (!enableDemo) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs w-full shadow-2xs">
        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#8C8270] leading-none">
            Verified Role
          </span>
          <span className="text-xs font-bold text-amber-900 truncate mt-0.5">
            {roleMeta?.label || role}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        htmlFor="role-selector"
        className={`text-[11px] font-bold tracking-wider text-[#8C8270] uppercase flex items-center gap-1.5 ${
          compact ? 'max-[900px]:sr-only' : ''
        }`}
      >
        <span>Simulation Role:</span>
        <span className="text-[10px] normal-case px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold ml-auto">
          Demo
        </span>
      </label>

      <div className="relative">
        <select
          id="role-selector"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full appearance-none bg-white hover:bg-amber-50/50 text-[#1A1612] border border-[#E5DCBE] hover:border-amber-400 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors cursor-pointer pr-8 shadow-2xs"
          aria-label="Switch User Role Preview"
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
