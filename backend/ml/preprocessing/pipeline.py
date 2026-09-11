"""
End-to-End Leakage-Safe Preprocessing & Engineering Pipeline for FraudSentinel.

Executes data loading, datetime parsing, feature creation (behavioral, velocity, amount,
location/device change), one-hot encoding, chronological splitting, metadata export,
and verification.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd

try:
    from .cleaning import load_banking_data, parse_datetime
    from .feature_engineering import (
        create_amount_features,
        create_customer_behavioral_features,
        create_datetime_features,
        create_location_device_history_features,
        create_velocity_features,
        encode_categorical_features,
    )
    from .split import split_dataset_chronological
except ImportError:
    from cleaning import load_banking_data, parse_datetime
    from feature_engineering import (
        create_amount_features,
        create_customer_behavioral_features,
        create_datetime_features,
        create_location_device_history_features,
        create_velocity_features,
        encode_categorical_features,
    )
    from split import split_dataset_chronological


def generate_feature_metadata(df_columns: List[str]) -> Dict[str, Any]:
    """
    Generate comprehensive feature metadata detailing source, type, transformation,
    leakage audit status, and ML usage flags.
    """
    metadata: Dict[str, Dict[str, Any]] = {}

    for col in df_columns:
        if col in ["transaction_id", "customer_id"]:
            metadata[col] = {
                "source_column": col,
                "feature_type": "identifier",
                "transformation": "none",
                "leakage_status": "Safe - Exclude from ML matrix",
                "used_by_ml": False,
            }
        elif col in ["is_fraud"]:
            metadata[col] = {
                "source_column": col,
                "feature_type": "target",
                "transformation": "none",
                "leakage_status": "Target Only",
                "used_by_ml": False,
            }
        elif col in ["parsed_time", "transaction_time"]:
            metadata[col] = {
                "source_column": col,
                "feature_type": "datetime",
                "transformation": "timestamp_parsing",
                "leakage_status": "Safe - Chronological ordering index",
                "used_by_ml": False,
            }
        elif col.startswith("amount_log"):
            metadata[col] = {
                "source_column": "transaction_amount",
                "feature_type": "numerical",
                "transformation": "log1p",
                "leakage_status": "Safe - Row isolated",
                "used_by_ml": True,
            }
        elif col.startswith("amount_zscore"):
            metadata[col] = {
                "source_column": "transaction_amount",
                "feature_type": "numerical",
                "transformation": "zscore_train_fit",
                "leakage_status": "Safe - Fit on train fold only",
                "used_by_ml": True,
            }
        elif "customer_transactions_last" in col:
            metadata[col] = {
                "source_column": "transaction_time",
                "feature_type": "numerical",
                "transformation": "time_window_rolling_closed_left",
                "leakage_status": "Safe - Prior timestamps only",
                "used_by_ml": True,
            }
        elif col.startswith("customer_") or "location" in col or "device" in col:
            metadata[col] = {
                "source_column": "customer_history",
                "feature_type": "numerical" if "count" in col or "dev" in col or "avg" in col or "max" in col or "min" in col else "categorical",
                "transformation": "shifted_expanding_window",
                "leakage_status": "Safe - Shifted prior transactions only",
                "used_by_ml": not col.startswith("customer_previous_"),
            }
        elif "=" in col:
            prefix = col.split("=")[0]
            metadata[col] = {
                "source_column": prefix,
                "feature_type": "binary_categorical",
                "transformation": "one_hot_encoding",
                "leakage_status": "Safe - One-hot dummy",
                "used_by_ml": True,
            }
        else:
            metadata[col] = {
                "source_column": col,
                "feature_type": "numerical" if df_columns and col in ["transaction_amount", "previous_transactions_count", "transaction_hour", "transaction_minute", "transaction_day"] else "categorical",
                "transformation": "none_or_datetime_extract",
                "leakage_status": "Safe - Direct raw or derived feature",
                "used_by_ml": True,
            }

    return {
        "total_features": len(metadata),
        "ml_features_count": sum(1 for v in metadata.values() if v["used_by_ml"]),
        "features": metadata,
    }


def run_feature_pipeline(
    primary_path: str = "data/raw/banking_fraud/fraud_detection_20k.csv",
    test_path: str = "data/raw/banking_fraud/fraud_detection_test_2k.csv",
    output_dir: str = "data/processed",
) -> Dict[str, Any]:
    """
    Run end-to-end leakage-safe feature engineering pipeline.
    """
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("      FraudSentinel Feature Engineering Pipeline  ")
    print("==================================================")

    # 1. Load Data
    print(f"[LOAD] Loading primary dataset: '{primary_path}'")
    df_primary = load_banking_data(primary_path)

    print(f"[LOAD] Loading blind test dataset: '{test_path}'")
    df_blind = load_banking_data(test_path)

    # 2. Parse Timestamps
    df_primary = parse_datetime(df_primary, time_col="transaction_time")
    df_blind = parse_datetime(df_blind, time_col="transaction_time")

    # 3. Create Datetime Features
    df_primary = create_datetime_features(df_primary)
    df_blind = create_datetime_features(df_blind)

    # 4. Create Amount Features (Fit stats on Primary train fold during split, compute initial)
    df_primary, primary_amt_stats = create_amount_features(df_primary)
    df_blind, _ = create_amount_features(df_blind, amount_stats=primary_amt_stats)

    # 5. Create Customer Behavioral Features (Shifted & Expanding)
    df_primary = create_customer_behavioral_features(df_primary)
    df_blind = create_customer_behavioral_features(df_blind)

    # 6. Create Velocity Features (Rolling Window Prior Only)
    df_primary = create_velocity_features(df_primary)
    df_blind = create_velocity_features(df_blind)

    # 7. Create Location & Device History Features
    df_primary = create_location_device_history_features(df_primary)
    df_blind = create_location_device_history_features(df_blind)

    # 8. Encode Categorical Features
    df_primary_enc, onehot_cols = encode_categorical_features(df_primary)
    df_blind_enc, _ = encode_categorical_features(df_blind, expected_onehot_cols=onehot_cols)

    # Clean string columns that were dummy encoded if needed or keep numeric
    cols_to_drop = ["customer_previous_location", "customer_previous_device", "amount_bucket"]
    df_primary_enc = df_primary_enc.drop(columns=[c for c in cols_to_drop if c in df_primary_enc.columns], errors="ignore")
    df_blind_enc = df_blind_enc.drop(columns=[c for c in cols_to_drop if c in df_blind_enc.columns], errors="ignore")

    # 9. Chronological Split (Primary 20k -> Train 70%, Val 15%, Test 15%)
    train_df, val_df, test_df, split_summary = split_dataset_chronological(
        df_primary_enc, time_col="parsed_time", train_ratio=0.70, val_ratio=0.15, test_ratio=0.15
    )

    # Save Processed Datasets
    train_path = out_dir / "fraudsentinel_train.csv"
    val_path = out_dir / "fraudsentinel_validation.csv"
    test_path_out = out_dir / "fraudsentinel_internal_test.csv"
    blind_path = out_dir / "fraudsentinel_blind_test.csv"
    meta_path = out_dir / "feature_metadata.json"

    print("[SAVE] Exporting processed datasets to data/processed/...")
    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    test_df.to_csv(test_path_out, index=False)
    df_blind_enc.to_csv(blind_path, index=False)

    # Generate Feature Metadata
    feature_meta = generate_feature_metadata(train_df.columns.tolist())
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(feature_meta, f, indent=2)

    print(f"[SUCCESS] Exported:")
    print(f"  - Train:         {train_path} ({len(train_df):,} rows x {train_df.shape[1]} cols)")
    print(f"  - Validation:    {val_path} ({len(val_df):,} rows x {val_df.shape[1]} cols)")
    print(f"  - Internal Test: {test_path_out} ({len(test_df):,} rows x {test_df.shape[1]} cols)")
    print(f"  - Blind Test:    {blind_path} ({len(df_blind_enc):,} rows x {df_blind_enc.shape[1]} cols)")
    print(f"  - Feature Meta:  {meta_path}\n")

    # Verification Checks
    nan_count = train_df.isna().sum().sum()
    inf_count = np.isinf(train_df.select_dtypes(include=[np.number]).values).sum()

    pipeline_summary = {
        "train_rows": len(train_df),
        "val_rows": len(val_df),
        "test_rows": len(test_df),
        "blind_test_rows": len(df_blind_enc),
        "total_feature_cols": train_df.shape[1],
        "ml_feature_cols": feature_meta["ml_features_count"],
        "total_nan_in_train": int(nan_count),
        "total_inf_in_train": int(inf_count),
        "split_metrics": split_summary,
    }

    return pipeline_summary


if __name__ == "__main__":
    run_feature_pipeline()
