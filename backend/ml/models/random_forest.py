"""
Random Forest Classifier for FraudSentinel.

Implements Random Forest classifier with cost-sensitive class weighting (class_weight='balanced')
and feature importance extraction for non-linear risk modeling.
"""

from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from backend.ml.evaluation import calculate_evaluation_metrics, evaluate_threshold_grid


def train_random_forest(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    model_save_path: str = "models/classical/random_forest.joblib",
    target_col: str = "is_fraud",
    exclude_cols: Tuple[str, ...] = ("transaction_id", "customer_id", "parsed_time", "transaction_time", "is_fraud"),
) -> Tuple[Any, List[str], pd.DataFrame, Dict[str, Any], pd.DataFrame]:
    """
    Train and evaluate Random Forest Classifier.

    Args:
        train_df: Training DataFrame.
        val_df: Validation DataFrame.
        model_save_path: Filepath to save trained model.
        target_col: Name of target column.
        exclude_cols: Columns to exclude from feature matrix X.

    Returns:
        Tuple containing trained model, feature names list, validation threshold
        grid DataFrame, validation metrics dict, and feature importances DataFrame.
    """
    # 1. Prepare Feature Matrix X and Target Vector y
    feature_cols = [c for c in train_df.columns if c not in exclude_cols]
    
    X_train = train_df[feature_cols].copy()
    y_train = train_df[target_col].values

    X_val = val_df[feature_cols].copy()
    y_val = val_df[target_col].values

    # 2. Train Random Forest
    print(f"[RF] Training RandomForestClassifier on {len(X_train):,} samples ({len(feature_cols)} features)...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # 3. Predict Probabilities on Validation Set
    val_probs = model.predict_proba(X_val)[:, 1]

    # 4. Threshold Analysis on Validation Set
    val_threshold_table = evaluate_threshold_grid(y_val, val_probs)
    
    # Evaluate default 0.5 threshold
    val_metrics = calculate_evaluation_metrics(y_val, val_probs, threshold=0.50)

    # 5. Extract Feature Importances
    importances = model.feature_importances_
    feature_imp_df = pd.DataFrame(
        {"feature": feature_cols, "importance": importances}
    ).sort_values(by="importance", ascending=False).reset_index(drop=True)

    # 6. Save Model Artifacts
    save_path = Path(model_save_path)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    
    artifact = {
        "model": model,
        "feature_names": feature_cols,
        "feature_importances": feature_imp_df.to_dict(orient="records"),
        "model_type": "RandomForestClassifier",
        "class_weight": "balanced",
    }
    joblib.dump(artifact, save_path)
    print(f"[RF] Model saved successfully to '{save_path}'")

    return model, feature_cols, val_threshold_table, val_metrics, feature_imp_df
