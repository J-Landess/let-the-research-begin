from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

import stripe

from billing.provider import BillingProvider, CheckoutSession, SubscriptionState


class StripeProvider(BillingProvider):
    name = "stripe"

    def __init__(
        self,
        *,
        secret_key: str,
        webhook_secret: str,
        price_id: str,
    ) -> None:
        self._secret_key = secret_key
        self._webhook_secret = webhook_secret
        self._price_id = price_id
        stripe.api_key = secret_key

    @classmethod
    def from_env(cls) -> "StripeProvider":
        secret_key = os.environ.get("STRIPE_SECRET_KEY")
        webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
        price_id = os.environ.get("STRIPE_PRICE_ID")
        missing = [k for k, v in [
            ("STRIPE_SECRET_KEY", secret_key),
            ("STRIPE_WEBHOOK_SECRET", webhook_secret),
            ("STRIPE_PRICE_ID", price_id),
        ] if not v]
        if missing:
            raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
        return cls(secret_key=secret_key, webhook_secret=webhook_secret, price_id=price_id)  # type: ignore[arg-type]

    def create_checkout_session(
        self,
        *,
        user_id: int,
        user_email: str,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSession:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": self._price_id, "quantity": 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user_email,
            client_reference_id=str(user_id),
            metadata={"user_id": str(user_id)},
            allow_promotion_codes=True,
        )
        return CheckoutSession(id=session["id"], url=session["url"])

    def verify_and_parse_webhook(
        self,
        *,
        payload: bytes,
        signature: Optional[str],
    ) -> dict:
        if not signature:
            raise ValueError("Missing Stripe-Signature header")
        return stripe.Webhook.construct_event(payload=payload, sig_header=signature, secret=self._webhook_secret)

    def subscription_state_from_event(
        self,
        *,
        event: dict,
    ) -> tuple[Optional[str], Optional[SubscriptionState]]:
        event_type = event.get("type")
        data_obj = (((event.get("data") or {}).get("object")) or {})

        if event_type == "checkout.session.completed":
            customer_id = data_obj.get("customer")
            user_id = (data_obj.get("metadata") or {}).get("user_id") or data_obj.get("client_reference_id")
            subscription_id = data_obj.get("subscription")

            sub_state: Optional[SubscriptionState] = None
            if subscription_id:
                sub = stripe.Subscription.retrieve(subscription_id)
                sub_state = SubscriptionState(
                    status=sub.get("status"),
                    current_period_end=_unix_to_dt(sub.get("current_period_end")),
                    provider_customer_id=customer_id,
                )
            else:
                sub_state = SubscriptionState(
                    status=None,
                    current_period_end=None,
                    provider_customer_id=customer_id,
                )
            return _as_str(user_id), sub_state

        if event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
            customer_id = data_obj.get("customer")
            sub_state = SubscriptionState(
                status=data_obj.get("status"),
                current_period_end=_unix_to_dt(data_obj.get("current_period_end")),
                provider_customer_id=customer_id,
            )
            return None, sub_state

        return None, None


def _as_str(v: object) -> Optional[str]:
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def _unix_to_dt(ts: object) -> Optional[datetime]:
    if ts is None:
        return None
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc)
    except Exception:
        return None

