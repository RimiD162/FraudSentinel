"""
Forecast evaluation metrics.
==============================
Provides MAE, RMSE, MAPE and a consolidated evaluation function
for comparing forecasting models.
"""

from __future__ import annotations

import numpy as np


def mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Mean Absolute Error.

    MAE = (1/n) Σ |y_i − ŷ_i|
    """
    actual = np.asarray(actual, dtype=np.float64)
    predicted = np.asarray(predicted, dtype=np.float64)
    return float(np.mean(np.abs(actual - predicted)))


def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    """Root Mean Squared Error.

    RMSE = √( (1/n) Σ (y_i − ŷ_i)² )
    """
    actual = np.asarray(actual, dtype=np.float64)
    predicted = np.asarray(predicted, dtype=np.float64)
    return float(np.sqrt(np.mean((actual - predicted) ** 2)))


def mape(actual: np.ndarray, predicted: np.ndarray) -> float | None:
    """Mean Absolute Percentage Error.

    MAPE = (100/n) Σ |y_i − ŷ_i| / |y_i|

    Returns None if any actual value is zero (MAPE is undefined).
    """
    actual = np.asarray(actual, dtype=np.float64)
    predicted = np.asarray(predicted, dtype=np.float64)

    if np.any(actual == 0):
        return None

    return float(np.mean(np.abs((actual - predicted) / actual)) * 100)


def evaluate_forecast(
    actual: np.ndarray,
    predicted: np.ndarray,
    model_name: str = "",
) -> dict:
    """Compute all evaluation metrics for a forecast.

    Parameters
    ----------
    actual : array-like
        Ground truth values.
    predicted : array-like
        Forecasted values (same length as actual).
    model_name : str
        Label for the model being evaluated.

    Returns
    -------
    dict with keys: model_name, mae, rmse, mape (or None), n_points.
    """
    actual = np.asarray(actual, dtype=np.float64)
    predicted = np.asarray(predicted, dtype=np.float64)

    return {
        "model_name": model_name,
        "mae": round(mae(actual, predicted), 4),
        "rmse": round(rmse(actual, predicted), 4),
        "mape": round(mape(actual, predicted), 2) if mape(actual, predicted) is not None else None,
        "n_points": len(actual),
    }


def rolling_origin_cv(
    y: np.ndarray,
    model_class,
    model_kwargs: dict | None = None,
    min_train_size: int = 14,
    horizon: int = 1,
    step: int = 1,
) -> list[dict]:
    """Rolling-origin cross-validation for time-series models.

    Expands the training window by `step` days at each fold,
    forecasts `horizon` steps, and collects per-fold metrics.

    Parameters
    ----------
    y : np.ndarray
        Full time series.
    model_class : class
        Must implement fit(y) -> self and predict(horizon) -> np.ndarray.
    model_kwargs : dict, optional
        Keyword arguments passed to model constructor.
    min_train_size : int
        Minimum training window size.
    horizon : int
        Forecast horizon per fold.
    step : int
        Number of observations to advance per fold.

    Returns
    -------
    list of dicts, each containing fold metrics.
    """
    model_kwargs = model_kwargs or {}
    results = []
    n = len(y)

    for split in range(min_train_size, n - horizon + 1, step):
        train = y[:split]
        test = y[split : split + horizon]

        model = model_class(**model_kwargs)
        try:
            model.fit(train)
            pred = model.predict(horizon)
            metrics = evaluate_forecast(test, pred[:len(test)])
            metrics["train_size"] = len(train)
            results.append(metrics)
        except (ValueError, RuntimeError):
            continue

    return results
