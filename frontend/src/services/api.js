/**
 * Centralized API Client for FraudSentinel REST API.
 * Interacts with FastAPI backend at /api/v1 endpoints.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Standard fetch helper with error handling and response normalization.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorDetail = 'API request failed';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorDetail);
    }
    return await response.json();
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

/**
 * 1. Analytics & Trends
 */
export async function getAnalyticsSummary() {
  return request('/analytics/summary');
}

export async function getAnalyticsTrends() {
  return request('/analytics/trends');
}

/**
 * 2. Transactions & Analysis
 */
export async function analyzeTransaction(transactionPayload) {
  return request('/transactions/analyze', {
    method: 'POST',
    body: JSON.stringify(transactionPayload),
  });
}

export async function getTransactions(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return request(`/transactions${qs ? `?${qs}` : ''}`);
}

/**
 * 3. Fraud Alerts
 */
export async function getAlerts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return request(`/alerts${qs ? `?${qs}` : ''}`);
}

export async function getAlertById(alertId) {
  return request(`/alerts/${encodeURIComponent(alertId)}`);
}

/**
 * 4. Multi-Paradigm KR&R & Bayesian Reasoning
 */
export async function getReasoning(transactionId) {
  return request(`/reasoning/${encodeURIComponent(transactionId)}`);
}

/**
 * 5. Time-Series Fraud Forecasting
 */
export async function getForecasts() {
  return request('/forecasts');
}

export async function getForecastByHorizon(horizon = 7) {
  return request(`/forecasts/${encodeURIComponent(horizon)}`);
}

/**
 * 6. Investigation & Graph Search
 */
export async function searchInvestigation(searchPayload) {
  return request('/investigations/search', {
    method: 'POST',
    body: JSON.stringify(searchPayload),
  });
}

export default {
  getAnalyticsSummary,
  getAnalyticsTrends,
  analyzeTransaction,
  getTransactions,
  getAlerts,
  getAlertById,
  getReasoning,
  getForecasts,
  getForecastByHorizon,
  searchInvestigation,
};
