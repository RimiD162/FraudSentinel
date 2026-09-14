"""
FraudSentinel Forecasting Runner
==================================
Main entry point for the forecasting pipeline.

Run from backend/:
    python -m ml.forecasting.runner

Pipeline:
  1. Aggregate daily data from 20K CSV
  2. Split into train (23 days) / holdout (7 days)
  3. Fit Holt-Winters + Naive on training data
  4. Evaluate on holdout
  5. Refit on full 30 days
  6. Forecast 7, 14, 30 days ahead
  7. Save artifacts + visualization
"""

from __future__ import annotations

import json
import sys
from datetime import timedelta
from pathlib import Path

import numpy as np
import pandas as pd

# Fix Windows console encoding for Unicode output
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

from ml.forecasting.aggregator import aggregate_daily, train_holdout_split
from ml.forecasting.evaluation import evaluate_forecast, rolling_origin_cv
from ml.forecasting.models import ForecastResult, HoltWintersModel, NaiveSeasonalModel
from ml.forecasting.visualization import plot_forecasts

# Output directory for artifacts
ARTIFACTS_DIR = Path(__file__).resolve().parents[3] / "models" / "forecasting"
METRICS = ["total_transactions", "fraud_count", "fraud_amount", "fraud_rate"]
HORIZONS = [7, 14, 30]
SEASONAL_PERIOD = 7


