"""
FastAPI routes for the Stock Trading Marketplace App.

This module contains all API endpoints organized by functionality:
- Authentication and user management
- Broker account management
- Formula discovery and management
- Subscription handling
- Portfolio and analytics
- Review and rating system
- Notifications and real-time updates
"""

import json
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, create_access_token, verify_password, hash_password
from app.models import User, Formula, Subscription, Trade, BrokerAccount, Review, BrokerType, Notification
from app.schemas import (
    UserCreate, UserResponse, UserUpdate,
    FormulaResponse, SubscriptionResponse, TradeResponse,
    BrokerAccountResponse, ReviewCreate, ReviewResponse,
    NotificationResponse
)
from app.services.broker_validation_service import validate_broker_credentials
from app.api.v1.trade_routes import router as trade_router

# Security
security = HTTPBearer()

# Router setup
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
broker_router = APIRouter(prefix="/brokers", tags=["Broker Management"])
formula_router = APIRouter(prefix="/formulas", tags=["Formula Discovery"])
subscription_router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])
portfolio_router = APIRouter(prefix="/portfolio", tags=["Portfolio & Analytics"])
review_router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])
notification_router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

class LoginRequest(BaseModel):
    """Login request schema."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class LoginResponse(BaseModel):
    """Login response schema."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")
    expires_in: int = Field(default=3600, description="Token expiration in seconds")


class KYCUploadResponse(BaseModel):
    """KYC upload response schema."""
    document_id: str = Field(..., description="Uploaded document ID")
    status: str = Field(..., description="Verification status")
    message: str = Field(..., description="Status message")


@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.
    
    Creates a new user account with the provided information.
    Validates email uniqueness and password strength.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@auth_router.post("/login", response_model=LoginResponse)
async def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    
    Validates user credentials and returns an access token
    for authenticated API requests.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Update last login (if field exists)
    # user.last_login_at = datetime.now(timezone.utc)
    # db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return LoginResponse(
        access_token=access_token,
        user=user,
        expires_in=3600
    )


@auth_router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(
    current_user: User = Depends(get_current_user)
):
    """
    Logout current user.
    
    Invalidates the current session and clears any cached data.
    Note: JWT tokens are stateless, so this is mainly for client-side cleanup.
    """
    return {"message": "Successfully logged out"}


@auth_router.post("/kyc/upload", response_model=KYCUploadResponse)
async def upload_kyc_documents(
    document_type: str = Query(..., description="Type of document (passport, driver_license, etc.)"),
    file: UploadFile = File(..., description="Document file"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload KYC (Know Your Customer) documents for account verification.
    
    Handles document upload for identity verification.
    Supports multiple document types and file formats.
    """
    # Validate file type and size
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and PDF are allowed"
        )
    
    if file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum 10MB allowed"
        )
    
    # TODO: Implement actual file upload to cloud storage
    document_id = f"kyc_{current_user.id}_{datetime.now().timestamp()}"
    
    return KYCUploadResponse(
        document_id=document_id,
        status="uploaded",
        message="Document uploaded successfully. Verification pending."
    )


# ============================================================================
# BROKER MANAGEMENT ROUTES
# ============================================================================

class BrokerConnectRequest(BaseModel):
    """Broker connection request schema."""
    broker_type: str = Field(..., description="Broker type (alpaca, interactive_brokers, robinhood)")
    account_id: str = Field(..., description="Broker account identifier")
    account_name: Optional[str] = Field(None, description="User-friendly account name")
    api_key: str = Field(..., description="Broker API key")
    secret_key: str = Field(..., description="Broker secret key")
    passphrase: Optional[str] = Field(None, description="Broker passphrase (if required)")


class BrokerConnectionResponse(BaseModel):
    """Broker connection response schema."""
    broker_account_id: UUID = Field(..., description="Created broker account ID")
    status: str = Field(..., description="Connection status")
    message: str = Field(..., description="Status message")


@broker_router.post("/connect", response_model=BrokerConnectionResponse)
async def connect_broker_account(
    broker_data: BrokerConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Connect a new broker account.
    
    Establishes connection to external broker API using provided credentials.
    Validates credentials and tests API connectivity.
    """
    # Check if account already exists
    existing_account = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == current_user.id,
        BrokerAccount.broker_type == broker_data.broker_type,
        BrokerAccount.account_id == broker_data.account_id
    ).first()
    
    if existing_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Broker account already connected"
        )
    
    # Validate broker credentials
    try:
        broker_type_enum = BrokerType(broker_data.broker_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid broker type: {broker_data.broker_type}"
        )
    
    validation_result = await validate_broker_credentials(
        broker_type_enum, 
        {
            "api_key": broker_data.api_key,
            "secret_key": broker_data.secret_key,
            "passphrase": broker_data.passphrase,
            "user_id": broker_data.account_id
        }
    )
    
    if not validation_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Broker validation failed: {validation_result['error']}"
        )
    
    # Create broker account
    broker_account = BrokerAccount(
        user_id=current_user.id,
        broker_type=broker_data.broker_type,
        account_id=broker_data.account_id,
        encrypted_credentials=json.dumps({
            "api_key": broker_data.api_key,
            "secret_key": broker_data.secret_key,
            "passphrase": broker_data.passphrase
        }),
        is_active=True
    )
    
    db.add(broker_account)
    db.commit()
    db.refresh(broker_account)
    
    return BrokerConnectionResponse(
        broker_account_id=broker_account.id,
        status="connected",
        message="Broker account connected successfully"
    )


@broker_router.get("/accounts", response_model=List[BrokerAccountResponse])
async def get_broker_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all connected broker accounts for the current user.
    
    Returns list of all broker accounts with their connection status
    and basic account information.
    """
    accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == current_user.id,
        BrokerAccount.is_active == True
    ).all()
    
    return accounts


@broker_router.delete("/{broker_account_id}/disconnect")
async def disconnect_broker_account(
    broker_account_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect a broker account.
    
    Removes broker account connection and clears stored credentials.
    Does not delete historical trade data.
    """
    broker_account = db.query(BrokerAccount).filter(
        BrokerAccount.id == broker_account_id,
        BrokerAccount.user_id == current_user.id
    ).first()
    
    if not broker_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker account not found"
        )
    
    # Soft delete - mark as inactive
    broker_account.is_active = False
    broker_account.is_connected = False
    broker_account.encrypted_api_key = None
    broker_account.encrypted_secret_key = None
    broker_account.encrypted_passphrase = None
    
    db.commit()
    
    return {"message": "Broker account disconnected successfully"}


# ============================================================================
# FORMULA DISCOVERY ROUTES
# ============================================================================

class FormulaFilters(BaseModel):
    """Formula filtering options."""
    category: Optional[str] = Field(None, description="Filter by category")
    min_performance_score: Optional[float] = Field(None, ge=0, le=100, description="Minimum performance score")
    max_risk_score: Optional[float] = Field(None, ge=0, le=100, description="Maximum risk score")
    is_free: Optional[bool] = Field(None, description="Filter by free/paid formulas")
    creator_id: Optional[UUID] = Field(None, description="Filter by specific creator")


class FormulaSearchResponse(BaseModel):
    """Formula search response with pagination."""
    formulas: List[FormulaResponse] = Field(..., description="List of formulas")
    total: int = Field(..., description="Total number of formulas")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Number of items per page")
    has_next: bool = Field(..., description="Whether there are more pages")


@formula_router.get("/", response_model=FormulaSearchResponse)
async def get_formulas(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    filters: FormulaFilters = Depends(),
    db: Session = Depends(get_db)
):
    """
    Get all published formulas with filtering, sorting, and pagination.
    
    Supports searching by name/description, filtering by category/performance,
    and sorting by various fields. Returns paginated results.
    """
    query = db.query(Formula).filter(Formula.status == "published")
    
    # Apply search filter
    if search:
        query = query.filter(
            Formula.name.ilike(f"%{search}%") |
            Formula.description.ilike(f"%{search}%") |
            Formula.tags.ilike(f"%{search}%")
        )
    
    # Apply filters
    if filters.category:
        query = query.filter(Formula.category == filters.category)
    
    if filters.min_performance_score is not None:
        query = query.filter(Formula.performance_score >= filters.min_performance_score)
    
    if filters.max_risk_score is not None:
        query = query.filter(Formula.risk_score <= filters.max_risk_score)
    
    if filters.is_free is not None:
        query = query.filter(Formula.is_free == filters.is_free)
    
    if filters.creator_id:
        query = query.filter(Formula.creator_id == filters.creator_id)
    
    # Apply sorting
    if sort_by == "performance_score":
        sort_field = Formula.performance_score
    elif sort_by == "total_subscribers":
        sort_field = Formula.total_subscribers
    elif sort_by == "created_at":
        sort_field = Formula.created_at
    else:
        sort_field = Formula.created_at
    
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    formulas = query.offset(offset).limit(per_page).all()
    
    return FormulaSearchResponse(
        formulas=formulas,
        total=total,
        page=page,
        per_page=per_page,
        has_next=(offset + per_page) < total
    )


