/**
 * Mock data for the FraudSentinel Dashboard
 */

export const stats = [
  {
    id: 'transactions-processed',
    label: 'Transactions Processed',
    value: '1,234,567',
    delta: '+12%',
    isPositive: true,
  },
  {
    id: 'fraud-alerts-triggered',
    label: 'Fraud Alerts Triggered',
    value: '456',
    delta: '-5%',
    isPositive: false,
  },
  {
    id: 'accuracy',
    label: 'Accuracy',
    value: '99.5%',
    delta: '+0.1%',
    isPositive: true,
  },
];

export const transactionVolume = {
  headline: 'Transaction Volume',
  total: '12,345',
  timeframe: 'Last 24 Hours',
  delta: '+15%',
  isPositive: true,
  data: [
    { time: '12AM', value: 1200 },
    { time: '3AM', value: 1500 },
    { time: '6AM', value: 1100 },
    { time: '9AM', value: 1800 },
    { time: '12PM', value: 2400 },
    { time: '3PM', value: 2100 },
    { time: '6PM', value: 2245 },
  ],
};

export const fraudulentTransactions = {
  headline: 'Fraudulent Transactions',
  total: '45',
  timeframe: 'Last 24 Hours',
  delta: '-10%',
  isPositive: false,
  data: [
    { time: '12AM', count: 4 },
    { time: '3AM', count: 7 },
    { time: '6AM', count: 3 },
    { time: '9AM', count: 9 },
    { time: '12PM', count: 12 },
    { time: '3PM', count: 6 },
    { time: '6PM', count: 4 },
  ],
};

export const fraudAlerts = [
  {
    id: 'TXN12345',
    amount: '$500',
    user: 'User A',
    timestamp: '2023-09-20 10:00 AM',
    status: 'Flagged',
  },
  {
    id: 'TXN67890',
    amount: '$1,200',
    user: 'User B',
    timestamp: '2023-09-20 11:30 AM',
    status: 'Under Review',
  },
  {
    id: 'TXN24680',
    amount: '$250',
    user: 'User C',
    timestamp: '2023-09-20 12:45 PM',
    status: 'Cleared',
  },
  {
    id: 'TXN13579',
    amount: '$800',
    user: 'User D',
    timestamp: '2023-09-20 02:15 PM',
    status: 'Flagged',
  },
  {
    id: 'TXN98765',
    amount: '$3,500',
    user: 'User E',
    timestamp: '2023-09-20 04:30 PM',
    status: 'Under Review',
  },
];
