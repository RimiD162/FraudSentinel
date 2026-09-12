"""
Bayesian Probabilistic Reasoning Module for FraudSentinel.

Implements a Directed Acyclic Graph (DAG) Bayesian Belief Network (BBN)
with exact inference via full joint enumeration / variable elimination,
evidence mapping from engineered transaction features, factor attribution,
and natural language probabilistic explanations.
"""

from dataclasses import dataclass, field
import itertools
import math
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class DiscreteVariable:
    """Represents a discrete random variable in a Bayesian Network."""
    name: str
    values: Tuple[int, ...] = (0, 1)
    parents: List[str] = field(default_factory=list)
    description: str = ""


@dataclass
class CPT:
    """
    Conditional Probability Table for a variable X given its parents Parents(X).
    
    Structure:
    table: Dict[Tuple[int, ...], Dict[int, float]]
    Key: tuple of parent values in the order of variable.parents
         (use empty tuple () for parentless root nodes)
    Value: mapping from variable value (e.g. 0 or 1) to probability P(X=val | parents)
    """
    variable_name: str
    parent_names: List[str]
    table: Dict[Tuple[int, ...], Dict[int, float]]

    def validate(self):
        """Verify that all probability rows sum to 1.0 within floating point tolerance."""
        for parent_vals, prob_dist in self.table.items():
            total = sum(prob_dist.values())
            if not math.isclose(total, 1.0, abs_tol=1e-5):
                raise ValueError(
                    f"CPT for '{self.variable_name}' with parent values {parent_vals} "
                    f"sums to {total} != 1.0"
                )

    def get_prob(self, val: int, parent_assignment: Dict[str, int]) -> float:
        """Retrieve P(X = val | Parents(X) = parent_assignment)."""
        key = tuple(parent_assignment[p] for p in self.parent_names)
        if key not in self.table:
            raise KeyError(
                f"Missing CPT entry for '{self.variable_name}' with parent assignment {key}"
            )
        return self.table[key].get(val, 0.0)


@dataclass
class FactorContribution:
    """Quantifies how much an observed evidence variable impacted the query probability."""
    variable: str
    observed_value: int
    probability_with_evidence: float
    probability_without_evidence: float
    risk_delta: float
    relative_impact_percent: float
    description: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "variable": self.variable,
            "observed_value": self.observed_value,
            "probability_with_evidence": round(self.probability_with_evidence, 4),
            "probability_without_evidence": round(self.probability_without_evidence, 4),
            "risk_delta": round(self.risk_delta, 4),
            "relative_impact_percent": round(self.relative_impact_percent, 2),
            "description": self.description,
        }


@dataclass
class BayesianInferenceResult:
    """Structured result of Bayesian probabilistic inference on a transaction."""
    query_variable: str
    fraud_probability: float
    prior_probability: float
    risk_assessment: str
    posterior_probabilities: Dict[str, float]
    observed_evidence: Dict[str, int]
    contributing_variables: List[FactorContribution]
    explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query_variable": self.query_variable,
            "fraud_probability": round(self.fraud_probability, 4),
            "prior_probability": round(self.prior_probability, 4),
            "risk_assessment": self.risk_assessment,
            "posterior_probabilities": {
                k: round(v, 4) for k, v in self.posterior_probabilities.items()
            },
            "observed_evidence": self.observed_evidence,
            "contributing_variables": [c.to_dict() for c in self.contributing_variables],
            "explanation": self.explanation,
        }