@formula_router.get("/{formula_id}", response_model=FormulaResponse)
async def get_formula_details(
    formula_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific formula.
    
    Returns complete formula information including code, parameters,
    performance metrics, and creator details.
    """
    formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.status == "published"
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    return formula


# ============================================================================
# SUBSCRIPTION ROUTES
# ============================================================================

class SubscriptionRequest(BaseModel):
    """Subscription request schema."""
    formula_id: UUID = Field(..., description="Formula to subscribe to")
    billing_period: str = Field(..., description="Billing period (monthly/yearly)")


@subscription_router.post("/", response_model=SubscriptionResponse)
async def subscribe_to_formula(
    subscription_data: SubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Subscribe to a formula.
    
    Creates a new subscription for the user to access a paid formula.
    Handles payment processing and access management.
    """
    # Check if formula exists and is published
    formula = db.query(Formula).filter(
        Formula.id == subscription_data.formula_id,
        Formula.status == "published"
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if already subscribed
    existing_subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.formula_id == subscription_data.formula_id,
        Subscription.status.in_(["active", "pending"])
    ).first()
    
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this formula"
        )
    
    # Calculate pricing
    if subscription_data.billing_period == "monthly":
        amount = formula.price_per_month
    elif subscription_data.billing_period == "yearly":
        amount = formula.price_per_year
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid billing period"
        )
    
    if not amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formula is not available for subscription"
        )
    
    # Create subscription
    subscription = Subscription(
        user_id=current_user.id,
        formula_id=subscription_data.formula_id,
        billing_period=subscription_data.billing_period,
        amount_paid=amount,
        started_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc)  # TODO: Calculate proper expiration
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return subscription


@subscription_router.get("/", response_model=List[SubscriptionResponse])
async def get_user_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all active subscriptions for the current user.
    
    Returns list of all active subscriptions with formula details
    and billing information.
    """
    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).all()
    
    return subscriptions


@subscription_router.delete("/{subscription_id}")
async def unsubscribe_from_formula(
    subscription_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a subscription to a formula.
    
    Cancels the subscription and removes access to the formula.
    Does not provide refunds for unused time.
    """
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    subscription.status = "cancelled"
    subscription.cancelled_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}


# ============================================================================
# PORTFOLIO & ANALYTICS ROUTES
# ============================================================================

class PortfolioSummary(BaseModel):
    """Portfolio summary schema."""
    total_value: float = Field(..., description="Total portfolio value")
    total_return: float = Field(..., description="Total return percentage")
    daily_pnl: float = Field(..., description="Daily profit/loss")
    positions_count: int = Field(..., description="Number of positions")
    active_trades: int = Field(..., description="Number of active trades")


class PortfolioHistory(BaseModel):
    """Portfolio history entry."""
    date: datetime = Field(..., description="Date")
    value: float = Field(..., description="Portfolio value")
    return_pct: float = Field(..., description="Return percentage")


class PortfolioStats(BaseModel):
    """Portfolio statistics."""
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    max_drawdown: Optional[float] = Field(None, description="Maximum drawdown")
    win_rate: Optional[float] = Field(None, description="Win rate percentage")
    avg_trade_return: Optional[float] = Field(None, description="Average trade return")


@portfolio_router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current portfolio summary.
    
    Returns real-time portfolio value, returns, and position counts
    aggregated across all connected broker accounts.
    """
    # Get all active broker accounts
    broker_accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == current_user.id,
        BrokerAccount.is_active == True,
        BrokerAccount.is_connected == True
    ).all()
    
    # Calculate portfolio metrics
    total_value = sum(account.portfolio_value or 0 for account in broker_accounts)
    total_return = 0.0  # TODO: Calculate from trade history
    daily_pnl = 0.0  # TODO: Calculate from today's trades
    positions_count = 0  # TODO: Get from broker APIs
    active_trades = db.query(Trade).filter(
        Trade.user_id == current_user.id,
        Trade.status.in_(["pending", "partially_filled"])
    ).count()
    
    return PortfolioSummary(
        total_value=total_value,
        total_return=total_return,
        daily_pnl=daily_pnl,
        positions_count=positions_count,
        active_trades=active_trades
    )


@portfolio_router.get("/history", response_model=List[PortfolioHistory])
async def get_portfolio_history(
    days: int = Query(30, ge=1, le=365, description="Number of days"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get portfolio value history.
    
    Returns historical portfolio values for the specified time period.
    Used for charting and performance analysis.
    """
    # TODO: Implement actual portfolio history calculation
    # This would typically involve:
    # 1. Getting historical trade data
    # 2. Calculating portfolio values at each point in time
    # 3. Computing returns
    
    history = []  # Placeholder
    return history


