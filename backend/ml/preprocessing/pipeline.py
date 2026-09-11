"""
Data Preprocessing Pipeline Entrypoint for FraudSentinel.

Executes end-to-end data ingestion, merging, quality check, feature engineering,
feature selection, and output serialization for the FraudSentinel fraud detection system.
"""

import argparse
import sys
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

import pandas as pd

# Support both package imports and standalone script execution
try:
    from .cleaning import (
        analyze_missing_values,
        detect_duplicates,
        inspect_data_quality,
        load_identity_data,
        load_transaction_data,
        merge_datasets,
    )
    from .feature_engineering import create_features, select_features
except ImportError:
    from cleaning import (
        analyze_missing_values,
        detect_duplicates,
        inspect_data_quality,
        load_identity_data,
        load_transaction_data,
        merge_datasets,
    )
    from feature_engineering import create_features, select_features


def run_preprocessing_pipeline(
    raw_dir: Union[str, Path] = "data/raw/ieee_cis",
    output_file: Union[str, Path] = "data/processed/fraudsentinel_transactions.csv",
    sample_size: Optional[int] = None,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Execute full data ingestion and preprocessing pipeline.

    Steps:
    1. Verify raw input dataset availability.
    2. Load train_transaction.csv and train_identity.csv.
    3. Merge datasets on TransactionID.
    4. Run initial data quality inspection.
    5. Perform domain feature engineering.
    6. Filter selected feature subset.
    7. Generate final data quality summary.
    8. Export processed dataset to CSV.

    Args:
        raw_dir: Path to directory containing raw CSVs.
        output_file: Path where processed CSV will be saved.
        sample_size: Optional row limit for fast local testing.

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]: Processed DataFrame and metrics summary dictionary.
    """
    raw_path = Path(raw_dir)
    out_path = Path(output_file)

    trans_file = raw_path / "train_transaction.csv"
    id_file = raw_path / "train_identity.csv"

    print("==================================================")
    print("      FraudSentinel Data Preprocessing Pipeline   ")
    print("==================================================")
    print(f"Raw Input Directory:  {raw_path.resolve()}")
    print(f"Output File Target:   {out_path.resolve()}")
    if sample_size:
        print(f"Sample Size Limit:    {sample_size:,} rows")
    print("--------------------------------------------------\n")

    # Step 1: Check raw files
    if not trans_file.exists():
        print(f"[ERROR] Transaction dataset missing: '{trans_file}'")
        print("\n[ACTION REQUIRED]: Please place raw IEEE-CIS dataset files in:")
        print(f"   - {trans_file}")
        print(f"   - {id_file}\n")
        raise FileNotFoundError(f"Raw file not found: {trans_file}")

    # Step 2: Ingestion
    df_trans = load_transaction_data(trans_file)
    if sample_size and len(df_trans) > sample_size:
        df_trans = df_trans.head(sample_size)

    if id_file.exists():
        df_id = load_identity_data(id_file)
        df_merged = merge_datasets(df_trans, df_id)
    else:
        print(f"[WARNING] Identity file not found at '{id_file}'. Proceeding with transaction data only.")
        df_merged = df_trans

    # Step 3: Feature Engineering
    df_engineered = create_features(df_merged)

    # Step 4: Feature Selection
    df_processed = select_features(df_engineered, include_target=True)

    # Step 5: Data Quality Inspection & Summary
    metrics = inspect_data_quality(df_processed, target_col="isFraud")

    # Step 6: Export Processed Dataset
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"[EXPORT] Saving processed dataset to '{out_path}'...")
    df_processed.to_csv(out_path, index=False)
    print(f"[SUCCESS] Processed dataset saved successfully! Shape: {df_processed.shape}\n")

    return df_processed, metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FraudSentinel Data Preprocessing Pipeline")
    parser.add_argument(
        "--raw-dir",
        default="data/raw/ieee_cis",
        help="Path to directory containing raw IEEE-CIS CSV files",
    )
    parser.add_argument(
        "--output-file",
        default="data/processed/fraudsentinel_transactions.csv",
        help="Target filepath for output processed CSV",
    )
    parser.add_argument(
        "--sample-size",
        type=int,
        default=None,
        help="Optional row sample limit for quick execution/testing",
    )

    args = parser.parse_args()

    try:
        run_preprocessing_pipeline(
            raw_dir=args.raw_dir,
            output_file=args.output_file,
            sample_size=args.sample_size,
        )
    except FileNotFoundError as e:
        print(f"\nPipeline halted: {e}")
        sys.exit(1)
