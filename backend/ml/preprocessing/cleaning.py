"""
Data Cleaning and Quality Inspection Module for FraudSentinel.

Provides reusable utilities to load raw IEEE-CIS datasets (transaction and identity),
merge them safely on TransactionID, inspect data quality, detect duplicates,
and analyze missing value distributions.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd


def load_transaction_data(filepath: Union[str, Path]) -> pd.DataFrame:
    """
    Load raw transaction dataset (e.g. train_transaction.csv).

    Args:
        filepath: Path to the transaction CSV file.

    Returns:
        pd.DataFrame: Loaded transaction data.

    Raises:
        FileNotFoundError: If the file does not exist.
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(
            f"Transaction dataset not found at '{path}'. "
            "Please place train_transaction.csv inside data/raw/ieee_cis/"
        )
    print(f"[LOAD] Loading transaction data from '{path}'...")
    df = pd.read_csv(path)
    print(f"[LOAD] Loaded {len(df):,} transaction records ({len(df.columns)} columns).")
    return df


def load_identity_data(filepath: Union[str, Path]) -> pd.DataFrame:
    """
    Load raw identity dataset (e.g. train_identity.csv).

    Args:
        filepath: Path to the identity CSV file.

    Returns:
        pd.DataFrame: Loaded identity data.

    Raises:
        FileNotFoundError: If the file does not exist.
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(
            f"Identity dataset not found at '{path}'. "
            "Please place train_identity.csv inside data/raw/ieee_cis/"
        )
    print(f"[LOAD] Loading identity data from '{path}'...")
    df = pd.read_csv(path)
    print(f"[LOAD] Loaded {len(df):,} identity records ({len(df.columns)} columns).")
    return df


def merge_datasets(
    df_trans: pd.DataFrame,
    df_id: pd.DataFrame,
    on: str = "TransactionID",
    how: str = "left",
) -> pd.DataFrame:
    """
    Merge transaction and identity datasets on transaction key.

    Args:
        df_trans: Transaction DataFrame.
        df_id: Identity DataFrame.
        on: Key column to merge on (default: 'TransactionID').
        how: Type of join (default: 'left').

    Returns:
        pd.DataFrame: Merged DataFrame.
    """
    print(f"[MERGE] Merging transaction and identity data on '{on}' ({how} join)...")
    merged_df = pd.merge(df_trans, df_id, on=on, how=how)
    print(
        f"[MERGE] Merged dataset shape: {merged_df.shape[0]:,} rows x {merged_df.shape[1]} columns."
    )
    return merged_df


def detect_duplicates(
    df: pd.DataFrame, subset: Optional[List[str]] = None
) -> int:
    """
    Detect duplicate rows in the dataset.

    Args:
        df: Input DataFrame.
        subset: Optional list of column names to check for duplication.

    Returns:
        int: Number of duplicate rows found.
    """
    num_duplicates = int(df.duplicated(subset=subset).sum())
    print(f"[QUALITY] Duplicate rows found (subset={subset}): {num_duplicates:,}")
    return num_duplicates


def analyze_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze missing value counts and percentages across all columns.

    Args:
        df: Input DataFrame.

    Returns:
        pd.DataFrame: Summary table sorted by missing percentage descending.
    """
    total_rows = len(df)
    missing_count = df.isnull().sum()
    missing_pct = (missing_count / total_rows) * 100.0

    summary = pd.DataFrame(
        {
            "column": df.columns,
            "dtype": df.dtypes.astype(str).values,
            "missing_count": missing_count.values,
            "missing_pct": missing_pct.values,
        }
    ).sort_values(by="missing_pct", ascending=False)

    return summary.reset_index(drop=True)


def inspect_data_quality(
    df: pd.DataFrame, target_col: str = "isFraud"
) -> Dict[str, Any]:
    """
    Perform comprehensive data quality inspection on dataset.

    Args:
        df: Input DataFrame.
        target_col: Name of the binary target column.

    Returns:
        Dict[str, Any]: Comprehensive metrics dictionary.
    """
    total_rows, total_cols = df.shape
    duplicate_rows = detect_duplicates(df, subset=["TransactionID"] if "TransactionID" in df.columns else None)
    missing_summary = analyze_missing_values(df)

    cols_with_missing = len(missing_summary[missing_summary["missing_count"] > 0])
    avg_missing_pct = float(missing_summary["missing_pct"].mean())

    metrics: Dict[str, Any] = {
        "number_of_rows": total_rows,
        "number_of_columns": total_cols,
        "duplicate_rows": duplicate_rows,
        "cols_with_missing_values": cols_with_missing,
        "average_missing_pct": round(avg_missing_pct, 2),
    }

    if target_col in df.columns:
        fraud_count = int((df[target_col] == 1).sum())
        non_fraud_count = int((df[target_col] == 0).sum())
        fraud_pct = round((fraud_count / total_rows) * 100.0, 4)

        metrics.update(
            {
                "fraud_count": fraud_count,
                "non_fraud_count": non_fraud_count,
                "fraud_percentage": fraud_pct,
            }
        )

    print("\n--- Data Quality Inspection Summary ---")
    print(f"  Rows: {metrics['number_of_rows']:,}")
    print(f"  Columns: {metrics['number_of_columns']}")
    print(f"  Duplicate Transactions: {metrics['duplicate_rows']}")
    if target_col in df.columns:
        print(f"  Fraud Count: {metrics['fraud_count']:,}")
        print(f"  Non-Fraud Count: {metrics['non_fraud_count']:,}")
        print(f"  Fraud Percentage: {metrics['fraud_percentage']}%")
    print(f"  Columns with missing values: {metrics['cols_with_missing_values']}")
    print(f"  Average column missingness: {metrics['average_missing_pct']}%\n")

    return metrics
