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
} from 'lucide-react';
import { analyzeTransaction } from '../services/api.js';

/**
 * AnalyzeTransaction Page Component
 * Allows analysts and admins to run real-time risk scoring, ML inference,
 * and symbolic KR&R anomaly detection on arbitrary transaction payloads.
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
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span>Analyze Transaction</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Live ML Engine
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Submit transaction parameters to run real-time multi-model ML risk scoring, Bayesian belief inference, and symbolic KR&R rule reasoning.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Transaction Payload Parameters
          </h2>

          <form onSubmit={handleRunAnalysis} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customer_id}
                  onChange={(e) => handleInputChange('customer_id', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Amount ($ USD)
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
                  Transaction Type
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Location (State / Region)
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Device Type
                </label>
                <select
                  value={formData.device_type}
                  onChange={(e) => handleInputChange('device_type', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                  <option value="POS">POS Terminal</option>
                  <option value="ATM">ATM Terminal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Previous Transactions Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.previous_transactions_count}
                onChange={(e) => handleInputChange('previous_transactions_count', e.target.value)}
                disabled={isViewOnly}
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
                {loading ? 'Evaluating ML & KR&R Engine...' : 'Run Fraud Analysis'}
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
        <div className="lg:col-span-6 space-y-5">
          {analysisResult ? (
            <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  ML & KR&R Inference Verdict
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    riskLevel === 'CRITICAL' || isFraud
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : riskLevel === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {riskLevel} Risk ({isFraud ? 'Fraud Flagged' : 'Approved'})
                </span>
              </div>

              {/* Big Score Dial */}
              <div className="p-5 rounded-xl bg-[#0B0E14] border border-[#222734] flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-medium">Calibrated Risk Score</div>
                  <div
                    className={`text-3xl font-extrabold mt-1 ${
                      scoreNumber >= 50
                        ? 'text-rose-400'
                        : scoreNumber >= 20
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {scoreNumber} / 100
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Threshold set at {formData.riskThreshold}
                  </div>
                </div>
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${
                    scoreNumber >= 50
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                      : scoreNumber >= 20
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  }`}
                >
                  <ShieldAlert className="w-7 h-7" />
                </div>
              </div>

              {/* Multi-Model ML Scoring Breakdown */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Model Classifier Scores
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734]">
                    <div className="text-gray-400 text-[10px]">Logistic Reg.</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {(analysisResult.logistic_regression.fraud_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {analysisResult.logistic_regression.predicted_label ? 'FLAGGED' : 'PASS'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734]">
                    <div className="text-gray-400 text-[10px]">Random Forest</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {(analysisResult.random_forest.fraud_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {analysisResult.random_forest.predicted_label ? 'FLAGGED' : 'PASS'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734]">
                    <div className="text-gray-400 text-[10px]">TensorFlow MLP</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {(analysisResult.tensorflow_mlp.fraud_probability * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {analysisResult.tensorflow_mlp.predicted_label ? 'FLAGGED' : 'PASS'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Triggered Explanations */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Detection Explanations & Signals
                </h3>
                <ul className="space-y-1.5 text-xs">
                  {analysisResult.explanations?.map((exp, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#222734] flex items-start gap-2.5 text-gray-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deep Symbolic KR&R Toggle */}
              <div className="pt-2 border-t border-[#222734]">
                <button
                  type="button"
                  onClick={() => setShowDeepReasoning(!showDeepReasoning)}
                  className="w-full flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    {showDeepReasoning ? 'Hide Symbolic Reasoning Proof' : 'View Deep KR&R Symbolic Proof & Bayes'}
                  </span>
                  {showDeepReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDeepReasoning && analysisResult.rule_based_reasoning && (
                  <div className="mt-3 p-3 rounded-lg bg-[#0B0E14] border border-[#222734] space-y-2 text-xs font-mono text-gray-300">
                    <div className="flex justify-between border-b border-[#222734] pb-1">
                      <span className="text-gray-500">Bayesian Network Probability:</span>
                      <span className="text-white font-bold">
                        {(analysisResult.bayesian_probability * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#222734] pb-1">
                      <span className="text-gray-500">Forward Chaining Steps:</span>
                      <span className="text-white">
                        {analysisResult.rule_based_reasoning.forward_chaining_steps} steps
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#222734] pb-1">
                      <span className="text-gray-500">Backward Chaining Goal Proof:</span>
                      <span className="text-emerald-400">
                        {analysisResult.rule_based_reasoning.backward_chaining_proven ? 'PROVEN' : 'UNPROVEN'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resolution Refutation (□):</span>
                      <span className="text-emerald-400">
                        {analysisResult.rule_based_reasoning.resolution_refuted ? 'REFUTATION SUCCESS' : 'N/A'}
                      </span>
                    </div>
                    {analysisResult.triggered_rules?.length > 0 && (
                      <div className="pt-1 text-[11px] text-amber-400 font-sans">
                        Triggered KB Rules: {analysisResult.triggered_rules.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#161A22] border border-[#222734] rounded-xl p-8 text-center text-gray-400 min-h-[360px] flex flex-col items-center justify-center">
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
