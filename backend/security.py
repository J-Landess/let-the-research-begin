"""
Security utilities for Wiseman Psychedelics API
Includes rate limiting, security headers, and CORS configuration
"""

import secrets
import string
from typing import List
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

def generate_secret_key(length: int = 32) -> str:
    """Generate a cryptographically secure secret key"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def get_cors_origins() -> List[str]:
    """Allowed browser origins. FRONTEND_URL may be a comma-separated list."""
    origins = [
        "https://www.wisemenresearch.org",
        "https://wisemenresearch.org",
        "https://wiseman.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://127.0.0.1:3000",
    ]
    extra = os.getenv("FRONTEND_URL", "")
    for origin in extra.split(","):
        origin = origin.strip().rstrip("/")
        if origin and origin not in origins:
            origins.append(origin)
    return origins

def setup_security_middleware(app: FastAPI) -> None:
    """Set up security middleware for the FastAPI app"""
    
    # Rate limiting
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Trusted host middleware (production only)
    if os.getenv("ENVIRONMENT") == "production":
        trusted_hosts = os.getenv("TRUSTED_HOSTS", "yourdomain.com,api.yourdomain.com").split(",")
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=trusted_hosts
        )

def add_security_headers(app: FastAPI) -> None:
    """Add security headers to all responses"""
    
    @app.middleware("http")
    async def add_security_headers_middleware(request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy (adjust as needed)
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # HSTS (HTTPS only in production)
        if os.getenv("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

def validate_environment() -> dict:
    """Validate required environment variables"""
    required_vars = [
        "SECRET_KEY",
        "ALGORITHM", 
        "DATABASE_URL"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # Validate SECRET_KEY strength
    secret_key = os.getenv("SECRET_KEY", "")
    if len(secret_key) < 32:
        raise ValueError("SECRET_KEY must be at least 32 characters long")
    
    return {
        "SECRET_KEY": secret_key,
        "ALGORITHM": os.getenv("ALGORITHM", "HS256"),
        "DATABASE_URL": os.getenv("DATABASE_URL"),
        "ENVIRONMENT": os.getenv("ENVIRONMENT", "development")
    }

# Rate limiting decorators for specific endpoints
def rate_limit_register():
    """Rate limit for registration endpoint"""
    return "5/minute"

def rate_limit_login():
    """Rate limit for login endpoint"""
    return "10/minute"

def rate_limit_general():
    """General rate limit for API endpoints"""
    return "100/hour"
