import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, ShieldCheck, Lock, Activity, Zap, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Hero Component
 * Prominent headline, value proposition, primary and secondary CTAs,
 * trust capability cards, and a stylized white & gold browser-frame dashboard mockup.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 md:pt-6 md:pb-16 bg-gradient-to-b from-white via-[#FCFAF5] to-[#F8F5EC]">
      {/* Ambient background gold glow orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines and CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-sm font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
              <span>Next-Gen Transaction Security</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1612] tracking-tight leading-[1.12]">
              AI-Powered Fraud Intelligence. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700">
                Zero False Positives.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#5C5648] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Protect every transaction in real-time with predictive machine learning, automated risk orchestration, and sub-second fraud interception.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/login/analyst"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login/analyst"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAF6EC] text-[#1A1612] font-bold text-sm border border-[#DFC78E] transition-all shadow-sm hover:shadow-md hover:border-amber-400 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                View Dashboard
              </Link>
            </div>

            {/* Redesigned Trust & Capability Badge Cards */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DCBE] hover:border-amber-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group">
                <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Zap className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-[#1A1612]">Zero latency overhead</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DCBE] hover:border-amber-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group">
                <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-[#1A1612]">PCI-DSS compliant</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DCBE] hover:border-amber-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group">
                <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-[#1A1612]">Instant rule deployment</span>
              </div>
            </div>
          </div>

          {/* Right Column: Browser-frame Dashboard Mockup */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl rounded-2xl bg-white border border-[#E5DCBE] shadow-[0_20px_50px_rgba(197,154,63,0.14)] overflow-hidden">
              
              {/* Browser Chrome Header */}
              <div className="h-11 bg-[#F9F7F2] border-b border-[#EAE2CE] px-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 max-w-xs mx-auto">
                  <div className="bg-white border border-[#E5DCBE] rounded-md px-3 py-1 flex items-center justify-center gap-1.5 text-[11px] text-[#6B6454] font-mono shadow-inner">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>fraudsentinel.internal/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Browser Body Mockup UI */}
              <div className="p-4 sm:p-5 space-y-4 bg-[#FAF8F4] select-none">
                
                {/* Mini Stat Cards Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white border border-[#EAE2CE] rounded-xl p-3 shadow-sm hover:border-amber-300 transition-colors">
                    <div className="text-[10px] text-[#6B6454] font-semibold">Processed</div>
                    <div className="text-sm sm:text-base font-extrabold text-[#1A1612] mt-0.5">1,234,567</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-0.5">+12%</div>
                  </div>
                  <div className="bg-white border border-[#EAE2CE] rounded-xl p-3 shadow-sm hover:border-amber-300 transition-colors">
                    <div className="text-[10px] text-[#6B6454] font-semibold">Alerts</div>
                    <div className="text-sm sm:text-base font-extrabold text-[#1A1612] mt-0.5">456</div>
                    <div className="text-[10px] text-rose-600 font-bold mt-0.5">-5%</div>
                  </div>
                  <div className="bg-white border border-[#EAE2CE] rounded-xl p-3 shadow-sm hover:border-amber-300 transition-colors">
                    <div className="text-[10px] text-[#6B6454] font-semibold">Accuracy</div>
                    <div className="text-sm sm:text-base font-extrabold text-[#1A1612] mt-0.5">99.5%</div>
                    <div className="text-[10px] text-amber-700 font-bold mt-0.5">+0.1%</div>
                  </div>
                </div>

                {/* Mini Visual Chart Preview */}
                <div className="bg-white border border-[#EAE2CE] rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A1612]">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      <span>Live Velocity Score</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono font-bold">99.98% Healthy</span>
                  </div>
                  
                  {/* Visual Bar Graph */}
                  <div className="h-16 flex items-end justify-between gap-1.5 pt-2">
                    {[40, 65, 30, 85, 95, 75, 45, 60, 90, 100, 70, 55, 80].map((height, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-t transition-all ${
                          i === 9
                            ? 'bg-gradient-to-t from-amber-500 to-yellow-400 shadow-md shadow-amber-500/40'
                            : 'bg-amber-500/20 hover:bg-amber-500/40'
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Mini Fraud Alerts Table Row */}
                <div className="bg-white border border-[#EAE2CE] rounded-xl overflow-hidden shadow-sm">
                  <div className="px-3 py-2 bg-[#F9F7F2] border-b border-[#EAE2CE] text-[11px] font-bold text-[#4A4438] flex items-center justify-between">
                    <span>Recent Security Detections</span>
                    <span className="text-[10px] text-[#8C8270] font-mono">Live Sync</span>
                  </div>
                  <div className="divide-y divide-[#EAE2CE]/70 text-[10px]">
                    <div className="px-3 py-2 flex items-center justify-between bg-white hover:bg-[#FDFBF7] transition-colors">
                      <span className="font-mono font-medium text-[#4A4438]">TXN-88219</span>
                      <span className="font-bold text-[#1A1612]">$1,420.00</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">Flagged</span>
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between bg-white hover:bg-[#FDFBF7] transition-colors">
                      <span className="font-mono font-medium text-[#4A4438]">TXN-88218</span>
                      <span className="font-bold text-[#1A1612]">$249.50</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold">Under Review</span>
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between bg-white hover:bg-[#FDFBF7] transition-colors">
                      <span className="font-mono font-medium text-[#4A4438]">TXN-88217</span>
                      <span className="font-bold text-[#1A1612]">$78.00</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Cleared</span>
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
