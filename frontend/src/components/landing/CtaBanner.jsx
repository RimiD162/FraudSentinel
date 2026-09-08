import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * CtaBanner Component
 * Full-width closing call-to-action banner linking directly to the dashboard.
 */
export default function CtaBanner() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0E121A] to-[#121722] border-t border-[#222734]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#161A22] border border-[#222734] rounded-2xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          
          {/* Subtle background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to protect your transactions?
            </h2>

            <p className="text-base sm:text-lg text-gray-400 font-normal">
              Experience the full power of FraudSentinel's real-time risk scoring, role-based workflows, and automated threat mitigation.
            </p>

            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
