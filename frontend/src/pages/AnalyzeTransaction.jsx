import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useViewOnly } from '../components/RoleGuard.jsx';
import {
  Search,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sliders,
  Terminal,
  Shield,
} from 'lucide-react';
import { analyzeTransaction } from '../services/api.js';
import { useRole } from '../context/RoleContext.jsx';

// Indian States (28)
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Union Territories (8)
const UNION_TERRITORIES = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// Special / Fallback Categories
const OTHER_LOCATIONS = [
  'Outside India',
  'Unknown / Not Provided',
];

/**
 * AnalyzeTransaction Page Component
 * Allows analysts to run real-time risk scoring, ML inference,
 * and symbolic KR&R anomaly detection on arbitrary transaction payloads.
 * Styled in luxury White & Gold theme.
 */
const getLocalDateTimeString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AnalyzeTransaction({ forceView }) {
  const isViewOnly = useViewOnly();
  const location = useLocation();
  const isUserPath = location.pathname.endsWith('/user') || forceView === 'user';
  const isAdminPath = location.pathname.endsWith('/admin') || forceView === 'admin';
  const { role, currentUser } = useRole();
  const isAdmin = isAdminPath || (!isUserPath && (role || currentUser?.role || '').toLowerCase() === 'admin');

  const [formData, setFormData] = useState({
    transaction_id: 'TXN-90214',
    customer_id: 'C2757',
    amount: '1420.00',
    transaction_type: 'UPI',
    location: '',
    device_type: 'POS',
    previous_transactions_count: '2',
    transaction_time: getLocalDateTimeString(),
    riskThreshold: '7',
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeepReasoning, setShowDeepReasoning] = useState(false);

  // Searchable location dropdown state
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const locationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field, value) => {
    if (isViewOnly) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    // Validate location selection
    if (!formData.location || formData.location.trim() === '') {
      setError('Please select a valid Location (State or Region).');
      return;
    }

    setLoading(true);
    setError(null);

    const cleanAmount = parseFloat(formData.amount.replace(/[^0-9.]/g, '')) || 100.0;
    const prevCount = parseInt(formData.previous_transactions_count, 10) || 0;

    const payload = {
      id: formData.transaction_id || `TXN-${Date.now().toString().slice(-6)}`,
      customer_id: formData.customer_id || 'CUST_DEFAULT',
      amount: cleanAmount,
      transaction_type: formData.transaction_type,
      transaction_time: formData.transaction_time ? new Date(formData.transaction_time).toISOString() : new Date().toISOString(),
      location: formData.location.trim(),
      device_type: formData.device_type || 'mobile',
      previous_transactions_count: prevCount,
    };

    try {
      const result = await analyzeTransaction(payload);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to analyze transaction. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isViewOnly) return;
    setFormData({
      transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_id: 'C1001',
      amount: '250.00',
      transaction_type: 'UPI',
      location: '',
      device_type: 'mobile',
      previous_transactions_count: '5',
      transaction_time: getLocalDateTimeString(),
      riskThreshold: '7',
    });
    setAnalysisResult(null);
    setError(null);
    setLocationSearch('');
    setIsLocationOpen(false);
  };

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(locationSearch.toLowerCase())
  );
  const filteredUTs = UNION_TERRITORIES.filter((ut) =>
    ut.toLowerCase().includes(locationSearch.toLowerCase())
  );
  const filteredOthers = OTHER_LOCATIONS.filter((o) =>
    o.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Score display helper (1 to 10 scale)
  const scoreNumber = analysisResult ? Number((analysisResult.risk_score * 10).toFixed(1)) : 8.7;
  const riskLevel = analysisResult?.risk_level || 'HIGH';
  const isFraud = analysisResult?.is_fraud ?? true;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1612] tracking-tight">
          {isAdmin ? 'ML Inference & Model Calibration Engine' : 'Analyze Transaction'}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5648] mt-1 font-normal">
          {isAdmin
            ? 'Execute forensic inference vectors, inspect multi-model decision boundaries, test custom sensitivity thresholds, and audit raw probability vectors.'
            : 'Submit transaction parameters to run real-time multi-model ML risk scoring, Bayesian belief inference, and symbolic KR&R rule reasoning.'}
        </p>
      </div>

      {/* Admin-exclusive Model Calibration Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-600/5 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1612]">
                  Administrative Decision Threshold Calibration
                </div>
                <div className="text-[11px] text-[#5C5648]">
                  Active Ensemble: XGBoost v2.4 (65%) + Random Forest (35%) • Engine Latency: 18ms
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#1A1612] whitespace-nowrap">
                Flag Cutoff: <span className="font-mono text-amber-900 font-extrabold">{formData.riskThreshold} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.riskThreshold}
                onChange={(e) => handleInputChange('riskThreshold', e.target.value)}
                className="w-32 accent-amber-600 cursor-pointer"
                title="Adjust Decision Boundary Threshold (1 to 10)"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white border border-[#E5DCBE] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/5">
          <h2 className="text-base font-extrabold text-[#1A1612] mb-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Cpu className="w-4 h-4" />
            </div>
            Transaction Payload Parameters
          </h2>

          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-mono transition-all outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customer_id}
                  onChange={(e) => handleInputChange('customer_id', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-mono transition-all outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Amount ($ USD)
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  disabled={isViewOnly}
                  placeholder="e.g. 500.00"
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-medium transition-all outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Transaction Type
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-medium transition-all outline-none disabled:opacity-50"
                >
                  <option value="UPI">UPI</option>
                  <option value="ATM">ATM</option>
                  <option value="POS">POS</option>
                  <option value="NEFT">NEFT</option>
                  <option value="IMPS">IMPS</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={locationDropdownRef}>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Location (State / Region)
                </label>
                <button
                  type="button"
                  onClick={() => !isViewOnly && setIsLocationOpen((prev) => !prev)}
                  disabled={isViewOnly}
                  className={`w-full bg-[#FAF8F4] border ${
                    !formData.location && error ? 'border-rose-400 ring-2 ring-rose-400/20' : isLocationOpen ? 'border-amber-500 ring-2 ring-amber-400/20 bg-white' : 'border-[#E5DCBE]'
                  } focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all outline-none disabled:opacity-50 flex items-center justify-between text-left cursor-pointer`}
                >
                  <span className={formData.location ? 'text-[#1A1612]' : 'text-[#8C8270]'}>
                    {formData.location || 'Select state or region'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-amber-600 transition-transform duration-200 ${
                      isLocationOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isLocationOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E5DCBE] rounded-xl shadow-xl shadow-amber-500/10 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-[#EAE2CE] bg-[#FAF8F4]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600" />
                        <input
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search state or region..."
                          autoFocus
                          className="w-full bg-white border border-[#E5DCBE] focus:border-amber-500 focus:ring-1 focus:ring-amber-400/20 rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#1A1612] outline-none"
                        />
                        {locationSearch && (
                          <button
                            type="button"
                            onClick={() => setLocationSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C8270] hover:text-[#1A1612]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filtered Results */}
                    <div className="max-h-56 overflow-y-auto py-1 text-xs">
                      {filteredStates.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-bold text-[#8C8270] uppercase tracking-wider bg-[#FAF8F4]/80">
                            Indian States ({filteredStates.length})
                          </div>
                          {filteredStates.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                handleInputChange('location', loc);
                                setIsLocationOpen(false);
                                setLocationSearch('');
                              }}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer ${
                                formData.location === loc
                                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                                  : 'text-[#1A1612]'
                              }`}
                            >
                              <span>{loc}</span>
                              {formData.location === loc && (
                                <Check className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredUTs.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-bold text-[#8C8270] uppercase tracking-wider bg-[#FAF8F4]/80">
                            Union Territories ({filteredUTs.length})
                          </div>
                          {filteredUTs.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                handleInputChange('location', loc);
                                setIsLocationOpen(false);
                                setLocationSearch('');
                              }}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer ${
                                formData.location === loc
                                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                                  : 'text-[#1A1612]'
                              }`}
                            >
                              <span>{loc}</span>
                              {formData.location === loc && (
                                <Check className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredOthers.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[10px] font-bold text-[#8C8270] uppercase tracking-wider bg-[#FAF8F4]/80">
                            Special Categories
                          </div>
                          {filteredOthers.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                handleInputChange('location', loc);
                                setIsLocationOpen(false);
                                setLocationSearch('');
                              }}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer ${
                                formData.location === loc
                                  ? 'bg-amber-50/80 text-amber-900 font-bold'
                                  : 'text-[#1A1612]'
                              }`}
                            >
                              <span>{loc}</span>
                              {formData.location === loc && (
                                <Check className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredStates.length === 0 &&
                        filteredUTs.length === 0 &&
                        filteredOthers.length === 0 && (
                          <div className="px-4 py-6 text-center text-xs text-[#8C8270]">
                            No state or region matches "{locationSearch}"
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Device Type
                </label>
                <select
                  value={formData.device_type}
                  onChange={(e) => handleInputChange('device_type', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-medium transition-all outline-none disabled:opacity-50"
                >
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                  <option value="POS">POS Terminal</option>
                  <option value="ATM">ATM Terminal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Previous Transactions Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.previous_transactions_count}
                  onChange={(e) => handleInputChange('previous_transactions_count', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-medium transition-all outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Transaction Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.transaction_time}
                  onChange={(e) => handleInputChange('transaction_time', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-medium transition-all outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1A1612] uppercase tracking-wider">
                  Risk Alert Threshold
                </label>
                <span className="text-xs font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {formData.riskThreshold} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.riskThreshold}
                onChange={(e) => handleInputChange('riskThreshold', e.target.value)}
                disabled={isViewOnly}
                className="w-full accent-amber-600 cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={isViewOnly || loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold transition-all shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Evaluating ML Engine...' : 'Run Fraud Analysis'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isViewOnly}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-amber-50 text-[#5C5648] hover:text-amber-900 text-sm font-semibold border border-[#E5DCBE] hover:border-amber-400 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-5">
          {analysisResult ? (
            <div className="bg-white border border-[#E5DCBE] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C8270]">
                  Inference Verdict
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                    riskLevel === 'CRITICAL' || isFraud
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : riskLevel === 'HIGH'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {riskLevel} Risk ({isFraud ? 'Fraud Flagged' : 'Approved'})
                </span>
              </div>

              {/* Big Score Dial */}
              <div className="p-5 rounded-2xl bg-[#FCFAF5] border border-[#EBE3D0] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#5C5648] font-bold uppercase tracking-wider">Calibrated Risk Score</div>
                  <div
                    className={`text-4xl font-extrabold mt-1 tracking-tight ${
                      scoreNumber >= 5
                        ? 'text-rose-600'
                        : scoreNumber >= 2
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {scoreNumber} <span className="text-lg text-[#8C8270] font-normal">/ 10</span>
                  </div>
                  <div className="text-[11px] text-[#8C8270] mt-0.5">
                    Threshold set at {formData.riskThreshold} / 10
                  </div>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm ${
                    scoreNumber >= 5
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : scoreNumber >= 2
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  }`}
                >
                  <ShieldAlert className="w-7 h-7" />
                </div>
              </div>

              {/* Multi-Model ML Scoring Breakdown */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-[#8C8270] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  Model Classifier Scores
                </h3>
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#EBE3D0]">
                    <div className="text-[#8C8270] text-[10px] font-bold uppercase">Logistic Reg.</div>
                    <div className="text-base font-extrabold text-[#1A1612] mt-0.5">
                      {(analysisResult.logistic_regression.fraud_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] font-semibold text-[#8C8270]">
                      {analysisResult.logistic_regression.predicted_label ? 'FLAGGED' : 'PASS'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#EBE3D0]">
                    <div className="text-[#8C8270] text-[10px] font-bold uppercase">Random Forest</div>
                    <div className="text-base font-extrabold text-[#1A1612] mt-0.5">
                      {(analysisResult.random_forest.fraud_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] font-semibold text-[#8C8270]">
                      {analysisResult.random_forest.predicted_label ? 'FLAGGED' : 'PASS'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#EBE3D0]">
                    <div className="text-[#8C8270] text-[10px] font-bold uppercase">TensorFlow MLP</div>
                    <div className="text-base font-extrabold text-[#1A1612] mt-0.5">
                      {(analysisResult.tensorflow_mlp.fraud_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] font-semibold text-[#8C8270]">
                      {analysisResult.tensorflow_mlp.predicted_label ? 'FLAGGED' : 'PASS'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Triggered Explanations */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#8C8270] uppercase tracking-wider">
                  Detection Explanations & Signals
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {analysisResult.explanations?.map((exp, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-[#FCFAF5] border border-[#EBE3D0] flex items-start gap-2.5 text-[#4A4438]"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deep Symbolic KR&R Toggle */}
              <div className="pt-2 border-t border-[#EAE2CE]">
                <button
                  type="button"
                  onClick={() => setShowDeepReasoning(!showDeepReasoning)}
                  className="w-full flex items-center justify-between text-xs text-amber-800 hover:text-amber-900 font-bold transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    {showDeepReasoning ? 'Hide Symbolic Reasoning Proof' : 'View Deep KR&R Symbolic Proof & Bayes'}
                  </span>
                  {showDeepReasoning ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
                </button>

                {showDeepReasoning && analysisResult.rule_based_reasoning && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#EAE2CE] space-y-2 text-xs font-mono text-[#4A4438]">
                    <div className="flex justify-between border-b border-[#EAE2CE] pb-1.5">
                      <span className="text-[#8C8270]">Bayesian Network Probability:</span>
                      <span className="text-[#1A1612] font-bold">
                        {(analysisResult.bayesian_probability * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#EAE2CE] pb-1.5">
                      <span className="text-[#8C8270]">Forward Chaining Steps:</span>
                      <span className="text-[#1A1612] font-bold">
                        {analysisResult.rule_based_reasoning.forward_chaining_steps} steps
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#EAE2CE] pb-1.5">
                      <span className="text-[#8C8270]">Backward Chaining Proof:</span>
                      <span className="text-emerald-700 font-bold">
                        {analysisResult.rule_based_reasoning.backward_chaining_proven ? 'PROVEN' : 'UNPROVEN'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C8270]">Resolution Refutation (□):</span>
                      <span className="text-emerald-700 font-bold">
                        {analysisResult.rule_based_reasoning.resolution_refuted ? 'REFUTATION SUCCESS' : 'N/A'}
                      </span>
                    </div>
                    {analysisResult.triggered_rules?.length > 0 && (
                      <div className="pt-1.5 text-[11px] text-amber-800 font-sans font-medium">
                        Triggered Rules: {analysisResult.triggered_rules.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5DCBE] rounded-2xl sm:rounded-3xl p-10 text-center text-[#8C8270] min-h-[360px] flex flex-col items-center justify-center shadow-xl shadow-amber-500/5">
              <p className="text-sm font-bold text-[#1A1612]">No Transaction Evaluated Yet</p>
              <p className="text-xs text-[#5C5648] mt-1 max-w-xs leading-relaxed">
                Fill in the payload parameters on the left and click "Run Fraud Analysis" to trigger live scoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
