import React, { useState, useEffect } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Search, Download, Filter, Eye, ArrowUpDown, CheckCircle, XCircle, Loader2, AlertCircle, X, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import { getTransactions, getReasoning } from '../services/api.js';

/**
 * Transactions Page Component
 * Ledger of evaluated transactions connected to REST API with filtering, search, CSV export,
 * pagination, and interactive KR&R / Bayesian reasoning inspection modal.
 */
export default function Transactions() {
  const isViewOnly = useViewOnly();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal state
  const [selectedTx, setSelectedTx] = useState(null);
  const [reasoningData, setReasoningData] = useState(null);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [reasoningError, setReasoningError] = useState(null);

  const fallbackTransactions = [
    { id: 'TXN-90214', date: '2023-09-21 14:22', customer: 'Sophia Bennett', channel: 'Mobile App', amount: '$420.00', risk: 88, status: 'Flagged' },
    { id: 'TXN-90213', date: '2023-09-21 14:18', customer: 'Liam Chen', channel: 'Web POS', amount: '$1,850.00', risk: 74, status: 'Under Review' },
    { id: 'TXN-90212', date: '2023-09-21 14:05', customer: 'Ava Morales', channel: 'API Direct', amount: '$64.99', risk: 12, status: 'Approved' },
    { id: 'TXN-90211', date: '2023-09-21 13:54', customer: 'Marcus Vance', channel: 'Mobile App', amount: '$2,100.00', risk: 92, status: 'Declined' },
    { id: 'TXN-90210', date: '2023-09-21 13:41', customer: 'Emma Watson', channel: 'Web POS', amount: '$312.50', risk: 28, status: 'Approved' },
    { id: 'TXN-90209', date: '2023-09-21 13:30', customer: 'Noah Miller', channel: 'Mobile App', amount: '$990.00', risk: 65, status: 'Under Review' },
    { id: 'TXN-90208', date: '2023-09-21 13:12', customer: 'Isabella Ross', channel: 'Web POS', amount: '$45.00', risk: 5, status: 'Approved' },
  ];

  const fetchTransactionsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      if (selectedStatus && selectedStatus !== 'All') {
        params.status = selectedStatus;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await getTransactions(params);
      if (res && res.items) {
        const mapped = res.items.map((tx) => ({
          id: tx.transaction_id || tx.id,
          date: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recent',
          customer: tx.customer_name || (tx.customer_id ? `Cust #${tx.customer_id}` : 'Verified Customer'),
          channel: tx.channel || 'Mobile App',
          amount: typeof tx.amount === 'number' ? `$${tx.amount.toFixed(2)}` : tx.amount || '$0.00',
          risk: Math.round((tx.risk_score || tx.fraud_probability || 0) * (tx.risk_score > 1 ? 1 : 100)),
          status: tx.status || (tx.is_fraud ? 'Flagged' : 'Approved'),
          raw: tx,
        }));
        setTransactions(mapped);
        setTotalPages(res.total_pages || Math.ceil((res.total || mapped.length) / pageSize) || 1);
        setTotalCount(res.total || mapped.length);
      } else if (Array.isArray(res)) {
        const mapped = res.map((tx) => ({
          id: tx.transaction_id || tx.id,
          date: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recent',
          customer: tx.customer_name || `Cust #${tx.customer_id || '901'}`,
          channel: tx.channel || 'Mobile App',
          amount: typeof tx.amount === 'number' ? `$${tx.amount.toFixed(2)}` : tx.amount || '$0.00',
          risk: Math.round((tx.risk_score || 0) * (tx.risk_score > 1 ? 1 : 100)),
          status: tx.status || 'Approved',
          raw: tx,
        }));
        setTransactions(mapped);
        setTotalPages(1);
        setTotalCount(mapped.length);
      } else {
        setTransactions(fallbackTransactions);
        setTotalCount(fallbackTransactions.length);
      }
    } catch (err) {
      console.warn('API error fetching transactions, displaying fallback:', err.message);
      setError('Live API unreachable. Showing cached ledger records.');
      // Filter fallback locally
      const filtered = fallbackTransactions.filter((tx) => {
        const matchesSearch =
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'All' || tx.status === selectedStatus;
        return matchesSearch && matchesStatus;
      });
      setTransactions(filtered);
      setTotalCount(filtered.length);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsData();
  }, [page, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactionsData();
  };

  const handleReviewClick = async (tx) => {
    setSelectedTx(tx);
    setIsLoadingReasoning(true);
    setReasoningError(null);
    setReasoningData(null);
    try {
      const data = await getReasoning(tx.id);
      setReasoningData(data);
    } catch (err) {
      console.warn(`Reasoning for ${tx.id} not found in DB:`, err.message);
      setReasoningError(`No active symbolic KR&R profile stored for ${tx.id}. Using transactional heuristic telemetry.`);
    } finally {
      setIsLoadingReasoning(false);
    }
  };

  const handleExportCSV = () => {
    if (isViewOnly) return;
    const headers = ['Transaction ID', 'Date/Time', 'Customer', 'Channel', 'Amount', 'Risk Score', 'Status'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.date}"`,
      `"${t.customer}"`,
      t.channel,
      t.amount,
      t.risk,
      t.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fraudsentinel_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'CLEARED':
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>;
      case 'Declined':
      case 'declined':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Declined</span>;
      case 'Flagged':
      case 'SUSPICIOUS':
      case 'flagged':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Flagged</span>;
      case 'Under Review':
      case 'REVIEW':
      case 'under_review':
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

        {/* Action Buttons: Refresh & Export CSV */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTransactionsData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161A22] hover:bg-[#1C212B] border border-[#222734] text-xs font-medium text-gray-300 transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            disabled={isViewOnly || transactions.length === 0}
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error / Offline Banner */}
      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchTransactionsData()}
            className="underline hover:text-amber-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-[#161A22] border border-[#222734] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            disabled={isViewOnly}
            className="bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Declined">Declined</option>
          </select>

          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Filter
          </button>
        </div>
      </form>

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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-xs">Loading ledger records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Search className="w-6 h-6 text-gray-600 mb-1" />
                      <span className="text-sm font-semibold text-white">No transactions found</span>
                      <span className="text-xs text-gray-500">Try adjusting your search or status filter</span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
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
                          onClick={() => handleReviewClick(tx)}
                          className="px-2.5 py-1 rounded bg-[#0B0E14] hover:bg-[#222734] border border-[#222734] text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          title="Inspect AI Reasoning & Deep KR&R Analysis"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          disabled={isViewOnly}
                          onClick={() => alert(`Refund requested for ${tx.id}`)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isViewOnly ? 'Disabled in View-only mode' : 'Refund transaction'}
                        >
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#222734] bg-[#0E121A]/30 flex items-center justify-between text-xs text-gray-400">
          <div>
            Showing <span className="text-white font-medium">{transactions.length}</span> of{' '}
            <span className="text-white font-medium">{totalCount}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-[#0B0E14] border border-[#222734] hover:bg-[#222734] text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs px-2">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-[#0B0E14] border border-[#222734] hover:bg-[#222734] text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161A22] border border-[#222734] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#222734] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Transaction Audit: <span className="font-mono text-blue-400">{selectedTx.id}</span>
                  </h3>
                  <p className="text-xs text-gray-400">Full heuristic and multi-paradigm KR&R reasoning profile</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg hover:bg-[#222734] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                <div className="text-[11px] text-gray-400">Amount</div>
                <div className="text-base font-bold text-white mt-0.5">{selectedTx.amount}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                <div className="text-[11px] text-gray-400">Status</div>
                <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                <div className="text-[11px] text-gray-400">Risk Score</div>
                <div className={`text-base font-mono font-bold mt-0.5 ${
                  selectedTx.risk > 70 ? 'text-rose-400' : selectedTx.risk > 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedTx.risk}/100
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                <div className="text-[11px] text-gray-400">Customer</div>
                <div className="text-xs font-semibold text-gray-200 truncate mt-1">{selectedTx.customer}</div>
              </div>
            </div>

            {/* Detailed KR&R Reasoning Content */}
            {isLoadingReasoning ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Querying Knowledge Representation & Bayesian inference engine...</span>
              </div>
            ) : reasoningData ? (
              <div className="space-y-4">
                {/* Composite Engine Summary */}
                <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#222734] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Multi-Paradigm Inference Verdict
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      Bayesian P(Fraud): {((reasoningData.bayesian_network?.posterior_fraud_probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {reasoningData.explanation || 'Composite analysis synthesized from production ML classifiers and symbolic rule graphs.'}
                  </p>
                </div>

                {/* Triggered Rules & Heuristics */}
                {reasoningData.expert_system?.fired_rules?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-300">Triggered Symbolic Rules ({reasoningData.expert_system.fired_rules.length})</div>
                    <div className="space-y-1.5">
                      {reasoningData.expert_system.fired_rules.map((rule, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
                          <span>{rule.description || rule.rule_id || rule}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 uppercase font-bold">
                            {rule.severity || 'HIGH'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical KR&R Paradigm Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">Ontology Classification</span>
                    <div className="text-gray-200 font-mono text-[11px]">{reasoningData.ontology?.category || 'Standard Electronic Transfer'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">Temporal Sequence Consistency</span>
                    <div className="text-emerald-400 font-mono text-[11px]">
                      {reasoningData.temporal_logic?.is_consistent ? 'Consistent (Allen Relations Satisfied)' : 'Temporal Anomaly Flagged'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#222734] text-xs text-gray-400">
                {reasoningError || 'Transaction evaluated via standard online heuristic pipeline.'}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#222734]">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-lg bg-[#222734] hover:bg-[#2c3242] text-xs font-semibold text-white transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
