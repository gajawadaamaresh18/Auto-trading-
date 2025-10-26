from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.db.database import Base

class Formula(Base):
    __tablename__ = "formulas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    blocks = Column(JSON, nullable=False)  # Array of block objects
    risk_level = Column(String(20), nullable=False)  # low, medium, high
    is_public = Column(Boolean, default=False, nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Performance metrics
    total_return = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    
    # Relationships
    author = relationship("User", back_populates="formulas")
    subscriptions = relationship("Subscription", back_populates="formula")
    reviews = relationship("Review", back_populates="formula")
    trades = relationship("Trade", back_populates="formula")
    
    def __repr__(self):
        return f"<Formula(id={self.id}, name={self.name}, author_id={self.author_id})>"