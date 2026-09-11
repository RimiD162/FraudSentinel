"""
Logistic Regression Baseline Classifier for FraudSentinel.

Implements a reproducible Logistic Regression model with feature standardization
and cost-sensitive class weighting (class_weight='balanced').
"""

from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

from backend.ml.evaluation import calculate_evaluation_metrics, evaluate_threshold_grid


def train_logistic_regression(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    model_save_path: str = "models/classical/logistic_regression.joblib",
    target_col: str = "is_fraud",
    exclude_cols: Tuple[str, ...] = ("transaction_id", "customer_id", "parsed_time", "transaction_time", "is_fraud"),
) -> Tuple[Any, StandardScaler, List[str], pd.DataFrame, Dict[str, Any]]:
    """
    Train and evaluate Logistic Regression baseline.

    Args:
        train_df: Training DataFrame.
        val_df: Validation DataFrame.
        model_save_path: Filepath to save trained model.
        target_col: Name of target column.
        exclude_cols: Columns to exclude from feature matrix X.

    Returns:
        Tuple containing trained model, fitted scaler, feature names list,
        validation threshold grid DataFrame, and validation metrics dict.
    """
    # 1. Prepare Feature Matrix X and Target Vector y
    feature_cols = [c for c in train_df.columns if c not in exclude_cols]
    
    X_train = train_df[feature_cols].copy()
    y_train = train_df[target_col].values

    X_val = val_df[feature_cols].copy()
    y_val = val_df[target_col].values

    # 2. Fit StandardScaler ONLY on Training Set
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    # 3. Train Logistic Regression
    print(f"[LR] Training LogisticRegression on {len(X_train):,} samples ({len(feature_cols)} features)...")
    model = LogisticRegression(
        class_weight="balanced",
        random_state=42,
        max_iter=1000,
        solver="lbfgs",
    )
    model.fit(X_train_scaled, y_train)

    # 4. Predict Probabilities on Validation Set
    val_probs = model.predict_proba(X_val_scaled)[:, 1]

    # 5. Threshold Analysis on Validation Set
    val_threshold_table = evaluate_threshold_grid(y_val, val_probs)
    
    # Evaluate default 0.5 threshold
    val_metrics = calculate_evaluation_metrics(y_val, val_probs, threshold=0.50)

    # 6. Save Model Artifacts
    save_path = Path(model_save_path)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    
    artifact = {
        "model": model,
        "scaler": scaler,
        "feature_names": feature_cols,
        "model_type": "LogisticRegression",
        "class_weight": "balanced",
    }
    joblib.dump(artifact, save_path)
    print(f"[LR] Model saved successfully to '{save_path}'")

    return model, scaler, feature_cols, val_threshold_table, val_metrics
