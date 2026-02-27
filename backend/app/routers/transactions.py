from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/transactions", tags=["transactions"])

class TransactionCreate(BaseModel):
    customer_id: int
    amount: float
    type: str  # "credit" or "payment"

class MarkRepaid(BaseModel):
    transaction_id: int

@router.post("/")
def add_transaction(
    txn: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == txn.customer_id,
        models.Customer.owner_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    new_txn = models.Transaction(
        customer_id=txn.customer_id,
        amount=txn.amount,
        type=txn.type,
        date_given=datetime.utcnow(),
        is_repaid=False
    )
    db.add(new_txn)
    db.commit()
    return {"message": "Transaction added"}

@router.patch("/repaid/{transaction_id}")
def mark_as_repaid(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    txn = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    txn.is_repaid = True
    txn.date_repaid = datetime.utcnow()
    db.commit()
    return {"message": "Marked as repaid"}