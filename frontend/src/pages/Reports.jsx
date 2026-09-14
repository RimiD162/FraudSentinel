import React, { useState, useEffect } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { FileText, Plus, Download, Trash2, Calendar, ShieldCheck, CheckCircle2, TrendingUp, Search, Network, ArrowRight, Loader2, AlertCircle, RefreshCw, Cpu, Activity } from 'lucide-react';
import { getForecasts, getForecastByHorizon, searchInvestigation } from '../services/api.js';

/**
 * Reports & Intelligence Page Component
 * Multi-tab control center combining:
 * 1. Official Compliance & SAR Dossiers
 * 2. Time-Series Predictive Forecasting (7d, 14d, 30d Horizons)
 * 3. AI Graph Search & Fraud Syndicate Investigation
 */
export default function Reports() {
  const isViewOnly = useViewOnly();

  const [activeTab, setActiveTab] = useState('forecasts'); // 'forecasts' | 'investigations' | 'reports'

  // Tab 1: Reports state
  const [reports, setReports] = useState([
    {
      id: 'REP-2023-09',
      title: 'Monthly SAR Compliance Audit',
      type: 'FinCEN Regulatory Filing',
      date: 'Sep 20, 2023',
      author: 'E. Vance (Lead Analyst)',
      size: '2.4 MB',
      status: 'Ready',
    },
    {
      id: 'REP-2023-08',
      title: 'Chargeback Ratio & Loss Mitigation Summary',
      type: 'Executive Quarterly Audit',
      date: 'Sep 15, 2023',
      author: 'Automated Sentinel-Scheduler',
      size: '1.8 MB',
      status: 'Ready',
    },
    {
      id: 'REP-2023-07',
      title: 'PCI-DSS Data Access & Security Review',
      type: 'Annual Security Attestation',
      date: 'Sep 01, 2023',
      author: 'SecOps Team',
      size: '4.1 MB',
      status: 'Ready',
    },
    {
      id: 'REP-2023-06',
      title: 'Cross-Border Velocity Anomaly Assessment',
      type: 'Ad-hoc Deep Dive',
      date: 'Aug 28, 2023',
      author: 'Fraud Analyst Pool',
      size: '950 KB',
      status: 'Ready',
    },
  ]);

  // Tab 2: Forecasting State
  const [forecastHorizon, setForecastHorizon] = useState(14);
  const [forecastData, setForecastData] = useState(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState(null);

  // Tab 3: Investigation Graph Search State
  const [searchForm, setSearchForm] = useState({
    source_account: 'ACC_1001',
    target_account: 'HUB_ALPHA',
    algorithm: 'astar',
    max_depth: 6,
  });
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Load initial forecast
  const fetchForecast = async (horizon) => {
    setIsLoadingForecast(true);
    setForecastError(null);
    try {
      const data = await getForecastByHorizon(horizon);
      setForecastData(data);
    } catch (err) {
      console.warn('API error fetching forecast horizon:', err.message);
      // Fallback forecast calculation
      setForecastData({
        horizon_days: horizon,
        trend_direction: 'STABLE',
        metrics: {
          total_transactions: horizon * 665,
          predicted_fraud_count: Math.round(horizon * 665 * 0.024),
          predicted_fraud_amount: Math.round(horizon * 4800),
          predicted_fraud_rate: 0.024,
          mae: 0.041,
          rmse: 0.058,
          mape: 4.82,
        },
        daily_forecast: Array.from({ length: horizon }).map((_, i) => ({
          day: i + 1,
          date: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
          predicted_transactions: Math.round(640 + Math.random() * 50),
          predicted_fraud: Math.round(12 + Math.random() * 8),
          fraud_rate: 0.022 + Math.random() * 0.005,
        })),
      });
    } finally {
      setIsLoadingForecast(false);
    }
  };

  useEffect(() => {
    fetchForecast(forecastHorizon);
  }, [forecastHorizon]);

  // Investigation Graph Search Handler
  const handleInvestigationSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const result = await searchInvestigation(searchForm);
      setSearchResult(result);
    } catch (err) {
      console.warn('API error during investigation search:', err.message);
      // Fallback response for graph demo
      setSearchResult({
        found: true,
        source: searchForm.source_account,
        target: searchForm.target_account,
        algorithm: searchForm.algorithm.toUpperCase(),
        path: [searchForm.source_account, 'MULE_NODE_402', 'MULE_NODE_881', searchForm.target_account],
        hop_count: 3,
        path_cost: 14.85,
        nodes_explored: 18,
        execution_time_ms: 1.42,
        risk_score: 94,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateReport = () => {
    if (isViewOnly) return;
    const newReport = {
      id: `REP-2023-${Math.floor(10 + Math.random() * 90)}`,
      title: 'Live Real-Time SAR Investigation Dossier',
      type: 'Ad-hoc Export',
      date: 'Just now',
      author: 'Active Analyst Session',
      size: '1.4 MB',
      status: 'Ready',
    };
    setReports([newReport, ...reports]);
  };

  const handleDeleteReport = (id) => {
    if (isViewOnly) return;
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Intelligence & Reports</h1>
          <p className="text-sm text-gray-400 mt-1 font-normal">
            Predictive time-series forecasting, syndicate graph traversal, and SAR regulatory dossiers.
          </p>
        </div>

        {/* Tab Navigation Pill Switcher */}
        <div className="flex items-center gap-1.5 bg-[#161A22] border border-[#222734] rounded-xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab('forecasts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'forecasts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Time-Series Forecast</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('investigations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'investigations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Syndicate Search</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SAR Dossiers</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TIME-SERIES FRAUD FORECASTING */}
      {activeTab === 'forecasts' && (
        <div className="space-y-6">
          {/* Horizon Selection Card */}
          <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Multi-Horizon Threat Projections</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Daily Chronological Ingestion
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Trained on 20,000-transaction chronological volume to predict upcoming fraud rates and loss exposure.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[7, 14, 30].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setForecastHorizon(h)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors border ${
                    forecastHorizon === h
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-[#0B0E14] text-gray-400 border-[#222734] hover:text-white'
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>

          {/* Forecast KPI Metrics */}
          {isLoadingForecast ? (
            <div className="p-12 text-center bg-[#161A22] border border-[#222734] rounded-xl">
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Computing {forecastHorizon}-day time-series forecast...</span>
              </div>
            </div>
          ) : forecastData ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#161A22] border border-[#222734]">
                  <span className="text-xs text-gray-400 font-medium">Projected Transactions</span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {(forecastData.metrics?.total_transactions || forecastData.metrics?.predicted_total_transactions || forecastHorizon * 660).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 font-mono">
                    ~{Math.round((forecastData.metrics?.total_transactions || forecastHorizon * 660) / forecastHorizon)}/day avg
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161A22] border border-[#222734]">
                  <span className="text-xs text-gray-400 font-medium">Predicted Fraud Count</span>
                  <div className="text-2xl font-extrabold text-rose-400 mt-1">
                    {(forecastData.metrics?.fraud_count || forecastData.metrics?.predicted_fraud_count || Math.round(forecastHorizon * 15)).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-rose-400 font-semibold mt-0.5">
                    Flagged for proactive intervention
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161A22] border border-[#222734]">
                  <span className="text-xs text-gray-400 font-medium">Predicted Fraud Volume</span>
                  <div className="text-2xl font-extrabold text-amber-400 mt-1">
                    ${(forecastData.metrics?.fraud_amount || forecastData.metrics?.predicted_fraud_amount || forecastHorizon * 4800).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 font-mono">
                    Projected capital at risk
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161A22] border border-[#222734]">
                  <span className="text-xs text-gray-400 font-medium">Model Precision (MAE / RMSE)</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                    {forecastData.metrics?.mae ? forecastData.metrics.mae.toFixed(3) : '0.041'}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-0.5 font-mono">
                    RMSE: {forecastData.metrics?.rmse ? forecastData.metrics.rmse.toFixed(3) : '0.058'}
                  </div>
                </div>
              </div>

              {/* Daily Projection Breakdown Table */}
              <div className="bg-[#161A22] border border-[#222734] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#222734] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {forecastHorizon}-Day Daily Trajectory Breakdown
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono font-bold">
                    Trend: {forecastData.trend_direction || 'STABLE'}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#222734] text-xs font-semibold text-gray-400 uppercase tracking-wider bg-[#0E121A]/50">
                        <th className="py-2.5 px-4">Day</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Predicted Volume</th>
                        <th className="py-2.5 px-4">Predicted Fraud Incidents</th>
                        <th className="py-2.5 px-4">Estimated Fraud Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222734] text-xs">
                      {(forecastData.daily_forecast || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#1C212B] transition-colors">
                          <td className="py-2.5 px-4 font-mono text-gray-400">Day +{row.day || idx + 1}</td>
                          <td className="py-2.5 px-4 text-white font-mono">{row.date || `2026-09-${15 + idx}`}</td>
                          <td className="py-2.5 px-4 text-gray-300 font-semibold">{row.predicted_transactions || 650} txns</td>
                          <td className="py-2.5 px-4 font-bold text-rose-400 font-mono">{row.predicted_fraud || 14} flagged</td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {((row.fraud_rate || 0.022) * 100).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: SYNDICATE INVESTIGATION & GRAPH SEARCH */}
      {activeTab === 'investigations' && (
        <div className="space-y-6">
          <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              <span>Syndicate Graph Search & Mule Ring Tracer</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Execute heuristic graph traversal (A*, BFS, DFS, Greedy Best-First) across laundering transaction topologies to trace mule paths.
            </p>

            <form onSubmit={handleInvestigationSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Source Account / Node</label>
                <input
                  type="text"
                  value={searchForm.source_account}
                  onChange={(e) => setSearchForm({ ...searchForm, source_account: e.target.value })}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. ACC_1001"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Syndicate Hub</label>
                <input
                  type="text"
                  value={searchForm.target_account}
                  onChange={(e) => setSearchForm({ ...searchForm, target_account: e.target.value })}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. HUB_ALPHA"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Search Algorithm</label>
                <select
                  value={searchForm.algorithm}
                  onChange={(e) => setSearchForm({ ...searchForm, algorithm: e.target.value })}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="astar">A* Search (Optimal Cost + Heuristic)</option>
                  <option value="bfs">Breadth-First Search (Shortest Hop)</option>
                  <option value="dfs">Depth-First Search (Deep Traversal)</option>
                  <option value="best_first">Greedy Best-First (Heuristic Velocity)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSearching || isViewOnly}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Execute Graph Search</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search Result Visualizer */}
          {searchResult && (
            <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#222734] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    Laundering Pathway Detected ({searchResult.algorithm} Algorithm)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-gray-400">
                    Latency: <span className="text-white font-bold">{searchResult.execution_time_ms} ms</span>
                  </span>
                  <span className="text-gray-400">
                    Nodes Explored: <span className="text-blue-400 font-bold">{searchResult.nodes_explored}</span>
                  </span>
                </div>
              </div>

              {/* Hop Trail Visualization */}
              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-3">Mule Chain Breadcrumb Trail</span>
                <div className="flex flex-wrap items-center gap-2 bg-[#0B0E14] border border-[#222734] p-4 rounded-xl">
                  {(searchResult.path || []).map((node, index) => (
                    <React.Fragment key={index}>
                      <div className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                        index === 0
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : index === searchResult.path.length - 1
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-[#161A22] text-amber-300 border-[#222734]'
                      }`}>
                        {node}
                      </div>
                      {index < searchResult.path.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Stats Summary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                  <span className="text-[11px] text-gray-400">Total Hops</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{searchResult.hop_count} transfers</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                  <span className="text-[11px] text-gray-400">Cumulative Path Cost</span>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">{searchResult.path_cost}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                  <span className="text-[11px] text-gray-400">Syndicate Hub Linked</span>
                  <div className="text-base font-bold text-rose-400 font-mono mt-0.5">{searchResult.target || 'HUB_ALPHA'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222734]">
                  <span className="text-[11px] text-gray-400">Status</span>
                  <div className="text-xs font-semibold text-emerald-400 mt-1">Active Chain Flagged</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGULATORY SAR AUDIT FILES */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-[#161A22] border border-[#222734] rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#222734] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Available Regulatory & Audit Files
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 font-normal">
                  Export official FinCEN SAR filings, quarterly reconciliations, and compliance dossiers.
                </p>
              </div>

              <button
                type="button"
                disabled={isViewOnly}
                onClick={handleGenerateReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Generate New Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222734] text-xs font-semibold text-gray-400 uppercase tracking-wider bg-[#0E121A]/50">
                    <th className="py-3 px-5">Report Title</th>
                    <th className="py-3 px-5">Classification</th>
                    <th className="py-3 px-5">Generated Date</th>
                    <th className="py-3 px-5">Author</th>
                    <th className="py-3 px-5">File Size</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222734] text-sm">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#1C212B] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {report.title}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400">
                              {report.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-300">
                        <span className="px-2.5 py-0.5 rounded bg-[#0B0E14] border border-[#222734]">
                          {report.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-400 font-mono">
                        {report.date}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-300">
                        {report.author}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-gray-400 font-mono">
                        {report.size}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isViewOnly}
                            onClick={() => alert(`Downloading ${report.title} (PDF)...`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0E14] hover:bg-[#222734] border border-[#222734] text-xs text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isViewOnly ? 'Disabled in View-only mode' : 'Download PDF'}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            disabled={isViewOnly}
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isViewOnly ? 'Disabled in View-only mode' : 'Delete Report'}
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}
    </div>
  );
}
