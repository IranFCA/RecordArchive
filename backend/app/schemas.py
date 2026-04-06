from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import CaseStatus, RelationshipType


class SubmissionCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    relationship_type: RelationshipType = RelationshipType.UNKNOWN
    country: str | None = Field(default=None, max_length=100)
    source_basis: str | None = Field(default=None, max_length=50)
    date_range_start: date | None = None
    date_range_end: date | None = None
    submitter_contact: EmailStr | None = None
    is_anonymous: bool = True

    # Security
    captcha_token: str = Field(min_length=1, description="reCAPTCHA token for verification")

    # File validation
    files: list[str] = Field(default_factory=list, max_length=5)  # Max 5 files


class CaptchaVerify(BaseModel):
    token: str = Field(min_length=1, description="reCAPTCHA token to verify")


class CaptchaResponse(BaseModel):
    success: bool
    challenge_ts: str | None = None
    hostname: str | None = None
    error_codes: list[str] = Field(default_factory=list)


class SubmissionUpdateStatus(BaseModel):
    status: CaseStatus


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_number: str
    title: str
    description: str
    relationship_type: RelationshipType
    country: str | None
    source_basis: str | None
    date_range_start: date | None
    date_range_end: date | None
    status: CaseStatus
    submitter_contact: str | None
    is_anonymous: bool
    investigator_notes: str | None
    created_at: datetime
    updated_at: datetime
    files: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    service: str


# Authentication schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str
    requires_mfa: bool = False
    user_id: str | None = None


class MFASetup(BaseModel):
    email: EmailStr


class MFAVerify(BaseModel):
    email: EmailStr
    totp_code: str = Field(min_length=6, max_length=6)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    role: str
    mfa_enabled: bool
    created_at: datetime


# Contact schemas
class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=5, max_length=200)
    message: str = Field(min_length=10, max_length=2000)
    captcha_token: str = Field(min_length=1, description="reCAPTCHA token for verification")


class ContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: datetime
