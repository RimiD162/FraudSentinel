"""
Leakage-Safe Feature Engineering Engine for FraudSentinel.

Implements strict temporal ordering and shifting logic to calculate customer behavioral
aggregations, transaction velocities, location/device change indicators, and datetime
features without any forward-looking data leakage or target contamination.
"""

from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd


def create_datetime_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract datetime features from 'parsed_time' column.

    Features Created:
    - transaction_year
    - transaction_month
    - transaction_day
    - transaction_hour
    - transaction_minute
    - day_of_week (0=Monday, 6=Sunday)
    - is_weekend (1 if Saturday/Sunday else 0)
    - is_night_transaction (1 if hour < 6 or hour >= 22 else 0)
    """
    df = df.copy()
    if "parsed_time" not in df.columns:
        raise KeyError("'parsed_time' column required to extract datetime features.")

    dt = df["parsed_time"].dt
    df["transaction_year"] = dt.year
    df["transaction_month"] = dt.month
    df["transaction_day"] = dt.day
    df["transaction_hour"] = dt.hour
    df["transaction_minute"] = dt.minute
    df["day_of_week"] = dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["is_night_transaction"] = (
        (df["transaction_hour"] < 6) | (df["transaction_hour"] >= 22)
    ).astype(int)

    return df


def create_amount_features(
    df: pd.DataFrame, amount_stats: Optional[Dict[str, float]] = None
) -> Tuple[pd.DataFrame, Dict[str, float]]:
    """
    Generate transaction amount transformations.

    Features Created:
    - amount_log: log1p(transaction_amount)
    - amount_zscore_global: (transaction_amount - mean) / std (fit on training fold)
    - amount_bucket: categorical binned transaction amounts

    Args:
        df: Input DataFrame.
        amount_stats: Precomputed global mean and std from training set.

    Returns:
        Tuple[pd.DataFrame, Dict[str, float]]: DataFrame and training amount stats.
    """
    df = df.copy()
    amt = df["transaction_amount"].clip(lower=0)

    # 1. Log Transform
    df["amount_log"] = np.log1p(amt).round(4)

    # 2. Global Z-Score (using train statistics to prevent test leakage)
    if amount_stats is None:
        mean_val = float(amt.mean())
        std_val = float(amt.std()) if float(amt.std()) > 0 else 1.0
        amount_stats = {"mean": mean_val, "std": std_val}

    df["amount_zscore_global"] = (
        (amt - amount_stats["mean"]) / (amount_stats["std"] + 1e-5)
    ).round(4)

    # 3. Categorical Amount Bucketing
    bins = [-np.inf, 25.0, 100.0, 250.0, np.inf]
    labels = ["micro", "low_medium", "high", "very_high"]
    df["amount_bucket"] = pd.cut(amt, bins=bins, labels=labels).astype(str)

    return df, amount_stats


def create_customer_behavioral_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate leakage-safe customer behavioral features using strict temporal ordering.

    Features Created:
    - customer_transaction_count (cumulative count including current)
    - customer_previous_transaction_count (cumulative count strictly prior)
    - customer_average_amount (expanding mean of prior amounts)
    - customer_amount_deviation (current amount minus customer prior average)
    - customer_max_amount (expanding max of prior amounts)
    - customer_min_amount (expanding min of prior amounts)
    """
    df = df.copy()

    # Ensure dataset is sorted chronologically
    df = df.sort_values(by=["parsed_time", "transaction_id"]).reset_index(drop=True)

    # Group by customer_id
    cust_group = df.groupby("customer_id")

    # Cumulative transaction counts
    df["customer_previous_transaction_count"] = cust_group.cumcount()
    df["customer_transaction_count"] = df["customer_previous_transaction_count"] + 1

    # Shift transaction amount by 1 to strictly exclude current transaction from prior statistics
    shifted_amt = cust_group["transaction_amount"].shift(1)

    # Expanding statistics on shifted amounts
    cust_shifted = shifted_amt.groupby(df["customer_id"])

    df["customer_average_amount"] = (
        cust_shifted.expanding().mean().reset_index(0, drop=True).fillna(df["transaction_amount"])
    ).round(4)

    df["customer_max_amount"] = (
        cust_shifted.expanding().max().reset_index(0, drop=True).fillna(df["transaction_amount"])
    ).round(4)

    df["customer_min_amount"] = (
        cust_shifted.expanding().min().reset_index(0, drop=True).fillna(df["transaction_amount"])
    ).round(4)

    # Customer amount deviation from prior historical average
    df["customer_amount_deviation"] = (
        df["transaction_amount"] - df["customer_average_amount"]
    ).round(4)

    return df


