"""
Feature Engineering and Selection Module for FraudSentinel.

Implements domain-specific feature engineering for banking fraud analysis and risk modeling.
Provides a documented feature selection configuration to keep the dataset lean,
reusable, and free from data leakage.
"""

from typing import Dict, List, Optional
import numpy as np
import pandas as pd

# ==============================================================================
# Feature Selection Configuration
# ==============================================================================
# Documented selection of raw IEEE-CIS columns to avoid including 400+ uninterpreted columns blindly.
FEATURE_CONFIG: Dict[str, List[str]] = {
    "identifiers": ["TransactionID", "TransactionDT"],
    "target": ["isFraud"],
    "transaction_core": ["TransactionAmt", "ProductCD"],
    "card_info": ["card1", "card2", "card3", "card4", "card5", "card6"],
    "address": ["addr1", "addr2", "dist1", "dist2"],
    "email_domains": ["P_emaildomain", "R_emaildomain"],
    "counters": ["C1", "C2", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13", "C14"],
    "timedelta": ["D1", "D2", "D3", "D4", "D10", "D15"],
    "match_cols": ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"],
    "v_features_selected": [
        "V12", "V13", "V29", "V30", "V53", "V54", "V75", "V76", "V95", "V96",
        "V126", "V127", "V128", "V130", "V131", "V281", "V282", "V283", "V285",
        "V291", "V294", "V306", "V307", "V308", "V310", "V312", "V313", "V314",
        "V315", "V317",
    ],
    "identity_selected": [
        "DeviceType", "DeviceInfo", "id_12", "id_15", "id_16", "id_28", "id_29",
        "id_30", "id_31", "id_33", "id_34", "id_35", "id_36", "id_37", "id_38",
    ],
}

# Derived engineered features list
ENGINEERED_FEATURES: List[str] = [
    "TransactionAmt_log",
    "TransactionAmt_decimal",
    "Transaction_hour",
    "Transaction_day",
    "Transaction_day_num",
    "P_emaildomain_vendor",
    "R_emaildomain_vendor",
    "OS_vendor",
    "Browser_vendor",
    "null_count",
    "Amt_to_mean_card1",
    "Amt_to_std_card1",
]


def extract_domain_vendor(domain: Optional[str]) -> str:
    """Extract general email domain vendor (e.g., gmail, yahoo, hotmail)."""
    if pd.isna(domain) or not isinstance(domain, str):
        return "missing"
    domain_lower = domain.lower()
    if "gmail" in domain_lower:
        return "gmail"
    elif "yahoo" in domain_lower:
        return "yahoo"
    elif "hotmail" in domain_lower or "outlook" in domain_lower or "msn" in domain_lower:
        return "microsoft"
    elif "aol" in domain_lower:
        return "aol"
    elif "anonymous" in domain_lower:
        return "anonymous"
    elif "icloud" in domain_lower or "me.com" in domain_lower:
        return "apple"
    else:
        return "other"


def extract_os_vendor(os_str: Optional[str]) -> str:
    """Extract operating system family from id_30 column."""
    if pd.isna(os_str) or not isinstance(os_str, str):
        return "missing"
    os_lower = os_str.lower()
    if "windows" in os_lower:
        return "Windows"
    elif "ios" in os_lower:
        return "iOS"
    elif "mac" in os_lower:
        return "Mac"
    elif "android" in os_lower:
        return "Android"
    elif "linux" in os_lower:
        return "Linux"
    else:
        return "Other"


def extract_browser_vendor(browser_str: Optional[str]) -> str:
    """Extract browser family from id_31 column."""
    if pd.isna(browser_str) or not isinstance(browser_str, str):
        return "missing"
    b_lower = browser_str.lower()
    if "chrome" in b_lower:
        return "chrome"
    elif "safari" in b_lower:
        return "safari"
    elif "firefox" in b_lower:
        return "firefox"
    elif "edge" in b_lower:
        return "edge"
    elif "ie" in b_lower or "internet explorer" in b_lower:
        return "ie"
    elif "opera" in b_lower:
        return "opera"
    else:
        return "other"


def create_features(
    df: pd.DataFrame, card1_stats: Optional[pd.DataFrame] = None
) -> pd.DataFrame:
    """
    Generate domain features for transaction fraud analysis.

    Features Created:
    - Amount transformation (log, cents/decimal)
    - Time features (hour of day, day of week, day count)
    - Categorical groupings (email vendor, OS vendor, browser vendor)
    - Row-level missingness count
    - Card behavioral aggregations (amount relative to card1 average & std)

    Data Leakage Prevention:
    - Target column is never used in feature creation.
    - Card group statistics can optionally be passed from training set to apply on test set.

    Args:
        df: Input merged DataFrame.
        card1_stats: Optional precomputed card1 stats (mean, std) for train/test consistency.

    Returns:
        pd.DataFrame: DataFrame with new engineered features attached.
    """
    print("[FE] Engineering fraud analysis features...")
    df = df.copy()

    # 1. Transaction Amount Features
    if "TransactionAmt" in df.columns:
        df["TransactionAmt_log"] = np.log1p(df["TransactionAmt"].clip(lower=0))
        df["TransactionAmt_decimal"] = (
            df["TransactionAmt"] - np.floor(df["TransactionAmt"])
        ).round(4)

    # 2. Time Features (TransactionDT is relative seconds from reference date)
    if "TransactionDT" in df.columns:
        # 3600 seconds/hour, 24 hours/day
        df["Transaction_hour"] = (df["TransactionDT"] // 3600) % 24
        df["Transaction_day"] = (df["TransactionDT"] // (3600 * 24)) % 7
        df["Transaction_day_num"] = df["TransactionDT"] // (3600 * 24)

    # 3. Categorical Vendor Extractions
    if "P_emaildomain" in df.columns:
        df["P_emaildomain_vendor"] = df["P_emaildomain"].apply(extract_domain_vendor)
    else:
        df["P_emaildomain_vendor"] = "missing"

    if "R_emaildomain" in df.columns:
        df["R_emaildomain_vendor"] = df["R_emaildomain"].apply(extract_domain_vendor)
    else:
        df["R_emaildomain_vendor"] = "missing"

    if "id_30" in df.columns:
        df["OS_vendor"] = df["id_30"].apply(extract_os_vendor)
    else:
        df["OS_vendor"] = "missing"

    if "id_31" in df.columns:
        df["Browser_vendor"] = df["id_31"].apply(extract_browser_vendor)
    else:
        df["Browser_vendor"] = "missing"

    # 4. Row-level Missingness Count
    df["null_count"] = df.isnull().sum(axis=1)

    # 5. Behavioral Features (Card Group Statistics)
    if "card1" in df.columns and "TransactionAmt" in df.columns:
        if card1_stats is None:
            card1_stats = (
                df.groupby("card1")["TransactionAmt"]
                .agg(["mean", "std"])
                .rename(columns={"mean": "card1_amt_mean", "std": "card1_amt_std"})
            )

        df = df.merge(card1_stats, on="card1", how="left")
        df["Amt_to_mean_card1"] = (
            df["TransactionAmt"] / (df["card1_amt_mean"] + 1e-5)
        ).round(4)
        df["Amt_to_std_card1"] = (
            (df["TransactionAmt"] - df["card1_amt_mean"])
            / (df["card1_amt_std"].fillna(1.0) + 1e-5)
        ).round(4)

        # Drop intermediate temp columns
        df.drop(columns=["card1_amt_mean", "card1_amt_std"], errors="ignore", inplace=True)

    print(f"[FE] Created {len(ENGINEERED_FEATURES)} engineered features successfully.")
    return df


def select_features(
    df: pd.DataFrame, include_target: bool = True
) -> pd.DataFrame:
    """
    Filter dataset to retain only documented raw columns and engineered features.

    Args:
        df: DataFrame with raw and engineered columns.
        include_target: Whether to keep 'isFraud' if present.

    Returns:
        pd.DataFrame: Filtered DataFrame with selected feature subset.
    """
    desired_cols: List[str] = []

    # Gather selected raw columns from config
    for key, cols in FEATURE_CONFIG.items():
        if key == "target" and not include_target:
            continue
        desired_cols.extend(cols)

    # Add engineered features
    desired_cols.extend(ENGINEERED_FEATURES)

    # Retain only columns that exist in the input DataFrame
    existing_cols = [c for c in desired_cols if c in df.columns]

    print(f"[SELECTION] Selecting {len(existing_cols)} features out of {len(df.columns)} total columns.")
    return df[existing_cols].copy()
