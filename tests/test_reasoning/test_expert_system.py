"""
Comprehensive Unit Tests for FraudSentinel Rule-Based Expert System.

Uses Python standard library unittest for zero-dependency execution,
fully compatible with both 'python -m unittest' and 'pytest'.

Tests all 8 Knowledge Representation & Reasoning (KR&R) components:
1. Knowledge Base
2. Forward Chaining
3. Backward Chaining
4. Answer Extraction
5. Semantic Network
6. Conceptual Graph
7. Resolution Refutation
8. Master FraudExpertSystem (Normal & Suspicious Transaction Evaluation)
"""

import sys
import unittest
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.ml.reasoning import (
    AnswerExtractor,
    BackwardChainingEngine,
    Clause,
    ConceptNode,
    ConceptualGraph,
    ExtractedAnswer,
    Fact,
    ForwardChainingEngine,
    ForwardChainingResult,
    FraudExpertSystem,
    KnowledgeBase,
    Literal,
    ProofNode,
    ResolutionRefutationEngine,
    ResolutionRefutationResult,
    Rule,
    SemanticNetwork,
    extract_facts_from_transaction,
)


class TestFraudExpertSystem(unittest.TestCase):
    """Test suite covering all 8 KR&R components and master expert system."""

    def setUp(self):
        self.expert_system = FraudExpertSystem()

        self.normal_transaction = {
            "transaction_id": "TX_NORM_101",
            "customer_id": "CUST_501",
            "transaction_amount": 42.50,
            "transaction_hour": 14,
            "is_night_transaction": 0,
            "customer_location_change": 0,
            "customer_device_change": 0,
            "customer_transactions_last_1h": 0,
            "customer_transactions_last_6h": 1,
            "customer_transactions_last_24h": 2,
            "amount_bucket": "low_medium",
            "amount_zscore_global": -0.4,
            "customer_amount_deviation": 0.1,
            "customer_average_amount": 45.0,
            "device_type": "mobile",
            "transaction_location": "California",
        }

        self.suspicious_takeover_transaction = {
            "transaction_id": "TX_FRAUD_909",
            "customer_id": "CUST_808",
            "transaction_amount": 7500.00,
            "transaction_hour": 3,
            "is_night_transaction": 1,
            "customer_location_change": 1,
            "customer_device_change": 1,
            "customer_transactions_last_1h": 4,
            "customer_transactions_last_6h": 7,
            "customer_transactions_last_24h": 12,
            "amount_bucket": "very_high",
            "amount_zscore_global": 3.8,
            "customer_amount_deviation": 4.5,
            "customer_average_amount": 50.0,
            "device_type": "POS",
            "transaction_location": "Texas",
        }

    # 1. Master Expert System: Normal Transaction Evaluation
    def test_expert_system_normal_transaction(self):
        result = self.expert_system.evaluate_transaction(self.normal_transaction)

        self.assertEqual(result["transaction_id"], "TX_NORM_101")
        self.assertFalse(result["is_fraud"])
        self.assertEqual(result["verdict"], "LEGITIMATE")
        self.assertEqual(result["risk_level"], "LOW")
        self.assertGreaterEqual(result["confidence"], 0.85)

        # Working memory assertions
        self.assertIn("legitimate", result["knowledge_base"]["final_working_memory"])
        self.assertNotIn("fraud", result["knowledge_base"]["final_working_memory"])

        # Backward chaining
        self.assertFalse(result["backward_chaining"]["proven"])

        # Resolution refutation
        self.assertFalse(result["resolution_refutation"]["refutation_successful"])

        # Semantic network
        self.assertFalse(result["semantic_network"]["has_fraud_path"])
        self.assertIn("CLEARED TRANSACTION", str(result["semantic_network"]["graph"]))

        # Conceptual graph
        linear = result["conceptual_graph"]["linear_notation"]
        self.assertIn("CLEARED_LEGITIMATE", linear)
        self.assertNotIn("FRAUD_ALERT", linear)

    # 2. Master Expert System: Suspicious Transaction Evaluation
    def test_expert_system_suspicious_transaction(self):
        result = self.expert_system.evaluate_transaction(self.suspicious_takeover_transaction)

        self.assertEqual(result["transaction_id"], "TX_FRAUD_909")
        self.assertTrue(result["is_fraud"])
        self.assertEqual(result["verdict"], "FRAUD")
        self.assertIn(result["risk_level"], ["HIGH", "CRITICAL"])
        self.assertGreaterEqual(result["confidence"], 0.90)

        # Rules fired
        triggered = result["forward_chaining"]["triggered_rules"]
        self.assertGreaterEqual(len(triggered), 1)

        # Backward chaining
        self.assertTrue(result["backward_chaining"]["proven"])
        self.assertIn("✓ [PROVEN]", result["backward_chaining"]["proof_tree_text"])

        # Resolution refutation
        self.assertTrue(result["resolution_refutation"]["refutation_successful"])
        self.assertIn("□", result["resolution_refutation"]["final_clause"])

        # Semantic network
        self.assertTrue(result["semantic_network"]["has_fraud_path"])
        self.assertGreaterEqual(len(result["semantic_network"]["risk_paths"]), 1)

        # Conceptual graph
        linear = result["conceptual_graph"]["linear_notation"]
        self.assertIn("FRAUD_ALERT", linear)
        self.assertIn("(triggers_verdict)", linear)

    def test_expert_system_rapid_drain_attack(self):
        """Test detection of rapid balance drain attack pattern (velocity + deviation at night)."""
        tx_drain = {
            "transaction_id": "TX_DRAIN_303",
            "customer_id": "CUST_777",
            "transaction_amount": 1800.00,
            "transaction_hour": 2,
            "is_night_transaction": 1,
            "customer_location_change": 0,
            "customer_device_change": 0,
            "customer_transactions_last_1h": 5,
            "customer_amount_deviation": 3.2,
            "customer_average_amount": 80.0,
            "device_type": "mobile",
            "transaction_location": "California",
        }
        result = self.expert_system.evaluate_transaction(tx_drain)
        self.assertTrue(result["is_fraud"])
        self.assertEqual(result["verdict"], "FRAUD")
        self.assertIn("R4_RapidDrainPattern", result["forward_chaining"]["triggered_rules"])
        self.assertIn("R5_RapidDrainEscalation", result["forward_chaining"]["triggered_rules"])

    def test_expert_system_partial_anomaly(self):
        """Test transaction with isolated high amount during regular day hours from regular device."""
        tx_isolated = {
            "transaction_id": "TX_PARTIAL_404",
            "customer_id": "CUST_111",
            "transaction_amount": 3500.00,
            "transaction_hour": 15,
            "is_night_transaction": 0,
            "customer_location_change": 0,
            "customer_device_change": 0,
            "customer_transactions_last_1h": 0,
            "customer_amount_deviation": 0.5,
            "amount_bucket": "high",
            "device_type": "desktop",
            "transaction_location": "New York",
        }
        result = self.expert_system.evaluate_transaction(tx_isolated)
        # Isolated high amount without compound anomalies does not trigger fraud
        self.assertFalse(result["is_fraud"])
        self.assertNotEqual(result["verdict"], "FRAUD")

    # 3. Knowledge Base Component
    def test_knowledge_base_rule_matching(self):
        kb = KnowledgeBase.create_default_fraud_kb()
        self.assertGreaterEqual(len(kb.rules), 10)

        test_facts = {Fact("high_amount"), Fact("night_transaction"), Fact("location_change")}
        matching = [r for r in kb.rules if r.matches(test_facts)]
        self.assertTrue(any(r.name == "R1_CompoundCriticalAnomaly" for r in matching))

    # 4. Forward Chaining Component
    def test_forward_chaining_priority(self):
        kb = KnowledgeBase()
        kb.add_rule(Rule(name="LowPriorityRule", antecedents=[Fact("A")], consequent=Fact("B"), priority=5))
        kb.add_rule(Rule(name="HighPriorityRule", antecedents=[Fact("A")], consequent=Fact("C"), priority=50))

        engine = ForwardChainingEngine(kb)
        result = engine.run(initial_facts={Fact("A")})

        self.assertEqual(len(result.reasoning_chain), 2)
        self.assertEqual(result.reasoning_chain[0].rule_name, "HighPriorityRule")
        self.assertEqual(result.reasoning_chain[1].rule_name, "LowPriorityRule")
        self.assertIn(Fact("B"), result.final_facts)
        self.assertIn(Fact("C"), result.final_facts)

    # 5. Backward Chaining Component
    def test_backward_chaining_cycle_prevention(self):
        kb = KnowledgeBase()
        kb.add_rule(Rule(name="R_Cycle1", antecedents=[Fact("A")], consequent=Fact("B")))
        kb.add_rule(Rule(name="R_Cycle2", antecedents=[Fact("B")], consequent=Fact("A")))

        engine = BackwardChainingEngine(kb)
        result = engine.prove_goal(goal=Fact("A"), initial_facts=set())

        self.assertFalse(result.proven)
        self.assertIn("Cycle detected", result.proof_tree.format_tree())

    # 6. Answer Extraction Component
    def test_answer_extraction_structure(self):
        kb = KnowledgeBase.create_default_fraud_kb()
        fc_engine = ForwardChainingEngine(kb)
        facts = extract_facts_from_transaction(self.normal_transaction)
        fc_result = fc_engine.run(facts)

        extracted = AnswerExtractor.extract_from_forward_chaining(fc_result, self.normal_transaction)
        self.assertIsInstance(extracted, ExtractedAnswer)
        self.assertEqual(extracted.conclusion, "LEGITIMATE")
        self.assertEqual(extracted.variable_bindings["amount"], 42.50)
        self.assertGreater(len(extracted.supporting_evidence), 0)
        self.assertIn("LEGITIMATE", extracted.natural_language_explanation)

    # 7. Semantic Network Component
    def test_semantic_network_graph_paths(self):
        net = SemanticNetwork()
        net.add_node("A", "Node A")
        net.add_node("B", "Node B")
        net.add_node("C", "Node C")
        net.add_edge("A", "B", "connects")
        net.add_edge("B", "C", "triggers")

        paths = net.find_paths("A", "C")
        self.assertEqual(len(paths), 1)
        self.assertEqual(paths[0], [("B", "connects"), ("C", "triggers")])

        d = net.to_dict()
        self.assertEqual(len(d["nodes"]), 3)
        self.assertEqual(len(d["edges"]), 2)

    # 8. Conceptual Graph Component
    def test_conceptual_graph_linear_form(self):
        cg = ConceptualGraph()
        c1 = cg.add_concept("AGENT", "Analyst_01")
        c2 = cg.add_concept("TRANSACTION", "TX_555")
        cg.add_relation("reviews", c1.id, c2.id)

        linear = cg.linear_form()
        self.assertEqual(linear, "[AGENT: Analyst_01] -> (reviews) -> [TRANSACTION: TX_555]")

    # 9. Resolution Refutation Component
    def test_resolution_refutation_simple_modus_ponens(self):
        kb = KnowledgeBase()
        kb.add_rule(Rule(name="R_MP", antecedents=[Fact("P")], consequent=Fact("Q")))

        engine = ResolutionRefutationEngine(kb)
        result = engine.prove_hypothesis(goal="Q", initial_facts={Fact("P")})

        self.assertTrue(result.refutation_successful)
        self.assertIn("□", result.final_clause)
        self.assertGreaterEqual(len(result.steps), 2)


if __name__ == "__main__":
    unittest.main()
