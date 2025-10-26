from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from typing import List, Optional
from math import ceil
from app.database import get_db
from app.models import User, Formula, Review, Subscription
from app.schemas import (
    ReviewCreate, ReviewUpdate, ReviewResponse, UserResponse
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a trading formula.
    
    Allows users to rate and comment on formulas they have access to.
    Users must be subscribed to or be the author of the formula to review it.
    """
    # Check if formula exists and is active
    formula = db.query(Formula).filter(
        Formula.id == review_data.formula_id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if user can review this formula
    can_review = False
    
    # Author can always review their own formula
    if formula.author_id == current_user.id:
        can_review = True
    else:
        # Check if user is subscribed to the formula
        subscription = db.query(Subscription).filter(
            and_(
                Subscription.user_id == current_user.id,
                Subscription.formula_id == review_data.formula_id,
                Subscription.is_active == True
            )
        ).first()
        
        if subscription:
            can_review = True
    
    if not can_review:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be subscribed to this formula to review it"
        )
    
    # Check if user already reviewed this formula
    existing_review = db.query(Review).filter(
        and_(
            Review.user_id == current_user.id,
            Review.formula_id == review_data.formula_id
        )
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this formula"
        )
    
    # Create new review
    db_review = Review(
        user_id=current_user.id,
        formula_id=review_data.formula_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(db_review)
    
    # Update formula's average rating
    formula_reviews = db.query(Review).filter(Review.formula_id == review_data.formula_id).all()
    if formula_reviews:
        average_rating = sum(review.rating for review in formula_reviews) / len(formula_reviews)
        formula.performance_score = round(average_rating * 20, 2)  # Convert 1-5 scale to 0-100
    
    db.commit()
    db.refresh(db_review)
    
    return db_review


@router.get("/formula/{formula_id}", response_model=List[ReviewResponse])
async def get_formula_reviews(
    formula_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all reviews for a specific formula.
    
    Returns paginated list of reviews for a formula with user information.
    Users must have access to the formula to view its reviews.
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
    
    # Check if user can access this formula
    can_access = False
    
    if formula.is_public:
        can_access = True
    elif formula.author_id == current_user.id:
        can_access = True
    else:
        subscription = db.query(Subscription).filter(
            and_(
                Subscription.user_id == current_user.id,
                Subscription.formula_id == formula_id,
                Subscription.is_active == True
            )
        ).first()
        
        if subscription:
            can_access = True
    
    if not can_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Subscribe to view formula reviews."
        )
    
    # Get reviews with pagination
    offset = (page - 1) * size
    reviews = db.query(Review).filter(
        Review.formula_id == formula_id
    ).order_by(desc(Review.created_at)).offset(offset).limit(size).all()
    
    return reviews


@router.get("/my", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all reviews created by the current user.
    
    Returns all reviews the user has written across all formulas.
    """
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).order_by(desc(Review.created_at)).all()
    
    return reviews


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing review.
    
    Allows users to modify their own reviews (rating and/or comment).
    Only the review author can update their review.
    """
    review = db.query(Review).filter(
        and_(
            Review.id == review_id,
            Review.user_id == current_user.id
        )
    ).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you don't have permission to edit it"
        )
    
    # Update fields if provided
    update_data = review_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)
    
    db.commit()
    
    # Update formula's average rating
    formula_reviews = db.query(Review).filter(Review.formula_id == review.formula_id).all()
    if formula_reviews:
        average_rating = sum(r.rating for r in formula_reviews) / len(formula_reviews)
        formula = db.query(Formula).filter(Formula.id == review.formula_id).first()
        if formula:
            formula.performance_score = round(average_rating * 20, 2)
            db.commit()
    
    db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=status.HTTP_200_OK)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a review.
    
    Permanently removes a review. Only the review author can delete their review.
    Formula's average rating will be recalculated after deletion.
    """
    review = db.query(Review).filter(
        and_(
            Review.id == review_id,
            Review.user_id == current_user.id
        )
    ).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you don't have permission to delete it"
        )
    
    formula_id = review.formula_id
    
    # Delete the review
    db.delete(review)
    
    # Recalculate formula's average rating
    remaining_reviews = db.query(Review).filter(Review.formula_id == formula_id).all()
    formula = db.query(Formula).filter(Formula.id == formula_id).first()
    
    if formula:
        if remaining_reviews:
            average_rating = sum(r.rating for r in remaining_reviews) / len(remaining_reviews)
            formula.performance_score = round(average_rating * 20, 2)
        else:
            formula.performance_score = 0.0
        
        db.commit()
    
    return {"message": "Review deleted successfully"}


@router.get("/formula/{formula_id}/stats")
async def get_formula_review_stats(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get review statistics for a specific formula.
    
    Returns aggregated review data including average rating, total reviews,
    and rating distribution for a formula.
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
    
    # Get review statistics
    reviews = db.query(Review).filter(Review.formula_id == formula_id).all()
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0.0,
            "rating_distribution": {str(i): 0 for i in range(1, 6)},
            "formula_id": formula_id
        }
    
    total_reviews = len(reviews)
    average_rating = sum(review.rating for review in reviews) / total_reviews
    
    # Calculate rating distribution
    rating_distribution = {str(i): 0 for i in range(1, 6)}
    for review in reviews:
        rating_distribution[str(review.rating)] += 1
    
    return {
        "total_reviews": total_reviews,
        "average_rating": round(average_rating, 2),
        "rating_distribution": rating_distribution,
        "formula_id": formula_id
    }


@router.get("/recent", response_model=List[ReviewResponse])
async def get_recent_reviews(
    limit: int = Query(10, ge=1, le=50, description="Number of recent reviews"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get recent reviews across all formulas.
    
    Returns the most recently created reviews from all formulas the user has access to.
    Useful for discovering new formulas and community activity.
    """
    # Get formulas user has access to
    accessible_formulas = db.query(Formula).filter(
        and_(
            Formula.is_active == True,
            or_(
                Formula.is_public == True,
                Formula.author_id == current_user.id
            )
        )
    ).all()
    
    # Get user's subscribed formulas
    subscriptions = db.query(Subscription).filter(
        and_(
            Subscription.user_id == current_user.id,
            Subscription.is_active == True
        )
    ).all()
    
    subscribed_formula_ids = [sub.formula_id for sub in subscriptions]
    
    # Filter accessible formulas
    accessible_formula_ids = []
    for formula in accessible_formulas:
        if formula.is_public or formula.author_id == current_user.id or formula.id in subscribed_formula_ids:
            accessible_formula_ids.append(formula.id)
    
    if not accessible_formula_ids:
        return []
    
    # Get recent reviews
    recent_reviews = db.query(Review).filter(
        Review.formula_id.in_(accessible_formula_ids)
    ).order_by(desc(Review.created_at)).limit(limit).all()
    
    return recent_reviews