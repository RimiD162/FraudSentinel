import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Search, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

/**
 * AnalyzeTransaction Page Component
 * Allows analysts and admins to run real-time risk scoring and anomaly detection
 * on arbitrary transaction payloads.
 * Permissions: Admin (Full), Fraud Analyst (Full), Viewer (Hidden)
 */
export default function AnalyzeTransaction() {
  const isViewOnly = useViewOnly();

  const [formData, setFormData] = useState({
    amount: '1,420.00',
    currency: 'USD',
    cardholder: 'Alex Rivera',
    ipAddress: '198.51.100.42',
    location: 'Lagos, Nigeria',
    merchantCategory: 'Electronics / High-Risk',
    riskThreshold: '75',
  });

  const [analyzed, setAnalyzed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    if (isViewOnly) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunAnalysis = (e) => {
    e.preventDefault();
    if (isViewOnly) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 400);
  };

  const handleReset = () => {
    if (isViewOnly) return;
    setFormData({
      amount: '',
      currency: 'USD',
      cardholder: '',
      ipAddress: '',
      location: '',
      merchantCategory: 'Retail',
      riskThreshold: '70',
    });
    setAnalyzed(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Analyze Transaction</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Live ML Engine
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Submit transaction parameters to run real-time ML risk scoring and anomaly detection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Transaction Payload Parameters
          </h2>

          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Amount
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  disabled={isViewOnly}
                  placeholder="e.g. 500.00"
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                value={formData.cardholder}
                onChange={(e) => handleInputChange('cardholder', e.target.value)}
                disabled={isViewOnly}
                placeholder="Full name on card"
                className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  IP Address
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  disabled={isViewOnly}
                  placeholder="e.g. 192.0.2.1"
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Geolocation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={isViewOnly}
                  placeholder="City, Country"
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Merchant Category
              </label>
              <input
                type="text"
                value={formData.merchantCategory}
                onChange={(e) => handleInputChange('merchantCategory', e.target.value)}
                disabled={isViewOnly}
                placeholder="e.g. Electronics, Travel"
                className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Risk Alert Threshold
                </label>
                <span className="text-xs font-mono text-blue-400 font-semibold">
                  {formData.riskThreshold} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.riskThreshold}
                onChange={(e) => handleInputChange('riskThreshold', e.target.value)}
                disabled={isViewOnly}
                className="w-full accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={isViewOnly || loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Evaluating Model...' : 'Run Fraud Analysis'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isViewOnly}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0B0E14] hover:bg-[#1C212B] text-gray-300 text-sm font-medium border border-[#222734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-5">
          {analyzed ? (
            <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  ML Inference Result
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                  High Risk (Flagged)
                </span>
              </div>

              {/* Big Score Dial */}
              <div className="p-5 rounded-xl bg-[#0B0E14] border border-[#222734] flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-medium">Calibrated Risk Score</div>
                  <div className="text-3xl font-extrabold text-rose-400 mt-1">87 / 100</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Threshold set at {formData.riskThreshold}</div>
                </div>
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
              </div>

              {/* Anomaly Factors */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Triggered Risk Factors
                </h3>
                <ul className="space-y-2 text-xs">
                  <li className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-start gap-2.5 text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Geolocation Mismatch:</strong> Card issued in US, but IP resolved to Lagos, Nigeria.</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-start gap-2.5 text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Velocity Anomaly:</strong> 3 attempts in past 90 seconds from identical device fingerprint.</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-start gap-2.5 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>AVS Verification:</strong> Billing postal code match confirmed.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-[#222734] flex items-center justify-between text-xs text-gray-400">
                <span>Model: Sentinel-XGB-v4</span>
                <span>Latency: 142ms</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#161A22] border border-[#222734] rounded-xl p-8 text-center text-gray-400 min-h-[300px] flex flex-col items-center justify-center">
              <Cpu className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-300">No Transaction Evaluated Yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Fill in the payload parameters on the left and click "Run Fraud Analysis".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
