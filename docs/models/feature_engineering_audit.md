# FraudSentinel Feature Engineering & Data Leakage Audit Report

## 1. Executive Summary

This report documents the design, implementation, and data-leakage audit of the feature engineering pipeline for **FraudSentinel**.

The pipeline processes:
1. **Primary Dataset**: `data/raw/banking_fraud/fraud_detection_20k.csv` (20,000 rows, labeled)
2. **Blind Inference Dataset**: `data/raw/banking_fraud/fraud_detection_test_2k.csv` (2,000 rows, unlabeled)

Outputs generated in `data/processed/`:
- `fraudsentinel_train.csv` (14,000 rows, 70% chronological split)
- `fraudsentinel_validation.csv` (3,000 rows, 15% chronological split)
- `fraudsentinel_internal_test.csv` (3,000 rows, 15% chronological split)
- `fraudsentinel_blind_test.csv` (2,000 rows, unlabeled inference test set)
- `feature_metadata.json` (Full metadata registry of all features)

---

## 2. Feature Engineering Architecture & Leakage Protections

### A. Identifier Handling
- `transaction_id`: Retained in output CSVs strictly as an auditing primary key. Flagged in `feature_metadata.json` as `used_by_ml: false` so model training matrices (`X`) exclude it to prevent sequence leakage.
- `customer_id`: Retained as an entity identifier for chronological grouping only. Excluded from direct model input matrices.

### B. Datetime Processing
- `transaction_time` parsed using robust datetime parsing (`format='mixed'`, handling both `YYYY-MM-DD` and `DD-MM-YYYY`).
- Derived features: `transaction_year`, `transaction_month`, `transaction_day`, `transaction_hour`, `transaction_minute`, `day_of_week`, `is_weekend`, `is_night_transaction`.
- Original timestamps preserved for chronological sorting and window calculations.

### C. Amount Transformations & Normalization
- `amount_log`: `np.log1p(transaction_amount)`. Strictly row-isolated.
- `amount_zscore_global`: `(transaction_amount - mean) / std`. Parameters `mean` and `std` are computed **strictly on the training fold** (14,000 rows) and applied to validation/test folds without recalculation.
- `amount_bucket`: Categorical bucketing (`micro`, `low_medium`, `high`, `very_high`).

### D. Customer Behavioral Features (Expanding Window & Shift)
All behavioral aggregation features strictly exclude the current transaction to prevent forward-looking leakage:
- `customer_previous_transaction_count`: `cumcount()` of previous transactions.
- `customer_average_amount`: `expanding().mean()` on amounts shifted by 1 transaction (`shift(1)`).
- `customer_amount_deviation`: `transaction_amount - customer_average_amount`.
- `customer_max_amount` & `customer_min_amount`: `expanding().max()` / `min()` shifted by 1.

### E. Velocity Window Features (1h, 6h, 24h)
- `customer_transactions_last_1h`
- `customer_transactions_last_6h`
- `customer_transactions_last_24h`
- **Leakage Prevention**: Computed using pandas rolling time windows with `closed='left'`, which includes only past timestamps occurring strictly before the current transaction.

### F. Location & Device Transition Features
- `customer_previous_location` & `customer_previous_device`: Shifted by 1 transaction.
- `customer_location_change` & `customer_device_change`: Binary flags (`1` if current location/device differs from immediately preceding transaction, `0` otherwise).
- `customer_unique_location_count` & `customer_unique_device_count`: Expanding unique count prior to current transaction.

### G. Categorical One-Hot Encoding
- One-hot encoding (`pd.get_dummies`) applied to `transaction_type`, `transaction_location`, `device_type`, and `amount_bucket`.
- Dummy columns fit on training set and aligned on test/blind datasets (`expected_onehot_cols`).

---

## 3. Train / Validation / Test Splitting Strategy

### Evaluation Strategy Recommendation: Chronological (Temporal) Split
- **Method**: 70% Train, 15% Validation, 15% Internal Test ordered strictly by `parsed_time`.
- **Rationale**: Banking transaction data is inherently time-series. A random stratified split causes temporal data leakage because model training would observe future transactions to predict past ones. Chronological splitting mirrors real-world fraud detection deployment where models score upcoming transactions using patterns learned from historical data.

### Class Imbalance Strategy Recommendation: Class Weighting
- **Method**: Cost-sensitive training (`class_weight='balanced'`) during model fitting.
- **Rationale**: Avoids pre-split oversampling (e.g. SMOTE or RandomOverSampler), which can distort validation probability calibration and cause data leakage if applied across split boundaries.

---

## 4. Comprehensive Data Leakage Audit

| Leakage Risk Category | Status | Audit Findings |
| :--- | :--- | :--- |
| **Transaction ID Leakage** | **PASSED** | Excluded from ML feature matrix `X`. Used for tracing only. |
| **Customer ID Leakage** | **PASSED** | Excluded from direct model input matrix `X`. |
| **Future Transaction Leakage**| **PASSED** | All expanding/rolling aggregations shifted by 1 transaction (`shift(1)` / `closed='left'`). |
| **Target Contamination** | **PASSED** | `is_fraud` is strictly separated; zero target-derived features created. |
| **Z-Score Normalization Leakage** | **PASSED** | Global mean and std computed on training fold only. |
| **Categorical Encoding Leakage** | **PASSED** | One-hot column schema fit on training set and aligned on test folds. |
| **Blind Test Contamination** | **PASSED** | 2,000-row blind test dataset (`fraudsentinel_blind_test.csv`) processed with identical train-fitted encoders and zero label dependency. |

---

## 5. Dataset Statistics & Verification Summary

- **Train Set**: `14,000` rows x `49` columns | Fraud Count: `203` (1.45%)
- **Validation Set**: `3,000` rows x `49` columns | Fraud Count: `42` (1.40%)
- **Internal Test Set**: `3,000` rows x `49` columns | Fraud Count: `59` (1.97%)
- **Blind Test Set**: `2,000` rows x `48` columns | Target Excluded
- **Data Quality**: `0` NaN values, `0` Infinite values across all processed datasets.
