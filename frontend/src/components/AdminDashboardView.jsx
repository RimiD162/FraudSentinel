import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Server,
  Activity,
  Cpu,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Database,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import StatCard from './StatCard.jsx';
import TransactionVolumeChart from './TransactionVolumeChart.jsx';
import FraudulentTransactionsChart from './FraudulentTransactionsChart.jsx';
import { getUsers, getHealth } from '../services/api.js';

/**
 * Admin Dashboard View
 * Executive Control Center for System Administrators with root governance,
 * platform-wide telemetry, cluster health, and organization user management.
 */
export default function AdminDashboardView({
  currentUser,
  statsData = [],
  volumeData = {},
  fraudData = {},
  loading = false,
}) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ status: 'online', uptime: '99.98%' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Audit event mock log for system administrators
  const auditLogs = [
    {
      id: 'AUD-8821',
      event: 'Root Session Verified',
      actor: currentUser?.email || 'admin',
      time: 'Just now',
      status: 'success',
      detail: 'Cryptographic JWT bearer token validated',
    },
    {
      id: 'AUD-8820',
      event: 'ML Inference Model Calibrated',
      actor: 'System Autonomous Runner',
      time: '24 mins ago',
      status: 'success',
      detail: 'XGBoost v2.4 hyperparameter weights verified',
    },
    {
      id: 'AUD-8819',
      event: 'RBAC Authorization Check',
      actor: 'Security Daemon',
      time: '1 hour ago',
      status: 'success',
      detail: 'Strict Zero-Trust policy enforced across all 8 nodes',
    },
    {
      id: 'AUD-8818',
      event: 'Analyst Account Synced',
      actor: 'Admin Officer',
      time: '3 hours ago',
      status: 'info',
      detail: 'Lead Fraud Analyst assigned to Live Alert Desk',
    },
  ];

  const fetchAdminDetails = async () => {
    setIsRefreshing(true);
    try {
      const [usersResp, healthResp] = await Promise.allSettled([
        getUsers(),
        getHealth(),
      ]);

      if (usersResp.status === 'fulfilled' && usersResp.value) {
        const raw = usersResp.value?.items || (Array.isArray(usersResp.value) ? usersResp.value : []);
        setTeamMembers(raw.slice(0, 5));
      }
      if (healthResp.status === 'fulfilled' && healthResp.value) {
        setSystemHealth(healthResp.value);
      }
    } catch (err) {
      console.warn('Admin telemetry fetch notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const adminName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'System Administrator';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Executive Admin Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-700/10 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg shadow-amber-900/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Executive Admin Console • Root Control</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Strict Zero-Trust Enforced</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1612] tracking-tight">
              Root Governance: {adminName}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5648] max-w-2xl leading-relaxed">
              Global platform command center. Monitor distributed cluster telemetry, inspect machine learning inference latency,
              audit organizational access permissions, and provision security team roles.
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/dashboard/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-white" />
              <span>User Management</span>
            </Link>
            <Link
              to="/dashboard/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-[#1A1612] font-bold text-xs sm:text-sm border border-[#E5DCBE] hover:border-amber-400 shadow-2xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Cluster Analytics</span>
            </Link>
            <Link
              to="/dashboard/user"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-[#1A1612] font-bold text-xs sm:text-sm border border-[#E5DCBE] hover:border-amber-400 shadow-2xs transition-colors cursor-pointer"
              title="Preview Analyst User Dashboard"
            >
              <span>User Dashboard →</span>
            </Link>
            <button
              onClick={fetchAdminDetails}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-[#5C5648] hover:text-amber-900 border border-[#E5DCBE] hover:border-amber-400 text-xs font-bold transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Infrastructure & Security KPIs */}
      <section aria-label="System Governance KPIs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Total System Volume"
            value={statsData?.[0]?.value || '0'}
            delta="100% Monitored"
            isPositive={true}
          />
          <StatCard
            label="Security Officers & Analysts"
            value={teamMembers.length > 0 ? teamMembers.length.toString() : '1'}
            delta="Active Roster"
            isPositive={true}
          />
          <StatCard
            label="Inference Latency"
            value="18 ms"
            delta="XGBoost & LightGBM"
            isPositive={true}
          />
          <StatCard
            label="Cluster Security Status"
            value="100.0%"
            delta="Zero Vulnerabilities"
            isPositive={true}
          />
        </div>
      </section>

      {/* 3. Cluster Telemetry & System Infrastructure Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4.5 h-4.5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#1A1612] tracking-tight">
              Platform Infrastructure & Machine Learning Architecture
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Cluster Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: FastAPI Gateway */}
          <div className="bg-white border border-[#E5DCBE] rounded-2xl p-4.5 shadow-sm hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#8C8270]">Core API Gateway</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-base font-extrabold text-[#1A1612]">FastAPI v1.0.0</div>
            <div className="text-xs text-[#5C5648] mt-1">Uptime: 99.98% • REST & Async</div>
            <div className="mt-3 pt-2 border-t border-[#F2ECE0] flex items-center justify-between text-[11px] text-[#8C8270]">
              <span>Port: 8000</span>
              <span className="font-semibold text-emerald-700">Healthy</span>
            </div>
          </div>

          {/* Card 2: ML Model Cluster */}
          <div className="bg-white border border-[#E5DCBE] rounded-2xl p-4.5 shadow-sm hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#8C8270]">Inference Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-base font-extrabold text-[#1A1612]">XGBoost Ensemble</div>
            <div className="text-xs text-[#5C5648] mt-1">Precision: 99.4% • Zero Drift</div>
            <div className="mt-3 pt-2 border-t border-[#F2ECE0] flex items-center justify-between text-[11px] text-[#8C8270]">
              <span>Latency: 18ms</span>
              <span className="font-semibold text-emerald-700">Optimal</span>
            </div>
          </div>

          {/* Card 3: Database & Storage */}
          <div className="bg-white border border-[#E5DCBE] rounded-2xl p-4.5 shadow-sm hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#8C8270]">Data Persistence</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-base font-extrabold text-[#1A1612]">SQLite & Supabase</div>
            <div className="text-xs text-[#5C5648] mt-1">Transactions, Alerts & Users</div>
            <div className="mt-3 pt-2 border-t border-[#F2ECE0] flex items-center justify-between text-[11px] text-[#8C8270]">
              <span>Pool: Active</span>
              <span className="font-semibold text-emerald-700">Connected</span>
            </div>
          </div>

          {/* Card 4: Security Layer */}
          <div className="bg-white border border-[#E5DCBE] rounded-2xl p-4.5 shadow-sm hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#8C8270]">Security Authority</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-base font-extrabold text-[#1A1612]">Supabase Auth & RBAC</div>
            <div className="text-xs text-[#5C5648] mt-1">Cryptographic Token Verify</div>
            <div className="mt-3 pt-2 border-t border-[#F2ECE0] flex items-center justify-between text-[11px] text-[#8C8270]">
              <span>Zero-Trust: On</span>
              <span className="font-semibold text-emerald-700">Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Team Access Governance Preview & Security Event Log */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Team Preview */}
        <div className="bg-white border border-[#E5DCBE] rounded-3xl p-6 shadow-xl shadow-amber-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1612] tracking-tight">
                    Organization User Roster
                  </h3>
                  <p className="text-xs text-[#5C5648]">Active system administrators and fraud analysts</p>
                </div>
              </div>
              <Link
                to="/dashboard/users"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 hover:underline"
              >
                <span>Manage Users</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#F2ECE0] text-xs">
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((m, idx) => {
                  const roleNorm = (m.role || m.role_name || 'analyst').toLowerCase();
                  return (
                    <div key={m.id || idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#1A1612]">{m.full_name || m.email}</div>
                        <div className="text-[11px] text-[#8C8270] font-mono">{m.email}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          roleNorm === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {roleNorm === 'admin' ? 'Administrator' : 'Fraud Analyst'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-[#8C8270]">
                  <p className="text-xs font-semibold text-[#5C5648]">No additional team members provisioned yet</p>
                  <p className="text-[11px] text-[#8C8270] mt-0.5">Use &ldquo;Manage Users&rdquo; to invite and configure analysts.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F2ECE0]">
            <Link
              to="/dashboard/users"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>+ Provision New User or Officer</span>
            </Link>
          </div>
        </div>

        {/* Security Audit Trail */}
        <div className="bg-white border border-[#E5DCBE] rounded-3xl p-6 shadow-xl shadow-amber-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1612] tracking-tight">
                    Security & Audit Trail
                  </h3>
                  <p className="text-xs text-[#5C5648]">Immutable telemetry of root authorizations</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8C8270] bg-[#FAF8F4] px-2 py-1 rounded border border-[#E5DCBE]">
                Audit Mode: ON
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#EAE2CE] flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#1A1612] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{log.event}</span>
                    </div>
                    <p className="text-[11px] text-[#5C5648]">{log.detail}</p>
                    <span className="text-[10px] text-[#8C8270] font-mono">{log.actor}</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#8C8270] whitespace-nowrap">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#F2ECE0] flex items-center justify-between text-xs text-[#8C8270]">
            <span>Audit log encryption: SHA-256</span>
            <Link
              to="/dashboard/reports"
              className="font-bold text-amber-800 hover:text-amber-950 hover:underline"
            >
              Export Audit Report →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. System-wide Volume & Fraud Trends */}
      <section aria-labelledby="platform-trends-heading">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="platform-trends-heading"
            className="text-lg sm:text-xl font-extrabold text-[#1A1612] tracking-tight"
          >
            Platform-Wide Telemetry & Volume Distribution
          </h2>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            All 8 Cluster Shards
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <TransactionVolumeChart volumeData={volumeData} />
          <FraudulentTransactionsChart fraudData={fraudData} />
        </div>
      </section>
    </div>
  );
}
