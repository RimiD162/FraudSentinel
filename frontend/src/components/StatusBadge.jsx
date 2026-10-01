import React from 'react';

/**
 * StatusBadge Component
 * Context-aware status pill badge tailored for the luxury White & Gold theme.
 */
export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase();

  let styleClasses = 'bg-[#FAF8F3] border-[#E5DCBE] text-[#5C5648]';
  let dotColor = 'bg-[#8C8270]';

  if (norm.includes('flag') || norm.includes('fraud') || norm.includes('block') || norm.includes('high')) {
    styleClasses = 'bg-rose-50 border-rose-200 text-rose-800';
    dotColor = 'bg-rose-500';
  } else if (norm.includes('review') || norm.includes('pending') || norm.includes('warn') || norm.includes('medium')) {
    styleClasses = 'bg-amber-50 border-amber-200 text-amber-800';
    dotColor = 'bg-amber-500';
  } else if (norm.includes('clear') || norm.includes('pass') || norm.includes('low') || norm.includes('approved')) {
    styleClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800';
    dotColor = 'bg-emerald-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border rounded-full whitespace-nowrap shadow-2xs ${styleClasses}`}
      aria-label={`Status: ${status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}
