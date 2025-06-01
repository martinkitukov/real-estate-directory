from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

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