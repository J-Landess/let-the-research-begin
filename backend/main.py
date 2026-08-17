from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserLogin, UserResponse, Token
from auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_admin_user
from models import User
import os
from dotenv import load_dotenv
from billing.routes import router as billing_router
from billing.webhooks import router as webhooks_router

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Wiseman Psychedelics API", 
    version="1.0.0",
    description="Consciousness research and psychedelic education platform API"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow exact deployed frontend and local dev
    allow_origins=[
        "https://wiseman.vercel.app",
        "http://localhost:3000",
    ],
    # Also allow any vercel.app subdomain (for previews)
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(billing_router)
app.include_router(webhooks_router)

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        age=user.age,
        email=user.email,
        hashed_password=hashed_password,
        phone=user.phone,
        street=user.street,
        city=user.city,
        state=user.state,
        zip=user.zip,
        country=user.country,
        is_subscribed=user.is_subscribed
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Authenticate user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/newsletter")
def get_newsletter_subscribers(current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    subscribers = db.query(User).filter(User.is_subscribed == True).all()
    return subscribers

@app.get("/")
def read_root():
    return {"message": "Welcome to Wiseman Psychedelics API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
