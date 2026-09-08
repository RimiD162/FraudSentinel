import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, ShieldCheck, Lock, Activity, TrendingUp } from 'lucide-react';

/**
 * Hero Component
 * Prominent headline, value proposition, primary and secondary CTAs,
 * and a stylized browser-frame dashboard mockup.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines and CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Next-Gen Transaction Security</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Stop Fraud <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                Before It Happens
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Detect suspicious patterns in milliseconds, protect revenue with automated machine learning risk scoring, and empower analysts with real-time intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#161A22] hover:bg-[#1C212B] text-white font-semibold text-sm border border-[#222734] transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                View Dashboard
              </Link>
            </div>

            {/* Quick feature tags */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Zero latency overhead</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>PCI-DSS compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Instant rule deployment</span>
              </div>
            </div>
          </div>

          {/* Right Column: Browser-frame Dashboard Mockup */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl rounded-2xl bg-[#161A22] border border-[#222734] shadow-2xl overflow-hidden">
              
              {/* Browser Chrome Header */}
              <div className="h-10 bg-[#0E121A] border-b border-[#222734] px-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="flex-1 max-w-xs mx-auto">
                  <div className="bg-[#161A22] border border-[#222734] rounded-md px-3 py-1 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-mono">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>fraudsentinel.internal/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Browser Body Mockup UI */}
              <div className="p-4 sm:p-5 space-y-4 bg-[#0B0E14]/80 select-none">
                
                {/* Mini Stat Cards Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#161A22] border border-[#222734] rounded-lg p-2.5">
                    <div className="text-[10px] text-gray-400 font-medium">Processed</div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">1,234,567</div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">+12%</div>
                  </div>
                  <div className="bg-[#161A22] border border-[#222734] rounded-lg p-2.5">
                    <div className="text-[10px] text-gray-400 font-medium">Alerts</div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">456</div>
                    <div className="text-[10px] text-rose-400 font-semibold mt-0.5">-5%</div>
                  </div>
                  <div className="bg-[#161A22] border border-[#222734] rounded-lg p-2.5">
                    <div className="text-[10px] text-gray-400 font-medium">Accuracy</div>
                    <div className="text-sm sm:text-base font-bold text-white mt-0.5">99.5%</div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">+0.1%</div>
                  </div>
                </div>

                {/* Mini Visual Chart Preview */}
                <div className="bg-[#161A22] border border-[#222734] rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span>Live Velocity Score</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">99.98% Healthy</span>
                  </div>
                  
                  {/* Visual Bar Graph */}
                  <div className="h-16 flex items-end justify-between gap-1.5 pt-2">
                    {[40, 65, 30, 85, 95, 75, 45, 60, 90, 100, 70, 55, 80].map((height, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-t transition-all ${
                          i === 9
                            ? 'bg-gradient-to-t from-blue-600 to-indigo-400 shadow-sm shadow-blue-500/50'
                            : 'bg-blue-600/30'
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Mini Fraud Alerts Table Row */}
                <div className="bg-[#161A22] border border-[#222734] rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#222734] text-[11px] font-semibold text-gray-300 flex items-center justify-between">
                    <span>Recent Security Detections</span>
                    <span className="text-[10px] text-gray-500 font-mono">Live Sync</span>
                  </div>
                  <div className="divide-y divide-[#222734]/60 text-[10px]">
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="font-mono text-gray-300">TXN-88219</span>
                      <span className="font-medium text-white">$1,420.00</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">Flagged</span>
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="font-mono text-gray-300">TXN-88218</span>
                      <span className="font-medium text-white">$249.50</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Under Review</span>
                    </div>
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="font-mono text-gray-300">TXN-88217</span>
                      <span className="font-medium text-white">$78.00</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Cleared</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