def create_velocity_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate customer transaction velocity in preceding time windows (1h, 6h, 24h).
    Uses closed='left' window rolling calculation to strictly exclude current transaction.
    """
    df = df.copy()
    df = df.sort_values(by=["parsed_time", "transaction_id"]).reset_index(drop=True)

    # Set index to parsed_time for time-based rolling window calculations
    temp_df = df.set_index("parsed_time")

    for hours, col_name in [(1, "customer_transactions_last_1h"),
                            (6, "customer_transactions_last_6h"),
                            (24, "customer_transactions_last_24h")]:
        window_str = f"{hours}h"
        # closed='left' ensures strictly prior timestamps within the window are counted
        counts = (
            temp_df.groupby("customer_id")["transaction_amount"]
            .rolling(window_str, closed="left")
            .count()
            .reset_index(level=0, drop=True)
            .values
        )
        df[col_name] = np.nan_to_num(counts, nan=0.0).astype(int)

    return df


def create_location_device_history_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate historical location and device behavior features.

    Features Created:
    - customer_previous_location
    - customer_location_change (1 if current location != prior location else 0)
    - customer_unique_location_count
    - customer_previous_device
    - customer_device_change (1 if current device != prior device else 0)
    - customer_unique_device_count
    """
    df = df.copy()
    df = df.sort_values(by=["parsed_time", "transaction_id"]).reset_index(drop=True)

    cust_group = df.groupby("customer_id")

    # Shifted previous location and device
    df["customer_previous_location"] = cust_group["transaction_location"].shift(1).fillna("none")
    df["customer_previous_device"] = cust_group["device_type"].shift(1).fillna("none")

    # Location & Device change flags
    df["customer_location_change"] = (
        (df["customer_previous_location"] != "none") &
        (df["transaction_location"] != df["customer_previous_location"])
    ).astype(int)

    df["customer_device_change"] = (
        (df["customer_previous_device"] != "none") &
        (df["device_type"] != df["customer_previous_device"])
    ).astype(int)

    # Expanding unique counts (strictly prior)
    def expanding_unique_counts(series: pd.Series) -> np.ndarray:
        seen = set()
        counts = []
        for val in series:
            counts.append(len(seen))
            seen.add(val)
        return np.array(counts)

    df["customer_unique_location_count"] = (
        cust_group["transaction_location"]
        .transform(expanding_unique_counts)
        .values
    )

    df["customer_unique_device_count"] = (
        cust_group["device_type"]
        .transform(expanding_unique_counts)
        .values
    )

    return df


def encode_categorical_features(
    df: pd.DataFrame,
    categorical_cols: Optional[List[str]] = None,
    expected_onehot_cols: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Perform One-Hot Encoding on categorical features.

    Args:
        df: Input DataFrame.
        categorical_cols: List of categorical columns to encode.
        expected_onehot_cols: Fixed column list for train/test consistency.

    Returns:
        Tuple[pd.DataFrame, List[str]]: Encoded DataFrame and list of one-hot column names.
    """
    if categorical_cols is None:
        categorical_cols = ["transaction_type", "transaction_location", "device_type", "amount_bucket"]

    df = df.copy()
    existing_cats = [c for c in categorical_cols if c in df.columns]

    encoded_df = pd.get_dummies(df, columns=existing_cats, prefix_sep="=", dtype=int)

    if expected_onehot_cols is None:
        # Collect generated onehot column names
        expected_onehot_cols = [
            c for c in encoded_df.columns
            if any(c.startswith(f"{cat}=") for cat in existing_cats)
        ]
    else:
        # Ensure test/val set has exact same dummy columns as train set
        for col in expected_onehot_cols:
            if col not in encoded_df.columns:
                encoded_df[col] = 0

    return encoded_df, expected_onehot_cols
