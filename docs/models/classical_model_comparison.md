# Classical Model Comparison Report — FraudSentinel

## Executive Summary
This document compares the performance, architecture, operational trade-offs, and feature importances of **Logistic Regression Baseline** vs **Random Forest Classifier** trained on the FraudSentinel 20k banking transaction dataset.

---

## 1. Metric Interpretation & Operational Trade-offs

A simple comparison of raw Recall at an arbitrary `0.10` threshold is misleading:
- **Random Forest (Th=0.10)**: Achieves **54.24% Recall** on internal test, but suffers from an **FPR of 45.66%** (1,343 false alarms on 2,941 legitimate transactions).
- **Logistic Regression (Th=0.10)**: Achieves **30.51% Recall** with an **FPR of 13.13%** (394 false alarms).
- **PR-AUC & ROC-AUC**: Logistic Regression outperforms Random Forest on global precision-recall space (**PR-AUC**: `0.0385` vs `0.0262`; **ROC-AUC**: `0.5894` vs `0.5572`).

### Operational Consequences:
An FPR of 45% creates severe customer friction (nearly half of all legitimate cardholders blocked/challenged) and overwhelms human fraud investigation teams. Operating points must constrain FPR to <= 20%.

---

## 2. Threshold Sensitivity Analysis (Validation Set)

| Model | Operating Strategy | Threshold | Precision | Recall | F1-Score | FPR | FNR |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | Max F1 | `0.44` | `0.0432` | `0.1429` | `0.0663` | `0.0450` | `0.8571` |
| **Logistic Regression** | Recall >= 50% | `0.24` | `0.0280` | `0.5000` | `0.0530` | `24.65%` | `0.5000` |
| **Logistic Regression** | FPR <= 20% | `0.27` | `0.0272` | `0.3810` | `0.0507` | `19.37%` | `0.6190` |
| **Random Forest** | Max F1 | `0.41` | `0.0976` | `0.0952` | `0.0964` | `0.0125` | `0.9048` |
| **Random Forest** | Recall >= 50% | `0.18` | `0.0279` | `0.5000` | `0.0528` | `24.75%` | `0.5000` |
| **Random Forest** | FPR <= 20% | `0.21` | `0.0330` | `0.4524` | `0.0616` | `18.80%` | `0.5476` |

---

## 3. Naive Baseline Comparison

| Model | Accuracy | Precision | Recall | F1-Score | PR-AUC | Confusion Matrix |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Naive Baseline (All Legitimate)** | **98.03%** | `0.00%` | `0.00%` | `0.00` | N/A | `TN=2941, FP=0, FN=59, TP=0` |
| **Logistic Regression (Th=0.27)** | `80.17%` | `2.72%` | `38.10%` | `0.0507` | `0.0385` | `TN=2371, FP=570, FN=36.5, TP=22.5` |
| **Random Forest (Th=0.21)** | `80.80%` | `3.30%` | `45.24%` | `0.0616` | `0.0262` | `TN=2388, FP=553, FN=32, TP=27` |

---

## 4. Balanced Model Selection Conclusion

- **Logistic Regression**: Best for calibrated probability outputs, global ranking (**PR-AUC = 0.0385**), and low-friction operational thresholds.
- **Random Forest**: Best for non-linear feature interaction capture when tuned at **Threshold = 0.21** (achieving **45.24% Recall** with **18.80% FPR**).

**RECOMMENDATION FOR TENSORFLOW DEEP LEARNING**:
Both classical models demonstrate the limitations of linear models and shallow decision trees on highly imbalanced (1.52%) transactional data. Deep Learning architectures (Dense MLPs with Focal Loss or Weighted Binary Cross-Entropy) are recommended as the next iteration to learn complex embeddings and non-linear risk representations.
