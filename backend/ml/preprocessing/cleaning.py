"""
Data Cleaning and Datetime Normalization Module for FraudSentinel.

Handles loading raw banking fraud datasets and robust parsing of timestamps
across differing date formats (e.g. train vs test dataset formats).
"""

from pathlib import Path
from typing import Union
import pandas as pd


def load_banking_data(filepath: Union[str, Path]) -> pd.DataFrame:
    """
    Load raw banking dataset from CSV.

    Args:
        filepath: Path to the CSV file.

    Returns:
        pd.DataFrame: Raw dataset.
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at '{path}'")

    df = pd.read_csv(path)
    return df


def parse_datetime(
    df: pd.DataFrame, time_col: str = "transaction_time"
) -> pd.DataFrame:
    """
    Parse transaction timestamp column robustly.
    Supports both ISO format (YYYY-MM-DD HH:MM:SS) and European format (DD-MM-YYYY HH:MM).

    Args:
        df: Input DataFrame.
        time_col: Name of the timestamp column.

    Returns:
        pd.DataFrame: DataFrame with parsed 'parsed_time' datetime column.
    """
    df = df.copy()
    if time_col not in df.columns:
        raise KeyError(f"Timestamp column '{time_col}' not found in DataFrame.")

    # Parse with fallback format handling
    df["parsed_time"] = pd.to_datetime(
        df[time_col],
        format="mixed",
        dayfirst=True,
        errors="coerce",
    )

    if df["parsed_time"].isnull().any():
        num_nulls = df["parsed_time"].isnull().sum()
        print(f"[WARNING] {num_nulls} timestamps could not be parsed.")

    return df
