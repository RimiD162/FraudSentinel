import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { analyzeTransaction } from '../services/api.js';

/**
 * AnalyzeTransaction Page Component
 * Allows analysts to run real-time risk scoring, ML inference,
 * and symbolic KR&R anomaly detection on arbitrary transaction payloads.
 * Styled in luxury White & Gold theme.
 */
export default function AnalyzeTransaction() {
  const isViewOnly = useViewOnly();

  const [formData, setFormData] = useState({
    transaction_id: 'TXN-90214',
    customer_id: 'C2757',
    amount: '1420.00',
    transaction_type: 'transfer',
    location: 'California',
    device_type: 'POS',
    previous_transactions_count: '2',
    riskThreshold: '70',
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeepReasoning, setShowDeepReasoning] = useState(false);

  const handleInputChange = (field, value) => {
    if (isViewOnly) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    setLoading(true);
    setError(null);

    const cleanAmount = parseFloat(formData.amount.replace(/[^0-9.]/g, '')) || 100.0;
    const prevCount = parseInt(formData.previous_transactions_count, 10) || 0;

    const payload = {
      id: formData.transaction_id || `TXN-${Date.now().toString().slice(-6)}`,
      customer_id: formData.customer_id || 'CUST_DEFAULT',
      amount: cleanAmount,
      transaction_type: formData.transaction_type,
      transaction_time: new Date().toISOString(),
      location: formData.location || 'New York',
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
      transaction_type: 'payment',
      location: 'New York',
      device_type: 'mobile',
      previous_transactions_count: '5',
      riskThreshold: '70',
    });
    setAnalysisResult(null);
    setError(null);
  };

  // Score display helper
  const scoreNumber = analysisResult ? Math.round(analysisResult.risk_score * 100) : 87;
  const riskLevel = analysisResult?.risk_level || 'HIGH';
  const isFraud = analysisResult?.is_fraud ?? true;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1612] tracking-tight">
            Analyze Transaction
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold">
            Live ML Engine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#5C5648] mt-1 font-normal">
          Submit transaction parameters to run real-time multi-model ML risk scoring, Bayesian belief inference, and symbolic KR&R rule reasoning.
        </p>
      </div>

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
                  <option value="payment">Payment</option>
                  <option value="transfer">Transfer</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="deposit">Deposit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1612] uppercase tracking-wider mb-1.5">
                  Location (State / Region)
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#FAF8F4] border border-[#E5DCBE] focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-sm text-[#1A1612] font-medium transition-all outline-none disabled:opacity-50"
                >
                  <option value="California">California</option>
                  <option value="Florida">Florida</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Illinois">Illinois</option>
                  <option value="New York">New York</option>
                  <option value="Texas">Texas</option>
                  <option value="Washington">Washington</option>
                  <option value="Lagos, Nigeria">Lagos, Nigeria (High-Risk)</option>
                </select>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1A1612] uppercase tracking-wider">
                  Risk Alert Threshold
                </label>
                <span className="text-xs font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
                      scoreNumber >= 50
                        ? 'text-rose-600'
                        : scoreNumber >= 20
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {scoreNumber} <span className="text-lg text-[#8C8270] font-normal">/ 100</span>
                  </div>
                  <div className="text-[11px] text-[#8C8270] mt-0.5">
                    Threshold set at {formData.riskThreshold}
                  </div>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm ${
                    scoreNumber >= 50
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : scoreNumber >= 20
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
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3.5">
                <Sparkles className="w-6 h-6" />
              </div>
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
