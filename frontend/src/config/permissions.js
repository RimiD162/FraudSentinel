/**
 * Centralized Role Permissions Matrix
 * 
 * Defines access levels for each role across all dashboard sections.
 * Levels:
 * - 'full': Section visible in navigation, all features and actions fully interactive.
 * - 'view': Section visible in navigation, rendered with 'View-only access' banner and disabled controls.
 * - 'hidden': Section hidden from navigation. Direct URL navigation displays access denied screen.
 */
export const ROLE_PERMISSIONS = {
  admin: {
    dashboard: 'full',
    analyzeTransaction: 'full',
    transactions: 'full',
    fraudAlerts: 'full',
    analytics: 'full',
    reports: 'full',
    userManagement: 'full',
    settings: 'full',
  },
  analyst: {
    dashboard: 'full',
    analyzeTransaction: 'full',
    transactions: 'full',
    fraudAlerts: 'full',
    analytics: 'full',
    reports: 'full',
    userManagement: 'hidden',
    settings: 'hidden',
  },
};

export const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    badge: 'Full Access',
    description: 'System administrator with root control, user provisioning, and engine settings.',
  },
  {
    id: 'analyst',
    label: 'Fraud Analyst',
    badge: 'Analyst Access',
    description: 'Investigator with full access to transactions, alerts, and inference analysis modules.',
  },
];

