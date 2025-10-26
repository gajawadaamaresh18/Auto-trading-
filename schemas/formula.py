"""
Pydantic schemas for Formula model.
"""

from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import Field

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class FormulaCreate(BaseCreateSchema):
    """Schema for creating a new formula."""
    
    title: str = Field(..., min_length=1, max_length=200, description="Formula title")
    description: str = Field(..., description="Formula description")
    short_description: Optional[str] = Field(None, max_length=500, description="Short description")
    formula_code: str = Field(..., description="Formula code/logic")
    parameters: Optional[str] = Field(None, description="Formula parameters (JSON)")
    version: str = Field("1.0.0", max_length=20, description="Formula version")
    category: str = Field(..., description="Formula category")
    tags: Optional[str] = Field(None, description="Formula tags (JSON)")
    is_free: bool = Field(False, description="Whether formula is free")
    price: Optional[Decimal] = Field(None, ge=0, description="Formula price")
    currency: str = Field("USD", max_length=3, description="Currency")
    is_public: bool = Field(True, description="Whether formula is public")
    documentation: Optional[str] = Field(None, description="Formula documentation")
    usage_instructions: Optional[str] = Field(None, description="Usage instructions")
    risk_level: Optional[str] = Field(None, description="Risk level")
    min_capital: Optional[Decimal] = Field(None, ge=0, description="Minimum capital required")
    max_drawdown: Optional[Decimal] = Field(None, ge=0, le=100, description="Maximum drawdown percentage")


class FormulaUpdate(BaseUpdateSchema):
    """Schema for updating a formula."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Formula title")
    description: Optional[str] = Field(None, description="Formula description")
    short_description: Optional[str] = Field(None, max_length=500, description="Short description")
    formula_code: Optional[str] = Field(None, description="Formula code/logic")
    parameters: Optional[str] = Field(None, description="Formula parameters (JSON)")
    version: Optional[str] = Field(None, max_length=20, description="Formula version")
    category: Optional[str] = Field(None, description="Formula category")
    tags: Optional[str] = Field(None, description="Formula tags (JSON)")
    is_free: Optional[bool] = Field(None, description="Whether formula is free")
    price: Optional[Decimal] = Field(None, ge=0, description="Formula price")
    currency: Optional[str] = Field(None, max_length=3, description="Currency")
    is_public: Optional[bool] = Field(None, description="Whether formula is public")
    status: Optional[str] = Field(None, description="Formula status")
    documentation: Optional[str] = Field(None, description="Formula documentation")
    usage_instructions: Optional[str] = Field(None, description="Usage instructions")
    risk_level: Optional[str] = Field(None, description="Risk level")
    min_capital: Optional[Decimal] = Field(None, ge=0, description="Minimum capital required")
    max_drawdown: Optional[Decimal] = Field(None, ge=0, le=100, description="Maximum drawdown percentage")


class FormulaResponse(BaseResponseSchema):
    """Schema for formula response."""
    
    title: str
    description: str
    short_description: Optional[str]
    creator_id: UUID
    formula_code: str
    parameters: Optional[str]
    version: str
    category: str
    tags: Optional[str]
    is_free: bool
    price: Optional[Decimal]
    currency: str
    status: str
    is_public: bool
    total_subscribers: int
    total_trades: int
    success_rate: Optional[Decimal]
    avg_return: Optional[Decimal]
    documentation: Optional[str]
    usage_instructions: Optional[str]
    risk_level: Optional[str]
    min_capital: Optional[Decimal]
    max_drawdown: Optional[Decimal]
    
    # Computed fields
    is_published: bool = Field(description="Whether formula is published")
    is_monetized: bool = Field(description="Whether formula is monetized")
    display_price: str = Field(description="Formatted price string")


class FormulaList(PaginationSchema):
    """Schema for paginated formula list."""
    
    items: List[FormulaResponse] = Field(description="List of formulas")


class FormulaSearch(BaseCreateSchema):
    """Schema for formula search."""
    
    query: Optional[str] = Field(None, description="Search query")
    category: Optional[str] = Field(None, description="Filter by category")
    is_free: Optional[bool] = Field(None, description="Filter by free status")
    min_price: Optional[Decimal] = Field(None, ge=0, description="Minimum price")
    max_price: Optional[Decimal] = Field(None, ge=0, description="Maximum price")
    min_rating: Optional[Decimal] = Field(None, ge=0, le=5, description="Minimum rating")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc/desc)")


class FormulaStats(BaseCreateSchema):
    """Schema for formula statistics."""
    
    total_formulas: int = Field(description="Total number of formulas")
    published_formulas: int = Field(description="Number of published formulas")
    total_subscribers: int = Field(description="Total subscribers across all formulas")
    total_trades: int = Field(description="Total trades executed")
    avg_success_rate: Optional[Decimal] = Field(description="Average success rate")
    total_revenue: Optional[Decimal] = Field(description="Total revenue generated")