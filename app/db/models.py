from datetime import datetime
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    BUYER = "buyer"
    DEVELOPER = "developer"
    ADMIN = "admin"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class ProjectStatus(str, enum.Enum):
    PLANNING = "planning"
    UNDER_CONSTRUCTION = "under_construction"
    COMPLETED = "completed"

class ProjectType(str, enum.Enum):
    APARTMENT_BUILDING = "apartment_building"
    HOUSE_COMPLEX = "house_complex"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(Enum(UserRole, name='user_role'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    saved_listings = relationship("SavedListing", back_populates="user")

class Developer(Base):
    __tablename__ = "developers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    company_name = Column(String, nullable=False)
    contact_person = Column(String)
    phone = Column(String)
    address = Column(String)
    website = Column(String)
    verification_status = Column(Enum(VerificationStatus, name='verification_status'), default=VerificationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")
    projects = relationship("Project", back_populates="developer")
    subscriptions = relationship("Subscription", back_populates="developer")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("developers.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    location_text = Column(String)
    location_point = Column(Geometry('POINT', srid=4326))
    city = Column(String)
    neighborhood = Column(String)
    country = Column(String)
    project_type = Column(Enum(ProjectType, name='project_type'))
    status = Column(Enum(ProjectStatus, name='project_status'))
    expected_completion_date = Column(DateTime)
    cover_image_url = Column(String)
    gallery_urls = Column(Text)  # JSON string of URLs
    amenities_list = Column(Text)  # JSON string of amenities
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Relationships
    developer = relationship("Developer", back_populates="projects")
    saved_listings = relationship("SavedListing", back_populates="project")

class SavedListing(Base):
    __tablename__ = "saved_listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_listings")
    project = relationship("Project", back_populates="saved_listings")

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price_bgn = Column(Integer)
    price_usd = Column(Integer)
    price_eur = Column(Integer)
    duration_months = Column(Integer)
    listing_limit = Column(Integer)
    features_list = Column(Text)  # JSON string of features

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("developers.id"))
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String)  # active, expired, cancelled
    payment_transaction_id = Column(String)

    # Relationships
    developer = relationship("Developer", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan") 