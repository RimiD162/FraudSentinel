import React from 'react';
import { Lock, Zap } from 'lucide-react';

/**
 * ProductPreview Component
 * High-fidelity, expanded browser-frame mockup showcasing the FraudSentinel
 * operational dashboard interface in a White & Gold luxury theme.
 */
export default function ProductPreview() {
  return (
    <section className="pt-16 pb-10 bg-gradient-to-b from-[#F9F7F1] to-[#FAF8F3] border-t border-[#EBE3D0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1612] tracking-tight">
            Designed for High-Velocity Risk Teams
          </h2>
          <p className="text-base sm:text-lg text-[#5C5648] mt-4">
            An intuitive command center that merges machine-speed decisioning with human investigator control.
          </p>
        </div>

        {/* Expanded Browser Frame Mockup */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-white border border-[#E5DCBE] shadow-[0_20px_60px_rgba(197,154,63,0.15)] overflow-hidden">
          {/* Browser Chrome Bar */}
          <div className="h-11 bg-[#F9F7F2] border-b border-[#EAE2CE] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>

            <div className="flex-1 max-w-sm mx-4">
              <div className="bg-white border border-[#E5DCBE] rounded-lg px-3 py-1 flex items-center justify-center gap-2 text-xs text-[#6B6454] font-mono shadow-inner">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">https://app.fraudsentinel.io/dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6B6454]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline font-mono text-[11px] font-semibold text-emerald-800">System Live</span>
            </div>
          </div>

          {/* Browser Interior Preview */}
          <div className="p-6 sm:p-8 bg-[#FAF8F4] space-y-6 select-none">
            {/* Top Toolbar in Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2CE]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1A1612] tracking-tight">
                    Fraud Sentinel Overview
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    Live Stream
                  </span>
                </div>
                <p className="text-xs text-[#6B6454] mt-1 font-medium">
                  Showing real-time transaction scoring from 14 global processing nodes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE2CE] text-xs font-semibold text-[#4A4438] flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Auto-Enforce: ON
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white text-xs font-bold shadow-md shadow-amber-500/20">
                  Admin Session
                </span>
              </div>
            </div>

            {/* Mock KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#EAE2CE] rounded-xl p-4 shadow-sm hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B6454] font-semibold">Daily Volume</span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">+15.4%</span>
                </div>
                <div className="text-2xl font-extrabold text-[#1A1612] mt-2">$3,482,910</div>
                <div className="text-[11px] text-[#8C8270] mt-1">12,345 transactions evaluated</div>
              </div>

              <div className="bg-white border border-[#EAE2CE] rounded-xl p-4 shadow-sm hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B6454] font-semibold">Flagged Transactions</span>
                  <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full">-10.2%</span>
                </div>
                <div className="text-2xl font-extrabold text-[#1A1612] mt-2">45 Incidents</div>
                <div className="text-[11px] text-[#8C8270] mt-1">99.5% classification confidence</div>
              </div>

              <div className="bg-white border border-[#EAE2CE] rounded-xl p-4 shadow-sm hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B6454] font-semibold">Model Precision</span>
                  <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">v4.8 Active</span>
                </div>
                <div className="text-2xl font-extrabold text-[#1A1612] mt-2">99.85%</div>
                <div className="text-[11px] text-[#8C8270] mt-1">Mean inference: 184ms</div>
              </div>
            </div>

            {/* Mock Two Column Chart / Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Mock Chart */}
              <div className="bg-white border border-[#EAE2CE] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-extrabold text-[#1A1612]">24h Anomaly Velocity</span>
                  <span className="text-xs text-[#6B6454] font-mono">UTC</span>
                </div>
                <div className="h-32 flex items-end justify-between gap-2 pt-4">
                  {[28, 45, 30, 60, 80, 50, 40, 75, 90, 65, 35, 55].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-t transition-all ${
                          i === 8
                            ? 'bg-gradient-to-t from-amber-500 to-yellow-400 shadow-md shadow-amber-500/40'
                            : 'bg-amber-500/25 hover:bg-amber-500/40'
                        }`}
                        style={{ height: `${val}%` }}
                      ></div>
                      <span className="text-[9px] text-[#8C8270] font-mono font-medium">{i * 2}h</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Mock Table */}
              <div className="bg-white border border-[#EAE2CE] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-extrabold text-[#1A1612]">Live Investigation Queue</span>
                  <span className="text-xs text-amber-700 font-bold hover:underline cursor-pointer">View All &rarr;</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EAE2CE] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-[#1A1612]">TXN-49102 • $1,200.00</div>
                      <div className="text-[11px] text-[#6B6454] mt-0.5">Multiple IPs in 5 min • Card Not Present</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                      High Risk
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#EAE2CE] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-[#1A1612]">TXN-49101 • $840.50</div>
                      <div className="text-[11px] text-[#6B6454] mt-0.5">Velocity spike from new device</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-300 text-[11px]">
                      Review
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Short Caption Underneath */}
        <p className="text-center text-xs sm:text-sm text-[#6B6454] mt-5 max-w-2xl mx-auto font-medium">
          The FraudSentinel real-time console provides granular drill-downs into every flagged transaction, customizable rule thresholds, and instant role-based access for your whole organization.
        </p>

      </div>
    </section>
  );
}