class BayesianNetwork:
    """
    General discrete Bayesian Belief Network supporting exact inference
    via joint distribution enumeration and factor marginalization.
    """

    def __init__(self):
        self.variables: Dict[str, DiscreteVariable] = {}
        self.cpts: Dict[str, CPT] = {}

    def add_variable(
        self,
        name: str,
        parents: Optional[List[str]] = None,
        values: Tuple[int, ...] = (0, 1),
        description: str = "",
        cpt_table: Optional[Dict[Tuple[int, ...], Dict[int, float]]] = None,
    ):
        parents = parents or []
        for p in parents:
            if p not in self.variables:
                raise ValueError(f"Parent '{p}' must be added before child '{name}'.")

        var = DiscreteVariable(
            name=name,
            values=values,
            parents=parents,
            description=description,
        )
        self.variables[name] = var

        if cpt_table is not None:
            cpt = CPT(variable_name=name, parent_names=parents, table=cpt_table)
            cpt.validate()
            self.cpts[name] = cpt

    def set_cpt(self, name: str, cpt_table: Dict[Tuple[int, ...], Dict[int, float]]):
        if name not in self.variables:
            raise KeyError(f"Variable '{name}' not found in network.")
        cpt = CPT(
            variable_name=name,
            parent_names=self.variables[name].parents,
            table=cpt_table,
        )
        cpt.validate()
        self.cpts[name] = cpt

    def topological_sort(self) -> List[str]:
        """Compute topological ordering of nodes (verifying DAG acyclicity)."""
        in_degree = {v: len(self.variables[v].parents) for v in self.variables}
        children: Dict[str, List[str]] = {v: [] for v in self.variables}
        for v, var in self.variables.items():
            for p in var.parents:
                children[p].append(v)

        queue = [v for v, deg in in_degree.items() if deg == 0]
        order = []

        while queue:
            node = queue.pop(0)
            order.append(node)
            for child in children[node]:
                in_degree[child] -= 1
                if in_degree[child] == 0:
                    queue.append(child)

        if len(order) != len(self.variables):
            raise ValueError("Cycle detected in Bayesian Network graph structure.")

        return order

    def joint_probability(self, assignment: Dict[str, int]) -> float:
        """
        Compute joint probability P(X1=x1, ..., Xn=xn) = PROD_i P(Xi=xi | Parents(Xi)).
        """
        prob = 1.0
        for name, var in self.variables.items():
            val = assignment[name]
            p_val = self.cpts[name].get_prob(val, assignment)
            prob *= p_val
        return prob

    def query_distribution(
        self,
        query_var: str,
        evidence: Dict[str, int],
    ) -> Dict[int, float]:
        """
        Exact inference via enumeration over unobserved hidden variables.
        
        P(Q = q | E = e) = alpha * SUM_{Y} P(Q = q, E = e, Y)
        where Y = Variables - {Q} - E
        """
        if query_var not in self.variables:
            raise KeyError(f"Query variable '{query_var}' not in network.")

        hidden_vars = [
            v for v in self.variables if v != query_var and v not in evidence
        ]

        query_values = self.variables[query_var].values
        unnormalized_probs: Dict[int, float] = {q: 0.0 for q in query_values}

        # Iterate over all Cartesian combinations of hidden variable values
        hidden_value_domains = [self.variables[v].values for v in hidden_vars]

        for hidden_vals in itertools.product(*hidden_value_domains):
            current_assignment = dict(evidence)
            for v, val in zip(hidden_vars, hidden_vals):
                current_assignment[v] = val

            for q in query_values:
                full_assignment = dict(current_assignment)
                full_assignment[query_var] = q
                p_joint = self.joint_probability(full_assignment)
                unnormalized_probs[q] += p_joint

        total_evidence_prob = sum(unnormalized_probs.values())
        if total_evidence_prob == 0.0:
            # Degenerate zero-probability evidence configuration
            uniform = 1.0 / len(query_values)
            return {q: uniform for q in query_values}

        # Normalize by alpha = 1 / P(E)
        return {q: p / total_evidence_prob for q, p in unnormalized_probs.items()}

    def infer_all_posteriors(
        self,
        evidence: Dict[str, int],
    ) -> Dict[str, float]:
        """Compute P(V=1 | evidence) for all unobserved binary variables in the network."""
        posteriors: Dict[str, float] = {}
        for var_name, var in self.variables.items():
            if var_name in evidence:
                posteriors[var_name] = float(evidence[var_name])
            else:
                dist = self.query_distribution(query_var=var_name, evidence=evidence)
                posteriors[var_name] = dist.get(1, 0.0)
        return posteriors


