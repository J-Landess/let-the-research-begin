from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Protocol


@dataclass(frozen=True)
class CheckoutSession:
    id: str
    url: str


@dataclass(frozen=True)
class SubscriptionState:
    status: Optional[str]
    current_period_end: Optional[datetime]
    provider_customer_id: Optional[str]


class BillingProvider(Protocol):
    name: str

    def create_checkout_session(
        self,
        *,
        user_id: int,
        user_email: str,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSession: ...

    def verify_and_parse_webhook(
        self,
        *,
        payload: bytes,
        signature: Optional[str],
    ) -> dict: ...

    def subscription_state_from_event(
        self,
        *,
        event: dict,
    ) -> tuple[Optional[str], Optional[SubscriptionState]]: ...

