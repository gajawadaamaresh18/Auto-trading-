from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Portfolio, Formula
from app.schemas import (
    PortfolioResponse, PortfolioStats, PortfolioHistory, 
    PortfolioCreate, PortfolioUpdate
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/current", response_model=List[PortfolioResponse])
async def get_current_portfolio(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current portfolio positions.
    
    Returns all current positions in the user's portfolio with real-time values
    and profit/loss calculations.
    """
    # Get latest position for each symbol
    latest_positions = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).order_by(Portfolio.symbol, desc(Portfolio.timestamp)).all()
    
    # Group by symbol and get the latest position for each
    current_positions = {}
    for position in latest_positions:
        if position.symbol not in current_positions:
            current_positions[position.symbol] = position
    
    return list(current_positions.values())


@router.get("/history", response_model=List[PortfolioHistory])
async def get_portfolio_history(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get portfolio value history over time.
    
    Returns daily portfolio snapshots showing total value, P&L, and other metrics
    for the specified time period.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily portfolio snapshots
    daily_snapshots = db.query(
        func.date(Portfolio.timestamp).label('date'),
        func.sum(Portfolio.total_value).label('total_value'),
        func.sum(Portfolio.unrealized_pnl).label('unrealized_pnl'),
        func.sum(Portfolio.realized_pnl).label('realized_pnl')
    ).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.timestamp >= start_date,
            Portfolio.timestamp <= end_date
        )
    ).group_by(func.date(Portfolio.timestamp)).order_by('date').all()
    
    history = []
    for snapshot in daily_snapshots:
        history.append(PortfolioHistory(
            date=snapshot.date,
            total_value=snapshot.total_value or 0.0,
            unrealized_pnl=snapshot.unrealized_pnl or 0.0,
            realized_pnl=snapshot.realized_pnl or 0.0
        ))
    
    return history


@router.get("/stats", response_model=PortfolioStats)
async def get_portfolio_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive portfolio statistics.
    
    Returns key performance metrics including total value, P&L, return percentage,
    and position count for the current portfolio.
    """
    # Get latest positions
    latest_positions = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id
    ).order_by(Portfolio.symbol, desc(Portfolio.timestamp)).all()
    
    # Group by symbol to get current positions
    current_positions = {}
    for position in latest_positions:
        if position.symbol not in current_positions:
            current_positions[position.symbol] = position
    
    if not current_positions:
        return PortfolioStats(
            total_value=0.0,
            total_unrealized_pnl=0.0,
            total_realized_pnl=0.0,
            total_return_percentage=0.0,
            positions_count=0
        )
    
    # Calculate statistics
    total_value = sum(pos.total_value or 0 for pos in current_positions.values())
    total_unrealized_pnl = sum(pos.unrealized_pnl or 0 for pos in current_positions.values())
    total_realized_pnl = sum(pos.realized_pnl or 0 for pos in current_positions.values())
    positions_count = len(current_positions)
    
    # Calculate total return percentage
    total_cost = sum((pos.average_price * pos.quantity) for pos in current_positions.values())
    total_return_percentage = ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0.0
    
    return PortfolioStats(
        total_value=round(total_value, 2),
        total_unrealized_pnl=round(total_unrealized_pnl, 2),
        total_realized_pnl=round(total_realized_pnl, 2),
        total_return_percentage=round(total_return_percentage, 2),
        positions_count=positions_count
    )


@router.post("/positions", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_position(
    position_data: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Add a new position to the portfolio.
    
    Creates a new portfolio position with the specified symbol, quantity, and price.
    Can optionally associate the position with a specific trading formula.
    """
    # Validate formula if provided
    if position_data.formula_id:
        formula = db.query(Formula).filter(
            Formula.id == position_data.formula_id,
            Formula.is_active == True
        ).first()
        
        if not formula:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Formula not found"
            )
    
    # Calculate total value
    total_value = position_data.quantity * position_data.average_price
    
    db_position = Portfolio(
        user_id=current_user.id,
        formula_id=position_data.formula_id,
        symbol=position_data.symbol,
        quantity=position_data.quantity,
        average_price=position_data.average_price,
        total_value=total_value,
        unrealized_pnl=0.0,  # Will be updated when current price is set
        realized_pnl=0.0
    )
    
    db.add(db_position)
    db.commit()
    db.refresh(db_position)
    
    return db_position


@router.put("/positions/{position_id}", response_model=PortfolioResponse)
async def update_portfolio_position(
    position_id: int,
    position_data: PortfolioUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing portfolio position.
    
    Updates position details such as current price, quantity, or other metrics.
    Automatically recalculates P&L and total value.
    """
    position = db.query(Portfolio).filter(
        Portfolio.id == position_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    # Update fields if provided
    update_data = position_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(position, field, value)
    
    # Recalculate derived fields
    if position_data.current_price is not None:
        position.total_value = position.quantity * position.current_price
        position.unrealized_pnl = (position.current_price - position.average_price) * position.quantity
    
    db.commit()
    db.refresh(position)
    
    return position


@router.delete("/positions/{position_id}", status_code=status.HTTP_200_OK)
async def remove_portfolio_position(
    position_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove a position from the portfolio.
    
    Permanently deletes a portfolio position. This should be used when a position
    is completely closed or needs to be removed from tracking.
    """
    position = db.query(Portfolio).filter(
        Portfolio.id == position_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if not position:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position not found"
        )
    
    db.delete(position)
    db.commit()
    
    return {"message": "Position removed successfully"}


@router.get("/positions/{symbol}", response_model=List[PortfolioResponse])
async def get_position_history(
    symbol: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get historical data for a specific symbol.
    
    Returns all historical positions and updates for a specific symbol,
    showing the evolution of the position over time.
    """
    positions = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.symbol == symbol.upper()
        )
    ).order_by(desc(Portfolio.timestamp)).all()
    
    if not positions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No positions found for symbol {symbol}"
        )
    
    return positions


@router.get("/formulas/{formula_id}/positions", response_model=List[PortfolioResponse])
async def get_formula_positions(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all positions associated with a specific formula.
    
    Returns all portfolio positions that were created or managed by a specific
    trading formula, showing the formula's impact on the portfolio.
    """
    # Verify user has access to the formula
    formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if user is subscribed to the formula or is the author
    if formula.author_id != current_user.id:
        from app.models import Subscription
        subscription = db.query(Subscription).filter(
            and_(
                Subscription.user_id == current_user.id,
                Subscription.formula_id == formula_id,
                Subscription.is_active == True
            )
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Subscribe to view formula positions."
            )
    
    positions = db.query(Portfolio).filter(
        and_(
            Portfolio.user_id == current_user.id,
            Portfolio.formula_id == formula_id
        )
    ).order_by(desc(Portfolio.timestamp)).all()
    
    return positions


@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_portfolio(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Sync portfolio with connected broker accounts.
    
    Fetches latest positions and prices from all connected broker accounts
    and updates the local portfolio data accordingly.
    """
    # Get active broker connections
    from app.models import BrokerConnection
    broker_connections = db.query(BrokerConnection).filter(
        and_(
            BrokerConnection.user_id == current_user.id,
            BrokerConnection.is_active == True
        )
    ).all()
    
    if not broker_connections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active broker connections found"
        )
    
    # This would typically integrate with broker APIs to fetch real-time data
    # For now, we'll return a placeholder response
    return {
        "message": "Portfolio sync initiated",
        "broker_connections": len(broker_connections),
        "sync_timestamp": datetime.utcnow()
    }