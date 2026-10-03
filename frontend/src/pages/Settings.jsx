import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Settings as SettingsIcon, Save, Key, Sliders, Webhook, ShieldCheck, Check, Lock, Bell, Cpu, ArrowRight } from 'lucide-react';

/**
 * Settings Page Component
 * System configuration, ML sensitivity thresholds, webhook integrations, and API keys.
 * Permissions: Admin (Full Access), Fraud Analyst (Hidden/Restricted)
 * Luxury White & Gold theme matching the Landing and Auth design system.
 */

export default function Settings() {
  const isViewOnly = useViewOnly();

  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [settings, setSettings] = useState({
    autoBlockThreshold: 85,
    analystReviewThreshold: 55,
    sensitivityProfile: 'balanced',
    webhookUrl: 'https://api.internal-risk.corp/webhooks/fraud-events',
    notificationEmail: 'alerts-critical@fraudsentinel.io',
    apiKey: 'fs_live_99d10e88c0314b9b9a674391cf8e990b',
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (isViewOnly) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopyKey = () => {
    if (isViewOnly) return;
    navigator.clipboard?.writeText(settings.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1612] tracking-tight flex items-center gap-2.5">
          <span>System Settings & Engine Rules</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-300">
            Admin Exclusive
          </span>
        </h1>
        <p className="text-sm text-[#5C5648] mt-1 font-normal">
          Configure risk threshold algorithms, notification webhooks, API tokens, and automated enforcement parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ML Sensitivity and Auto-Enforcement Card */}
        <div className="bg-white border border-[#E5DCBE] rounded-2xl p-6 shadow-xl shadow-amber-500/5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBE3D0]">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1612] tracking-tight">
                Machine Learning Sensitivity & Automated Risk Thresholds
              </h2>
              <p className="text-xs text-[#8C8270]">
                Tune how the dual LightGBM + KR&R engine classifies and routes live transactions.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#FCFAF5] border border-[#EBE3D0] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1612]">
                  Automatic Block Threshold (Risk Score &ge;)
                </label>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono text-xs font-bold">
                  {settings.autoBlockThreshold} / 100
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.autoBlockThreshold}
                onChange={(e) => setSettings({ ...settings, autoBlockThreshold: Number(e.target.value) })}
                disabled={isViewOnly}
                className="w-full accent-amber-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-[#8C8270]">
                Transactions scoring above this score trigger instant gateway denial and syndicate quarantine.
              </p>
            </div>

            <div className="bg-[#FCFAF5] border border-[#EBE3D0] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A1612]">
                  Analyst Review Queue Threshold (Risk Score &ge;)
                </label>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-mono text-xs font-bold">
                  {settings.analystReviewThreshold} / 100
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={settings.analystReviewThreshold}
                onChange={(e) => setSettings({ ...settings, analystReviewThreshold: Number(e.target.value) })}
                disabled={isViewOnly}
                className="w-full accent-amber-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-[#8C8270]">
                Transactions scoring between this threshold and the block threshold are automatically routed to the Fraud Analyst review queue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1612] mb-1.5">
                Inference Sensitivity Profile
              </label>
              <select
                value={settings.sensitivityProfile}
                onChange={(e) => setSettings({ ...settings, sensitivityProfile: e.target.value })}
                disabled={isViewOnly}
                className="w-full sm:w-80 bg-[#FAF8F4] border border-[#E5DCBE] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#1A1612] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="aggressive">Aggressive (Zero tolerance, higher manual review queue)</option>
                <option value="balanced">Balanced (Optimal for high volume retail & payment gateways)</option>
                <option value="lenient">Lenient (Prioritize frictionless checkout, low false positives)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Webhook & Notification Card */}
        <div className="bg-white border border-[#E5DCBE] rounded-2xl p-6 shadow-xl shadow-amber-500/5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBE3D0]">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1612] tracking-tight">
                Alert Webhooks & Dispatch Endpoints
              </h2>
              <p className="text-xs text-[#8C8270]">
                Real-time security event relays for internal SIEM, Slack, or webhook subscribers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1612] mb-1.5">
                Real-time Webhook URL
              </label>
              <input
                type="url"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                disabled={isViewOnly}
                placeholder="https://..."
                className="w-full bg-[#FAF8F4] border border-[#E5DCBE] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1612] font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1612] mb-1.5">
                Emergency Escalation Email
              </label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                disabled={isViewOnly}
                className="w-full bg-[#FAF8F4] border border-[#E5DCBE] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1612] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* API Keys Card */}
        <div className="bg-white border border-[#E5DCBE] rounded-2xl p-6 shadow-xl shadow-amber-500/5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBE3D0]">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1612] tracking-tight">
                Production API Secret Key
              </h2>
              <p className="text-xs text-[#8C8270]">
                Used to authenticate server-to-server transaction inference payloads via REST API.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1612] mb-1.5">
              Live Secret Bearer Token
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={settings.apiKey}
                className="w-full bg-[#FAF8F4] border border-[#E5DCBE] rounded-xl px-3.5 py-2.5 text-xs text-[#5C5648] font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                disabled={isViewOnly}
                onClick={handleCopyKey}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F4] border border-[#E5DCBE] text-xs font-bold text-[#1A1612] transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm hover:border-amber-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                {copiedKey ? 'Copied' : 'Copy Key'}
              </button>
            </div>
            <p className="text-[11px] text-[#8C8270] mt-1.5">
              Keep this token secret. Restrict access strictly to authorized backend services.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isViewOnly}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
          {saved && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Settings saved & dispatched to cluster!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

