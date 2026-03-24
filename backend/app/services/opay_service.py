import logging

import httpx

from app.settings import get_settings

logger = logging.getLogger(__name__)


async def create_checkout_session(
    user_email: str,
    user_name: str,
    amount_usd: float,
    success_url: str,
    cancel_url: str,
) -> dict:
    settings = get_settings()

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                f"{settings.OPAY_BASE_URL}/api/v1/payments",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.OPAY_SECRET_KEY}",
                },
                json={
                    "amount": int(amount_usd * 100),
                    "currency": "usd",
                    "customer": {"email": user_email, "name": user_name},
                    "success_url": success_url,
                    "cancel_url": cancel_url,
                },
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error(f"OPay HTTP error: {e.response.status_code} {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"OPay request error: {e}")
            raise

    data = resp.json()
    return {
        "checkout_url": data["checkout_url"],
        "session_id": data.get("session_id") or data.get("id"),
    }
