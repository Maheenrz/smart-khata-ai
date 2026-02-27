from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.services.aitbaar_score import calculate_score
from app.services.cashflow import calculate_cashflow
from app.services.ai_agent import generate_whatsapp_message, generate_cashflow_insight
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class MessageRequest(BaseModel):
    customer_id: int
    language: str = "roman_urdu"  # or "english"

@router.get("/cashflow")
def get_cashflow_insight(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customers = db.query(models.Customer).filter(
        models.Customer.owner_id == current_user.id
    ).all()

    customers_data = []
    for c in customers:
        score = calculate_score(c.transactions)
        customers_data.append({
            "id": c.id,
            "name": c.name,
            "aitbaar_score": score,
            "transactions": c.transactions
        })

    cashflow = calculate_cashflow(customers_data)

    # Gracefully handle AI rate limit or failure
    try:
        insight = generate_cashflow_insight(cashflow, current_user.shop_name)
    except Exception as e:
        insight = f"AI insight unavailable right now — your data is still accurate. Total outstanding: ₨{cashflow['total_outstanding']:,.0f}, at-risk amount: ₨{cashflow['at_risk_amount']:,.0f}."

    return {
        **cashflow,
        "ai_insight": insight
    }



@router.post("/message")
def get_whatsapp_message(
    request: MessageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == request.customer_id,
        models.Customer.owner_id == current_user.id
    ).first()

    unpaid = [t for t in customer.transactions if not t.is_repaid]
    total_due = sum(t.amount for t in unpaid)

    try:
        message = generate_whatsapp_message(
            customer_name=customer.name,
            amount_due=total_due,
            shop_name=current_user.shop_name,
            language=request.language
        )
    except Exception as e:
        message = f"Assalam o Alaikum {customer.name} bhai, aap ki taraf se ₨{total_due:,.0f} baaki hain. Meherbani farma ke jald ada kar dein. Shukriya — {current_user.shop_name}"

    return {
        "customer_name": customer.name,
        "amount_due": total_due,
        "message": message
    }