def run_forecasting_pipeline() -> dict:
    """Execute the full forecasting pipeline.

    Returns
    -------
    dict
        Complete results including forecasts, evaluation, and metadata.
    """
    print("🔮 FraudSentinel Forecasting Pipeline")
    print("=" * 55)

    # ── Step 1: Aggregate ─────────────────────────────────────
    print("\n📊 Step 1: Aggregating daily time series...")
    daily = aggregate_daily()
    print(f"   Total days: {len(daily)}")
    print(f"   Date range: {daily.index[0].date()} → {daily.index[-1].date()}")
    print(f"   Avg daily fraud count: {daily['fraud_count'].mean():.1f}")

    # Save aggregated data
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    daily.to_csv(ARTIFACTS_DIR / "daily_aggregated.csv")
    print(f"   Saved → {ARTIFACTS_DIR / 'daily_aggregated.csv'}")

    # ── Step 2: Train/Holdout Split ───────────────────────────
    print("\n✂️  Step 2: Splitting train (23d) / holdout (7d)...")
    train, holdout = train_holdout_split(daily, holdout_days=7)
    print(f"   Train: {len(train)} days ({train.index[0].date()} → {train.index[-1].date()})")
    print(f"   Holdout: {len(holdout)} days ({holdout.index[0].date()} → {holdout.index[-1].date()})")

    # ── Step 3: Fit models on training data ───────────────────
    print("\n🔧 Step 3: Fitting models on training data...")
    holdout_evaluations = {}
    hw_params_all = {}

    for metric in METRICS:
        y_train = train[metric].values
        y_holdout = holdout[metric].values
        horizon = len(holdout)

        # Holt-Winters
        hw = HoltWintersModel(seasonal_period=SEASONAL_PERIOD)
        hw.fit(y_train)
        hw_pred = hw.predict(horizon)
        hw_eval = evaluate_forecast(y_holdout, hw_pred, f"holt_winters_{metric}")
        hw_params_all[metric] = hw.get_params()

        # Naive Seasonal
        naive = NaiveSeasonalModel(seasonal_period=SEASONAL_PERIOD)
        naive.fit(y_train)
        naive_pred = naive.predict(horizon)
        naive_eval = evaluate_forecast(y_holdout, naive_pred, f"naive_{metric}")

        holdout_evaluations[metric] = {
            "holt_winters": hw_eval,
            "naive": naive_eval,
        }

        hw_mae = hw_eval["mae"]
        naive_mae = naive_eval["mae"]
        winner = "HW" if hw_mae <= naive_mae else "Naive"
        improvement = (
            ((naive_mae - hw_mae) / naive_mae * 100)
            if naive_mae > 0
            else 0.0
        )
        print(f"   {metric}:")
        print(f"     HW  MAE={hw_mae:.4f}  RMSE={hw_eval['rmse']:.4f}")
        print(f"     NAI MAE={naive_mae:.4f}  RMSE={naive_eval['rmse']:.4f}")
        print(f"     Winner: {winner} ({improvement:+.1f}% MAE improvement)")

    # Save HW parameters
    hw_params_path = ARTIFACTS_DIR / "hw_params.json"
    with open(hw_params_path, "w") as f:
        json.dump(hw_params_all, f, indent=2)
    print(f"\n   Saved HW params → {hw_params_path}")

    # ── Step 4: Rolling-origin CV ─────────────────────────────
    print("\n📈 Step 4: Rolling-origin cross-validation...")
    cv_results = {}
    for metric in METRICS:
        y_full_train = train[metric].values

        hw_cv = rolling_origin_cv(
            y_full_train,
            HoltWintersModel,
            model_kwargs={"seasonal_period": SEASONAL_PERIOD},
            min_train_size=14,
            horizon=1,
            step=1,
        )
        naive_cv = rolling_origin_cv(
            y_full_train,
            NaiveSeasonalModel,
            model_kwargs={"seasonal_period": SEASONAL_PERIOD},
            min_train_size=14,
            horizon=1,
            step=1,
        )

        hw_avg_mae = np.mean([r["mae"] for r in hw_cv]) if hw_cv else float("inf")
        naive_avg_mae = np.mean([r["mae"] for r in naive_cv]) if naive_cv else float("inf")

        cv_results[metric] = {
            "holt_winters_cv_mae": round(float(hw_avg_mae), 4),
            "naive_cv_mae": round(float(naive_avg_mae), 4),
            "n_folds": len(hw_cv),
        }
        print(f"   {metric}: HW CV-MAE={hw_avg_mae:.4f}, Naive CV-MAE={naive_avg_mae:.4f} ({len(hw_cv)} folds)")

    # ── Step 5: Refit on full data + forecast ─────────────────
    print("\n🔮 Step 5: Refitting on full 30 days & forecasting...")
    all_forecasts = {}
    forecast_dates_map = {}

    for horizon in HORIZONS:
        forecast_results = {}
        hw_fc_vals = {}
        naive_fc_vals = {}
        hw_lower_vals = {}
        hw_upper_vals = {}

        last_date = daily.index[-1]
        fc_dates = pd.date_range(
            start=last_date + timedelta(days=1), periods=horizon, freq="D"
        )
        forecast_dates_map[horizon] = fc_dates

        for metric in METRICS:
            y_full = daily[metric].values

            # Holt-Winters
            hw = HoltWintersModel(seasonal_period=SEASONAL_PERIOD)
            hw.fit(y_full)
            hw_point, hw_lo, hw_hi = hw.predict_interval(horizon, z=1.0)
            trend_dir = hw.get_trend_direction()

            hw_result = ForecastResult(
                dates=[d.strftime("%Y-%m-%d") for d in fc_dates],
                values=hw_point,
                model_name="holt_winters",
                trend_direction=trend_dir,
                parameters=hw.get_params(),
            )

            # Naive
            naive = NaiveSeasonalModel(seasonal_period=SEASONAL_PERIOD)
            naive.fit(y_full)
            naive_point = naive.predict(horizon)

            naive_result = ForecastResult(
                dates=[d.strftime("%Y-%m-%d") for d in fc_dates],
                values=naive_point,
                model_name="naive_seasonal",
                trend_direction="stable",
            )

            forecast_results[metric] = {
                "holt_winters": hw_result.to_dict(),
                "naive": naive_result.to_dict(),
            }
            hw_fc_vals[metric] = hw_point
            naive_fc_vals[metric] = naive_point
            hw_lower_vals[metric] = hw_lo
            hw_upper_vals[metric] = hw_hi

        all_forecasts[f"{horizon}_day"] = forecast_results

        print(f"   {horizon}-day forecast generated")

        # Generate visualization for the 7-day horizon
        if horizon == 7:
            print("\n🎨 Generating visualization (7-day horizon)...")
            plot_forecasts(
                daily_train=train,
                daily_holdout=holdout,
                hw_forecasts=hw_fc_vals,
                naive_forecasts=naive_fc_vals,
                hw_lower=hw_lower_vals,
                hw_upper=hw_upper_vals,
                forecast_dates=fc_dates,
                save_path=ARTIFACTS_DIR / "forecast_visualization.png",
            )

    # ── Step 6: Save complete results ─────────────────────────
    print("\n💾 Step 6: Saving complete results...")
    results = {
        "metadata": {
            "dataset": "fraud_detection_20k.csv",
            "total_days": len(daily),
            "date_range": f"{daily.index[0].date()} to {daily.index[-1].date()}",
            "train_days": len(train),
            "holdout_days": len(holdout),
            "seasonal_period": SEASONAL_PERIOD,
            "metrics": METRICS,
            "horizons": HORIZONS,
        },
        "holdout_evaluation": holdout_evaluations,
        "cross_validation": cv_results,
        "forecasts": all_forecasts,
    }

    results_path = ARTIFACTS_DIR / "forecast_results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"   Saved → {results_path}")

    # ── Summary ───────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("✅ Forecasting pipeline complete!")
    print(f"   Artifacts saved to: {ARTIFACTS_DIR}")
    print(f"   Files:")
    for p in sorted(ARTIFACTS_DIR.glob("*")):
        if p.name != ".gitkeep":
            print(f"     • {p.name} ({p.stat().st_size:,} bytes)")
    print("=" * 55)

    return results


if __name__ == "__main__":
    run_forecasting_pipeline()
