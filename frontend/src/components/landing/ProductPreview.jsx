import React from 'react';
import { Lock, ShieldCheck, BarChart2, Bell, Layers, Zap } from 'lucide-react';

/**
 * ProductPreview Component
 * High-fidelity, expanded browser-frame mockup showcasing the FraudSentinel
 * operational dashboard interface with a clear explanatory caption.
 */
export default function ProductPreview() {
  return (
    <section className="py-20 bg-[#0E121A]/80 border-t border-[#222734]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Unified Risk Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            Designed for High-Velocity Risk Teams
          </h2>
          <p className="text-base text-gray-400 mt-3">
            An intuitive command center that merges machine-speed decisioning with human investigator control.
          </p>
        </div>

        {/* Expanded Browser Frame Mockup */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#161A22] border border-[#222734] shadow-2xl overflow-hidden">
          {/* Browser Chrome Bar */}
          <div className="h-11 bg-[#0E121A] border-b border-[#222734] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>

            <div className="flex-1 max-w-sm mx-4">
              <div className="bg-[#161A22] border border-[#222734] rounded-lg px-3 py-1 flex items-center justify-center gap-2 text-xs text-gray-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">https://app.fraudsentinel.io/dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline font-mono text-[11px]">System Live</span>
            </div>
          </div>

          {/* Browser Interior Preview */}
          <div className="p-6 sm:p-8 bg-[#0B0E14] space-y-6 select-none">
            {/* Top Toolbar in Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222734]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Fraud Sentinel Overview
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Live Stream
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing real-time transaction scoring from 14 global processing nodes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-[#161A22] border border-[#222734] text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Enforce: ON
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                  Admin Session
                </span>
              </div>
            </div>

            {/* Mock KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#161A22] border border-[#222734] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Daily Volume</span>
                  <span className="text-xs text-emerald-400 font-semibold">+15.4%</span>
                </div>
                <div className="text-2xl font-bold text-white mt-2">$3,482,910</div>
                <div className="text-[11px] text-gray-500 mt-1">12,345 transactions evaluated</div>
              </div>

              <div className="bg-[#161A22] border border-[#222734] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Flagged Transactions</span>
                  <span className="text-xs text-rose-400 font-semibold">-10.2%</span>
                </div>
                <div className="text-2xl font-bold text-white mt-2">45 Incidents</div>
                <div className="text-[11px] text-gray-500 mt-1">99.5% classification confidence</div>
              </div>

              <div className="bg-[#161A22] border border-[#222734] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Model Precision</span>
                  <span className="text-xs text-blue-400 font-semibold">v4.8 Active</span>
                </div>
                <div className="text-2xl font-bold text-white mt-2">99.85%</div>
                <div className="text-[11px] text-gray-500 mt-1">Mean inference: 184ms</div>
              </div>
            </div>

            {/* Mock Two Column Chart / Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Mock Chart */}
              <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">24h Anomaly Velocity</span>
                  <span className="text-xs text-gray-400 font-mono">UTC</span>
                </div>
                <div className="h-32 flex items-end justify-between gap-2 pt-4">
                  {[28, 45, 30, 60, 80, 50, 40, 75, 90, 65, 35, 55].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-t ${
                          i === 8
                            ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
                            : 'bg-blue-600/40 hover:bg-blue-500'
                        }`}
                        style={{ height: `${val}%` }}
                      ></div>
                      <span className="text-[9px] text-gray-500 font-mono">{i * 2}h</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Mock Table */}
              <div className="bg-[#161A22] border border-[#222734] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">Live Investigation Queue</span>
                  <span className="text-xs text-blue-400 font-medium">View All &rarr;</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-medium text-white">TXN-49102 • $1,200.00</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Multiple IPs in 5 min • Card Not Present</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 text-[11px]">
                      High Risk
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-medium text-white">TXN-49101 • $840.50</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Velocity spike from new device</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 text-[11px]">
                      Review
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Short Caption Underneath */}
        <p className="text-center text-xs sm:text-sm text-gray-400 mt-6 max-w-2xl mx-auto">
          The FraudSentinel real-time console provides granular drill-downs into every flagged transaction, customizable rule thresholds, and instant role-based access for your whole organization.
        </p>

      </div>
    </section>
  );
}
