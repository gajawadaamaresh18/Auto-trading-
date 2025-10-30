/**
 * Basket Backend Models and API
 * 
 * Backend models and API endpoints for basket management, including
 * basket creation, symbol management, formula assignment, and analytics.
 */

from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Index, Boolean, Integer, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from enum import Enum

from app.database import Base

class BasketType(str, Enum):
    """Basket types for categorization."""
    PREBUILT = "PREBUILT"
    CUSTOM = "CUSTOM"
    SECTOR = "SECTOR"
    THEME = "THEME"

class BasketCategory(str, Enum):
    """Basket categories for organization."""
    NIFTY50 = "NIFTY50"
    NIFTY100 = "NIFTY100"
    NIFTY500 = "NIFTY500"
    SECTORAL = "SECTORAL"
    CUSTOM = "CUSTOM"
    THEMATIC = "THEMATIC"

class ScanFrequency(str, Enum):
    """Scan frequency options."""
    REAL_TIME = "REAL_TIME"
    HOURLY = "HOURLY"
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"

class Basket(Base):
    """Basket model for storing user-defined scrip lists."""
    
    __tablename__ = "baskets"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic Information
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(20), nullable=False)  # PREBUILT, CUSTOM, SECTOR, THEME
    category = Column(String(20), nullable=False)  # NIFTY50, NIFTY100, etc.
    
    # Basket Configuration
    symbols = Column(JSON, nullable=False, default=list)  # List of symbols
    max_symbols = Column(Integer, nullable=False, default=50)
    is_active = Column(Boolean, nullable=False, default=True)
    is_public = Column(Boolean, nullable=False, default=False)
    
    # Formula Assignment
    assigned_formulas = Column(JSON, nullable=False, default=list)  # List of formula IDs
    scan_frequency = Column(String(20), nullable=False, default=ScanFrequency.DAILY)
    last_scan_time = Column(DateTime, nullable=True)
    
    # Analytics (cached for performance)
    total_signals = Column(Integer, nullable=False, default=0)
    active_signals = Column(Integer, nullable=False, default=0)
    total_trades = Column(Integer, nullable=False, default=0)
    win_rate = Column(Float, nullable=False, default=0.0)
    avg_return = Column(Float, nullable=False, default=0.0)
    max_drawdown = Column(Float, nullable=False, default=0.0)
    
    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tags = Column(JSON, nullable=False, default=list)  # List of tags
    
    # Settings
    settings = Column(JSON, nullable=False, default=dict)  # Basket settings
    
    # Relationships
    user = relationship("User", back_populates="baskets")
    basket_symbols = relationship("BasketSymbol", back_populates="basket", cascade="all, delete-orphan")
    basket_signals = relationship("BasketSignal", back_populates="basket", cascade="all, delete-orphan")
    basket_trades = relationship("BasketTrade", back_populates="basket", cascade="all, delete-orphan")
    basket_analytics = relationship("BasketAnalytics", back_populates="basket", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_baskets_user_id", "created_by"),
        Index("idx_baskets_type", "type"),
        Index("idx_baskets_category", "category"),
        Index("idx_baskets_active", "is_active"),
        Index("idx_baskets_public", "is_public"),
        Index("idx_baskets_created_at", "created_at"),
        Index("idx_baskets_user_type", "created_by", "type"),
        Index("idx_baskets_user_category", "created_by", "category"),
    )
    
    def __repr__(self):
        return f"<Basket(id={self.id}, name={self.name}, type={self.type})>"

