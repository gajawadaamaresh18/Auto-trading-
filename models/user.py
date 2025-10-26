"""
User model representing both normal users and formula creators.
"""

import enum
from typing import List, Optional

from sqlalchemy import Boolean, Column, Enum, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class UserRole(str, enum.Enum):
    """User role enumeration."""
    NORMAL = "normal"
    CREATOR = "creator"
    ADMIN = "admin"


class User(Base, UUIDMixin, TimestampMixin):
    """
    User model representing both normal users and formula creators.
    
    This model handles user authentication, profile information, and role-based access.
    Normal users can subscribe to formulas and execute trades, while creators can
    publish formulas and manage their content. Admins have system-wide privileges.
    """
    
    __tablename__ = "users"
    
    # Basic user information
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.NORMAL, nullable=False, index=True)
    
    # Creator-specific fields
    creator_bio = Column(Text, nullable=True)
    social_links = Column(Text, nullable=True)  # JSON string of social media links
    
    # Relationships
    created_formulas = relationship("Formula", back_populates="creator", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")
    broker_accounts = relationship("BrokerAccount", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_users_email_active", "email", "is_active"),
        Index("idx_users_role_active", "role", "is_active"),
        Index("idx_users_username_active", "username", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
    
    @property
    def full_name(self) -> str:
        """Get the user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    @property
    def is_creator(self) -> bool:
        """Check if user is a creator."""
        return self.role in [UserRole.CREATOR, UserRole.ADMIN]
    
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == UserRole.ADMIN