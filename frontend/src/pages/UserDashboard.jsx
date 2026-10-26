import React from 'react';
import Dashboard from './Dashboard.jsx';

/**
 * Enterprise Fraud Analyst Operational Dashboard Page
 * Dedicated Route: `/user/dashboard`, `/dashboard/user`
 * 
 * Provides:
 * - Real-time fraud detection alerts queue
 * - Daily transaction scoring volume KPIs
 * - Instant access to single transaction analyzer & audit ledger
 */
export default function UserDashboard() {
  return <Dashboard forceView="user" />;
}
