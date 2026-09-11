"""
FraudSentinel Preprocessing Package.

Provides data cleaning, dataset merging, inspection, feature engineering,
and end-to-end preprocessing pipeline execution for fraud detection modeling.
"""

from .cleaning import (
    analyze_missing_values,
    detect_duplicates,
    inspect_data_quality,
    load_identity_data,
    load_transaction_data,
    merge_datasets,
)
from .feature_engineering import (
    ENGINEERED_FEATURES,
    FEATURE_CONFIG,
    create_features,
    select_features,
)
from .pipeline import run_preprocessing_pipeline

__all__ = [
    "load_transaction_data",
    "load_identity_data",
    "merge_datasets",
    "detect_duplicates",
    "analyze_missing_values",
    "inspect_data_quality",
    "create_features",
    "select_features",
    "FEATURE_CONFIG",
    "ENGINEERED_FEATURES",
    "run_preprocessing_pipeline",
]
