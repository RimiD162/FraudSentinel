"""
Train/Validation/Test Splitting Strategy Module for FraudSentinel.

Implements chronological (temporal) dataset splitting as the primary evaluation strategy
to mirror real-world production deployment and prevent temporal data leakage.
"""

from typing import Tuple, Dict, Any
import pandas as pd


def split_dataset_chronological(
    df: pd.DataFrame,
    time_col: str = "parsed_time",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Perform a leakage-free Chronological (Temporal) Split.

    Ratios:
    - Train: First 70% of transactions chronologically
    - Validation: Next 15% of transactions chronologically
    - Internal Test: Final 15% of transactions chronologically

    Args:
        df: Input DataFrame containing timestamp column.
        time_col: Column name for parsed datetime.
        train_ratio: Ratio for training split.
        val_ratio: Ratio for validation split.
        test_ratio: Ratio for internal test split.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
            train_df, val_df, test_df, split_summary metrics.
    """
    if abs((train_ratio + val_ratio + test_ratio) - 1.0) > 1e-5:
        raise ValueError("Train, validation, and test ratios must sum to 1.0.")

    # Sort strictly by timestamp
    df = df.sort_values(by=[time_col, "transaction_id"]).reset_index(drop=True)

    n_total = len(df)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * val_ratio)

    train_df = df.iloc[:n_train].copy()
    val_df = df.iloc[n_train : n_train + n_val].copy()
    test_df = df.iloc[n_train + n_val :].copy()

    split_summary = {
        "split_method": "Chronological (Temporal)",
        "total_rows": n_total,
        "train_rows": len(train_df),
        "val_rows": len(val_df),
        "test_rows": len(test_df),
        "train_time_range": (
            str(train_df[time_col].min()),
            str(train_df[time_col].max()),
        ),
        "val_time_range": (
            str(val_df[time_col].min()),
            str(val_df[time_col].max()),
        ),
        "test_time_range": (
            str(test_df[time_col].min()),
            str(test_df[time_col].max()),
        ),
    }

    if "is_fraud" in df.columns:
        split_summary.update(
            {
                "train_fraud_count": int(train_df["is_fraud"].sum()),
                "train_fraud_pct": round(
                    float(train_df["is_fraud"].mean() * 100), 2
                ),
                "val_fraud_count": int(val_df["is_fraud"].sum()),
                "val_fraud_pct": round(
                    float(val_df["is_fraud"].mean() * 100), 2
                ),
                "test_fraud_count": int(test_df["is_fraud"].sum()),
                "test_fraud_pct": round(
                    float(test_df["is_fraud"].mean() * 100), 2
                ),
            }
        )

    return train_df, val_df, test_df, split_summary
