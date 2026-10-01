import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

/**
 * FraudAlertsTable Component
 * Renders the Machine Learning Fraud Alerts data table in luxury White & Gold styling
 * with hairline dividers, row hover effects, and contextual status indicators.
 */
export default function FraudAlertsTable({ alerts }) {
  return (
    <div className="bg-white border border-[#E5DCBE] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-amber-500/5">
      <div className="p-6 pb-4 border-b border-[#EAE2CE] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#1A1612] tracking-tight">
              Machine Learning Fraud Alerts
            </h3>
            <p className="text-xs text-[#5C5648] mt-0.5">
              Live automated inference alerts requiring analyst review
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/alerts"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FCFAF5] border-b border-[#EAE2CE] text-xs font-bold text-[#8C8270] uppercase tracking-wider">
              <th scope="col" className="py-3 px-6">
                Transaction ID
              </th>
              <th scope="col" className="py-3 px-6">
                Amount
              </th>
              <th scope="col" className="py-3 px-6">
                User / Account
              </th>
              <th scope="col" className="py-3 px-6">
                Timestamp
              </th>
              <th scope="col" className="py-3 px-6 text-right sm:text-left">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EBD9] text-sm font-medium">
            {alerts.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#FDFBF7] transition-colors duration-150"
              >
                <td className="py-3.5 px-6 font-mono text-xs font-bold text-amber-900">
                  <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                    {row.id}
                  </span>
                </td>
                <td className="py-3.5 px-6 font-bold text-[#1A1612]">
                  {row.amount}
                </td>
                <td className="py-3.5 px-6 text-[#5C5648]">
                  {row.user}
                </td>
                <td className="py-3.5 px-6 text-[#8C8270] text-xs">
                  {row.timestamp}
                </td>
                <td className="py-3.5 px-6 text-right sm:text-left">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
