from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.core import security
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.user import User, UserRole
from backend.app.models.audit import AuditLog
from backend.app.schemas.auth import Token, UserCreate, UserOut, LoginRequest
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect police email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account deactivated")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Log login action
    audit = AuditLog(
        user_id=user.id,
        user_email=user.email,
        badge_number=user.badge_number,
        action="USER_LOGIN",
        target_resource="users",
        target_id=str(user.id),
        details={"department": user.department, "role": user.role.value}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name,
        "badge_number": user.badge_number
    }


@router.post("/login/json", response_model=Token)
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect police email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account deactivated")
    
    token = security.create_access_token(subject=user.id)

    audit = AuditLog(
        user_id=user.id,
        user_email=user.email,
        badge_number=user.badge_number,
        action="USER_LOGIN_JSON",
        target_resource="users",
        target_id=str(user.id),
        details={"department": user.department, "role": user.role.value}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name,
        "badge_number": user.badge_number
    }


@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/users", response_model=UserOut, dependencies=[Depends(require_roles(UserRole.ADMIN))])
def create_police_officer_account(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        badge_number=user_in.badge_number,
        department=user_in.department,
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        badge_number=current_user.badge_number,
        action="CREATE_USER",
        target_resource="users",
        target_id=str(user.id),
        details={"created_email": user.email, "role": user.role.value}
    )
    db.add(audit)
    db.commit()

    return user