class FraudBayesianNetwork:
    """
    Standard Banking Fraud Bayesian Belief Network for FraudSentinel.
    
    Variables:
    1. Fraud (Target Root, Prior = 0.015)
    2. AccountTakeover (Latent Intermediate, Child of Fraud)
    3. DeviceChange (Observable, Child of AccountTakeover)
    4. LocationChange (Observable, Child of AccountTakeover)
    5. HighAmount (Observable, Child of Fraud)
    6. AmountDeviation (Observable, Child of Fraud, HighAmount)
    7. RapidVelocity (Observable, Child of Fraud)
    8. NightTransaction (Observable, Child of Fraud)
    """

    VARIABLE_DESCRIPTIONS = {
        "HighAmount": "Transaction amount exceeds regular customer profile threshold (>= $2,500).",
        "NightTransaction": "Transaction occurred during nocturnal high-risk window (22:00-06:00).",
        "DeviceChange": "Transaction initiated from unrecognized or new hardware fingerprint.",
        "LocationChange": "Transaction initiated from geographical location anomaly or foreign IP.",
        "RapidVelocity": "Burst transaction frequency exceeding velocity threshold within 1h.",
        "AmountDeviation": "Transaction amount significantly deviates (>2x) from historical mean.",
    }

    def __init__(self, network: Optional[BayesianNetwork] = None):
        self.bn = network or self.create_default_network()

    @classmethod
    def create_default_network(cls) -> BayesianNetwork:
        bn = BayesianNetwork()

        # 1. Fraud (Prior: 1.5% fraud rate in dataset)
        bn.add_variable(
            name="Fraud",
            parents=[],
            values=(0, 1),
            description="True transaction state (1=Fraudulent, 0=Legitimate)",
            cpt_table={
                (): {0: 0.985, 1: 0.015}
            },
        )

        # 2. AccountTakeover (Latent intermediate syndrome)
        bn.add_variable(
            name="AccountTakeover",
            parents=["Fraud"],
            values=(0, 1),
            description="Compromised account credential or session takeover",
            cpt_table={
                (0,): {0: 0.98, 1: 0.02},  # P(ATO | Fraud=0) = 2%
                (1,): {0: 0.40, 1: 0.60},  # P(ATO | Fraud=1) = 60%
            },
        )

        # 3. DeviceChange (Conditioned on AccountTakeover)
        bn.add_variable(
            name="DeviceChange",
            parents=["AccountTakeover"],
            values=(0, 1),
            description="Hardware identifier or browser user-agent change",
            cpt_table={
                (0,): {0: 0.95, 1: 0.05},  # P(DevChange | ATO=0) = 5%
                (1,): {0: 0.15, 1: 0.85},  # P(DevChange | ATO=1) = 85%
            },
        )

        # 4. LocationChange (Conditioned on AccountTakeover)
        bn.add_variable(
            name="LocationChange",
            parents=["AccountTakeover"],
            values=(0, 1),
            description="Geographic region, country, or IP subnet shift",
            cpt_table={
                (0,): {0: 0.96, 1: 0.04},  # P(LocChange | ATO=0) = 4%
                (1,): {0: 0.25, 1: 0.75},  # P(LocChange | ATO=1) = 75%
            },
        )

        # 5. HighAmount (Conditioned directly on Fraud)
        bn.add_variable(
            name="HighAmount",
            parents=["Fraud"],
            values=(0, 1),
            description="Nominal transaction value in upper quartile",
            cpt_table={
                (0,): {0: 0.90, 1: 0.10},  # P(HighAmount | Fraud=0) = 10%
                (1,): {0: 0.30, 1: 0.70},  # P(HighAmount | Fraud=1) = 70%
            },
        )

        # 6. AmountDeviation (Conditioned on Fraud and HighAmount)
        bn.add_variable(
            name="AmountDeviation",
            parents=["Fraud", "HighAmount"],
            values=(0, 1),
            description="Magnitude relative to user's personalized spending history",
            cpt_table={
                # (Fraud, HighAmount)
                (0, 0): {0: 0.98, 1: 0.02},
                (0, 1): {0: 0.80, 1: 0.20},
                (1, 0): {0: 0.60, 1: 0.40},
                (1, 1): {0: 0.15, 1: 0.85},
            },
        )

        # 7. RapidVelocity (Conditioned directly on Fraud)
        bn.add_variable(
            name="RapidVelocity",
            parents=["Fraud"],
            values=(0, 1),
            description="High transaction count within short sliding time window",
            cpt_table={
                (0,): {0: 0.95, 1: 0.05},  # P(Velocity | Fraud=0) = 5%
                (1,): {0: 0.35, 1: 0.65},  # P(Velocity | Fraud=1) = 65%
            },
        )

        # 8. NightTransaction (Conditioned on Fraud)
        bn.add_variable(
            name="NightTransaction",
            parents=["Fraud"],
            values=(0, 1),
            description="Off-peak nocturnal transaction execution",
            cpt_table={
                (0,): {0: 0.85, 1: 0.15},  # P(Night | Fraud=0) = 15%
                (1,): {0: 0.55, 1: 0.45},  # P(Night | Fraud=1) = 45%
            },
        )

        return bn

    def evaluate_transaction(self, tx_data: Dict[str, Any]) -> BayesianInferenceResult:
        """
        Extract evidence from transaction data and execute full Bayesian inference.
        """
        evidence = extract_evidence_from_transaction(tx_data)
        return self.infer(evidence=evidence)

    def infer(self, evidence: Dict[str, int]) -> BayesianInferenceResult:
        """
        Perform exact inference on P(Fraud=1 | evidence), compute factor contributions,
        and generate an explainable diagnostic narrative.
        """
        # Prior probability P(Fraud=1)
        prior_dist = self.bn.query_distribution("Fraud", evidence={})
        prior_p = prior_dist[1]

        # Posterior probability P(Fraud=1 | evidence)
        posterior_dist = self.bn.query_distribution("Fraud", evidence=evidence)
        fraud_p = posterior_dist[1]

        # Posteriors across all network variables
        all_posteriors = self.bn.infer_all_posteriors(evidence=evidence)

        # Factor attribution: evaluate delta in fraud probability if evidence is removed
        contributions: List[FactorContribution] = []
        for var_name, observed_val in evidence.items():
            counterfactual_evidence = {k: v for k, v in evidence.items() if k != var_name}
            cf_dist = self.bn.query_distribution("Fraud", evidence=counterfactual_evidence)
            cf_p = cf_dist[1]
            delta = fraud_p - cf_p
            rel_impact = (delta / max(fraud_p, 1e-4)) * 100.0 if fraud_p > 0 else 0.0

            contributions.append(
                FactorContribution(
                    variable=var_name,
                    observed_value=observed_val,
                    probability_with_evidence=fraud_p,
                    probability_without_evidence=cf_p,
                    risk_delta=delta,
                    relative_impact_percent=rel_impact,
                    description=self.VARIABLE_DESCRIPTIONS.get(var_name, ""),
                )
            )

        # Sort factors by highest positive delta (greatest drivers of fraud risk)
        contributions.sort(key=lambda c: c.risk_delta, reverse=True)

        # Calibrate categorical risk assessment
        if fraud_p >= 0.85:
            risk_assessment = "CRITICAL"
        elif fraud_p >= 0.50:
            risk_assessment = "HIGH"
        elif fraud_p >= 0.15:
            risk_assessment = "MODERATE"
        elif fraud_p >= 0.03:
            risk_assessment = "ELEVATED"
        else:
            risk_assessment = "MINIMAL"

        # Generate natural language narrative
        explanation = self._generate_explanation(
            prior_p=prior_p,
            fraud_p=fraud_p,
            risk_assessment=risk_assessment,
            evidence=evidence,
            contributions=contributions,
            ato_p=all_posteriors.get("AccountTakeover", 0.0),
        )

        return BayesianInferenceResult(
            query_variable="Fraud",
            fraud_probability=fraud_p,
            prior_probability=prior_p,
            risk_assessment=risk_assessment,
            posterior_probabilities=all_posteriors,
            observed_evidence=evidence,
            contributing_variables=contributions,
            explanation=explanation,
        )

    def _generate_explanation(
        self,
        prior_p: float,
        fraud_p: float,
        risk_assessment: str,
        evidence: Dict[str, int],
        contributions: List[FactorContribution],
        ato_p: float,
    ) -> str:
        """Synthesize explainable Bayesian diagnostic summary."""
        active_evidence = [k for k, v in evidence.items() if v == 1]
        prior_pct = f"{prior_p * 100:.1f}%"
        post_pct = f"{fraud_p * 100:.1f}%"
        ato_pct = f"{ato_p * 100:.1f}%"

        if not active_evidence:
            return (
                f"Bayesian risk is MINIMAL: Posterior fraud probability is {post_pct} "
                f"(baseline prior: {prior_pct}). All observed signals conform strictly "
                f"to expected normal behavior. Latent Account Takeover probability is {ato_pct}."
            )

        top_drivers = [c for c in contributions if c.observed_value == 1 and c.risk_delta > 0]
        if not top_drivers:
            return (
                f"Bayesian risk is {risk_assessment}: Posterior fraud probability is {post_pct} "
                f"(prior: {prior_pct}). Observed signals slightly modify belief without "
                f"indicating significant fraud anomalies."
            )

        driver_phrases = [
            f"{c.variable} (+{c.risk_delta * 100:.1f}% shift)"
            for c in top_drivers[:3]
        ]
        drivers_str = ", ".join(driver_phrases)

        verdict_str = (
            f"Bayesian Belief Network evaluated transaction at {risk_assessment} risk: "
            f"Posterior fraud probability shifted from baseline prior of {prior_pct} "
            f"to {post_pct}. Inferred latent Account Takeover risk is {ato_pct}. "
            f"Primary risk drivers: {drivers_str}."
        )
        return verdict_str


