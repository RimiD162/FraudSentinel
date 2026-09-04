import React from 'react';
import StatCard from '../components/StatCard.jsx';
import TransactionVolumeChart from '../components/TransactionVolumeChart.jsx';
import FraudulentTransactionsChart from '../components/FraudulentTransactionsChart.jsx';
import FraudAlertsTable from '../components/FraudAlertsTable.jsx';
import {
  stats,
  transactionVolume,
  fraudulentTransactions,
  fraudAlerts,
} from '../data/mockDashboard.js';

/**
 * Dashboard Page Component
 * Main analytical dashboard view displaying real-time metrics, volume trends,
 * and ML fraud alert records.
 */
export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-normal">
          Overview of real-time transaction monitoring and fraud detection
        </p>
      </div>

      {/* 1. Stat Cards Row (3 cards, equal width, side by side) */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((item) => (
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

      {/* 2. Real-time Transaction Monitoring Section */}
      <section aria-labelledby="realtime-monitoring-heading">
        <h2
          id="realtime-monitoring-heading"
          className="text-lg font-bold text-white mb-4 tracking-tight"
        >
          Real-time Transaction Monitoring
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TransactionVolumeChart volumeData={transactionVolume} />
          <FraudulentTransactionsChart fraudData={fraudulentTransactions} />
        </div>
      </section>

      {/* 3. Machine Learning Fraud Alerts Section */}
      <section aria-labelledby="ml-fraud-alerts-heading">
        <h2
          id="ml-fraud-alerts-heading"
          className="sr-only"
        >
          Machine Learning Fraud Alerts
        </h2>
        <FraudAlertsTable alerts={fraudAlerts} />
      </section>
    </div>
  );
}
