from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(Text, unique=True, nullable=False)
    title = Column(Text, nullable=False)
    platform = Column(String(50))  # e.g., "amazon", "flipkart"
    current_price = Column(Float, nullable=False)
    currency = Column(String(3), default="INR")
    image_url = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    specifications = Column(JSON, nullable=True)
    rating = Column(Float, nullable=True)
    reviews_count = Column(Integer, nullable=True)
    last_checked = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class UserTracking(Base):
    __tablename__ = "user_tracking"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    target_price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_notified_at = Column(DateTime(timezone=True), nullable=True)
    
    # New columns for manual tracking
    last_price = Column(Float, nullable=True)
    last_checked = Column(DateTime(timezone=True), nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    price_at_alert = Column(Float, nullable=False)
    sent_via = Column(String(20), default="email")
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    opened = Column(Boolean, default=False)

class AICache(Base):
    __tablename__ = "ai_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    analysis_type = Column(String(50), nullable=False)  # fake_discount, sentiment, deal_prediction
    result = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))  # optional TTL

class UpcomingSale(Base):
    __tablename__ = "upcoming_sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sale_name = Column(String(255), nullable=False)
    platform = Column(String(100), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    categories = Column(ARRAY(String), nullable=True)
    confidence = Column(String(20), default="medium")
    year = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())