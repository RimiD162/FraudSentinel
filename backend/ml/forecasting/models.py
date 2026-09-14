"""
Forecasting models for FraudSentinel.
======================================
Implements:
  1. NaiveSeasonalModel  — Seasonal naive baseline (repeat last week)
  2. HoltWintersModel    — Triple Exponential Smoothing (additive seasonality)

Both are implemented from scratch using numpy/scipy — no statsmodels required.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from scipy.optimize import minimize


@dataclass
class ForecastResult:
    """Container for forecast output."""

    dates: list[str]
    values: np.ndarray
    model_name: str
    trend_direction: str  # "rising", "falling", "stable"
    parameters: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "model_name": self.model_name,
            "trend_direction": self.trend_direction,
            "dates": self.dates,
            "values": [round(float(v), 4) for v in self.values],
            "parameters": self.parameters,
        }


# ─── Naive Seasonal Baseline ─────────────────────────────────────────


class NaiveSeasonalModel:
    """Seasonal naive forecaster: repeats the last observed seasonal cycle.

    For a seasonal period *m*, the forecast for horizon *h* is:
        ŷ_{t+h} = y_{t + h - m}   (cyclically from the last *m* observations)

    This is a strong baseline for short seasonal time series.
    """

    def __init__(self, seasonal_period: int = 7):
        self.seasonal_period = seasonal_period
        self._last_cycle: np.ndarray | None = None

    def fit(self, y: np.ndarray) -> NaiveSeasonalModel:
        """Store the last `seasonal_period` observations as the repeating cycle."""
        y = np.asarray(y, dtype=np.float64)
        m = self.seasonal_period
        if len(y) < m:
            # Fall back to repeating whatever is available
            self._last_cycle = y.copy()
        else:
            self._last_cycle = y[-m:].copy()
        return self

    def predict(self, horizon: int) -> np.ndarray:
        """Forecast `horizon` steps ahead by repeating the last cycle."""
        if self._last_cycle is None:
            raise RuntimeError("Model not fitted. Call fit() first.")
        cycle = self._last_cycle
        reps = (horizon // len(cycle)) + 1
        tiled = np.tile(cycle, reps)
        return tiled[:horizon]


# ─── Holt-Winters Triple Exponential Smoothing ───────────────────────


class HoltWintersModel:
    """Additive Holt-Winters (triple exponential smoothing).

    Equations (additive seasonality, period *m*):

        Level:    l_t = α (y_t − s_{t−m}) + (1−α)(l_{t−1} + b_{t−1})
        Trend:    b_t = β (l_t − l_{t−1}) + (1−β) b_{t−1}
        Season:   s_t = γ (y_t − l_t)     + (1−γ) s_{t−m}
        Forecast: ŷ_{t+h} = l_t + h·b_t + s_{t − m + ((h−1) mod m) + 1}

    Parameters α, β, γ ∈ (0, 1) are optimized via L-BFGS-B minimizing
    in-sample MSE.
    """

    def __init__(self, seasonal_period: int = 7, damped: bool = False):
        self.seasonal_period = seasonal_period
        self.damped = damped

        # Fitted state
        self.alpha: float = 0.0
        self.beta: float = 0.0
        self.gamma: float = 0.0
        self.level: float = 0.0
        self.trend: float = 0.0
        self.seasonals: np.ndarray = np.array([])
        self._residual_std: float = 0.0
        self._fitted: bool = False

    # ── Initialization ────────────────────────────────────────────

    @staticmethod
    def _initialize(y: np.ndarray, m: int) -> tuple[float, float, np.ndarray]:
        """Initialize level, trend and seasonal components.

        Level:   average of first season
        Trend:   average slope between first two seasons (or 0 if < 2 seasons)
        Season:  deviation of each position from the first-season mean
        """
        # Level = mean of first complete season
        level = float(np.mean(y[:m]))

        # Trend = average slope across first two seasons (if available)
        if len(y) >= 2 * m:
            trend = float(
                np.mean((y[m : 2 * m] - y[:m]) / m)
            )
        else:
            trend = 0.0

        # Seasonal indices = deviation from first-season level
        seasonals = y[:m] - level

        return level, trend, seasonals

    # ── Core filter (forward pass) ────────────────────────────────

    def _filter(
        self,
        y: np.ndarray,
        alpha: float,
        beta: float,
        gamma: float,
    ) -> tuple[float, float, np.ndarray, np.ndarray]:
        """Run the Holt-Winters filter over observations y.

        Returns
        -------
        level, trend, seasonals, fitted_values
        """
        m = self.seasonal_period
        n = len(y)

        level, trend, seasonals_init = self._initialize(y, m)
        seasonals = np.zeros(n + m)
        seasonals[:m] = seasonals_init

        fitted = np.zeros(n)

        for t in range(n):
            if t == 0:
                fitted[t] = level + trend + seasonals[t]
            else:
                # One-step-ahead forecast (before updating)
                fitted[t] = level + trend + seasonals[t]

            # Update equations
            prev_level = level
            level = alpha * (y[t] - seasonals[t]) + (1 - alpha) * (level + trend)
            trend = beta * (level - prev_level) + (1 - beta) * trend
            seasonals[t + m] = gamma * (y[t] - level) + (1 - gamma) * seasonals[t]

        return level, trend, seasonals[n : n + m], fitted

    # ── Optimization objective ────────────────────────────────────

    def _objective(self, params: np.ndarray, y: np.ndarray) -> float:
        """MSE objective for parameter optimization."""
        alpha, beta, gamma = params
        try:
            _, _, _, fitted = self._filter(y, alpha, beta, gamma)
            residuals = y - fitted
            return float(np.mean(residuals**2))
        except (FloatingPointError, ValueError, OverflowError):
            return 1e12

    # ── Fit ───────────────────────────────────────────────────────

    def fit(self, y: np.ndarray) -> HoltWintersModel:
        """Fit the model by optimizing α, β, γ via L-BFGS-B.

        Parameters
        ----------
        y : np.ndarray
            Training time series (length >= seasonal_period).
        """
        y = np.asarray(y, dtype=np.float64)
        m = self.seasonal_period

        if len(y) < m:
            raise ValueError(
                f"Need at least {m} observations (got {len(y)}) "
                f"for seasonal_period={m}"
            )

        # Optimize with deterministic starting point
        np.random.seed(42)
        x0 = np.array([0.3, 0.05, 0.3])
        bounds = [(0.01, 0.99), (0.001, 0.5), (0.01, 0.99)]

        result = minimize(
            self._objective,
            x0,
            args=(y,),
            method="L-BFGS-B",
            bounds=bounds,
            options={"maxiter": 500, "ftol": 1e-10},
        )

        self.alpha, self.beta, self.gamma = result.x
        self.level, self.trend, self.seasonals, fitted = self._filter(
            y, self.alpha, self.beta, self.gamma
        )

        residuals = y - fitted
        self._residual_std = float(np.std(residuals))
        self._fitted = True

        return self

    # ── Predict ───────────────────────────────────────────────────

    def predict(self, horizon: int) -> np.ndarray:
        """Generate point forecasts for `horizon` steps ahead.

        Returns
        -------
        np.ndarray of shape (horizon,)
        """
        if not self._fitted:
            raise RuntimeError("Model not fitted. Call fit() first.")

        m = self.seasonal_period
        forecasts = np.zeros(horizon)

        for h in range(1, horizon + 1):
            seasonal_idx = (h - 1) % m
            forecasts[h - 1] = self.level + h * self.trend + self.seasonals[seasonal_idx]

        return forecasts

    def predict_interval(
        self, horizon: int, z: float = 1.0
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generate point forecasts with confidence intervals.

        Parameters
        ----------
        horizon : int
            Number of steps to forecast.
        z : float
            Z-score multiplier for intervals (default 1.0 = ~68%).

        Returns
        -------
        (forecast, lower, upper) each of shape (horizon,)
        """
        forecast = self.predict(horizon)
        margin = z * self._residual_std * np.sqrt(np.arange(1, horizon + 1))
        return forecast, forecast - margin, forecast + margin

    # ── Trend direction ───────────────────────────────────────────

    def get_trend_direction(self, threshold: float = 0.01) -> str:
        """Classify the trend component as rising, falling, or stable.

        Uses the absolute trend slope relative to the current level.
        """
        if not self._fitted:
            return "unknown"
        if abs(self.level) < 1e-8:
            return "stable"
        relative_trend = self.trend / abs(self.level)
        if relative_trend > threshold:
            return "rising"
        elif relative_trend < -threshold:
            return "falling"
        return "stable"

    # ── Serialization ─────────────────────────────────────────────

    def get_params(self) -> dict:
        """Return model parameters as a dict (JSON-serializable)."""
        return {
            "alpha": round(self.alpha, 6),
            "beta": round(self.beta, 6),
            "gamma": round(self.gamma, 6),
            "level": round(self.level, 4),
            "trend": round(self.trend, 4),
            "seasonal_period": self.seasonal_period,
            "seasonals": [round(float(s), 4) for s in self.seasonals],
            "residual_std": round(self._residual_std, 4),
        }

    def save_params(self, path: str | Path) -> None:
        """Save model parameters to a JSON file."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.get_params(), f, indent=2)

    def load_params(self, path: str | Path) -> HoltWintersModel:
        """Load model parameters from a JSON file."""
        with open(path) as f:
            params = json.load(f)
        self.alpha = params["alpha"]
        self.beta = params["beta"]
        self.gamma = params["gamma"]
        self.level = params["level"]
        self.trend = params["trend"]
        self.seasonal_period = params["seasonal_period"]
        self.seasonals = np.array(params["seasonals"])
        self._residual_std = params["residual_std"]
        self._fitted = True
        return self
