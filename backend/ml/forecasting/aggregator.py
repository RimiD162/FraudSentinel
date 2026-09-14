"""
Daily time-series aggregation from raw transaction data.
=========================================================
Loads the raw 20K CSV and produces a daily DataFrame with:
  - total_transactions: count of transactions per day
  - fraud_count: number of fraudulent transactions per day
  - fraud_amount: total monetary value of fraudulent transactions per day
  - fraud_rate: fraud_count / total_transactions
"""

from pathlib import Path

import numpy as np
import pandas as pd

# Default path to the raw dataset
_DEFAULT_CSV = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "raw"
    / "banking_fraud"
    / "fraud_detection_20k.csv"
)


def aggregate_daily(csv_path: str | Path | None = None) -> pd.DataFrame:
    """Aggregate raw transactions into a daily time series.

    Parameters
    ----------
    csv_path : str or Path, optional
        Path to the raw CSV. Defaults to
        ``data/raw/banking_fraud/fraud_detection_20k.csv``.

    Returns
    -------
    pd.DataFrame
        Indexed by date (DatetimeIndex, daily frequency), columns:
        ``total_transactions``, ``fraud_count``, ``fraud_amount``, ``fraud_rate``.
    """
    csv_path = Path(csv_path) if csv_path else _DEFAULT_CSV
    df = pd.read_csv(csv_path, parse_dates=["transaction_time"])

    # Tag fraud amounts (0 for non-fraud rows)
    df["fraud_amount_value"] = np.where(
        df["is_fraud"] == 1, df["transaction_amount"], 0.0
    )

    # Resample to daily frequency
    df = df.set_index("transaction_time")
    daily = pd.DataFrame(
        {
            "total_transactions": df["is_fraud"].resample("D").count(),
            "fraud_count": df["is_fraud"].resample("D").sum(),
            "fraud_amount": df["fraud_amount_value"].resample("D").sum(),
        }
    )

    # Fill any missing calendar dates with 0
    full_range = pd.date_range(daily.index.min(), daily.index.max(), freq="D")
    daily = daily.reindex(full_range, fill_value=0)
    daily.index.name = "date"

    # Compute fraud rate (safe division)
    daily["fraud_rate"] = np.where(
        daily["total_transactions"] > 0,
        daily["fraud_count"] / daily["total_transactions"],
        0.0,
    )

    return daily


def train_holdout_split(
    daily: pd.DataFrame, holdout_days: int = 7
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split daily time series into training and holdout sets.

    Parameters
    ----------
    daily : pd.DataFrame
        Output of :func:`aggregate_daily`.
    holdout_days : int
        Number of trailing days to use as holdout. Default 7.

    Returns
    -------
    tuple[pd.DataFrame, pd.DataFrame]
        (train, holdout) DataFrames.
    """
    if holdout_days >= len(daily):
        raise ValueError(
            f"holdout_days ({holdout_days}) must be < total days ({len(daily)})"
        )
    split_idx = len(daily) - holdout_days
    return daily.iloc[:split_idx].copy(), daily.iloc[split_idx:].copy()
