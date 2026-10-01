import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

/**
 * NavBar Component
 * Clean top navigation bar with brand logo and gold CTA in White & Gold theme.
 */
export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBE3D0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#1A1612] hover:opacity-90 transition-opacity"
          aria-label="FraudSentinel Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <span className="font-extrabold tracking-tight">
            Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">Sentinel</span>
          </span>
        </Link>

        {/* CTA Action */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
