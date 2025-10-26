from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from app.database import get_db
from app.models import User, Formula, Subscription
from app.schemas import (
    SubscriptionCreate, SubscriptionResponse, FormulaResponse
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_to_formula(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Subscribe to a trading formula.
    
    Creates a new subscription to a formula, allowing access to private formulas
    and enabling formula-based trading signals.
    """
    # Check if formula exists and is active
    formula = db.query(Formula).filter(
        Formula.id == subscription_data.formula_id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if user is already subscribed
    existing_subscription = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == subscription_data.formula_id
        )
    ).first()
    
    if existing_subscription:
        if existing_subscription.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already subscribed to this formula"
            )
        else:
            # Reactivate existing subscription
            existing_subscription.is_active = True
            db.commit()
            db.refresh(existing_subscription)
            
            # Update formula subscriber count
            formula.total_subscribers += 1
            db.commit()
            
            return existing_subscription
    
    # Create new subscription
    db_subscription = Subscription(
        user_id=current_user.id,
        formula_id=subscription_data.formula_id,
        is_active=True
    )
    
    db.add(db_subscription)
    
    # Update formula subscriber count
    formula.total_subscribers += 1
    
    db.commit()
    db.refresh(db_subscription)
    
    return db_subscription


@router.get("/", response_model=List[SubscriptionResponse])
async def get_my_subscriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all active subscriptions for the current user.
    
    Returns list of all formulas the user is currently subscribed to
    with subscription details and formula information.
    """
    subscriptions = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True
        )
    ).all()
    
    return subscriptions


@router.get("/formulas", response_model=List[FormulaResponse])
async def get_subscribed_formulas(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all formulas the user is subscribed to.
    
    Returns the actual formula objects for all active subscriptions,
    including private formulas the user has access to.
    """
    subscriptions = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True
        )
    ).all()
    
    formula_ids = [sub.formula_id for sub in subscriptions]
    
    if not formula_ids:
        return []
    
    formulas = db.query(Formula).filter(
        and_(
            Formula.id.in_(formula_ids),
            Formula.is_active == True
        )
    ).all()
    
    return formulas


@router.delete("/{formula_id}", status_code=status.HTTP_200_OK)
async def unsubscribe_from_formula(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Unsubscribe from a trading formula.
    
    Deactivates the subscription to a formula, removing access to private formulas
    and stopping formula-based trading signals.
    """
    subscription = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == formula_id,
            Subscription.is_active == True
        )
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active subscription not found"
        )
    
    # Deactivate subscription
    subscription.is_active = False
    
    # Update formula subscriber count
    formula = db.query(Formula).filter(Formula.id == formula_id).first()
    if formula and formula.total_subscribers > 0:
        formula.total_subscribers -= 1
    
    db.commit()
    
    return {"message": "Successfully unsubscribed from formula"}


@router.get("/{formula_id}/status")
async def get_subscription_status(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Check subscription status for a specific formula.
    
    Returns whether the user is currently subscribed to the specified formula.
    """
    subscription = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == formula_id
        )
    ).first()
    
    is_subscribed = subscription and subscription.is_active
    
    return {
        "formula_id": formula_id,
        "is_subscribed": is_subscribed,
        "subscribed_at": subscription.subscribed_at if subscription else None
    }


@router.post("/{formula_id}/toggle", response_model=SubscriptionResponse)
async def toggle_subscription(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Toggle subscription status for a formula.
    
    If subscribed, unsubscribes. If not subscribed, subscribes.
    Returns the current subscription status after the toggle.
    """
    # Check if formula exists
    formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check current subscription status
    subscription = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == formula_id
        )
    ).first()
    
    if subscription and subscription.is_active:
        # Unsubscribe
        subscription.is_active = False
        if formula.total_subscribers > 0:
            formula.total_subscribers -= 1
        db.commit()
        db.refresh(subscription)
        return subscription
    else:
        # Subscribe
        if subscription:
            # Reactivate existing subscription
            subscription.is_active = True
            formula.total_subscribers += 1
            db.commit()
            db.refresh(subscription)
            return subscription
        else:
            # Create new subscription
            new_subscription = Subscription(
                user_id=current_user.id,
                formula_id=formula_id,
                is_active=True
            )
            db.add(new_subscription)
            formula.total_subscribers += 1
            db.commit()
            db.refresh(new_subscription)
            return new_subscription


@router.get("/stats/summary")
async def get_subscription_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get subscription statistics for the current user.
    
    Returns summary statistics about the user's subscriptions including
    total active subscriptions, categories, and performance metrics.
    """
    # Get active subscriptions with formula details
    subscriptions = db.query(Subscription, Formula).join(
        Formula, Subscription.formula_id == Formula.id
    ).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True,
            Formula.is_active == True
        )
    ).all()
    
    if not subscriptions:
        return {
            "total_subscriptions": 0,
            "categories": [],
            "average_performance_score": 0.0,
            "total_formulas_accessed": 0
        }
    
    # Calculate statistics
    total_subscriptions = len(subscriptions)
    categories = list(set([sub[1].category for sub in subscriptions if sub[1].category]))
    performance_scores = [sub[1].performance_score for sub in subscriptions]
    average_performance_score = sum(performance_scores) / len(performance_scores) if performance_scores else 0.0
    
    return {
        "total_subscriptions": total_subscriptions,
        "categories": categories,
        "average_performance_score": round(average_performance_score, 2),
        "total_formulas_accessed": total_subscriptions
    }