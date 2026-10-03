import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * CtaBanner Component
 * Full-width closing call-to-action banner in a White & Gold theme.
 */
export default function CtaBanner() {
  return (
    <section className="pt-6 pb-12 bg-gradient-to-b from-[#FAFAF8] to-[#F6F1E3] border-t border-[#EBE3D0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-[#FDFBF7] to-[#F8F3E6] border border-[#DFC78E] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(197,154,63,0.15)]">
          
          {/* Subtle gold background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1612] tracking-tight leading-tight">
              Ready to protect your transactions?
            </h2>

            <p className="text-base sm:text-lg text-[#5C5648] font-normal leading-relaxed">
              Experience the full power of FraudSentinel's real-time risk scoring, role-based workflows, and automated threat mitigation.
            </p>

            <div className="pt-3">
              <Link
                to="/login/analyst"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base transition-all shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Launch Dashboard Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
