import React from 'react';

/**
 * StatCard Component
 * Displays a high-level metric card with label, prominent value, and colored delta indicator.
 */
export default function StatCard({ label, value, delta, isPositive }) {
  return (
    <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm">
      <span className="text-sm text-gray-400 font-medium tracking-wide">
        {label}
      </span>
      <div className="mt-2 mb-1">
        <span className="text-3xl font-bold text-white tracking-tight">
          {value}
        </span>
      </div>
      <div className="flex items-center text-xs font-semibold mt-1">
        <span
          className={
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          }
        >
          {delta}
        </span>
      </div>
    </div>
  );
}
