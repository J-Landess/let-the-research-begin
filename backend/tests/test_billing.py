from datetime import datetime, timezone

import stripe


def test_create_checkout_session(client, monkeypatch, user):
    def fake_get_current_user():
        return user

    from auth import get_current_user

    client.app.dependency_overrides[get_current_user] = fake_get_current_user

    def fake_create(**kwargs):
        assert kwargs["mode"] == "subscription"
        assert kwargs["metadata"]["user_id"] == str(user.id)
        return {"id": "cs_test_123", "url": "https://checkout.stripe.test/session/cs_test_123"}

    monkeypatch.setattr(stripe.checkout.Session, "create", fake_create)

    resp = client.post(
        "/billing/create-checkout-session",
        json={
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["session_id"] == "cs_test_123"
    assert data["checkout_url"].startswith("https://checkout.stripe.test/")


def test_stripe_webhook_checkout_session_completed_updates_user(client, monkeypatch, db_session, user):
    event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "customer": "cus_123",
                "subscription": "sub_123",
                "metadata": {"user_id": str(user.id)},
            }
        },
    }

    monkeypatch.setattr(stripe.Webhook, "construct_event", lambda payload, sig_header, secret: event)
    monkeypatch.setattr(
        stripe.Subscription,
        "retrieve",
        lambda sub_id: {"status": "active", "current_period_end": int(datetime(2030, 1, 1, tzinfo=timezone.utc).timestamp())},
    )

    resp = client.post("/webhooks/stripe", content=b"{}", headers={"Stripe-Signature": "sig_test"})
    assert resp.status_code == 200, resp.text

    refreshed = db_session.query(type(user)).filter(type(user).id == user.id).first()
    assert refreshed.stripe_customer_id == "cus_123"
    assert refreshed.subscription_status == "active"
    assert refreshed.is_subscribed is True
    assert refreshed.current_period_end is not None

