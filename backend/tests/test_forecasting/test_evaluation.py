"""Tests for forecast evaluation metrics."""

import numpy as np
import pytest

from ml.forecasting.evaluation import mae, rmse, mape, evaluate_forecast


class TestMAE:
    def test_perfect_prediction(self):
        actual = np.array([1.0, 2.0, 3.0])
        assert mae(actual, actual) == 0.0

    def test_known_values(self):
        actual = np.array([3.0, -0.5, 2.0, 7.0])
        predicted = np.array([2.5, 0.0, 2.0, 8.0])
        # |0.5| + |0.5| + |0| + |1| = 2.0 / 4 = 0.5
        assert mae(actual, predicted) == pytest.approx(0.5)

    def test_symmetric(self):
        a = np.array([1.0, 2.0])
        b = np.array([3.0, 4.0])
        assert mae(a, b) == mae(b, a)


class TestRMSE:
    def test_perfect_prediction(self):
        actual = np.array([1.0, 2.0, 3.0])
        assert rmse(actual, actual) == 0.0

    def test_known_values(self):
        actual = np.array([1.0, 2.0, 3.0])
        predicted = np.array([1.0, 2.0, 5.0])
        # MSE = (0 + 0 + 4) / 3 = 4/3; RMSE = sqrt(4/3)
        expected = np.sqrt(4.0 / 3.0)
        assert rmse(actual, predicted) == pytest.approx(expected, rel=1e-6)

    def test_rmse_gte_mae(self):
        """RMSE should always be >= MAE."""
        actual = np.array([1, 5, 3, 8, 2], dtype=float)
        predicted = np.array([2, 4, 4, 7, 3], dtype=float)
        assert rmse(actual, predicted) >= mae(actual, predicted)


class TestMAPE:
    def test_perfect_prediction(self):
        actual = np.array([10.0, 20.0, 30.0])
        assert mape(actual, actual) == 0.0

    def test_known_values(self):
        actual = np.array([100.0, 200.0])
        predicted = np.array([90.0, 220.0])
        # |10/100| + |20/200| = 0.1 + 0.1 = 0.2; * 100 = 20 / 2 = 10%
        assert mape(actual, predicted) == pytest.approx(10.0)

    def test_returns_none_when_zero_actual(self):
        actual = np.array([0.0, 1.0, 2.0])
        predicted = np.array([1.0, 1.0, 2.0])
        assert mape(actual, predicted) is None


class TestEvaluateForecast:
    def test_returns_all_keys(self):
        actual = np.array([1.0, 2.0, 3.0])
        predicted = np.array([1.1, 2.2, 2.8])
        result = evaluate_forecast(actual, predicted, "test_model")
        assert "model_name" in result
        assert "mae" in result
        assert "rmse" in result
        assert "mape" in result
        assert "n_points" in result
        assert result["model_name"] == "test_model"
        assert result["n_points"] == 3

    def test_mape_none_with_zeros(self):
        actual = np.array([0.0, 2.0])
        predicted = np.array([1.0, 2.0])
        result = evaluate_forecast(actual, predicted)
        assert result["mape"] is None
