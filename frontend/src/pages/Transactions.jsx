import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Search, Download, Filter, Eye, ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';

/**
 * Transactions Page Component
 * Ledger of evaluated transactions with filtering, search, CSV export,
 * and dispute/review actions.
 * Permissions: Admin (Full), Fraud Analyst (Full), Viewer (View-only)
 */
export default function Transactions() {
  const isViewOnly = useViewOnly();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const mockTransactions = [
    { id: 'TXN-90214', date: '2023-09-21 14:22', customer: 'Sophia Bennett', channel: 'Mobile App', amount: '$420.00', risk: 88, status: 'Flagged' },
    { id: 'TXN-90213', date: '2023-09-21 14:18', customer: 'Liam Chen', channel: 'Web POS', amount: '$1,850.00', risk: 74, status: 'Under Review' },
    { id: 'TXN-90212', date: '2023-09-21 14:05', customer: 'Ava Morales', channel: 'API Direct', amount: '$64.99', risk: 12, status: 'Approved' },
    { id: 'TXN-90211', date: '2023-09-21 13:54', customer: 'Marcus Vance', channel: 'Mobile App', amount: '$2,100.00', risk: 92, status: 'Declined' },
    { id: 'TXN-90210', date: '2023-09-21 13:41', customer: 'Emma Watson', channel: 'Web POS', amount: '$312.50', risk: 28, status: 'Approved' },
    { id: 'TXN-90209', date: '2023-09-21 13:30', customer: 'Noah Miller', channel: 'Mobile App', amount: '$990.00', risk: 65, status: 'Under Review' },
    { id: 'TXN-90208', date: '2023-09-21 13:12', customer: 'Isabella Ross', channel: 'Web POS', amount: '$45.00', risk: 5, status: 'Approved' },
  ];

  const filtered = mockTransactions.filter((tx) => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || tx.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
      case 'Declined':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Declined</span>;
      case 'Flagged':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Flagged</span>;
      case 'Under Review':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Under Review</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1 font-normal">
            Comprehensive audit ledger of incoming, scored, and processed payment transactions.
          </p>
        </div>

        {/* Action Button: Export CSV */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isViewOnly}
            onClick={() => alert('Exporting CSV transaction ledger...')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161A22] border border-[#222734] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isViewOnly}
            className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={isViewOnly}
            className="bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-[#161A22] border border-[#222734] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222734] text-xs font-semibold text-gray-400 uppercase tracking-wider bg-[#0E121A]/50">
                <th className="py-3 px-5">Transaction ID</th>
                <th className="py-3 px-5">Date / Time</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Channel</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Risk Score</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222734] text-sm">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1C212B] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold text-blue-400">
                    {tx.id}
                  </td>
                  <td className="py-3.5 px-5 text-gray-400 text-xs font-mono">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-5 text-white font-medium">
                    {tx.customer}
                  </td>
                  <td className="py-3.5 px-5 text-gray-400 text-xs">
                    {tx.channel}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-white">
                    {tx.amount}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`font-mono text-xs font-bold ${
                      tx.risk > 70 ? 'text-rose-400' : tx.risk > 40 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {tx.risk}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => alert(`Reviewing transaction ${tx.id}`)}
                        className="px-2.5 py-1 rounded bg-[#0B0E14] hover:bg-[#222734] border border-[#222734] text-xs text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isViewOnly ? 'Disabled in View-only mode' : 'Review details'}
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => alert(`Initiating refund for ${tx.id}`)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isViewOnly ? 'Disabled in View-only mode' : 'Refund transaction'}
                      >
                        Refund
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
