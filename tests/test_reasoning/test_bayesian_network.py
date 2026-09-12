"""
Unit Tests for Bayesian Probabilistic Reasoning Module in FraudSentinel.

Tests Directed Acyclic Graph properties, Conditional Probability Tables (CPTs),
exact inference via joint enumeration, latent variable inference, evidence extraction,
factor attribution, normal vs. suspicious vs. high-risk transactions, and integration
with FraudExpertSystem.
"""

import unittest
from backend.ml.reasoning.bayesian_network import (
    CPT,
    BayesianInferenceResult,
    BayesianNetwork,
    DiscreteVariable,
    FraudBayesianNetwork,
    extract_evidence_from_transaction,
)
from backend.ml.reasoning.expert_system import FraudExpertSystem


class TestBayesianNetwork(unittest.TestCase):
    """Test suite for Bayesian Belief Network and probabilistic fraud reasoning."""

    def setUp(self):
        self.fraud_bn = FraudBayesianNetwork()
        self.expert_system = FraudExpertSystem()

    def test_dag_topological_sort_and_acyclicity(self):
        """Verify the DAG is strictly acyclic and topological sort respects parent dependencies."""
        order = self.fraud_bn.bn.topological_sort()
        self.assertEqual(len(order), 8)
        self.assertEqual(order[0], "Fraud")  # Root node must be first

        # Parents must precede children in topological order
        for var_name, var in self.fraud_bn.bn.variables.items():
            for p in var.parents:
                self.assertLess(
                    order.index(p),
                    order.index(var_name),
                    f"Parent '{p}' must appear before child '{var_name}' in topological sort",
                )

    def test_cpt_validation_catches_invalid_probabilities(self):
        """Verify CPT validation throws ValueError if probabilities do not sum to 1.0."""
        with self.assertRaises(ValueError):
            CPT(
                variable_name="BadVar",
                parent_names=[],
                table={(): {0: 0.7, 1: 0.5}},  # 0.7 + 0.5 = 1.2 != 1.0
            ).validate()

    def test_cycle_detection_raises_error(self):
        """Verify cycle detection identifies cyclical graph dependencies."""
        cyclic_bn = BayesianNetwork()
        cyclic_bn.add_variable("A", parents=[], cpt_table={(): {0: 0.5, 1: 0.5}})
        cyclic_bn.add_variable("B", parents=["A"], cpt_table={(0,): {0: 0.5, 1: 0.5}, (1,): {0: 0.5, 1: 0.5}})
        
        # Manually introduce cycle B -> A
        cyclic_bn.variables["A"].parents.append("B")
        with self.assertRaises(ValueError):
            cyclic_bn.topological_sort()

    def test_prior_probability_without_evidence(self):
        """With zero evidence, posterior P(Fraud=1) must exactly match prior 0.015."""
        result = self.fraud_bn.infer(evidence={})
        self.assertAlmostEqual(result.prior_probability, 0.015, places=4)
        self.assertAlmostEqual(result.fraud_probability, 0.015, places=4)
        self.assertEqual(result.risk_assessment, "MINIMAL")

    def test_normal_transaction_inference(self):
        """Normal transaction (all signals 0) should have posterior < 0.1% and minimal risk."""
        normal_evidence = {
            "HighAmount": 0,
            "NightTransaction": 0,
            "DeviceChange": 0,
            "LocationChange": 0,
            "RapidVelocity": 0,
            "AmountDeviation": 0,
        }
        result = self.fraud_bn.infer(evidence=normal_evidence)

        # Baseline fraud rate was 1.5%; with all normal signals, it should drop well below 0.1%
        self.assertLess(result.fraud_probability, 0.001)
        self.assertEqual(result.risk_assessment, "MINIMAL")
        self.assertIn("MINIMAL", result.explanation)
        self.assertLess(result.posterior_probabilities["AccountTakeover"], 0.01)

    def test_suspicious_account_takeover_inference(self):
        """Account Takeover signals (DeviceChange + LocationChange + HighAmount + Deviation) should push P(Fraud) > 85%."""
        suspicious_evidence = {
            "DeviceChange": 1,
            "LocationChange": 1,
            "HighAmount": 1,
            "AmountDeviation": 1,
        }
        result = self.fraud_bn.infer(evidence=suspicious_evidence)

        # Posterior should strongly indicate fraud (> 90%)
        self.assertGreater(result.fraud_probability, 0.85)
        self.assertEqual(result.risk_assessment, "CRITICAL")
        
        # Latent Account Takeover should also be strongly inferred
        ato_posterior = result.posterior_probabilities["AccountTakeover"]
        self.assertGreater(ato_posterior, 0.80)

        # Even with dampening negative signals (daytime, normal velocity), risk remains HIGH (> 70%)
        mixed_evidence = dict(suspicious_evidence)
        mixed_evidence.update({"NightTransaction": 0, "RapidVelocity": 0})
        mixed_result = self.fraud_bn.infer(evidence=mixed_evidence)
        self.assertGreater(mixed_result.fraud_probability, 0.70)
        self.assertEqual(mixed_result.risk_assessment, "HIGH")

        # Contributing variables should rank top risk drivers
        contributing_names = [c.variable for c in result.contributing_variables if c.risk_delta > 0]
        self.assertIn("DeviceChange", contributing_names)
        self.assertIn("LocationChange", contributing_names)
        self.assertIn("HighAmount", contributing_names)

    def test_extreme_high_risk_burst_attack(self):
        """All 6 risk signals active must produce posterior > 98% and CRITICAL assessment."""
        extreme_evidence = {
            "HighAmount": 1,
            "NightTransaction": 1,
            "DeviceChange": 1,
            "LocationChange": 1,
            "RapidVelocity": 1,
            "AmountDeviation": 1,
        }
        result = self.fraud_bn.infer(evidence=extreme_evidence)

        self.assertGreater(result.fraud_probability, 0.98)
        self.assertEqual(result.risk_assessment, "CRITICAL")
        self.assertGreater(result.posterior_probabilities["AccountTakeover"], 0.95)

    def test_base_rate_fallacy_isolated_high_amount(self):
        """
        Academic demonstration of Bayesian base-rate effect:
        An isolated HighAmount (P(High | Fraud=1)=0.7, P(High | Fraud=0)=0.1)
        with prior P(Fraud)=0.015 yields posterior P(Fraud | High) ≈ 9.6%.
        This prevents false alarms on legitimate high-value purchases.
        """
        isolated_evidence = {"HighAmount": 1}
        result = self.fraud_bn.infer(evidence=isolated_evidence)

        # Analytically: (0.70 * 0.015) / (0.70 * 0.015 + 0.10 * 0.985) = 0.0105 / 0.109 = 0.09633
        self.assertAlmostEqual(result.fraud_probability, 0.0963, places=3)
        self.assertEqual(result.risk_assessment, "ELEVATED")
        self.assertLess(result.fraud_probability, 0.20)  # Isolated anomaly does not trigger high alert

    def test_evidence_extraction_from_raw_features(self):
        """Test extraction of discrete binary evidence from engineered feature dictionary."""
        tx_data = {
            "transaction_amount": 3500.0,
            "amount_bucket": "high",
            "is_night_transaction": 1,
            "customer_location_change": 1,
            "customer_device_change": 1,
            "customer_transactions_last_1h": 3,
            "customer_amount_deviation": 2.5,
        }
        evidence = extract_evidence_from_transaction(tx_data)
        self.assertEqual(evidence["HighAmount"], 1)
        self.assertEqual(evidence["NightTransaction"], 1)
        self.assertEqual(evidence["DeviceChange"], 1)
        self.assertEqual(evidence["LocationChange"], 1)
        self.assertEqual(evidence["RapidVelocity"], 1)
        self.assertEqual(evidence["AmountDeviation"], 1)

    def test_expert_system_bayesian_integration_normal(self):
        """Verify evaluate_transaction integrates Bayesian fields for normal transaction."""
        normal_tx = {
            "transaction_id": "TX_NORM_100",
            "transaction_amount": 42.50,
            "amount_bucket": "low",
            "is_night_transaction": 0,
            "transaction_hour": 14,
            "customer_location_change": 0,
            "customer_device_change": 0,
            "customer_transactions_last_1h": 0,
            "customer_transactions_last_24h": 1,
            "customer_amount_deviation": 0.1,
            "customer_average_amount": 45.0,
        }
        result = self.expert_system.evaluate_transaction(normal_tx)

        self.assertIn("bayesian_reasoning", result)
        self.assertIn("bayesian_fraud_probability", result)
        self.assertFalse(result["is_fraud"])
        self.assertEqual(result["risk_level"], "LOW")
        self.assertLess(result["bayesian_fraud_probability"], 0.01)
        
        bayesian_info = result["bayesian_reasoning"]
        self.assertEqual(bayesian_info["query_variable"], "Fraud")
        self.assertEqual(bayesian_info["risk_assessment"], "MINIMAL")

    def test_expert_system_bayesian_integration_suspicious(self):
        """Verify evaluate_transaction integrates Bayesian fields for suspicious transaction."""
        suspicious_tx = {
            "transaction_id": "TX_SUSP_200",
            "transaction_amount": 4800.00,
            "amount_bucket": "very_high",
            "is_night_transaction": 1,
            "transaction_hour": 3,
            "customer_location_change": 1,
            "customer_device_change": 1,
            "customer_transactions_last_1h": 4,
            "customer_transactions_last_24h": 8,
            "customer_amount_deviation": 3.8,
            "customer_average_amount": 120.0,
        }
        result = self.expert_system.evaluate_transaction(suspicious_tx)

        self.assertIn("bayesian_reasoning", result)
        self.assertTrue(result["is_fraud"])
        self.assertEqual(result["risk_level"], "CRITICAL")
        self.assertGreater(result["bayesian_fraud_probability"], 0.90)

        bayesian_info = result["bayesian_reasoning"]
        self.assertEqual(bayesian_info["risk_assessment"], "CRITICAL")
        self.assertGreater(len(bayesian_info["contributing_variables"]), 0)
        self.assertIn("Bayesian Belief Network", bayesian_info["explanation"])


if __name__ == "__main__":
    unittest.main()
