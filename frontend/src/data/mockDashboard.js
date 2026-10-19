/**
 * Clean default data for the FraudSentinel Dashboard
 */

export const stats = [
  {
    id: 'transactions-processed',
    label: 'Transactions Processed',
    value: '0',
    delta: null,
    isPositive: true,
  },
  {
    id: 'fraud-alerts-triggered',
    label: 'Fraud Alerts Triggered',
    value: '0',
    delta: null,
    isPositive: true,
  },
  {
    id: 'accuracy',
    label: 'Detection Accuracy',
    value: '100.0%',
    delta: null,
    isPositive: true,
  },
];

export const transactionVolume = {
  headline: 'Transaction Volume',
  total: '0',
  timeframe: 'Past 7 Days',
  delta: null,
  isPositive: true,
  data: [],
};

export const fraudulentTransactions = {
  headline: 'Fraudulent Transactions',
  total: '0',
  timeframe: 'Past 7 Days',
  delta: null,
  isPositive: true,
  data: [],
};

export const fraudAlerts = [];

