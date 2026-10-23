import React from 'react';
import StatCard from './StatCard.jsx';
import FraudAlertsTable from './FraudAlertsTable.jsx';

/**
 * User / Analyst Dashboard View
 * Clean operational overview displaying key metric cards and live ML fraud alert records.
 */
export default function UserDashboardView({
  currentUser,
  statsData,
  alertsData,
  loading,
}) {
  const displayName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Fraud Analyst';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Analyst Header & Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-600/5 border border-amber-300/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1612] tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C5648] max-w-2xl leading-relaxed">
              Your real-time fraud investigation workstation is ready. Review high-priority alert queues
              and triage suspicious payment events.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Key Operational KPI Cards */}
      <section aria-label="Analyst Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            label="Urgent Alerts Pending"
            value={alertsData?.length ? alertsData.length.toString() : '0'}
            delta={alertsData?.length > 0 ? 'Requires Action' : null}
            isPositive={false}
          />
          {statsData
            .filter((item) => item.id !== 'accuracy' && item.label !== 'Detection Accuracy')
            .map((item) => (
              <StatCard
                key={item.id}
                label={item.label}
                value={item.value}
                delta={item.delta}
                isPositive={item.isPositive}
              />
            ))}
        </div>
      </section>

      {/* 3. Live Fraud Alerts Queue Table */}
      <section aria-labelledby="ml-fraud-alerts-heading">
        <FraudAlertsTable alerts={alertsData} />
      </section>
    </div>
  );
}
