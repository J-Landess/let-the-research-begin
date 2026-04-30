from __future__ import annotations

from pydantic import BaseModel, AnyHttpUrl
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from billing.service import BillingService
from billing.stripe_provider import StripeProvider
from database import get_db
from models import User


router = APIRouter(prefix="/billing", tags=["billing"])


class CreateCheckoutSessionRequest(BaseModel):
    success_url: AnyHttpUrl
    cancel_url: AnyHttpUrl


class CreateCheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str


def get_billing_service() -> BillingService:
    provider = StripeProvider.from_env()
    return BillingService(provider=provider)


@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
def create_checkout_session(
    body: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    _: Session = Depends(get_db),
    svc: BillingService = Depends(get_billing_service),
):
    try:
        session = svc.create_checkout_session(
            user=current_user,
            success_url=str(body.success_url),
            cancel_url=str(body.cancel_url),
        )
        return CreateCheckoutSessionResponse(session_id=session.id, checkout_url=session.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

