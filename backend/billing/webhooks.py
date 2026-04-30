from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from billing.service import BillingService
from billing.stripe_provider import StripeProvider
from database import get_db


router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def get_billing_service() -> BillingService:
    provider = StripeProvider.from_env()
    return BillingService(provider=provider)


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(default=None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
    svc: BillingService = Depends(get_billing_service),
):
    payload = await request.body()
    return svc.handle_webhook(db=db, payload=payload, signature=stripe_signature)

