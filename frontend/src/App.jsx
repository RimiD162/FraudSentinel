import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext.jsx';
import RoleGuard from './components/RoleGuard.jsx';
import AdminGuard from './components/AdminGuard.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import UserSignup from './pages/UserSignup.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminSignup from './pages/AdminSignup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AnalyzeTransaction from './pages/AnalyzeTransaction.jsx';
import Transactions from './pages/Transactions.jsx';
import FraudAlerts from './pages/FraudAlerts.jsx';
import Analytics from './pages/Analytics.jsx';
import Reports from './pages/Reports.jsx';
import UserManagement from './pages/UserManagement.jsx';
import Settings from './pages/Settings.jsx';

/**
 * Main Application Root
 * Sets up client-side routing, public landing, dedicated Admin/User auth portals,
 * and role-guarded operational & executive paths.
 * 
 * STRICT ACCESS POLICY:
 * Admin routes ONLY show after logging in as an administrator. Otherwise, they do NOT show.
 */
export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================================
              1. PUBLIC MARKETING & LANDING ROUTE
             ========================================= */}
          <Route path="/" element={<Landing />} />

          {/* =========================================
              2. USER / ANALYST AUTHENTICATION ROUTES
             ========================================= */}
          {/* User Sign In */}
          <Route path="/login/user" element={<Login />} />
          <Route path="/login/User" element={<Login />} />
          <Route path="/user/login" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/user" element={<Navigate to="/login/user" replace />} />

          {/* User Sign Up */}
          <Route path="/signup/user" element={<UserSignup />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/register" element={<UserSignup />} />

          {/* Backward compatibility redirects */}
          <Route path="/login/analyst" element={<Navigate to="/login/user" replace />} />
          <Route path="/login/Analyst" element={<Navigate to="/login/user" replace />} />
          <Route path="/analyst/login" element={<Navigate to="/login/user" replace />} />
          <Route path="/analyst" element={<Navigate to="/login/user" replace />} />

          {/* =========================================
              3. DEDICATED ADMIN AUTHENTICATION ROUTES
             ========================================= */}
          {/* Admin Sign In */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/Admin" element={<AdminLogin />} />
          <Route path="/admin/auth" element={<AdminLogin />} />

          {/* Admin Sign Up / Account Provisioning */}
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/signup/admin" element={<AdminSignup />} />
          <Route path="/signup/Admin" element={<AdminSignup />} />
          <Route path="/admin/register" element={<AdminSignup />} />
          <Route path="/register/admin" element={<AdminSignup />} />

          {/* =========================================
              4. PROTECTED APPLICATION CONSOLE (RBAC)
             ========================================= */}
          <Route element={<DashboardLayout />}>
            
            {/* --- DASHBOARD ENTRY POINTS --- */}
            {/* Root Admin Dashboard: ONLY accessible after login as admin */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />

            {/* Root User Dashboard */}
            <Route
              path="/user/dashboard"
              element={
                <RoleGuard section="dashboard">
                  <UserDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <RoleGuard section="dashboard">
                  <UserDashboard />
                </RoleGuard>
              }
            />

            {/* Generic /dashboard auto-redirects based on active session role */}
            <Route
              path="/dashboard"
              element={
                <RoleGuard section="dashboard">
                  <Dashboard />
                </RoleGuard>
              }
            />

            {/* --- ANALYZE TRANSACTION ROUTES --- */}
            <Route
              path="/admin/analyze"
              element={
                <AdminGuard>
                  <AnalyzeTransaction forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/analyze/admin"
              element={
                <AdminGuard>
                  <AnalyzeTransaction forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/user/analyze"
              element={
                <RoleGuard section="analyzeTransaction">
                  <AnalyzeTransaction forceView="user" />
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
              path="/analyze"
              element={
                <RoleGuard section="analyzeTransaction">
                  <AnalyzeTransaction />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/analyze" element={<Navigate to="/analyze" replace />} />
            <Route path="/dashboard/analyze/user" element={<Navigate to="/analyze/user" replace />} />
            <Route path="/dashboard/analyze/admin" element={<Navigate to="/analyze/admin" replace />} />

            {/* --- TRANSACTIONS ROUTES --- */}
            <Route
              path="/admin/transactions"
              element={
                <AdminGuard>
                  <Transactions forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/transactions/admin"
              element={
                <AdminGuard>
                  <Transactions forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/user/transactions"
              element={
                <RoleGuard section="transactions">
                  <Transactions forceView="user" />
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
              path="/transactions"
              element={
                <RoleGuard section="transactions">
                  <Transactions />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/transactions" element={<Navigate to="/transactions" replace />} />
            <Route path="/dashboard/transactions/user" element={<Navigate to="/transactions/user" replace />} />
            <Route path="/dashboard/transactions/admin" element={<Navigate to="/transactions/admin" replace />} />

            {/* --- FRAUD ALERTS ROUTES --- */}
            <Route
              path="/admin/alerts"
              element={
                <AdminGuard>
                  <FraudAlerts forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/alerts/admin"
              element={
                <AdminGuard>
                  <FraudAlerts forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/user/alerts"
              element={
                <RoleGuard section="fraudAlerts">
                  <FraudAlerts forceView="user" />
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
              path="/alerts"
              element={
                <RoleGuard section="fraudAlerts">
                  <FraudAlerts />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/alerts" element={<Navigate to="/alerts" replace />} />
            <Route path="/dashboard/alerts/user" element={<Navigate to="/alerts/user" replace />} />
            <Route path="/dashboard/alerts/admin" element={<Navigate to="/alerts/admin" replace />} />

            {/* --- EXECUTIVE ANALYTICS & TELEMETRY (ADMIN RESTRICTED: ONLY SHOWN AFTER ADMIN LOGIN) --- */}
            <Route
              path="/admin/analytics"
              element={
                <AdminGuard>
                  <Analytics forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/analytics/admin"
              element={
                <AdminGuard>
                  <Analytics forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/analytics"
              element={
                <AdminGuard>
                  <Analytics forceView="admin" />
                </AdminGuard>
              }
            />
            <Route path="/analytics/user" element={<Navigate to="/dashboard/user" replace />} />
            <Route path="/dashboard/analytics" element={<Navigate to="/analytics" replace />} />
            <Route path="/dashboard/analytics/user" element={<Navigate to="/dashboard/user" replace />} />
            <Route path="/dashboard/analytics/admin" element={<Navigate to="/admin/analytics" replace />} />

            {/* --- REGULATORY & SAR REPORTS (ADMIN RESTRICTED: ONLY SHOWN AFTER ADMIN LOGIN) --- */}
            <Route
              path="/admin/reports"
              element={
                <AdminGuard>
                  <Reports forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/reports/admin"
              element={
                <AdminGuard>
                  <Reports forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <AdminGuard>
                  <Reports forceView="admin" />
                </AdminGuard>
              }
            />
            <Route path="/reports/user" element={<Navigate to="/dashboard/user" replace />} />
            <Route path="/dashboard/reports" element={<Navigate to="/reports" replace />} />
            <Route path="/dashboard/reports/user" element={<Navigate to="/dashboard/user" replace />} />
            <Route path="/dashboard/reports/admin" element={<Navigate to="/admin/reports" replace />} />

            {/* --- USER MANAGEMENT & ACCESS CONTROL (ADMIN RESTRICTED: ONLY SHOWN AFTER ADMIN LOGIN) --- */}
            <Route
              path="/admin/users"
              element={
                <AdminGuard>
                  <UserManagement />
                </AdminGuard>
              }
            />
            <Route
              path="/users/admin"
              element={
                <AdminGuard>
                  <UserManagement />
                </AdminGuard>
              }
            />
            <Route
              path="/users"
              element={
                <AdminGuard>
                  <UserManagement />
                </AdminGuard>
              }
            />
            <Route path="/users/user" element={<Navigate to="/dashboard/user" replace />} />
            <Route path="/dashboard/users" element={<Navigate to="/admin/users" replace />} />

            {/* --- SETTINGS ROUTES --- */}
            <Route
              path="/admin/settings"
              element={
                <AdminGuard>
                  <Settings forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/settings/admin"
              element={
                <AdminGuard>
                  <Settings forceView="admin" />
                </AdminGuard>
              }
            />
            <Route
              path="/user/settings"
              element={
                <RoleGuard section="settings">
                  <Settings forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/settings/user"
              element={
                <RoleGuard section="settings">
                  <Settings forceView="user" />
                </RoleGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <RoleGuard section="settings">
                  <Settings />
                </RoleGuard>
              }
            />
            <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />
          </Route>

          {/* =========================================
              5. CATCH-ALL FALLBACK
             ========================================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
