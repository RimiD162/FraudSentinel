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

          {/* Dedicated Fraud Analyst Authentication Page */}
          <Route path="/login/analyst" element={<Login />} />
          <Route path="/login/Analyst" element={<Login />} />
          <Route path="/analyst/login" element={<Login />} />
          <Route path="/analyst" element={<Navigate to="/login/analyst" replace />} />
          <Route path="/login" element={<Navigate to="/login/analyst" replace />} />
          <Route path="/auth" element={<Navigate to="/login/analyst" replace />} />

          {/* Dedicated System Administrator Only Authentication Portal */}
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/Admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/login/admin" replace />} />


          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route
              index
              element={
                <RoleGuard section="dashboard">
                  <Dashboard />
                </RoleGuard>
              }
            />
            <Route
              path="analyze"
              element={
                <RoleGuard section="analyzeTransaction">
                  <AnalyzeTransaction />
                </RoleGuard>
              }
            />
            <Route
              path="transactions"
              element={
                <RoleGuard section="transactions">
                  <Transactions />
                </RoleGuard>
              }
            />
            <Route
              path="alerts"
              element={
                <RoleGuard section="fraudAlerts">
                  <FraudAlerts />
                </RoleGuard>
              }
            />
            <Route
              path="analytics"
              element={
                <RoleGuard section="analytics">
                  <Analytics />
                </RoleGuard>
              }
            />
            <Route
              path="reports"
              element={
                <RoleGuard section="reports">
                  <Reports />
                </RoleGuard>
              }
            />
            <Route
              path="users"
              element={
                <RoleGuard section="userManagement">
                  <UserManagement />
                </RoleGuard>
              }
            />
            <Route
              path="settings"
              element={
                <RoleGuard section="settings">
                  <Settings />
                </RoleGuard>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
