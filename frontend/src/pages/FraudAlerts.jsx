import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Bell, ShieldAlert, CheckCircle2, UserPlus, Ban, AlertOctagon, Filter } from 'lucide-react';

/**
 * FraudAlerts Page Component
 * Centralized queue of automated threat alerts, incident severity filters,
 * and bulk mitigation controls.
 * Permissions: Admin (Full), Fraud Analyst (Full), Viewer (View-only)
 */
export default function FraudAlerts() {
  const isViewOnly = useViewOnly();

  const [filterSeverity, setFilterSeverity] = useState('All');

  const alertsList = [
    {
      id: 'ALT-4019',
      transactionId: 'TXN-90214',
      user: 'Sophia Bennett (sophia@example.com)',
      severity: 'Critical',
      amount: '$1,420.00',
      reason: 'Cross-continental card velocity violation (3 attempts within 90s)',
      timestamp: '10 mins ago',
    },
    {
      id: 'ALT-4018',
      transactionId: 'TXN-90213',
      user: 'Liam Chen (lchen88@corp.net)',
      severity: 'High',
      amount: '$1,850.00',
      reason: 'Known proxy VPN exit node with masked MAC address fingerprint',
      timestamp: '24 mins ago',
    },
    {
      id: 'ALT-4017',
      transactionId: 'TXN-90211',
      user: 'Marcus Vance (m.vance@mail.org)',
      severity: 'Critical',
      amount: '$2,100.00',
      reason: 'Synthetic ID pattern: SSN mismatch against credit bureau profile',
      timestamp: '1 hour ago',
    },
    {
      id: 'ALT-4016',
      transactionId: 'TXN-90209',
      user: 'Noah Miller (noah.m@domain.co)',
      severity: 'Medium',
      amount: '$990.00',
      reason: 'Device timezone desynchronization (+7 hours from billing address)',
      timestamp: '2 hours ago',
    },
  ];

  const filteredAlerts = alertsList.filter((a) => {
    if (filterSeverity === 'All') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Fraud Alerts</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              4 Active
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-normal">
            Real-time security alert queue detected by automated heuristic and ML models.
          </p>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isViewOnly}
            onClick={() => alert('Bulk assigning analyst...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161A22] hover:bg-[#1C212B] border border-[#222734] text-gray-300 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-400" />
            Assign Analyst
          </button>
          <button
            type="button"
            disabled={isViewOnly}
            onClick={() => alert('Resolving selected alerts...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Bulk Resolve
          </button>
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto">
        {['All', 'Critical', 'High', 'Medium'].map((sev) => (
          <button
            key={sev}
            type="button"
            disabled={isViewOnly}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterSeverity === sev
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'bg-[#161A22] text-gray-400 border-[#222734] hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {sev} Severity
          </button>
        ))}
      </div>

      {/* Alerts Incident List */}
      <div className="space-y-3">
        {filteredAlerts.map((alertItem) => (
          <div
            key={alertItem.id}
            className="bg-[#161A22] border border-[#222734] rounded-xl p-5 shadow-sm hover:border-gray-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">
                  {alertItem.id}
                </span>
                <span className="text-gray-500 text-xs">•</span>
                <span className="font-mono text-xs text-blue-400">
                  {alertItem.transactionId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                    alertItem.severity === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : alertItem.severity === 'High'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {alertItem.severity}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {alertItem.timestamp}
                </span>
              </div>

              <div className="text-sm font-semibold text-white">
                {alertItem.amount} — {alertItem.user}
              </div>

              <p className="text-xs text-gray-400">
                {alertItem.reason}
              </p>
            </div>

            {/* Row Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                disabled={isViewOnly}
                onClick={() => alert(`Marking ${alertItem.id} as false positive`)}
                className="px-3 py-1.5 rounded-lg bg-[#0B0E14] hover:bg-[#222734] border border-[#222734] text-xs font-medium text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isViewOnly ? 'Disabled in View-only mode' : 'Mark False Positive'}
              >
                False Positive
              </button>

              <button
                type="button"
                disabled={isViewOnly}
                onClick={() => alert(`Blocking card associated with ${alertItem.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 text-rose-400 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isViewOnly ? 'Disabled in View-only mode' : 'Block Card / Account'}
              >
                <Ban className="w-3.5 h-3.5" />
                Block Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
