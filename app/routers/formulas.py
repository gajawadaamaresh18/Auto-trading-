from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional
from math import ceil
from app.database import get_db
from app.models import User, Formula, Subscription
from app.schemas import (
    FormulaCreate, FormulaUpdate, FormulaResponse, FormulaListResponse,
    FormulaFilters
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/formulas", tags=["formulas"])


@router.get("/", response_model=FormulaListResponse)
async def get_formulas(
    category: Optional[str] = Query(None, description="Filter by category"),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags"),
    min_performance_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum performance score"),
    max_performance_score: Optional[float] = Query(None, ge=0, le=100, description="Maximum performance score"),
    is_public: Optional[bool] = Query(True, description="Filter by public/private formulas"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    sort_by: str = Query("created_at", description="Sort field: created_at, performance_score, total_subscribers"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all formulas with filtering, sorting, and pagination.
    
    Supports filtering by category, tags, performance score range, and public/private status.
    Includes search functionality across name and description fields.
    Results are paginated and can be sorted by various criteria.
    """
    # Build query
    query = db.query(Formula).filter(Formula.is_active == True)
    
    # Apply filters
    if category:
        query = query.filter(Formula.category == category)
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Formula.tags.contains([tag]))
    
    if min_performance_score is not None:
        query = query.filter(Formula.performance_score >= min_performance_score)
    
    if max_performance_score is not None:
        query = query.filter(Formula.performance_score <= max_performance_score)
    
    if is_public is not None:
        query = query.filter(Formula.is_public == is_public)
    
    if search:
        search_filter = or_(
            Formula.name.ilike(f"%{search}%"),
            Formula.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Apply sorting
    if sort_by == "performance_score":
        sort_column = Formula.performance_score
    elif sort_by == "total_subscribers":
        sort_column = Formula.total_subscribers
    else:  # default to created_at
        sort_column = Formula.created_at
    
    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * size
    formulas = query.offset(offset).limit(size).all()
    
    # Calculate total pages
    total_pages = ceil(total / size) if total > 0 else 1
    
    return FormulaListResponse(
        formulas=formulas,
        total=total,
        page=page,
        size=size,
        total_pages=total_pages
    )


@router.get("/{formula_id}", response_model=FormulaResponse)
async def get_formula(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific formula by ID.
    
    Returns detailed information about a single formula including its code and metadata.
    """
    formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if user can access private formula
    if not formula.is_public and formula.author_id != current_user.id:
        # Check if user is subscribed to this formula
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == formula_id,
            Subscription.is_active == True
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Subscribe to access this formula."
            )
    
    return formula


@router.post("/", response_model=FormulaResponse, status_code=status.HTTP_201_CREATED)
async def create_formula(
    formula_data: FormulaCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new trading formula.
    
    Creates a new formula with the provided code and metadata.
    The creator becomes the author and can set visibility (public/private).
    """
    db_formula = Formula(
        name=formula_data.name,
        description=formula_data.description,
        formula_code=formula_data.formula_code,
        category=formula_data.category,
        tags=formula_data.tags or [],
        author_id=current_user.id,
        is_public=formula_data.is_public
    )
    
    db.add(db_formula)
    db.commit()
    db.refresh(db_formula)
    
    return db_formula


@router.put("/{formula_id}", response_model=FormulaResponse)
async def update_formula(
    formula_id: int,
    formula_data: FormulaUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing formula.
    
    Only the formula author can update their formulas.
    Updates can include name, description, code, category, tags, and visibility.
    """
    formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.author_id == current_user.id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found or you don't have permission to edit it"
        )
    
    # Update fields if provided
    update_data = formula_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(formula, field, value)
    
    db.commit()
    db.refresh(formula)
    
    return formula


@router.delete("/{formula_id}", status_code=status.HTTP_200_OK)
async def delete_formula(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a formula.
    
    Only the formula author can delete their formulas.
    This soft-deletes the formula (sets is_active=False) to preserve historical data.
    """
    formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.author_id == current_user.id,
        Formula.is_active == True
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found or you don't have permission to delete it"
        )
    
    # Soft delete
    formula.is_active = False
    db.commit()
    
    return {"message": "Formula deleted successfully"}


@router.get("/categories/list", response_model=List[str])
async def get_formula_categories(
    db: Session = Depends(get_db)
):
    """
    Get list of all formula categories.
    
    Returns unique categories from all active formulas for filtering purposes.
    """
    categories = db.query(Formula.category).filter(
        Formula.is_active == True,
        Formula.category.isnot(None)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]


@router.get("/tags/list", response_model=List[str])
async def get_formula_tags(
    db: Session = Depends(get_db)
):
    """
    Get list of all formula tags.
    
    Returns unique tags from all active formulas for filtering purposes.
    """
    # Get all tags from active formulas
    formulas = db.query(Formula.tags).filter(
        Formula.is_active == True,
        Formula.tags.isnot(None)
    ).all()
    
    # Flatten and deduplicate tags
    all_tags = set()
    for formula_tags in formulas:
        if formula_tags[0]:
            all_tags.update(formula_tags[0])
    
    return sorted(list(all_tags))


@router.get("/my/formulas", response_model=List[FormulaResponse])
async def get_my_formulas(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get formulas created by the current user.
    
    Returns all formulas (active and inactive) created by the authenticated user.
    """
    formulas = db.query(Formula).filter(
        Formula.author_id == current_user.id
    ).order_by(desc(Formula.created_at)).all()
    
    return formulas


@router.post("/{formula_id}/duplicate", response_model=FormulaResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_formula(
    formula_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Duplicate an existing formula.
    
    Creates a copy of an existing formula with a new name.
    The duplicated formula is owned by the current user.
    """
    original_formula = db.query(Formula).filter(
        Formula.id == formula_id,
        Formula.is_active == True
    ).first()
    
    if not original_formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found"
        )
    
    # Check if user can access the formula
    if not original_formula.is_public and original_formula.author_id != current_user.id:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.formula_id == formula_id,
            Subscription.is_active == True
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Subscribe to duplicate this formula."
            )
    
    # Create duplicate
    duplicate_formula = Formula(
        name=f"{original_formula.name} (Copy)",
        description=original_formula.description,
        formula_code=original_formula.formula_code,
        category=original_formula.category,
        tags=original_formula.tags.copy() if original_formula.tags else [],
        author_id=current_user.id,
        is_public=False  # Duplicates are private by default
    )
    
    db.add(duplicate_formula)
    db.commit()
    db.refresh(duplicate_formula)
    
    return duplicate_formula