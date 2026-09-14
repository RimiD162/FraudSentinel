# Time-Series Fraud Forecasting & Predictive Analysis Report

**Project:** FraudSentinel — Intelligent Financial Fraud Detection & Prevention Platform  
**Module:** `backend/ml/forecasting/`  
**Date:** September 2026  
**Artifacts Location:** `models/forecasting/`  

---

## 1. Executive Summary

Financial fraud prevention systems must anticipate transaction volumes and fraud pressures to allocate investigative resources, tune rule thresholds, and manage cash reserves. This report presents the methodology, mathematical formulation, empirical evaluation, and forecast projections for the time-series forecasting engine of FraudSentinel.

Using the chronological 20,000 transaction dataset spanning January 1 to January 30, 2025 (30 days), daily aggregations were extracted for four key operational metrics:
1. **Total Transactions** ($N_t$)
2. **Fraudulent Transaction Count** ($F_t$)
3. **Fraudulent Amount ($)** ($A_t$)
4. **Fraud Rate (%)** ($R_t = F_t / N_t$)

We formulate short-horizon forecasting using an additive **Holt-Winters Triple Exponential Smoothing** model with weekly periodicity ($m = 7$), optimized via L-BFGS-B on in-sample residuals, and benchmark it against a cyclic **Seasonal Naive** baseline. The models generate multi-horizon forecasts ($h \in \{7, 14, 30\}$ days) equipped with empirical confidence bounds and directional trend diagnostics.

---

## 2. Dataset Aggregation & Time-Series Characterization

The underlying transaction stream is aggregated into an equidistant daily frequency ($\Delta t = 1 \text{ day}$):

$$\mathcal{D} = \{(y_{1,t}, y_{2,t}, y_{3,t}, y_{4,t})\}_{t=1}^{T}, \quad T = 30$$

### Key Empirical Properties (30-Day Aggregation)

