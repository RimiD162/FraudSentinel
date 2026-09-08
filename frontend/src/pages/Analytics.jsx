import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { BarChart3, TrendingUp, ShieldAlert, PieChart, Calendar, ArrowUpRight } from 'lucide-react';

/**
 * Analytics Page Component
 * Aggregated fraud trends, detection model performance, and vector distribution.
 * Permissions: Admin (Full), Fraud Analyst (Full), Viewer (View-only)
 */
export default function Analytics() {
  const isViewOnly = useViewOnly();
  const [timeframe, setTimeframe] = useState('30d');

  const fraudPatterns = [
    { name: 'Card Not Present (CNP)', percentage: 54, color: 'bg-blue-500', count: '1,240 cases' },
    { name: 'Account Takeover (ATO)', percentage: 26, color: 'bg-indigo-500', count: '598 cases' },
    { name: 'Synthetic Identity Fraud', percentage: 14, color: 'bg-purple-500', count: '322 cases' },
    { name: 'Friendly / Chargeback Abuse', percentage: 6, color: 'bg-emerald-500', count: '138 cases' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Risk Insights</h1>
          <p className="text-sm text-gray-400 mt-1 font-normal">
            Statistical breakdown of fraud vectors, loss prevention metrics, and detection efficiency.
          </p>
        </div>

        {/* Timeframe Filter Dropdown/Buttons */}
        <div className="flex items-center gap-2 bg-[#161A22] border border-[#222734] rounded-lg p-1">
          <Calendar className="w-4 h-4 text-gray-400 ml-2" />
          <button
            type="button"
            disabled={isViewOnly}
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              timeframe === '7d'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            disabled={isViewOnly}
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              timeframe === '30d'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            disabled={isViewOnly}
            onClick={() => setTimeframe('90d')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              timeframe === '90d'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5">
          <span className="text-xs text-gray-400 font-medium">Prevented Net Loss</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">$842,500</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +18.2% vs previous period
          </div>
        </div>

        <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5">
          <span className="text-xs text-gray-400 font-medium">Fraud-to-Sales Ratio</span>
          <div className="text-3xl font-extrabold text-white mt-2">0.08%</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            Well below 0.65% Visa/Mastercard threshold
          </div>
        </div>

        <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5">
          <span className="text-xs text-gray-400 font-medium">Auto-Mitigation Rate</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">94.3%</div>
          <div className="text-xs text-gray-400 mt-1">
            Resolved without manual analyst escalation
          </div>
        </div>
      </div>

      {/* Main Analytics Content: Patterns Breakdown & Geographic Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Fraud Patterns Breakdown */}
        <div className="lg:col-span-7 bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Top Fraud Attack Vectors
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Proportion of flagged incidents by fraud classification
              </p>
            </div>
            <span className="text-xs font-mono text-gray-500">2,298 Total</span>
          </div>

          <div className="space-y-4">
            {fraudPatterns.map((pattern) => (
              <div key={pattern.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{pattern.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{pattern.count}</span>
                    <span className="font-bold font-mono text-white">{pattern.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#0B0E14] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pattern.color}`}
                    style={{ width: `${pattern.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: High-Risk Geographies */}
        <div className="lg:col-span-5 bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight mb-1">
              High-Risk Origin Geographies
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Locations exhibiting disproportionate anomaly velocities
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-white">Lagos, Nigeria</span>
                  <div className="text-[11px] text-gray-400">Tor/VPN cluster proxy</div>
                </div>
                <span className="font-bold text-rose-400 font-mono">28.4% Flagged</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-white">Bucharest, Romania</span>
                  <div className="text-[11px] text-gray-400">Card enumeration attempts</div>
                </div>
                <span className="font-bold text-amber-400 font-mono">19.1% Flagged</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-white">São Paulo, Brazil</span>
                  <div className="text-[11px] text-gray-400">Credential stuffing signals</div>
                </div>
                <span className="font-bold text-amber-400 font-mono">14.6% Flagged</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#222734] text-xs text-gray-500 text-center">
            Updated live via global threat intelligence network
          </div>
        </div>
      </div>
    </div>
  );
}
