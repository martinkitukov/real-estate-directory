from datetime import datetime
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.infrastructure.database import Base
import enum

class ProjectStatus(str, enum.Enum):
    PLANNING = "planning"
    UNDER_CONSTRUCTION = "under_construction"
    COMPLETED = "completed"

class ProjectType(str, enum.Enum):
    APARTMENT_BUILDING = "apartment_building"
    HOUSE_COMPLEX = "house_complex"

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