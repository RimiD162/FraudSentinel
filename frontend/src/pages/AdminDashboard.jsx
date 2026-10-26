import React from 'react';
import Dashboard from './Dashboard.jsx';

/**
 * System Administrator Executive Dashboard Page
 * Dedicated Route: `/admin/dashboard`, `/dashboard/admin`
 * 
 * Provides:
 * - Enterprise root governance and real-time security posture
 * - ML scoring engine status and throughput metrics
 * - Organization user management shortcuts
 * - Live audit logs & zero-trust platform telemetry
 */
export default function AdminDashboard() {
  return <Dashboard forceView="admin" />;
}
