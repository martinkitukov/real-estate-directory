from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.types import Enum as CEnum
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base
import enum

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class Developer(Base):
    __tablename__ = "developers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    contact_person = Column(String)
    phone = Column(String)
    address = Column(String)
    website = Column(String)
    verification_status = Column(CEnum(VerificationStatus, name='verification_status',
                                      values_callable=lambda obj: [e.value for e in obj]),
                                nullable=False,
                                default=VerificationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="developer")
    subscriptions = relationship("Subscription", back_populates="developer") 