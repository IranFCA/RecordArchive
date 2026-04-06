import io
import uuid
from datetime import datetime, timedelta
from typing import Any

import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..config import settings
from ..crud import get_user_by_email
from ..database import get_db
from ..models import User
from ..schemas import Token, UserLogin, MFASetup, MFAVerify

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# JWT settings
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Authenticate user and return access token."""
    user = get_user_by_email(db, email=user_credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if MFA is enabled
    if user.mfa_enabled:
        return {
            "access_token": "",  # Empty token until MFA is verified
            "token_type": "bearer",
            "requires_mfa": True,
            "user_id": str(user.id)
        }

    # Create access token for non-MFA users
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "requires_mfa": False
    }


@router.post("/verify-mfa", response_model=Token)
async def verify_mfa(mfa_data: MFAVerify, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Verify MFA TOTP code and return access token."""
    user = get_user_by_email(db, email=mfa_data.email)
    if not user or not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA verification request"
        )

    # Verify TOTP code
    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(mfa_data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "requires_mfa": False
    }


@router.post("/setup-mfa")
async def setup_mfa(email: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Setup MFA for a user and return QR code."""
    user = get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Generate new MFA secret
    secret = pyotp.random_base32()

    # Update user with MFA secret (but don't enable yet)
    user.mfa_secret = secret
    db.commit()

    # Generate QR code
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email,
        issuer_name="IranArchive"
    )

    # Create QR code image
    img = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # Convert to base64 for frontend
    import base64
    qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "qr_code_url": f"data:image/png;base64,{qr_code_base64}",
        "secret": secret
    }


@router.post("/enable-mfa")
async def enable_mfa(email: str, totp_code: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Enable MFA for a user after verifying the TOTP code."""
    user = get_user_by_email(db, email=email)
    if not user or not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup not initiated"
        )

    # Verify the TOTP code
    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(totp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )

    # Enable MFA
    user.mfa_enabled = True
    db.commit()

    return {"message": "MFA enabled successfully"}


@router.post("/disable-mfa")
async def disable_mfa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    """Disable MFA for the current user."""
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    db.commit()

    return {"message": "MFA disabled successfully"}