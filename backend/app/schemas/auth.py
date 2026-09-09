from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    email: str
    full_name: str
    badge_number: Optional[str] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class LoginRequest(BaseModel):
    email: str = Field(..., example="command@sentrax.gujarat.gov.in")
    password: str


class UserCreate(BaseModel):
    email: str = Field(..., example="officer@sentrax.gujarat.gov.in")
    password: str
    full_name: str
    badge_number: Optional[str] = None
    department: str = "Gujarat Police"
    role: UserRole = UserRole.OFFICER


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    badge_number: Optional[str] = None
    department: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
