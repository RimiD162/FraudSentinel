"""
FraudSentinel Time-Series Forecasting Module
=============================================
Provides daily aggregation, Holt-Winters exponential smoothing,
naive baseline comparison, evaluation metrics, and visualization
for fraud volume forecasting.
"""

from ml.forecasting.aggregator import aggregate_daily, train_holdout_split
from ml.forecasting.models import HoltWintersModel, NaiveSeasonalModel
from ml.forecasting.evaluation import mae, rmse, mape, evaluate_forecast

__all__ = [
    "aggregate_daily",
    "train_holdout_split",
    "HoltWintersModel",
    "NaiveSeasonalModel",
    "mae",
    "rmse",
    "mape",
    "evaluate_forecast",
]
