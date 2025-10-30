"""
Trade API Endpoints

Backend API routes for trade management and approval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Trade
from app.schemas import (
    TradeApprovalRequest,
    TradeApprovalResponse,
    TradeRejectionRequest,
    TradeResponse
)

router = APIRouter(prefix="/trades", tags=["trades"])

# Get User Trades
@router.get("/", response_model=List[TradeResponse])
async def get_trades(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all trades for the current user.
    """
    try:
        trades = db.query(Trade).filter(
            Trade.user_id == current_user.id
        ).all()
        
        return trades
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Get Trade by ID
@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade_by_id(
    trade_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific trade by ID.
    """
    try:
        # Convert string to UUID
        trade_uuid = UUID(trade_id)
        trade = db.query(Trade).filter(
            Trade.id == trade_uuid,
            Trade.user_id == current_user.id
        ).first()
        
        if not trade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trade not found"
            )
        
        return trade
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid trade ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Trade Approval Endpoint
@router.patch("/{trade_id}/approve", response_model=TradeApprovalResponse)
async def approve_trade(
    trade_id: str,
    approval_request: TradeApprovalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Approve a pending trade for execution.
    """
    try:
        # Get the trade
        trade_uuid = UUID(trade_id)
        trade = db.query(Trade).filter(
            Trade.id == trade_uuid,
            Trade.user_id == current_user.id
        ).first()
        
        if not trade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trade not found"
            )
        
        # Check if trade can be approved
        if trade.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Trade cannot be approved. Current status: {trade.status}"
            )
        
        # Update trade status
        trade.status = "approved"
        db.commit()
        db.refresh(trade)
        
        return TradeApprovalResponse(
            trade_id=trade.id,
            status=trade.status,
            execution_queue_position=None,
            estimated_execution_time=None,
            message="Trade approved successfully"
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid trade ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Trade Rejection Endpoint
@router.patch("/{trade_id}/reject", response_model=TradeApprovalResponse)
async def reject_trade(
    trade_id: str,
    rejection_request: TradeRejectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject a pending trade.
    """
    try:
        # Get the trade
        trade_uuid = UUID(trade_id)
        trade = db.query(Trade).filter(
            Trade.id == trade_uuid,
            Trade.user_id == current_user.id
        ).first()
        
        if not trade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trade not found"
            )
        
        # Check if trade can be rejected
        if trade.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Trade cannot be rejected. Current status: {trade.status}"
            )
        
        # Update trade status
        trade.status = "rejected"
        db.commit()
        db.refresh(trade)
        
        return TradeApprovalResponse(
            trade_id=trade.id,
            status=trade.status,
            execution_queue_position=None,
            estimated_execution_time=None,
            message="Trade rejected successfully"
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid trade ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )