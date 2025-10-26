"""
Base Pydantic schemas and common utilities.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        arbitrary_types_allowed=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }
    )


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields."""
    
    created_at: datetime
    updated_at: datetime


class UUIDSchema(BaseSchema):
    """Schema with UUID primary key."""
    
    id: UUID


class BaseResponseSchema(UUIDSchema, TimestampSchema):
    """Base response schema with UUID and timestamps."""
    pass


class BaseCreateSchema(BaseSchema):
    """Base schema for create operations."""
    pass


class BaseUpdateSchema(BaseSchema):
    """Base schema for update operations."""
    
    model_config = ConfigDict(extra="forbid")


class PaginationSchema(BaseSchema):
    """Schema for pagination metadata."""
    
    page: int = Field(ge=1, description="Page number")
    size: int = Field(ge=1, le=100, description="Page size")
    total: int = Field(ge=0, description="Total number of items")
    pages: int = Field(ge=0, description="Total number of pages")
    has_next: bool = Field(description="Whether there are more pages")
    has_prev: bool = Field(description="Whether there are previous pages")


class ErrorSchema(BaseSchema):
    """Schema for error responses."""
    
    error: str = Field(description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    code: Optional[str] = Field(None, description="Error code")


class SuccessSchema(BaseSchema):
    """Schema for success responses."""
    
    message: str = Field(description="Success message")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional data")