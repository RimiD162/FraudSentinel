import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext.jsx';
import RoleGuard from './components/RoleGuard.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AnalyzeTransaction from './pages/AnalyzeTransaction.jsx';
import Transactions from './pages/Transactions.jsx';
import FraudAlerts from './pages/FraudAlerts.jsx';
import Analytics from './pages/Analytics.jsx';
import Reports from './pages/Reports.jsx';
import UserManagement from './pages/UserManagement.jsx';
import Settings from './pages/Settings.jsx';

/**
 * Main Application Root
 * Sets up client-side routing, public landing/auth pages, and role-guarded dashboard paths.
 */
export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Dedicated User Authentication Page */}
          <Route path="/login/user" element={<Login />} />
          <Route path="/login/User" element={<Login />} />
          <Route path="/user/login" element={<Login />} />
          <Route path="/user" element={<Navigate to="/login/user" replace />} />
          <Route path="/login" element={<Navigate to="/login/user" replace />} />
          <Route path="/auth" element={<Navigate to="/login/user" replace />} />

          {/* Backward compatibility redirects for /login/analyst */}
          <Route path="/login/analyst" element={<Navigate to="/login/user" replace />} />
          <Route path="/login/Analyst" element={<Navigate to="/login/user" replace />} />
          <Route path="/analyst/login" element={<Navigate to="/login/user" replace />} />
          <Route path="/analyst" element={<Navigate to="/login/user" replace />} />

          {/* Dedicated System Administrator Only Authentication Portal */}
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/Admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/login/admin" replace />} />


          {/* Protected Routes inside DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <RoleGuard section="dashboard">
                  <Dashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <RoleGuard section="dashboard">
                  <Dashboard forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <RoleGuard section="dashboard">
                  <Dashboard forceView="admin" />
                </RoleGuard>
              }
            />

            {/* Analyze Transaction Routes */}
            <Route
              path="/analyze"
              element={
                <RoleGuard section="analyzeTransaction">
                  <AnalyzeTransaction />
                </RoleGuard>
              }
            />
            <Route
              path="/analyze/user"
              element={
                <RoleGuard section="analyzeTransaction">
                  <AnalyzeTransaction forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/analyze/admin"
              element={
                <RoleGuard section="analyzeTransaction">
                  <AnalyzeTransaction forceView="admin" />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/analyze" element={<Navigate to="/analyze" replace />} />
            <Route path="/dashboard/analyze/user" element={<Navigate to="/analyze/user" replace />} />
            <Route path="/dashboard/analyze/admin" element={<Navigate to="/analyze/admin" replace />} />

            {/* Transactions Routes */}
            <Route
              path="/transactions"
              element={
                <RoleGuard section="transactions">
                  <Transactions />
                </RoleGuard>
              }
            />
            <Route
              path="/transactions/user"
              element={
                <RoleGuard section="transactions">
                  <Transactions forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/transactions/admin"
              element={
                <RoleGuard section="transactions">
                  <Transactions forceView="admin" />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/transactions" element={<Navigate to="/transactions" replace />} />
            <Route path="/dashboard/transactions/user" element={<Navigate to="/transactions/user" replace />} />
            <Route path="/dashboard/transactions/admin" element={<Navigate to="/transactions/admin" replace />} />

            {/* Fraud Alerts Routes */}
            <Route
              path="/alerts"
              element={
                <RoleGuard section="fraudAlerts">
                  <FraudAlerts />
                </RoleGuard>
              }
            />
            <Route
              path="/alerts/user"
              element={
                <RoleGuard section="fraudAlerts">
                  <FraudAlerts forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/alerts/admin"
              element={
                <RoleGuard section="fraudAlerts">
                  <FraudAlerts forceView="admin" />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/alerts" element={<Navigate to="/alerts" replace />} />
            <Route path="/dashboard/alerts/user" element={<Navigate to="/alerts/user" replace />} />
            <Route path="/dashboard/alerts/admin" element={<Navigate to="/alerts/admin" replace />} />

            {/* Analytics Routes */}
            <Route
              path="/analytics"
              element={
                <RoleGuard section="analytics">
                  <Analytics />
                </RoleGuard>
              }
            />
            <Route
              path="/analytics/user"
              element={
                <RoleGuard section="analytics">
                  <Analytics forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/analytics/admin"
              element={
                <RoleGuard section="analytics">
                  <Analytics forceView="admin" />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/analytics" element={<Navigate to="/analytics" replace />} />
            <Route path="/dashboard/analytics/user" element={<Navigate to="/analytics/user" replace />} />
            <Route path="/dashboard/analytics/admin" element={<Navigate to="/analytics/admin" replace />} />

            {/* Reports Routes */}
            <Route
              path="/reports"
              element={
                <RoleGuard section="reports">
                  <Reports />
                </RoleGuard>
              }
            />
            <Route
              path="/reports/user"
              element={
                <RoleGuard section="reports">
                  <Reports forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/reports/admin"
              element={
                <RoleGuard section="reports">
                  <Reports forceView="admin" />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/reports" element={<Navigate to="/reports" replace />} />
            <Route path="/dashboard/reports/user" element={<Navigate to="/reports/user" replace />} />
            <Route path="/dashboard/reports/admin" element={<Navigate to="/reports/admin" replace />} />

            {/* User Management */}
            <Route
              path="/users"
              element={
                <RoleGuard section="userManagement">
                  <UserManagement />
                </RoleGuard>
              }
            />
            <Route
              path="/users/admin"
              element={
                <RoleGuard section="userManagement">
                  <UserManagement />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/users" element={<Navigate to="/users/admin" replace />} />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <RoleGuard section="settings">
                  <Settings />
                </RoleGuard>
              }
            />
            <Route
              path="/settings/user"
              element={
                <RoleGuard section="settings">
                  <Settings />
                </RoleGuard>
              }
            />
            <Route
              path="/settings/admin"
              element={
                <RoleGuard section="settings">
                  <Settings />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
