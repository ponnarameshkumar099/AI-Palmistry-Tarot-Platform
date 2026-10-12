import uuid
import datetime
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, ROLES
from app.database import db, save_db

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def register_user(user_data: dict) -> dict:
    # Check if user already exists
    for u in db["users"].values():
        if u["email"].lower() == user_data["email"].lower():
            raise HTTPException(status_code=400, detail="User with this email already exists")
    
    role = user_data.get("role", "User")
    if role not in ROLES:
        role = "User"
    
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "name": user_data["name"],
        "email": user_data["email"].lower(),
        "password_hash": get_password_hash(user_data["password"]),
        "role": role,
        "age_group": user_data.get("age_group", "26-35"),
        "interests": user_data.get("interests", ["Tarot", "Palmistry"]),
        "spiritual_goals": user_data.get("spiritual_goals", ["Self-Discovery"]),
        "reading_preferences": user_data.get("reading_preferences", {"frequency": "Weekly", "depth": "Deep Spiritual", "focus": "Life Path"}),
        "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={user_data['name']}",
        "bio": "Spiritual seeker seeking universal wisdom.",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "readings_count": 0
    }
    db["users"][user_id] = new_user
    save_db()
    return new_user

def authenticate_user(email: str, password: str) -> Optional[dict]:
    for u in db["users"].values():
        if u["email"].lower() == email.lower():
            if verify_password(password, u["password_hash"]):
                return u
    return None

def authenticate_oauth(provider: str, token: str, email: Optional[str], name: Optional[str], role: Optional[str]) -> dict:
    # OAuth simulation - finds existing or registers new user
    target_email = email.lower() if email else f"oauth_{provider}_{uuid.uuid4().hex[:6]}@mystic.io"
    for u in db["users"].values():
        if u["email"].lower() == target_email:
            return u
    
    # Create new oauth user
    user_id = f"usr-oauth-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "name": name or f"Seeker ({provider.title()})",
        "email": target_email,
        "password_hash": get_password_hash("oauth_login_secret"),
        "role": role if role in ROLES else "User",
        "age_group": "26-35",
        "interests": ["Tarot", "Palmistry", "Esoteric AI"],
        "spiritual_goals": ["Discover Soul Purpose"],
        "reading_preferences": {"frequency": "Weekly", "depth": "Deep Spiritual", "focus": "Life Path"},
        "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={name or 'Seeker'}",
        "bio": f"Joined via {provider.title()} authentication.",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "readings_count": 0
    }
    db["users"][user_id] = new_user
    save_db()
    return new_user

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None or user_id not in db["users"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token or user not found")
        return db["users"][user_id]
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

def require_roles(allowed_roles: list):
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}"
            )
        return current_user
    return role_checker
