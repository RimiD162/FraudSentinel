"""
TensorFlow Deep Learning MLP Module for FraudSentinel.

Implements a Deep Neural Network (Multi-Layer Perceptron) for binary fraud detection:
Input -> Dense(128, ReLU) -> Dropout(0.2) -> Dense(64, ReLU) -> Dropout(0.2) -> Dense(32, ReLU) -> Dense(1, Sigmoid)

Features:
- Adam optimizer
- Cost-sensitive class weighting for ~1.5% fraud imbalance
- EarlyStopping monitoring validation PR-AUC
- Validation threshold sweep (0.01 to 0.99)
- Single-pass evaluation on internal test set
- Model, history, and feature order serialization
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow.keras import callbacks, layers, metrics, models, optimizers

from backend.ml.evaluation import calculate_evaluation_metrics


def build_mlp_model(
    input_dim: int,
    dropout_rate: float = 0.2,
    learning_rate: float = 0.001,
) -> models.Sequential:
    """
    Construct the specified TensorFlow/Keras MLP architecture:
    Input -> Dense(128, ReLU) -> Dropout -> Dense(64, ReLU) -> Dropout -> Dense(32, ReLU) -> Dense(1, Sigmoid)
    """
    model = models.Sequential(
        [
            layers.Input(shape=(input_dim,), name="input_features"),
            layers.Dense(128, activation="relu", name="dense_128"),
            layers.Dropout(dropout_rate, name="dropout_1"),
            layers.Dense(64, activation="relu", name="dense_64"),
            layers.Dropout(dropout_rate, name="dropout_2"),
            layers.Dense(32, activation="relu", name="dense_32"),
            layers.Dense(1, activation="sigmoid", name="output_fraud_prob"),
        ],
        name="FraudSentinel_MLP",
    )

    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="binary_crossentropy",
        metrics=[
            metrics.BinaryAccuracy(name="accuracy"),
            metrics.AUC(curve="PR", name="pr_auc"),
            metrics.AUC(curve="ROC", name="roc_auc"),
            metrics.Precision(name="precision"),
            metrics.Recall(name="recall"),
        ],
    )
    return model


def prepare_datasets(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    blind_df: Optional[pd.DataFrame] = None,
    target_col: str = "is_fraud",
    exclude_cols: Tuple[str, ...] = (
        "transaction_id",
        "customer_id",
        "parsed_time",
        "transaction_time",
        "is_fraud",
    ),
) -> Tuple[
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
    Optional[np.ndarray],
    List[str],
    StandardScaler,
    Dict[int, float],
]:
    """
    Extract feature matrices and target vectors.
    Fit StandardScaler ONLY on training data to prevent leakage.
    Compute balanced class weights.
    """
    feature_cols = [c for c in train_df.columns if c not in exclude_cols]

    X_train = train_df[feature_cols].copy()
    y_train = train_df[target_col].values.astype(int)

    X_val = val_df[feature_cols].copy()
    y_val = val_df[target_col].values.astype(int)

    X_test = test_df[feature_cols].copy()
    y_test = test_df[target_col].values.astype(int)

    X_blind = blind_df[feature_cols].copy() if blind_df is not None else None

    # Fit scaler ONLY on training data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    X_blind_scaled = scaler.transform(X_blind) if X_blind is not None else None

    # Compute balanced class weights for ~1.5% fraud imbalance
    classes = np.unique(y_train)
    weights = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
    class_weight_dict = {int(c): float(w) for c, w in zip(classes, weights)}

    return (
        X_train_scaled,
        y_train,
        X_val_scaled,
        y_val,
        X_test_scaled,
        y_test,
        X_blind_scaled,
        feature_cols,
        scaler,
        class_weight_dict,
    )


def train_fraud_mlp(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    class_weight_dict: Dict[int, float],
    epochs: int = 100,
    batch_size: int = 256,
    patience: int = 15,
    random_seed: int = 42,
) -> Tuple[models.Sequential, Dict[str, List[float]]]:
    """
    Train the Keras MLP with Adam, class weights, and EarlyStopping monitoring validation PR-AUC.
    """
    tf.random.set_seed(random_seed)
    np.random.seed(random_seed)

    input_dim = X_train.shape[1]
    model = build_mlp_model(input_dim=input_dim)

    early_stopping = callbacks.EarlyStopping(
        monitor="val_pr_auc",
        mode="max",
        patience=patience,
        restore_best_weights=True,
        verbose=1,
    )

    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor="val_pr_auc",
        mode="max",
        factor=0.5,
        patience=5,
        min_lr=1e-5,
        verbose=1,
    )

    print(f"\n[TF MLP] Training MLP ({input_dim} features, class_weights={class_weight_dict})...")
    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        class_weight=class_weight_dict,
        callbacks=[early_stopping, reduce_lr],
        verbose=1,
    )

    history_dict = {k: [float(v) for v in vals] for k, vals in history.history.items()}
    return model, history_dict


def find_best_validation_threshold(
    y_val: np.ndarray,
    y_val_probs: np.ndarray,
    threshold_min: float = 0.01,
    threshold_max: float = 0.99,
    threshold_step: float = 0.01,
    min_recall: float = 0.40,
) -> Tuple[float, Dict[str, Any], pd.DataFrame]:
    """
    Grid search thresholds on validation data from 0.01 to 0.99.
    Selects the threshold that optimizes F1 while maintaining viable recall.
    """
    thresholds = np.arange(threshold_min, threshold_max + threshold_step / 2, threshold_step)
    records = []

    best_threshold = 0.50
    best_f1 = -1.0
    best_metrics: Dict[str, Any] = {}

    for th in thresholds:
        th_val = round(float(th), 3)
        metrics_dict = calculate_evaluation_metrics(y_val, y_val_probs, threshold=th_val)
        records.append(
            {
                "threshold": th_val,
                "precision": metrics_dict["precision"],
                "recall": metrics_dict["recall"],
                "f1": metrics_dict["f1"],
                "accuracy": metrics_dict["accuracy"],
                "fpr": metrics_dict["false_positive_rate"],
                "fnr": metrics_dict["false_negative_rate"],
                "tp": metrics_dict["confusion_matrix"]["tp"],
                "fp": metrics_dict["confusion_matrix"]["fp"],
                "fn": metrics_dict["confusion_matrix"]["fn"],
                "tn": metrics_dict["confusion_matrix"]["tn"],
            }
        )

        # Primary optimization: Maximize F1 with a viable recall floor,
        # fallback to raw max F1 if constrained space is empty
        if metrics_dict["recall"] >= min_recall and metrics_dict["f1"] > best_f1:
            best_f1 = metrics_dict["f1"]
            best_threshold = th_val
            best_metrics = metrics_dict

    # If no threshold met min_recall, select absolute max F1
    if best_f1 <= 0:
        for r in records:
            if r["f1"] > best_f1:
                best_f1 = r["f1"]
                best_threshold = r["threshold"]
        best_metrics = calculate_evaluation_metrics(y_val, y_val_probs, threshold=best_threshold)

    val_grid_df = pd.DataFrame(records)
    return best_threshold, best_metrics, val_grid_df
