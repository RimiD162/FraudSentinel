import React from 'react';

/**
 * StatusBadge Component
 * Neutral gray pill badge with white text, matching the reference design.
 * Renders identically for 'Flagged', 'Under Review', and 'Cleared'.
 */
export default function StatusBadge({ status }) {
  return (
    <span
      className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-[#282E3E] rounded-full whitespace-nowrap"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