class BasketSymbol(Base):
    """Basket symbol model for detailed symbol information."""
    
    __tablename__ = "basket_symbols"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    basket_id = Column(UUID(as_uuid=True), ForeignKey("baskets.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    
    # Symbol Information
    name = Column(String(100), nullable=True)
    sector = Column(String(50), nullable=True)
    market_cap = Column(Float, nullable=True)
    weight = Column(Float, nullable=False, default=0.0)
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Metadata
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    basket = relationship("Basket", back_populates="basket_symbols")
    user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index("idx_basket_symbols_basket_id", "basket_id"),
        Index("idx_basket_symbols_symbol", "symbol"),
        Index("idx_basket_symbols_active", "is_active"),
        Index("idx_basket_symbols_basket_symbol", "basket_id", "symbol"),
    )
    
    def __repr__(self):
        return f"<BasketSymbol(id={self.id}, basket_id={self.basket_id}, symbol={self.symbol})>"

class BasketSignal(Base):
    """Basket signal model for storing signals generated for basket symbols."""
    
    __tablename__ = "basket_signals"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    basket_id = Column(UUID(as_uuid=True), ForeignKey("baskets.id"), nullable=False)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    
    # Signal Details
    action = Column(String(10), nullable=False)  # BUY, SELL
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    
    # Signal Quality
    signal_strength = Column(Integer, nullable=False)  # 1-10
    confidence = Column(Float, nullable=False)  # 0-100%
    reason = Column(Text, nullable=True)
    
    # Status
    status = Column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, EXECUTED, EXPIRED, CANCELLED
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    executed_at = Column(DateTime, nullable=True)
    expired_at = Column(DateTime, nullable=True)
    
    # Relationships
    basket = relationship("Basket", back_populates="basket_signals")
    formula = relationship("Formula")
    
    # Indexes
    __table_args__ = (
        Index("idx_basket_signals_basket_id", "basket_id"),
        Index("idx_basket_signals_formula_id", "formula_id"),
        Index("idx_basket_signals_symbol", "symbol"),
        Index("idx_basket_signals_status", "status"),
        Index("idx_basket_signals_created_at", "created_at"),
        Index("idx_basket_signals_basket_status", "basket_id", "status"),
    )
    
    def __repr__(self):
        return f"<BasketSignal(id={self.id}, basket_id={self.basket_id}, symbol={self.symbol}, action={self.action})>"

class BasketTrade(Base):
    """Basket trade model for storing trades executed for basket symbols."""
    
    __tablename__ = "basket_trades"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    basket_id = Column(UUID(as_uuid=True), ForeignKey("baskets.id"), nullable=False)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False)
    signal_id = Column(UUID(as_uuid=True), ForeignKey("basket_signals.id"), nullable=True)
    symbol = Column(String(20), nullable=False)
    
    # Trade Details
    action = Column(String(10), nullable=False)  # BUY, SELL
    quantity = Column(Integer, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    
    # P&L
    pnl = Column(Float, nullable=True)
    pnl_percentage = Column(Float, nullable=True)
    
    # Status
    status = Column(String(20), nullable=False, default="OPEN")  # OPEN, CLOSED, CANCELLED
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)
    
    # Relationships
    basket = relationship("Basket", back_populates="basket_trades")
    formula = relationship("Formula")
    signal = relationship("BasketSignal")
    
    # Indexes
    __table_args__ = (
        Index("idx_basket_trades_basket_id", "basket_id"),
        Index("idx_basket_trades_formula_id", "formula_id"),
        Index("idx_basket_trades_symbol", "symbol"),
        Index("idx_basket_trades_status", "status"),
        Index("idx_basket_trades_created_at", "created_at"),
        Index("idx_basket_trades_basket_status", "basket_id", "status"),
    )
    
    def __repr__(self):
        return f"<BasketTrade(id={self.id}, basket_id={self.basket_id}, symbol={self.symbol}, action={self.action})>"

class BasketAnalytics(Base):
    """Basket analytics model for storing calculated analytics."""
    
    __tablename__ = "basket_analytics"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    basket_id = Column(UUID(as_uuid=True), ForeignKey("baskets.id"), nullable=False)
    
    # Analytics Data
    analytics_data = Column(JSON, nullable=False)  # Complete analytics data
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    basket = relationship("Basket", back_populates="basket_analytics")
    
    # Indexes
    __table_args__ = (
        Index("idx_basket_analytics_basket_id", "basket_id"),
        Index("idx_basket_analytics_calculated_at", "calculated_at"),
    )
    
    def __repr__(self):
        return f"<BasketAnalytics(id={self.id}, basket_id={self.basket_id}, calculated_at={self.calculated_at})>"

# API Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import User
from app.schemas import (
    BasketCreate,
    BasketUpdate,
    BasketResponse,
    BasketSymbolCreate,
    BasketSymbolResponse,
    BasketSignalResponse,
    BasketTradeResponse,
    BasketAnalyticsResponse,
    BasketScanRequest,
    BasketScanResponse
)
from app.auth import get_current_user
from app.services.basket_service import BasketService
from app.services.formula_service import FormulaService
from app.services.analytics_service import AnalyticsService
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/baskets", tags=["baskets"])

