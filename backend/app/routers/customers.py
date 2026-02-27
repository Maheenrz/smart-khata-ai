from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.services.aitbaar_score import calculate_score
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/customers", tags=["customers"])

class CustomerCreate(BaseModel):
    name: str
    phone: str
    area: Optional[str] = None  # was missing — caused area to never save

@router.get("/")
def get_customers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customers = db.query(models.Customer).filter(
        models.Customer.owner_id == current_user.id
    ).all()

    result = []
    for c in customers:
        transactions = c.transactions
        score = calculate_score(transactions)
        total_due = sum(t.amount for t in transactions if not t.is_repaid)
        result.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "area": c.area,  # was missing
            "aitbaar_score": score,
            "total_due": total_due,
            "total_transactions": len(transactions)
        })

    result.sort(key=lambda x: x["total_due"], reverse=True)
    return result


@router.post("/")
def add_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new = models.Customer(
        name=customer.name,
        phone=customer.phone,
        area=customer.area,  # was missing
        owner_id=current_user.id
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return {"message": "Customer added", "id": new.id}


@router.get("/{customer_id}")
def get_customer_detail(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.owner_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    transactions = customer.transactions
    score = calculate_score(transactions)
    total_due = sum(t.amount for t in transactions if not t.is_repaid)

    return {
        "id": customer.id,
        "name": customer.name,
        "phone": customer.phone,
        "area": customer.area,  # was missing
        "aitbaar_score": score,
        "total_due": total_due,
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "type": t.type,
                "date_given": t.date_given,
                "date_repaid": t.date_repaid,
                "is_repaid": t.is_repaid
            } for t in transactions
        ]
    }


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id,
        models.Customer.owner_id == current_user.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Delete transactions first due to foreign key constraint
    db.query(models.Transaction).filter(
        models.Transaction.customer_id == customer_id
    ).delete()

    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}