| Metric | Mean ($\mu$) | Std Dev ($\sigma$) | Min | Max | Lag-1 Autocorr ($r_1$) | Lag-7 Autocorr ($r_7$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Total Transactions** | 666.67 | 32.14 | 598 | 734 | +0.013 | +0.254 |
| **Fraud Count** | 10.10 | 3.21 | 4 | 18 | -0.045 | +0.182 |
| **Fraud Amount ($)** | $1,541.28 | $642.11 | $385.40 | $3,120.90 | +0.038 | +0.115 |
| **Fraud Rate** | 1.516% | 0.482% | 0.612% | 2.682% | -0.052 | +0.176 |

### Analytical Insights
- **Short-Series Regime:** With $T = 30$ daily observations, deep neural approaches (LSTM, Transformers) or complex autoregressive models (ARIMA $(p,d,q)$ with high parameter counts) are prone to severe parameter overparameterization and overfitting.
- **Weekly Seasonality:** The series exhibits a subtle weekly cyclical pattern ($r_7 > r_1$), reflecting human behavioral differences across weekdays versus weekends.
- **Trend Stationarity:** OLS linear trend slope test on fraud rate yields $\beta_1 = 0.048$ ($p = 0.50$), indicating a stationary, stable regime without structural drift.

---

## 3. Mathematical Methodology

### 3.1 Holt-Winters Triple Exponential Smoothing (Additive Seasonality)

Given a seasonal period $m = 7$, additive Holt-Winters decomposes the observed series $y_t$ into level ($l_t$), trend ($b_t$), and seasonal component ($s_t$):

$$\begin{aligned}
\text{Level Update:} \quad & l_t = \alpha (y_t - s_{t-m}) + (1 - \alpha)(l_{t-1} + b_{t-1}) \\
\text{Trend Update:} \quad & b_t = \beta (l_t - l_{t-1}) + (1 - \beta) b_{t-1} \\
\text{Seasonal Update:} \quad & s_t = \gamma (y_t - l_t) + (1 - \gamma) s_{t-m}
\end{aligned}$$

where smoothing coefficients $\alpha, \beta, \gamma \in (0, 1)$.

The $h$-step-ahead point forecast $\hat{y}_{t+h}$ is formulated as:

$$\hat{y}_{t+h} = l_t + h \cdot b_t + s_{t - m + ((h - 1) \bmod m) + 1}$$

### 3.2 Confidence Intervals

Point forecasts are augmented with empirical prediction intervals based on in-sample residual standard error $\hat{\sigma}_e$:

$$\hat{y}_{t+h} \pm z_{1-\alpha/2} \cdot \hat{\sigma}_e \cdot \sqrt{h}$$

For $z = 1.0$, this yields an approximate 68% prediction envelope expanding with horizon depth $h$.

### 3.3 Parameter Optimization

The parameter vector $\boldsymbol{\theta} = (\alpha, \beta, \gamma)$ is estimated by minimizing the sum of squared one-step-ahead forecasting errors:

$$\boldsymbol{\theta}^* = \arg\min_{\alpha, \beta, \gamma} \frac{1}{n}\sum_{t=1}^n (y_t - \hat{y}_{t|t-1})^2$$

subject to the box constraints $\alpha \in [0.01, 0.99]$, $\beta \in [0.001, 0.50]$, $\gamma \in [0.01, 0.99]$. Optimization is performed using the quasi-Newton **L-BFGS-B** algorithm with initial state:

$$\boldsymbol{\theta}_0 = (0.30, 0.05, 0.30)$$

### 3.4 Seasonal Naive Baseline

The benchmark baseline repeats the last observed seasonal cycle without parameter smoothing:

$$\hat{y}_{t+h}^{\text{naive}} = y_{t + ((h - 1) \bmod m) + 1 - m}$$

---

## 4. Evaluation Metrics & Experimental Protocol

### 4.1 Evaluation Metrics

- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{H} \sum_{i=1}^H |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE):**
  $$\text{RMSE} = \sqrt{\frac{1}{H}\sum_{i=1}^H (y_i - \hat{y}_i)^2}$$
- **Mean Absolute Percentage Error (MAPE):**
  $$\text{MAPE} = \frac{100\%}{H} \sum_{i=1}^H \left|\frac{y_i - \hat{y}_i}{y_i}\right| \quad (\text{evaluated only when } y_i > 0)$$

### 4.2 Validation Protocols
1. **Holdout Split:** First 23 days ($t=1\dots23$) for training, final 7 days ($t=24\dots30$) for out-of-sample holdout validation.
2. **Expanding-Window Cross-Validation:** Rolling origin evaluated from $t=14$ to $t=23$ ($9$ folds) with 1-day step.

---

## 5. Empirical Results

### 5.1 Out-of-Sample Holdout Evaluation (7 Days)

| Metric | Model | MAE | RMSE | MAPE (%) | Optimal $\alpha, \beta, \gamma$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Total Transactions** | **Holt-Winters** | **32.99** | **37.03** | **4.91%** | $\alpha=0.010, \beta=0.001, \gamma=0.010$ |
| | Seasonal Naive | 36.71 | 40.79 | 5.51% | — |
| **Fraud Count** | **Holt-Winters** | 3.32 | 4.48 | 36.42% | $\alpha=0.010, \beta=0.001, \gamma=0.010$ |
| | Seasonal Naive | **3.29** | **3.68** | **34.18%** | — |
| **Fraud Amount ($)** | **Holt-Winters** | 705.97 | 977.39 | 49.61% | $\alpha=0.010, \beta=0.001, \gamma=0.010$ |
| | Seasonal Naive | **584.84** | **779.70** | **42.30%** | — |
| **Fraud Rate** | **Holt-Winters** | 0.0055 | 0.0072 | 39.80% | $\alpha=0.010, \beta=0.001, \gamma=0.010$ |
| | Seasonal Naive | **0.0048** | **0.0054** | **35.21%** | — |

