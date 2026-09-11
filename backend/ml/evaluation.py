"""
Model Evaluation and Threshold Analysis Module for FraudSentinel.

Provides comprehensive metrics calculation (Precision, Recall, F1, PR-AUC, ROC-AUC,
FPR, FNR) and threshold sensitivity analysis optimized for highly imbalanced fraud detection.
"""

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    auc,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)


def calculate_evaluation_metrics(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    threshold: float = 0.50,
) -> Dict[str, Any]:
    """
    Calculate comprehensive metrics for binary fraud classification.

    Args:
        y_true: Ground truth binary labels.
        y_prob: Predicted positive class probabilities.
        threshold: Decision threshold for classification.

    Returns:
        Dict[str, Any]: Metrics dictionary including Recall, Precision, F1, PR-AUC,
                        ROC-AUC, FPR, FNR, and Confusion Matrix.
    """
    y_pred = (y_prob >= threshold).astype(int)

    # Confusion matrix
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()

    # Derived rates
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    # Basic metrics
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    # ROC-AUC
    try:
        roc_auc = float(roc_auc_score(y_true, y_prob))
    except Exception:
        roc_auc = 0.0

    # PR-AUC (Precision-Recall Area Under Curve)
    try:
        precisions, recalls, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = float(auc(recalls, precisions))
    except Exception:
        pr_auc = 0.0

    return {
        "threshold": round(threshold, 2),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "false_positive_rate": round(fpr, 4),
        "false_negative_rate": round(fnr, 4),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
    }


def evaluate_threshold_grid(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    thresholds: Optional[List[float]] = None,
) -> pd.DataFrame:
    """
    Evaluate model performance across a grid of decision thresholds.

    Args:
        y_true: Ground truth binary labels.
        y_prob: Predicted positive class probabilities.
        thresholds: List of candidate thresholds to evaluate.

    Returns:
        pd.DataFrame: Table comparing threshold performance metrics.
    """
    if thresholds is None:
        thresholds = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]

    records = []
    for th in thresholds:
        metrics = calculate_evaluation_metrics(y_true, y_prob, threshold=th)
        records.append(
            {
                "threshold": metrics["threshold"],
                "precision": metrics["precision"],
                "recall": metrics["recall"],
                "f1": metrics["f1"],
                "false_positive_rate": metrics["false_positive_rate"],
                "false_negative_rate": metrics["false_negative_rate"],
                "tp": metrics["confusion_matrix"]["tp"],
                "fp": metrics["confusion_matrix"]["fp"],
                "fn": metrics["confusion_matrix"]["fn"],
                "tn": metrics["confusion_matrix"]["tn"],
            }
        )

    return pd.DataFrame(records)
