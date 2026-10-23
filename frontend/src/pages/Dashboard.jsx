import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext.jsx';
import UserDashboardView from '../components/UserDashboardView.jsx';
import AdminDashboardView from '../components/AdminDashboardView.jsx';
import {
  stats as defaultStats,
  transactionVolume as defaultVolume,
  fraudulentTransactions as defaultFraud,
  fraudAlerts as defaultAlerts,
} from '../data/mockDashboard.js';
import { getAnalyticsSummary, getAnalyticsTrends, getAlerts } from '../services/api.js';

/**
 * Main Dashboard Entry Point Component
 * Dynamically routes to / handles:
 * - `/dashboard/admin`: Executive Admin Control Center
 * - `/dashboard/user`: Fraud Analyst Operational Terminal
 * - `/dashboard`: Automatically redirects to the user's role-assigned dashboard.
 */
export default function Dashboard({ forceView }) {
  const { role, currentUser } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(defaultStats);
  const [volumeData, setVolumeData] = useState(defaultVolume);
  const [fraudData, setFraudData] = useState(defaultFraud);
  const [alertsData, setAlertsData] = useState(defaultAlerts);
  const [loading, setLoading] = useState(true);

  // Check if current user has administrator role
  const userRole = (role || currentUser?.role || 'analyst').toLowerCase();
  const userIsAdmin = userRole === 'admin';

  // Determine active view: explicit prop, URL route, or role fallback
  let activeView = forceView;
  if (!activeView) {
    if (location.pathname.endsWith('/admin')) {
      activeView = 'admin';
    } else if (location.pathname.endsWith('/user')) {
      activeView = 'user';
    } else {
      activeView = userIsAdmin ? 'admin' : 'user';
    }
  }

  // Automatic redirect if visiting root /dashboard
  useEffect(() => {
    const isRootDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    if (isRootDashboard) {
      navigate(userIsAdmin ? '/dashboard/admin' : '/dashboard/user', { replace: true });
    }
  }, [location.pathname, userIsAdmin, navigate]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        const [summary, trends, alertsResp] = await Promise.allSettled([
          getAnalyticsSummary(),
          getAnalyticsTrends(),
          getAlerts({ page: 1, page_size: 5 }),
        ]);

        if (!isMounted) return;

        // 1. Process Summary for Stat Cards
        if (summary.status === 'fulfilled' && summary.value) {
          const s = summary.value;
          const totalAlerts =
            (s.alerts_by_status?.flagged || 0) +
            (s.alerts_by_status?.under_review || 0) ||
            s.total_fraud_transactions ||
            0;
          const txCount = s.total_transactions || 0;
          const accuracyVal = txCount > 0
            ? (100 - (s.fraud_rate_percentage || 0)).toFixed(1)
            : '100.0';

          setStatsData([
            {
              id: 'transactions-processed',
              label: 'Transactions Processed',
              value: txCount.toLocaleString(),
              delta: null,
              isPositive: true,
            },
            {
              id: 'fraud-alerts-triggered',
              label: 'Fraud Alerts Triggered',
              value: totalAlerts.toLocaleString(),
              delta: null,
              isPositive: false,
            },
            {
              id: 'accuracy',
              label: 'Detection Accuracy',
              value: `${accuracyVal}%`,
              delta: null,
              isPositive: true,
            },
          ]);
        }

        // 2. Process Trends for Charts
        if (trends.status === 'fulfilled' && trends.value?.trends?.length) {
          const rawTrends = trends.value.trends;
          const recentTrends = rawTrends.slice(-7);

          const volChartData = recentTrends.map((t) => ({
            time: t.date ? t.date.slice(5) : 'Day',
            value: t.total_transactions,
          }));

          const fraudChartData = recentTrends.map((t) => ({
            time: t.date ? t.date.slice(5) : 'Day',
            count: t.fraud_count,
          }));

          const sumVol = recentTrends.reduce((acc, curr) => acc + curr.total_transactions, 0);
          const sumFraud = recentTrends.reduce((acc, curr) => acc + curr.fraud_count, 0);

          setVolumeData({
            headline: 'Transaction Volume',
            total: sumVol.toLocaleString(),
            timeframe: `Past ${recentTrends.length} Days`,
            delta: null,
            isPositive: true,
            data: sumVol > 0 ? volChartData : [],
          });

          setFraudData({
            headline: 'Fraudulent Transactions',
            total: sumFraud.toLocaleString(),
            timeframe: `Past ${recentTrends.length} Days`,
            delta: null,
            isPositive: false,
            data: sumFraud > 0 ? fraudChartData : [],
          });
        } else {
          setVolumeData({
            headline: 'Transaction Volume',
            total: '0',
            timeframe: 'Past 7 Days',
            delta: null,
            isPositive: true,
            data: [],
          });
          setFraudData({
            headline: 'Fraudulent Transactions',
            total: '0',
            timeframe: 'Past 7 Days',
            delta: null,
            isPositive: false,
            data: [],
          });
        }

        // 3. Process Live Alerts Table
        if (alertsResp.status === 'fulfilled' && alertsResp.value?.items?.length) {
          const formattedAlerts = alertsResp.value.items.map((a) => {
            const amt = a.transaction?.amount
              ? `$${a.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : '$0.00';
            const user = a.transaction?.customer_id
              ? `Customer ${a.transaction.customer_id}`
              : 'Unknown User';
            const timeStr = a.created_at
              ? new Date(a.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent';
            const statusStr = a.status
              ? a.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : 'Flagged';

            return {
              id: a.transaction_id || a.id.slice(0, 8),
              amount: amt,
              user: user,
              timestamp: timeStr,
              status: statusStr,
            };
          });
          setAlertsData(formattedAlerts);
        } else {
          setAlertsData([]);
        }
      } catch (err) {
        console.warn('Dashboard telemetry notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Strict RBAC: Non-admin users cannot access the /dashboard/admin route
  if (activeView === 'admin' && !userIsAdmin) {
    return <Navigate to="/dashboard/user" replace />;
  }

  if (activeView === 'admin') {
    return (
      <AdminDashboardView
        currentUser={currentUser}
        statsData={statsData}
        volumeData={volumeData}
        fraudData={fraudData}
        alertsData={alertsData}
        loading={loading}
      />
    );
  }

  return (
    <UserDashboardView
      currentUser={currentUser}
      statsData={statsData}
      volumeData={volumeData}
      fraudData={fraudData}
      alertsData={alertsData}
      loading={loading}
    />
  );
}
