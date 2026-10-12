from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import UserRegister, UserLogin, OAuthLoginRequest, TokenResponse, UserOut
from app.services.auth_service import register_user, authenticate_user, authenticate_oauth, create_access_token, get_current_user
from app.database import db

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister):
    user = register_user(req.model_dump())
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin):
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/oauth", response_model=TokenResponse)
def oauth_login(req: OAuthLoginRequest):
    user = authenticate_oauth(req.provider, req.token, req.email, req.name, req.role)
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    # Return user safe profile
    u = current_user.copy()
    u.pop("password_hash", None)
    return u

@router.get("/demo-users")
def get_demo_users():
    """Provides seed user credentials for rapid switching across all 4 roles."""
    return [
        {"role": "User", "email": "user@mystic.io", "password": "SeekerPass2026!", "name": "Aria Solstice (Seeker)"},
        {"role": "Tarot Reader", "email": "reader@mystic.io", "password": "ReaderPass2026!", "name": "Madame Seraphina (Tarot Reader)"},
        {"role": "Spiritual Consultant", "email": "consultant@mystic.io", "password": "ConsultantPass2026!", "name": "Zachary Vance (Spiritual Consultant)"},
        {"role": "Administrator", "email": "admin@mystic.io", "password": "AdminPass2026!", "name": "Grand Sovereign Admin (Administrator)"}
    ]