### 5.2 Rolling-Origin Cross-Validation (9 Folds, Average MAE)

| Metric | Holt-Winters CV-MAE | Seasonal Naive CV-MAE | Relative Performance |
| :--- | :--- | :--- | :--- |
| **Total Transactions** | **31.03** | 31.11 | HW (+0.3% improvement) |
| **Fraud Count** | **2.28** | 3.44 | **HW (+33.9% improvement)** |
| **Fraud Amount ($)** | 372.88 | **267.28** | Naive |
| **Fraud Rate** | **0.0034** | 0.0050 | **HW (+32.0% improvement)** |

---

## 6. Projections & Multi-Horizon Forecasts

Models refitted on the full 30-day dataset generate the following horizon forecasts starting from **2025-01-31**:

### Forecast Summary (Next 7, 14, 30 Days)

```
========================================================================================
Metric: Total Transactions (Trend: Stable)
  - 7-Day Mean:  666.8 txns/day  [634.7, 698.9]
  - 14-Day Mean: 666.8 txns/day  [621.5, 712.1]
  - 30-Day Mean: 666.7 txns/day  [600.2, 733.3]

Metric: Fraud Count (Trend: Stable)
  - 7-Day Mean:  10.1 alerts/day  [6.8, 13.4]
  - 14-Day Mean: 10.1 alerts/day  [5.5, 14.7]
  - 30-Day Mean: 10.1 alerts/day  [3.3, 16.9]

Metric: Fraud Amount ($) (Trend: Stable)
  - 7-Day Mean:  $1,540.3 /day    [$898.1, $2,182.5]
  - 14-Day Mean: $1,540.3 /day    [$632.4, $2,448.2]
  - 30-Day Mean: $1,540.3 /day    [$200.0, $2,880.6]

Metric: Fraud Rate (Trend: Stable)
  - 7-Day Mean:  1.516%           [1.021%, 2.011%]
  - 14-Day Mean: 1.516%           [0.817%, 2.215%]
  - 30-Day Mean: 1.516%           [0.490%, 2.542%]
========================================================================================
```

---

## 7. Model Artifacts & Reproducibility

All generated artifacts are persisted in `models/forecasting/`:

1. [`daily_aggregated.csv`](file:///c:/Users/ishit/FraudSentinel/models/forecasting/daily_aggregated.csv) — 30-day daily aggregated dataset.
2. [`hw_params.json`](file:///c:/Users/ishit/FraudSentinel/models/forecasting/hw_params.json) — Fitted parameter weights ($\alpha, \beta, \gamma$, initial level, trend, seasonal indices, residual std).
3. [`forecast_results.json`](file:///c:/Users/ishit/FraudSentinel/models/forecasting/forecast_results.json) — Full multi-horizon point and interval forecasts, holdout comparisons, and cross-validation tables.
4. [`forecast_visualization.png`](file:///c:/Users/ishit/FraudSentinel/models/forecasting/forecast_visualization.png) — 4-panel visual chart comparing historical trends, holdout actuals, Holt-Winters predictions with 68% confidence bounds, and naive seasonal forecasts.

---

## 8. Limitations & Recommendations

1. **Transaction Amount Skewness:** Individual fraudulent amounts possess high variance (kurtosis). Incorporating extreme-value mixture models or log-normal transformations prior to time aggregation can further dampen volatility in dollar forecasts.
2. **Macro Calendar Features:** Future iterations should incorporate calendar exogenous regressors (e.g., salary payout cycles, bank holidays, seasonal shopping events) via SARIMAX or prophet-style generalized additive formulations.
3. **Adaptive Thresholding:** The estimated daily fraud rate envelope ($[1.02\%, 2.01\%]$) should directly inform the dynamic alert thresholding rules in `backend/ml/reasoning/` to prevent analyst fatigue during volume surges.
