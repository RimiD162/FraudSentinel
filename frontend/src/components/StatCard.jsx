import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard Component
 * Displays a high-level metric card with luxury White & Gold styling,
 * prominent value typography, and contextual delta badge.
 */
export default function StatCard({ label, value, delta, isPositive }) {
  return (
    <div className="bg-white border border-[#E5DCBE] hover:border-amber-400 rounded-2xl sm:rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 shadow-xl shadow-amber-500/5 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-0.5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-400/10 transition-colors"></div>

      <div className="relative z-10">
        <span className="text-xs sm:text-sm text-[#5C5648] font-bold tracking-wider uppercase">
          {label}
        </span>
        <div className="mt-2.5 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#1A1612] tracking-tight">
            {value}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#F2EBD9] mt-2">
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isPositive
              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
              : 'text-rose-800 bg-rose-50 border border-rose-200'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-emerald-600" />
          ) : (
            <TrendingDown className="w-3 h-3 text-rose-600" />
          )}
          <span>{delta}</span>
        </div>
        <span className="text-[11px] font-medium text-[#8C8270]">vs previous period</span>
      </div>
    </div>
  );
}
