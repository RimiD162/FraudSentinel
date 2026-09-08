import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { Settings as SettingsIcon, Save, Key, Sliders, Webhook, ShieldCheck, Check } from 'lucide-react';

/**
 * Settings Page Component
 * System configuration, ML sensitivity thresholds, webhook integrations, and API keys.
 * Permissions: Admin (Full), Fraud Analyst (Hidden), Viewer (Hidden)
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>System Settings</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Admin Only
          </span>
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-normal">
          Configure risk threshold algorithms, notification webhooks, API keys, and compliance rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ML Sensitivity and Auto-Enforcement Card */}
        <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222734]">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Machine Learning Sensitivity & Thresholds
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Automatic Block Threshold (Risk Score &ge;)
                </label>
                <span className="font-mono text-xs font-bold text-rose-400">
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
                className="w-full accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Transactions scoring above this limit are immediately rejected without human intervention.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-300">
                  Analyst Review Queue Threshold (Risk Score &ge;)
                </label>
                <span className="font-mono text-xs font-bold text-amber-400">
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
                className="w-full accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Transactions between this threshold and the block threshold are routed to Fraud Analysts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Inference Sensitivity Profile
              </label>
              <select
                value={settings.sensitivityProfile}
                onChange={(e) => setSettings({ ...settings, sensitivityProfile: e.target.value })}
                disabled={isViewOnly}
                className="w-full sm:w-72 bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="aggressive">Aggressive (Zero tolerance, higher review rate)</option>
                <option value="balanced">Balanced (Optimal for high volume retail)</option>
                <option value="lenient">Lenient (Prioritize frictionless checkout)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Webhook & Notification Card */}
        <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222734]">
            <Webhook className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Alert Webhooks & Dispatch Endpoints
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Real-time Webhook URL
              </label>
              <input
                type="url"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                disabled={isViewOnly}
                placeholder="https://..."
                className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Emergency Escalation Email
              </label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                disabled={isViewOnly}
                className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* API Keys Card */}
        <div className="bg-[#161A22] border border-[#222734] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222734]">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Production API Secret Key
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Live Secret Token
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={settings.apiKey}
                className="w-full bg-[#0B0E14] border border-[#222734] rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none"
              />
              <button
                type="button"
                disabled={isViewOnly}
                onClick={handleCopyKey}
                className="px-3.5 py-2 rounded-lg bg-[#0B0E14] hover:bg-[#1C212B] border border-[#222734] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Used to authenticate server-to-server transaction inference payloads.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isViewOnly}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