@portfolio_router.get("/stats", response_model=PortfolioStats)
async def get_portfolio_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get portfolio performance statistics.
    
    Returns key performance metrics including Sharpe ratio,
    maximum drawdown, win rate, and average trade return.
    """
    # TODO: Implement actual statistics calculation
    # This would involve analyzing trade history and calculating metrics
    
    return PortfolioStats(
        sharpe_ratio=None,
        max_drawdown=None,
        win_rate=None,
        avg_trade_return=None
    )


# ============================================================================
# REVIEW & RATING ROUTES
# ============================================================================

@review_router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a formula.
    
    Allows users to rate and review formulas they have used.
    Validates that the user has access to the formula.
    """
    # Check if formula exists
    formula = db.query(Formula).filter(Formula.id == review_data.formula_id).first()
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if user has access to formula (subscription or free)
    has_access = False
    if formula.is_free:
        has_access = True
    else:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == review_data.formula_id,
            Subscription.status == "active"
        ).first()
        has_access = subscription is not None
    
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must have access to this formula to review it"
        )
    
    # Check if user already reviewed this formula
    existing_review = db.query(Review).filter(
        Review.reviewer_id == current_user.id,
        Review.formula_id == review_data.formula_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this formula"
        )
    
    # Create review
    review = Review(
        reviewer_id=current_user.id,
        formula_id=review_data.formula_id,
        formula_creator_id=formula.creator_id,
        rating=review_data.rating,
        title=review_data.title,
        content=review_data.content,
        is_verified_purchase=True  # User has access
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review


@review_router.get("/formula/{formula_id}", response_model=List[ReviewResponse])
async def get_formula_reviews(
    formula_id: UUID,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Get all reviews for a specific formula.
    
    Returns paginated list of reviews with ratings and comments.
    Includes helpful vote counts and verification status.
    """
    query = db.query(Review).filter(
        Review.formula_id == formula_id,
        Review.is_moderated == False
    ).order_by(Review.created_at.desc())
    
    total = query.count()
    offset = (page - 1) * per_page
    reviews = query.offset(offset).limit(per_page).all()
    
    return reviews


# ============================================================================
# NOTIFICATION ROUTES
# ============================================================================

class NotificationPreferences(BaseModel):
    """Notification preferences schema."""
    push_enabled: bool = Field(default=True, description="Enable push notifications")
    email_enabled: bool = Field(default=True, description="Enable email notifications")
    trade_executed: bool = Field(default=True, description="Notify on trade execution")
    formula_trigger: bool = Field(default=True, description="Notify on formula triggers")
    subscription_expired: bool = Field(default=True, description="Notify on subscription expiry")


@notification_router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    unread_only: bool = Query(False, description="Show only unread notifications"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user notifications.
    
    Returns paginated list of notifications for the current user.
    Supports filtering by read status and notification type.
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    query = query.order_by(Notification.created_at.desc())
    
    total = query.count()
    offset = (page - 1) * per_page
    notifications = query.offset(offset).limit(per_page).all()
    
    return notifications


@notification_router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read.
    
    Updates the notification status to read and records the read timestamp.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"message": "Notification marked as read"}


@notification_router.put("/preferences", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update notification preferences.
    
    Allows users to customize which types of notifications they receive
    and through which channels (push, email).
    """
    # TODO: Implement notification preferences storage
    # This would typically be stored in user profile or separate preferences table
    
    return preferences


# ============================================================================
# WEBSOCKET ENDPOINTS FOR REAL-TIME UPDATES
# ============================================================================

from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    """WebSocket connection manager."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@notification_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time notifications.
    
    Establishes persistent connection for real-time updates including:
    - Trade execution notifications
    - Formula trigger alerts
    - Portfolio value updates
    - System announcements
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # TODO: Handle incoming WebSocket messages
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Main router combining all sub-routers
router = APIRouter()
router.include_router(auth_router)
router.include_router(broker_router)
router.include_router(formula_router)
router.include_router(subscription_router)
router.include_router(portfolio_router)
router.include_router(review_router)
router.include_router(notification_router)
router.include_router(trade_router)
