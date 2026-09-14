"""Tests for forecasting models (Holt-Winters and Naive Seasonal)."""

import numpy as np
import pytest

from ml.forecasting.models import HoltWintersModel, NaiveSeasonalModel


# ─── Naive Seasonal Tests ─────────────────────────────────────────────


class TestNaiveSeasonal:
    def test_predict_length(self):
        """Naive forecast should return exactly `horizon` values."""
        y = np.array([10, 12, 11, 9, 13, 14, 10], dtype=np.float64)
        model = NaiveSeasonalModel(seasonal_period=7)
        model.fit(y)
        pred = model.predict(14)
        assert len(pred) == 14

    def test_repeats_last_cycle(self):
        """Should exactly repeat the last 7 values."""
        y = np.array([1, 2, 3, 4, 5, 6, 7], dtype=np.float64)
        model = NaiveSeasonalModel(seasonal_period=7)
        model.fit(y)
        pred = model.predict(14)
        np.testing.assert_array_equal(pred[:7], y)
        np.testing.assert_array_equal(pred[7:14], y)

    def test_fit_required(self):
        model = NaiveSeasonalModel()
        with pytest.raises(RuntimeError, match="not fitted"):
            model.predict(5)

    def test_short_series(self):
        """Should handle series shorter than seasonal period."""
        y = np.array([10, 20, 30], dtype=np.float64)
        model = NaiveSeasonalModel(seasonal_period=7)
        model.fit(y)
        pred = model.predict(6)
        assert len(pred) == 6
        # Should repeat [10, 20, 30, 10, 20, 30]
        np.testing.assert_array_equal(pred, [10, 20, 30, 10, 20, 30])


# ─── Holt-Winters Tests ──────────────────────────────────────────────


class TestHoltWinters:
    @pytest.fixture
    def trend_seasonal_data(self):
        """Generate deterministic data with trend + weekly seasonality."""
        np.random.seed(42)
        n = 28  # 4 full weeks
        t = np.arange(n, dtype=np.float64)
        seasonal = 5 * np.sin(2 * np.pi * t / 7)  # weekly pattern
        trend = 0.5 * t
        noise = np.random.normal(0, 0.5, n)
        return 100 + trend + seasonal + noise

    def test_predict_length(self, trend_seasonal_data):
        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(trend_seasonal_data)
        pred = hw.predict(10)
        assert len(pred) == 10

    def test_predict_interval_length(self, trend_seasonal_data):
        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(trend_seasonal_data)
        point, lower, upper = hw.predict_interval(10)
        assert len(point) == 10
        assert len(lower) == 10
        assert len(upper) == 10
        # Intervals should widen
        assert np.all(upper >= point)
        assert np.all(lower <= point)

    def test_fit_required(self):
        hw = HoltWintersModel()
        with pytest.raises(RuntimeError, match="not fitted"):
            hw.predict(5)

    def test_too_short_series(self):
        hw = HoltWintersModel(seasonal_period=7)
        with pytest.raises(ValueError, match="at least 7"):
            hw.fit(np.array([1, 2, 3]))

    def test_parameters_bounded(self, trend_seasonal_data):
        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(trend_seasonal_data)
        assert 0.01 <= hw.alpha <= 0.99
        assert 0.001 <= hw.beta <= 0.5
        assert 0.01 <= hw.gamma <= 0.99

    def test_detects_rising_trend(self, trend_seasonal_data):
        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(trend_seasonal_data)
        # Data has positive trend (0.5 * t)
        assert hw.get_trend_direction() == "rising"

    def test_detects_stable_trend(self):
        """Constant data should have stable trend."""
        np.random.seed(42)
        y = np.full(14, 100.0) + np.random.normal(0, 0.1, 14)
        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(y)
        assert hw.get_trend_direction() == "stable"

    def test_beats_naive_on_trended_data(self, trend_seasonal_data):
        """HW should outperform naive on data with clear trend."""
        train = trend_seasonal_data[:21]
        test = trend_seasonal_data[21:]

        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(train)
        hw_pred = hw.predict(len(test))

        naive = NaiveSeasonalModel(seasonal_period=7)
        naive.fit(train)
        naive_pred = naive.predict(len(test))

        hw_mae = np.mean(np.abs(test - hw_pred))
        naive_mae = np.mean(np.abs(test - naive_pred))

        assert hw_mae < naive_mae, (
            f"HW MAE ({hw_mae:.2f}) should be < Naive MAE ({naive_mae:.2f})"
        )

    def test_deterministic_results(self, trend_seasonal_data):
        """Two fits on the same data should produce identical results."""
        hw1 = HoltWintersModel(seasonal_period=7)
        hw1.fit(trend_seasonal_data)
        pred1 = hw1.predict(7)

        hw2 = HoltWintersModel(seasonal_period=7)
        hw2.fit(trend_seasonal_data)
        pred2 = hw2.predict(7)

        np.testing.assert_array_almost_equal(pred1, pred2)

    def test_save_load_params(self, trend_seasonal_data, tmp_path):
        """Saved and loaded model should produce identical forecasts."""
        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(trend_seasonal_data)
        pred_original = hw.predict(7)

        path = tmp_path / "hw_params.json"
        hw.save_params(path)

        hw_loaded = HoltWintersModel()
        hw_loaded.load_params(path)
        pred_loaded = hw_loaded.predict(7)

        np.testing.assert_array_almost_equal(pred_original, pred_loaded)

    def test_get_params_serializable(self, trend_seasonal_data):
        """get_params() output should be JSON-serializable."""
        import json

        hw = HoltWintersModel(seasonal_period=7)
        hw.fit(trend_seasonal_data)
        params = hw.get_params()
        # Should not raise
        json.dumps(params)
