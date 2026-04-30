from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from billing.provider import BillingProvider, CheckoutSession, SubscriptionState
from models import User


class BillingService:
    def __init__(self, *, provider: BillingProvider) -> None:
        self._provider = provider

    def create_checkout_session(
        self,
        *,
        user: User,
        success_url: str,
        cancel_url: str,
    ) -> CheckoutSession:
        return self._provider.create_checkout_session(
            user_id=user.id,
            user_email=user.email,
            success_url=success_url,
            cancel_url=cancel_url,
        )

    def handle_webhook(
        self,
        *,
        db: Session,
        payload: bytes,
        signature: Optional[str],
    ) -> dict:
        event = self._provider.verify_and_parse_webhook(payload=payload, signature=signature)
        user_id_str, sub_state = self._provider.subscription_state_from_event(event=event)
        if sub_state is None:
            return {"received": True}

        user = _resolve_user(db=db, user_id_str=user_id_str, customer_id=sub_state.provider_customer_id)
        if user is None:
            return {"received": True}

        _apply_subscription_state(user=user, sub_state=sub_state)
        db.add(user)
        db.commit()
        return {"received": True}


def _resolve_user(*, db: Session, user_id_str: Optional[str], customer_id: Optional[str]) -> Optional[User]:
    if user_id_str:
        try:
            user_id = int(user_id_str)
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        except Exception:
            pass

    if customer_id:
        return db.query(User).filter(User.stripe_customer_id == customer_id).first()

    return None


def _apply_subscription_state(*, user: User, sub_state: SubscriptionState) -> None:
    user.subscription_status = sub_state.status
    user.stripe_customer_id = sub_state.provider_customer_id
    user.current_period_end = sub_state.current_period_end
    user.is_subscribed = bool(sub_state.status in {"active", "trialing"})

