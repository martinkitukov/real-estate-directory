from datetime import datetime
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.types import Enum as CEnum
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base
import enum

class UserRole(str, enum.Enum):
    BUYER = "buyer"
    DEVELOPER = "developer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(CEnum(UserRole, name='user_role',
                       values_callable=lambda obj: [e.value for e in obj]),
                 nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    saved_listings = relationship("SavedListing", back_populates="user") 