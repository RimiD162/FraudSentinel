# Classical Machine Learning Comprehensive Report — FraudSentinel

## 1. Dataset & Preprocessing Overview
- **Primary Dataset**: `fraud_detection_20k.csv` (20,000 banking transactions)
- **Chronological Split**: Train (14,000 rows, 70%), Validation (3,000 rows, 15%), Internal Test (3,000 rows, 15%)
- **Blind Evaluation Test Set**: `fraudsentinel_blind_test.csv` (2,000 rows, unlabeled)
- **Target**: `is_fraud` (Prevalence: ~1.52% overall)
- **Excluded Identifiers**: `transaction_id`, `customer_id`, `transaction_time`, `parsed_time`

---

## 2. Class Imbalance Strategy
- **Method**: Cost-Sensitive Loss Weighting (`class_weight='balanced'`).
- **Rationale**: Prevents artificial distribution distortion and memory bloat caused by pre-split SMOTE/oversampling.

---

## 3. Operating Threshold Selection (Validation Set)

| Threshold | LR Precision | LR Recall | LR F1 | RF Precision | RF Recall | RF F1 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0.10** | `0.0141` | **`0.7381`** | `0.0277` | `0.0173` | **`0.7381`** | `0.0339` |
| **0.20** | `0.0230` | `0.5476` | `0.0441` | `0.0303` | `0.4524` | `0.0567` |
| **0.30** | `0.0299` | `0.3333` | `0.0548` | `0.0287` | `0.1667` | `0.0490` |
| **0.40** | `0.0302` | `0.1429` | `0.0498` | `0.0784` | `0.0952` | **`0.0860`** |
| **0.50** | `0.0000` | `0.0000` | `0.0000` | `0.2500` | `0.0238` | `0.0435` |

**Operating Threshold Selected**: **`0.10`**
- **Justification**: In banking fraud detection, **Recall** is prioritized over Precision to catch maximum fraudulent transactions before financial settlement. Operating at threshold = 0.10 captures **73.81% of all fraud cases**.

---

## 4. Final Internal Test Evaluation Results

### A. Logistic Regression Baseline (Threshold = 0.1)
- **Precision**: `0.0437`
- **Recall**: `0.3051`
- **F1-Score**: `0.0764`
- **PR-AUC**: `0.0385`
- **ROC-AUC**: `0.5894`
- **Confusion Matrix**: `TN=2547, FP=394, FN=41, TP=18`
- **False Positive Rate (FPR)**: `0.134`
- **False Negative Rate (FNR)**: `0.6949`

### B. Random Forest Classifier (Threshold = 0.1)
- **Precision**: `0.0233`
- **Recall**: `0.5424`
- **F1-Score**: `0.0447`
- **PR-AUC**: `0.0262`
- **ROC-AUC**: `0.5572`
- **Confusion Matrix**: `TN=1599, FP=1342, FN=27, TP=32`
- **False Positive Rate (FPR)**: `0.4563`
- **False Negative Rate (FNR)**: `0.4576`

---

## 5. Summary & Limitations
- **Limitations**: With ~2.5 transactions per customer across 20k rows, historical customer velocity features remain sparse for early customer transactions.
- **Next Phase**: TensorFlow Deep Learning models and Rule Engines to combine rule-based heuristics with machine learning risk probabilities.
