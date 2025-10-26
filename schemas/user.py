"""
Pydantic schemas for User model.
"""

from typing import List, Optional
from uuid import UUID

from pydantic import EmailStr, Field, validator

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class UserCreate(BaseCreateSchema):
    """Schema for creating a new user."""
    
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=8, description="Password")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    bio: Optional[str] = Field(None, description="User bio")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar URL")
    creator_bio: Optional[str] = Field(None, description="Creator bio")
    social_links: Optional[str] = Field(None, description="Social media links (JSON)")


class UserUpdate(BaseUpdateSchema):
    """Schema for updating a user."""
    
    email: Optional[EmailStr] = Field(None, description="User email address")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    bio: Optional[str] = Field(None, description="User bio")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar URL")
    creator_bio: Optional[str] = Field(None, description="Creator bio")
    social_links: Optional[str] = Field(None, description="Social media links (JSON)")
    is_active: Optional[bool] = Field(None, description="Account active status")
    is_verified: Optional[bool] = Field(None, description="Account verified status")


class UserResponse(BaseResponseSchema):
    """Schema for user response."""
    
    email: str
    username: str
    first_name: Optional[str]
    last_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    is_verified: bool
    role: str
    creator_bio: Optional[str]
    social_links: Optional[str]
    
    # Computed fields
    full_name: str = Field(description="User's full name")
    is_creator: bool = Field(description="Whether user is a creator")
    is_admin: bool = Field(description="Whether user is an admin")


class UserList(PaginationSchema):
    """Schema for paginated user list."""
    
    items: List[UserResponse] = Field(description="List of users")


class UserLogin(BaseCreateSchema):
    """Schema for user login."""
    
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="Password")


class UserPasswordChange(BaseCreateSchema):
    """Schema for password change."""
    
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")


class UserPasswordReset(BaseCreateSchema):
    """Schema for password reset."""
    
    email: EmailStr = Field(..., description="User email address")


class UserPasswordResetConfirm(BaseCreateSchema):
    """Schema for password reset confirmation."""
    
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, description="New password")