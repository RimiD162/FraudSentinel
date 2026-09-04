import React from 'react';
import StatusBadge from './StatusBadge.jsx';

/**
 * FraudAlertsTable Component
 * Renders the Machine Learning Fraud Alerts data table with hairline dividers
 * and hover highlight effects.
 */
export default function FraudAlertsTable({ alerts }) {
  return (
    <div className="bg-[#161A22] border border-[#222734] rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 pb-3">
        <h3 className="text-base font-bold text-white tracking-tight">
          Machine Learning Fraud Alerts
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-t border-[#222734] text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th scope="col" className="py-3 px-5">
                Transaction ID
              </th>
              <th scope="col" className="py-3 px-5">
                Amount
              </th>
              <th scope="col" className="py-3 px-5">
                User
              </th>
              <th scope="col" className="py-3 px-5">
                Timestamp
              </th>
              <th scope="col" className="py-3 px-5 text-right sm:text-left">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222734] text-sm">
            {alerts.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#1C212B] transition-colors duration-150"
              >
                <td className="py-3.5 px-5 font-mono text-xs font-medium text-white">
                  {row.id}
                </td>
                <td className="py-3.5 px-5 font-medium text-white">
                  {row.amount}
                </td>
                <td className="py-3.5 px-5 text-gray-300">
                  {row.user}
                </td>
                <td className="py-3.5 px-5 text-gray-400 text-xs">
                  {row.timestamp}
                </td>
                <td className="py-3.5 px-5 text-right sm:text-left">
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