# Basket CRUD Endpoints
@router.post("/", response_model=BasketResponse)
async def create_basket(
    basket_data: BasketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new basket."""
    try:
        basket_service = BasketService(db)
        basket = await basket_service.create_basket(basket_data, current_user.id)
        
        logger.info(f"Basket created: {basket.id} by user {current_user.id}")
        
        return BasketResponse.from_orm(basket)
        
    except Exception as e:
        logger.error(f"Error creating basket: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/", response_model=List[BasketResponse])
async def get_baskets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get user's baskets with optional filtering."""
    try:
        basket_service = BasketService(db)
        baskets = await basket_service.get_user_baskets(
            current_user.id,
            skip=skip,
            limit=limit,
            type=type,
            category=category,
            is_active=is_active
        )
        
        return [BasketResponse.from_orm(basket) for basket in baskets]
        
    except Exception as e:
        logger.error(f"Error getting baskets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/{basket_id}", response_model=BasketResponse)
async def get_basket(
    basket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific basket by ID."""
    try:
        basket_service = BasketService(db)
        basket = await basket_service.get_basket(basket_id, current_user.id)
        
        if not basket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket not found"
            )
        
        return BasketResponse.from_orm(basket)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/{basket_id}", response_model=BasketResponse)
async def update_basket(
    basket_id: str,
    basket_data: BasketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a basket."""
    try:
        basket_service = BasketService(db)
        basket = await basket_service.update_basket(basket_id, basket_data, current_user.id)
        
        if not basket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket not found"
            )
        
        logger.info(f"Basket updated: {basket_id} by user {current_user.id}")
        
        return BasketResponse.from_orm(basket)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/{basket_id}")
async def delete_basket(
    basket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a basket."""
    try:
        basket_service = BasketService(db)
        success = await basket_service.delete_basket(basket_id, current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket not found"
            )
        
        logger.info(f"Basket deleted: {basket_id} by user {current_user.id}")
        
        return {"message": "Basket deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Basket Symbol Management
@router.post("/{basket_id}/symbols", response_model=BasketSymbolResponse)
async def add_symbol_to_basket(
    basket_id: str,
    symbol_data: BasketSymbolCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a symbol to a basket."""
    try:
        basket_service = BasketService(db)
        basket_symbol = await basket_service.add_symbol_to_basket(
            basket_id, symbol_data, current_user.id
        )
        
        if not basket_symbol:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket not found"
            )
        
        logger.info(f"Symbol {symbol_data.symbol} added to basket {basket_id}")
        
        return BasketSymbolResponse.from_orm(basket_symbol)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding symbol to basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/{basket_id}/symbols/{symbol}")
async def remove_symbol_from_basket(
    basket_id: str,
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a symbol from a basket."""
    try:
        basket_service = BasketService(db)
        success = await basket_service.remove_symbol_from_basket(
            basket_id, symbol, current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket or symbol not found"
            )
        
        logger.info(f"Symbol {symbol} removed from basket {basket_id}")
        
        return {"message": "Symbol removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing symbol from basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Basket Formula Management
@router.post("/{basket_id}/formulas/{formula_id}")
async def assign_formula_to_basket(
    basket_id: str,
    formula_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign a formula to a basket."""
    try:
        basket_service = BasketService(db)
        success = await basket_service.assign_formula_to_basket(
            basket_id, formula_id, current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket or formula not found"
            )
        
        logger.info(f"Formula {formula_id} assigned to basket {basket_id}")
        
        return {"message": "Formula assigned successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning formula to basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/{basket_id}/formulas/{formula_id}")
async def unassign_formula_from_basket(
    basket_id: str,
    formula_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unassign a formula from a basket."""
    try:
        basket_service = BasketService(db)
        success = await basket_service.unassign_formula_from_basket(
            basket_id, formula_id, current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket or formula not found"
            )
        
        logger.info(f"Formula {formula_id} unassigned from basket {basket_id}")
        
        return {"message": "Formula unassigned successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unassigning formula from basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Basket Scanning
@router.post("/{basket_id}/scan", response_model=BasketScanResponse)
async def scan_basket(
    basket_id: str,
    scan_request: BasketScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scan a basket for trading signals."""
    try:
        basket_service = BasketService(db)
        formula_service = FormulaService(db)
        
        # Get basket
        basket = await basket_service.get_basket(basket_id, current_user.id)
        if not basket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket not found"
            )
        
        # Scan basket
        scan_result = await basket_service.scan_basket(
            basket_id, scan_request, current_user.id
        )
        
        logger.info(f"Basket {basket_id} scanned by user {current_user.id}")
        
        return scan_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning basket {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Basket Analytics
@router.get("/{basket_id}/analytics", response_model=BasketAnalyticsResponse)
async def get_basket_analytics(
    basket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get basket analytics."""
    try:
        analytics_service = AnalyticsService(db)
        analytics = await analytics_service.get_basket_analytics(
            basket_id, current_user.id
        )
        
        if not analytics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Basket not found"
            )
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting basket analytics {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Basket Signals
@router.get("/{basket_id}/signals", response_model=List[BasketSignalResponse])
async def get_basket_signals(
    basket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Get signals for a basket."""
    try:
        basket_service = BasketService(db)
        signals = await basket_service.get_basket_signals(
            basket_id, current_user.id, skip=skip, limit=limit, status=status
        )
        
        return [BasketSignalResponse.from_orm(signal) for signal in signals]
        
    except Exception as e:
        logger.error(f"Error getting basket signals {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Basket Trades
@router.get("/{basket_id}/trades", response_model=List[BasketTradeResponse])
async def get_basket_trades(
    basket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Get trades for a basket."""
    try:
        basket_service = BasketService(db)
        trades = await basket_service.get_basket_trades(
            basket_id, current_user.id, skip=skip, limit=limit, status=status
        )
        
        return [BasketTradeResponse.from_orm(trade) for trade in trades]
        
    except Exception as e:
        logger.error(f"Error getting basket trades {basket_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Prebuilt Baskets
@router.get("/prebuilt/list")
async def get_prebuilt_baskets():
    """Get list of prebuilt baskets."""
    try:
        prebuilt_baskets = [
            {
                "name": "Nifty 50",
                "description": "Top 50 companies by market capitalization",
                "type": "PREBUILT",
                "category": "NIFTY50",
                "symbols": [
                    "RELIANCE", "TCS", "HDFCBANK", "INFY", "HINDUNILVR", "ICICIBANK", "KOTAKBANK",
                    "HDFC", "ITC", "BHARTIARTL", "SBIN", "ASIANPAINT", "AXISBANK", "MARUTI",
                    "LT", "NESTLEIND", "ULTRACEMCO", "SUNPHARMA", "TITAN", "POWERGRID",
                    "NTPC", "ONGC", "TECHM", "WIPRO", "COALINDIA", "JSWSTEEL", "TATASTEEL",
                    "BAJFINANCE", "BAJAJFINSV", "DRREDDY", "CIPLA", "EICHERMOT", "HEROMOTOCO",
                    "INDUSINDBK", "GRASIM", "SHREECEM", "UPL", "BRITANNIA", "DIVISLAB",
                    "HCLTECH", "ADANIPORTS", "TATAMOTORS", "APOLLOHOSP", "BAJAJHLDNG", "BPCL",
                    "HINDALCO", "TATACONSUM", "SBILIFE", "HDFCLIFE"
                ],
                "max_symbols": 50,
                "tags": ["large-cap", "blue-chip", "nifty"]
            },
            {
                "name": "Banking Sector",
                "description": "All banking and financial services companies",
                "type": "SECTOR",
                "category": "SECTORAL",
                "symbols": [
                    "HDFCBANK", "ICICIBANK", "KOTAKBANK", "AXISBANK", "SBIN", "INDUSINDBK",
                    "FEDERALBNK", "BANDHANBNK", "RBLBANK", "IDFCFIRSTB", "YESBANK"
                ],
                "max_symbols": 20,
                "tags": ["banking", "financial-services", "sectoral"]
            },
            {
                "name": "IT Sector",
                "description": "Information technology companies",
                "type": "SECTOR",
                "category": "SECTORAL",
                "symbols": [
                    "TCS", "INFY", "HCLTECH", "WIPRO", "TECHM", "MINDTREE", "LTI", "MPHASIS",
                    "PERSISTENT", "COFORGE", "LTTS", "HEXAWARE"
                ],
                "max_symbols": 15,
                "tags": ["technology", "software", "sectoral"]
            }
        ]
        
        return prebuilt_baskets
        
    except Exception as e:
        logger.error(f"Error getting prebuilt baskets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Export models and enums
__all__ = [
    "Basket",
    "BasketSymbol", 
    "BasketSignal",
    "BasketTrade",
    "BasketAnalytics",
    "BasketType",
    "BasketCategory",
    "ScanFrequency"
]
