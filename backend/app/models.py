from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    shop_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    city = Column(String, default="Lahore")
    customers=relationship("Customer", back_populates="owner")


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="customers")
    transactions = relationship("Transaction", back_populates="customer")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    amount = Column(Float)
    type = Column(String)  # "credit" or "payment"
    date_given = Column(DateTime)
    date_repaid = Column(DateTime, nullable=True)
    is_repaid = Column(Boolean, default=False)
    customer = relationship("Customer", back_populates="transactions")        