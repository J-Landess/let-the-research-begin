import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("wiseman")

FIELD_LABELS = {
    "name": "name",
    "age": "age",
    "email": "email",
    "password": "password",
    "phone": "phone number",
    "street": "street address",
    "city": "city",
    "state": "state",
    "zip": "ZIP code",
    "country": "country",
}


def _field_from_loc(loc: Any) -> str:
    if not loc:
        return "this field"
    parts = [part for part in loc if part not in ("body", "query", "path")]
    key = str(parts[-1]) if parts else str(loc[-1])
    return FIELD_LABELS.get(key, key.replace("_", " "))


def format_validation_errors(errors: list) -> str:
    messages = []
    for err in errors:
        field = _field_from_loc(err.get("loc", ()))
        err_type = err.get("type", "")
        msg = (err.get("msg") or "is invalid").strip()
        ctx_reason = (err.get("ctx") or {}).get("reason")

        if field == "email" or "email" in err_type:
            extra = f" {ctx_reason}" if ctx_reason else ""
            messages.append(
                f"Please enter a valid email address (accounts use email, not a username).{extra}"
            )
        elif field == "age" or "int" in err_type:
            messages.append("Age must be a whole number between 18 and 120.")
        elif field == "password":
            if "max" in err_type or "72" in msg:
                messages.append("Password cannot be longer than 72 characters.")
            elif "min" in err_type or "6" in msg:
                messages.append("Password must be at least 6 characters long.")
            else:
                messages.append(f"Password is invalid: {msg}")
        elif field == "name":
            messages.append("Please enter your name.")
        elif "missing" in err_type:
            messages.append(f"{field.capitalize()} is required.")
        else:
            cleaned = msg[0].lower() + msg[1:] if msg else "is invalid"
            messages.append(f"{field.capitalize()} {cleaned}.")

    # Preserve order while dropping duplicates
    unique = list(dict.fromkeys(messages))
    return " ".join(unique) if unique else (
        "Some of the information you entered isn't valid. "
        "Check your name, email, age (18–120), and password (6–72 characters)."
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": format_validation_errors(exc.errors())},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        detail = exc.detail
        if not isinstance(detail, str):
            detail = str(detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": detail},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        if isinstance(exc, HTTPException):
            return await http_exception_handler(request, exc)

        logger.exception("Unhandled server error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={
                "detail": (
                    "Something went wrong on the server while processing your request. "
                    "Please wait a moment and try again. If this keeps happening, the API "
                    "may be restarting — retry in about 30 seconds."
                )
            },
        )
