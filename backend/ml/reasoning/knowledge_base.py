"""
Knowledge Base and Fact Representation Module for FraudSentinel Expert System.

Implements facts, production rules, working memory, and deterministic translation
from engineered transaction features to formal domain predicates.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass(frozen=True)
class Fact:
    """Represents an atomic ground fact or assertion in working memory."""
    name: str
    arguments: Tuple[str, ...] = ()
    confidence: float = 1.0

    def __str__(self) -> str:
        if self.arguments:
            args_str = ", ".join(self.arguments)
            return f"{self.name}({args_str})"
        return self.name

    @classmethod
    def from_str(cls, fact_str: str) -> "Fact":
        fact_str = fact_str.strip()
        if "(" in fact_str and fact_str.endswith(")"):
            name, rest = fact_str[:-1].split("(", 1)
            args = tuple(a.strip() for a in rest.split(",") if a.strip())
            return cls(name=name.strip(), arguments=args)
        return cls(name=fact_str)


@dataclass
class Rule:
    """
    Production rule (Horn clause: Antecedents -> Consequent).
    """
    name: str
    antecedents: List[Fact]
    consequent: Fact
    priority: int = 10
    description: str = ""
    explanation_template: str = ""

    def matches(self, known_facts: Set[Fact]) -> bool:
        """Check if all rule antecedents are satisfied by the current facts."""
        return all(ant in known_facts for ant in self.antecedents)


class KnowledgeBase:
    """
    Repository for domain rules, facts, and working memory.
    """

    def __init__(self, rules: Optional[List[Rule]] = None):
        self.rules: List[Rule] = rules or []
        self.working_memory: Set[Fact] = set()

    def add_rule(self, rule: Rule):
        self.rules.append(rule)

    def add_fact(self, fact: Fact):
        self.working_memory.add(fact)

    def clear_working_memory(self):
        self.working_memory.clear()

    @classmethod
    def create_default_fraud_kb(cls) -> "KnowledgeBase":
        """
        Builds the standard banking fraud knowledge base based on FraudSentinel features.
        """
        kb = cls()

        # Rule 1: Compound Critical Risk (High Amount + Night Hours + Location Anomaly)
        kb.add_rule(
            Rule(
                name="R1_CompoundCriticalAnomaly",
                antecedents=[
                    Fact("high_amount"),
                    Fact("night_transaction"),
                    Fact("location_change"),
                ],
                consequent=Fact("fraud"),
                priority=90,
                description="High value transaction executed during nocturnal hours following location change.",
                explanation_template="Flagged as FRAUD: High amount occurred at night from an abnormal location.",
            )
        )

        # Rule 2: Account Takeover Pattern
        kb.add_rule(
            Rule(
                name="R2_AccountTakeoverPattern",
                antecedents=[
                    Fact("device_change"),
                    Fact("location_change"),
                    Fact("rapid_velocity"),
                ],
                consequent=Fact("suspicious_account_takeover"),
                priority=80,
                description="Simultaneous device and location shift accompanied by rapid transaction frequency.",
                explanation_template="Inferred SUSPICIOUS ACCOUNT TAKEOVER: Device switch combined with geographical change and rapid bursts.",
            )
        )

        # Rule 3: Account Takeover Escalation to Fraud
        kb.add_rule(
            Rule(
                name="R3_AccountTakeoverEscalation",
                antecedents=[
                    Fact("suspicious_account_takeover"),
                    Fact("high_amount"),
                ],
                consequent=Fact("fraud"),
                priority=85,
                description="High value transaction on an account displaying takeover indicators.",
                explanation_template="Flagged as FRAUD: Account takeover indicators paired with high financial exposure.",
            )
        )

        # Rule 4: Rapid Balance Drain Pattern
        kb.add_rule(
            Rule(
                name="R4_RapidDrainPattern",
                antecedents=[
                    Fact("rapid_velocity"),
                    Fact("max_amount_deviation"),
                ],
                consequent=Fact("rapid_drain_attack"),
                priority=75,
                description="Abnormally high transaction count with severe deviation from historical spending.",
                explanation_template="Inferred RAPID DRAIN ATTACK: High frequency velocity combined with excessive spending deviation.",
            )
        )

        # Rule 5: Drain Escalation to Fraud
        kb.add_rule(
            Rule(
                name="R5_RapidDrainEscalation",
                antecedents=[
                    Fact("rapid_drain_attack"),
                    Fact("night_transaction"),
                ],
                consequent=Fact("fraud"),
                priority=85,
                description="Rapid balance depletion occurring during non-business nocturnal hours.",
                explanation_template="Flagged as FRAUD: Rapid balance depletion attack executed during night hours.",
            )
        )

        # Rule 6: Unauthorized Access Device Shift
        kb.add_rule(
            Rule(
                name="R6_UnauthorizedDeviceShift",
                antecedents=[
                    Fact("device_change"),
                    Fact("max_amount_deviation"),
                    Fact("high_amount"),
                ],
                consequent=Fact("suspicious_unauthorized_access"),
                priority=70,
                description="New device submitting high outlier transactions.",
                explanation_template="Inferred SUSPICIOUS UNAUTHORIZED ACCESS: Unrecognized device with atypical transaction magnitude.",
            )
        )

        # Rule 7: Unauthorized Access Escalation
        kb.add_rule(
            Rule(
                name="R7_UnauthorizedAccessEscalation",
                antecedents=[
                    Fact("suspicious_unauthorized_access"),
                    Fact("rapid_velocity"),
                ],
                consequent=Fact("fraud"),
                priority=80,
                description="Repeated burst transactions following suspicious unauthorized device access.",
                explanation_template="Flagged as FRAUD: Burst velocity following unauthorized device access.",
            )
        )

        # Rule 8: Baseline Legitimacy Rule
        kb.add_rule(
            Rule(
                name="R8_StandardLegitimateBaseline",
                antecedents=[
                    Fact("regular_amount"),
                    Fact("regular_device"),
                    Fact("regular_location"),
                    Fact("regular_hours"),
                ],
                consequent=Fact("legitimate"),
                priority=20,
                description="Transaction fully conforms with regular customer historical profile across all dimensions.",
                explanation_template="Cleared as LEGITIMATE: Transaction matches standard amount, device, location, and daytime hours.",
            )
        )

        # Rule 9: Low Velocity Daytime Behavior
        kb.add_rule(
            Rule(
                name="R9_LowVelocityDaytime",
                antecedents=[
                    Fact("normal_velocity"),
                    Fact("regular_hours"),
                ],
                consequent=Fact("low_risk_behavior"),
                priority=15,
                description="Normal velocity rate during regular business hours.",
                explanation_template="Inferred LOW RISK BEHAVIOR: Standard transaction frequency during normal daylight hours.",
            )
        )

        # Rule 10: Low Risk Behavior Clearance
        kb.add_rule(
            Rule(
                name="R10_LowRiskClearance",
                antecedents=[
                    Fact("low_risk_behavior"),
                    Fact("regular_amount"),
                ],
                consequent=Fact("legitimate"),
                priority=25,
                description="Confirmed low risk pattern paired with typical spending amount.",
                explanation_template="Cleared as LEGITIMATE: Confirmed low risk activity pattern with normal amount.",
            )
        )

        return kb


def extract_facts_from_transaction(tx_data: Dict[str, Any]) -> Set[Fact]:
    """
    Deterministic mapper translating transaction records or engineered feature
    dictionaries into domain facts for the Knowledge Base.
    """
    facts: Set[Fact] = set()

    # 1. Amount analysis
    amount = float(tx_data.get("transaction_amount", 0.0))
    amount_bucket = str(tx_data.get("amount_bucket", "")).lower()
    zscore = float(tx_data.get("amount_zscore_global", 0.0))

    if amount >= 2500.0 or amount_bucket in ["high", "very_high"] or zscore >= 1.5:
        facts.add(Fact("high_amount"))
    else:
        facts.add(Fact("regular_amount"))

    # 2. Time analysis
    is_night = int(tx_data.get("is_night_transaction", 0))
    hour = tx_data.get("transaction_hour")
    if hour is not None:
        h = int(hour)
        if h < 6 or h >= 22:
            is_night = 1

    if is_night == 1:
        facts.add(Fact("night_transaction"))
    else:
        facts.add(Fact("regular_hours"))

    # 3. Location analysis
    loc_change = int(tx_data.get("customer_location_change", 0))
    if loc_change == 1:
        facts.add(Fact("location_change"))
    else:
        facts.add(Fact("regular_location"))

    # 4. Device analysis
    dev_change = int(tx_data.get("customer_device_change", 0))
    if dev_change == 1:
        facts.add(Fact("device_change"))
    else:
        facts.add(Fact("regular_device"))

    # 5. Velocity analysis
    tx_1h = int(tx_data.get("customer_transactions_last_1h", 0))
    tx_24h = int(tx_data.get("customer_transactions_last_24h", 0))
    prev_cnt = int(tx_data.get("previous_transactions_count", 0))

    if tx_1h >= 2 or tx_24h >= 6:
        facts.add(Fact("rapid_velocity"))
    else:
        facts.add(Fact("normal_velocity"))

    # 6. Customer amount deviation
    deviation = float(tx_data.get("customer_amount_deviation", 0.0))
    if deviation >= 2.0 or (tx_data.get("customer_average_amount") and amount > 3.0 * float(tx_data.get("customer_average_amount", 1.0))):
        facts.add(Fact("max_amount_deviation"))

    return facts
