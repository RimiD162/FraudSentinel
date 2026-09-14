"""Tests for the daily aggregator."""

import pandas as pd
import pytest

from ml.forecasting.aggregator import aggregate_daily, train_holdout_split


class TestAggregate:
    def test_aggregate_produces_correct_shape(self):
        """Aggregation should produce 30 rows (Jan 1-30, 2025)."""
        daily = aggregate_daily()
        assert len(daily) == 30

    def test_aggregate_has_required_columns(self):
        daily = aggregate_daily()
        expected_cols = {"total_transactions", "fraud_count", "fraud_amount", "fraud_rate"}
        assert expected_cols.issubset(set(daily.columns))

    def test_aggregate_no_nulls(self):
        daily = aggregate_daily()
        assert daily.isnull().sum().sum() == 0

    def test_aggregate_fraud_count_matches_total(self):
        """Total fraud count across all days should be 304."""
        daily = aggregate_daily()
        assert daily["fraud_count"].sum() == 304

    def test_aggregate_total_transactions(self):
        """Total transactions should be 20000."""
        daily = aggregate_daily()
        assert daily["total_transactions"].sum() == 20000

    def test_aggregate_fraud_rate_bounded(self):
        """Fraud rate should be between 0 and 1."""
        daily = aggregate_daily()
        assert (daily["fraud_rate"] >= 0).all()
        assert (daily["fraud_rate"] <= 1).all()

    def test_aggregate_daily_frequency(self):
        """Index should be daily frequency."""
        daily = aggregate_daily()
        # Check consecutive days differ by 1
        diffs = pd.Series(daily.index).diff().dropna()
        assert (diffs == pd.Timedelta(days=1)).all()


class TestTrainHoldoutSplit:
    def test_split_sizes(self):
        daily = aggregate_daily()
        train, holdout = train_holdout_split(daily, holdout_days=7)
        assert len(train) == 23
        assert len(holdout) == 7

    def test_split_no_overlap(self):
        daily = aggregate_daily()
        train, holdout = train_holdout_split(daily, holdout_days=7)
        assert train.index[-1] < holdout.index[0]

    def test_split_covers_full_range(self):
        daily = aggregate_daily()
        train, holdout = train_holdout_split(daily, holdout_days=7)
        assert len(train) + len(holdout) == len(daily)

    def test_split_invalid_holdout(self):
        daily = aggregate_daily()
        with pytest.raises(ValueError):
            train_holdout_split(daily, holdout_days=30)
