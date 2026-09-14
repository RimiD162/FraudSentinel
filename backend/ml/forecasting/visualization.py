"""
Forecast visualization.
========================
Generates a 2×2 subplot grid showing historical data, holdout actuals,
Holt-Winters forecasts, and naive baseline forecasts for each metric.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
import pandas as pd


def plot_forecasts(
    daily_train: pd.DataFrame,
    daily_holdout: pd.DataFrame,
    hw_forecasts: dict[str, np.ndarray],
    naive_forecasts: dict[str, np.ndarray],
    hw_lower: dict[str, np.ndarray] | None = None,
    hw_upper: dict[str, np.ndarray] | None = None,
    forecast_dates: pd.DatetimeIndex | None = None,
    save_path: str | Path | None = None,
) -> None:
    """Generate a 2×2 forecast visualization.

    Parameters
    ----------
    daily_train : pd.DataFrame
        Training portion of daily aggregated data.
    daily_holdout : pd.DataFrame
        Holdout portion (can be empty for pure forecasting).
    hw_forecasts : dict
        Metric name → Holt-Winters forecast array.
    naive_forecasts : dict
        Metric name → Naive forecast array.
    hw_lower, hw_upper : dict, optional
        Confidence interval bounds for HW.
    forecast_dates : DatetimeIndex, optional
        Dates for the forecast period.
    save_path : str or Path, optional
        File path to save the figure.
    """
    metrics = ["total_transactions", "fraud_count", "fraud_amount", "fraud_rate"]
    titles = [
        "Daily Total Transactions",
        "Daily Fraud Count",
        "Daily Fraud Amount ($)",
        "Daily Fraud Rate",
    ]
    colors = {
        "train": "#2563EB",
        "holdout": "#10B981",
        "hw": "#F59E0B",
        "naive": "#EF4444",
        "ci": "#FDE68A",
    }

    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    fig.suptitle(
        "FraudSentinel — Time-Series Fraud Forecasting",
        fontsize=16,
        fontweight="bold",
        y=0.98,
    )

    for idx, (metric, title) in enumerate(zip(metrics, titles)):
        ax = axes[idx // 2, idx % 2]

        # Historical training data
        ax.plot(
            daily_train.index,
            daily_train[metric].values,
            color=colors["train"],
            linewidth=1.5,
            marker="o",
            markersize=3,
            label="Training Data",
            zorder=3,
        )

        # Holdout actuals (if available)
        if len(daily_holdout) > 0 and metric in daily_holdout.columns:
            ax.plot(
                daily_holdout.index,
                daily_holdout[metric].values,
                color=colors["holdout"],
                linewidth=1.5,
                marker="s",
                markersize=4,
                label="Holdout Actual",
                zorder=3,
            )

        # Forecast dates
        if forecast_dates is not None and metric in hw_forecasts:
            fc_dates = forecast_dates[: len(hw_forecasts[metric])]

            # Holt-Winters confidence interval
            if hw_lower and hw_upper and metric in hw_lower:
                ax.fill_between(
                    fc_dates,
                    hw_lower[metric][: len(fc_dates)],
                    hw_upper[metric][: len(fc_dates)],
                    alpha=0.25,
                    color=colors["ci"],
                    label="HW ±1σ Interval",
                    zorder=1,
                )

            # Holt-Winters forecast
            ax.plot(
                fc_dates,
                hw_forecasts[metric][: len(fc_dates)],
                color=colors["hw"],
                linewidth=2,
                linestyle="--",
                marker="D",
                markersize=4,
                label="Holt-Winters",
                zorder=4,
            )

            # Naive forecast
            if metric in naive_forecasts:
                ax.plot(
                    fc_dates,
                    naive_forecasts[metric][: len(fc_dates)],
                    color=colors["naive"],
                    linewidth=1.5,
                    linestyle=":",
                    marker="x",
                    markersize=4,
                    label="Naive Seasonal",
                    zorder=2,
                )

        ax.set_title(title, fontsize=12, fontweight="bold")
        ax.set_xlabel("Date")
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
        ax.tick_params(axis="x", rotation=45)
        ax.legend(fontsize=8, loc="upper left")
        ax.grid(True, alpha=0.3)

    plt.tight_layout(rect=[0, 0, 1, 0.95])

    if save_path:
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"  Saved visualization → {save_path}")

    plt.close(fig)