def extract_evidence_from_transaction(tx_data: Dict[str, Any]) -> Dict[str, int]:
    """
    Deterministically maps transaction features into discrete binary evidence
    for the Bayesian Belief Network.
    """
    evidence: Dict[str, int] = {}

    # 1. HighAmount
    amount = float(tx_data.get("transaction_amount", 0.0))
    amount_bucket = str(tx_data.get("amount_bucket", "")).lower()
    zscore = float(tx_data.get("amount_zscore_global", 0.0))
    if amount >= 2500.0 or amount_bucket in ["high", "very_high"] or zscore >= 1.5:
        evidence["HighAmount"] = 1
    else:
        evidence["HighAmount"] = 0

    # 2. NightTransaction
    is_night = int(tx_data.get("is_night_transaction", 0))
    hour = tx_data.get("transaction_hour")
    if hour is not None:
        h = int(hour)
        if h < 6 or h >= 22:
            is_night = 1
    evidence["NightTransaction"] = 1 if is_night == 1 else 0

    # 3. DeviceChange
    evidence["DeviceChange"] = 1 if int(tx_data.get("customer_device_change", 0)) == 1 else 0

    # 4. LocationChange
    evidence["LocationChange"] = 1 if int(tx_data.get("customer_location_change", 0)) == 1 else 0

    # 5. RapidVelocity
    tx_1h = int(tx_data.get("customer_transactions_last_1h", 0))
    tx_24h = int(tx_data.get("customer_transactions_last_24h", 0))
    evidence["RapidVelocity"] = 1 if (tx_1h >= 2 or tx_24h >= 6) else 0

    # 6. AmountDeviation
    deviation = float(tx_data.get("customer_amount_deviation", 0.0))
    avg_amt = float(tx_data.get("customer_average_amount", 0.0))
    if deviation >= 2.0 or (avg_amt > 0 and amount > 3.0 * avg_amt):
        evidence["AmountDeviation"] = 1
    else:
        evidence["AmountDeviation"] = 0

    return evidence
