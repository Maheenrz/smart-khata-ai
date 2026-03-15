from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.services.aitbaar_score import calculate_score
from app.services.cashflow import calculate_cashflow
from app.services.ai_agent import generate_whatsapp_message, generate_cashflow_insight
from pydantic import BaseModel
from datetime import datetime
from collections import defaultdict

router = APIRouter(prefix="/ai", tags=["ai"])

class MessageRequest(BaseModel):
    customer_id: int
    language: str = "roman_urdu"


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

    try:
        insight = generate_cashflow_insight(cashflow, current_user.shop_name)
    except Exception as e:
        insight = f"AI insight unavailable right now. Total outstanding: Rs.{cashflow['total_outstanding']:,.0f}, at-risk: Rs.{cashflow['at_risk_amount']:,.0f}."

    return {**cashflow, "ai_insight": insight}


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
        message = f"Assalam o Alaikum {customer.name} bhai, aap ki taraf se Rs.{total_due:,.0f} baaki hain. Meherbani farma ke jald ada kar dein. Shukriya — {current_user.shop_name}"

    return {"customer_name": customer.name, "amount_due": total_due, "message": message}


@router.get("/intelligence")
def get_business_intelligence(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    customers = db.query(models.Customer).filter(
        models.Customer.owner_id == current_user.id
    ).all()

    # flatten all transactions with customer info attached
    all_transactions = []
    for c in customers:
        for t in c.transactions:
            all_transactions.append({
                "customer_id": c.id,
                "customer_name": c.name,
                "amount": t.amount,
                "type": t.type,
                "date_given": t.date_given,
                "date_repaid": t.date_repaid,
                "is_repaid": t.is_repaid
            })

    # 1. Payment velocity by week of month
    # Week 1 is usually salary week so customers pay fast
    # Week 3 is usually when money gets tight
    week_delays = defaultdict(list)
    for t in all_transactions:
        if t["is_repaid"] and t["date_repaid"] and t["date_given"]:
            week_num = min(4, (t["date_given"].day - 1) // 7 + 1)
            delay = (t["date_repaid"] - t["date_given"]).days
            week_delays[week_num].append(delay)

    week_labels = {1: "Week 1", 2: "Week 2", 3: "Week 3", 4: "Week 4"}
    payment_by_week = []
    for week in [1, 2, 3, 4]:
        delays = week_delays.get(week, [])
        avg = round(sum(delays) / len(delays), 1) if delays else None
        payment_by_week.append({
            "week": week_labels[week],
            "avgDays": avg,
            "transactions": len(delays)
        })

    filled = [w for w in payment_by_week if w["avgDays"] is not None]
    worst_week = max(filled, key=lambda x: x["avgDays"]) if filled else None
    best_week = min(filled, key=lambda x: x["avgDays"]) if filled else None

    # 2. Monthly collection pattern — which months have bad collections historically
    monthly_data = defaultdict(lambda: {"total": 0, "collected": 0, "count": 0})
    for t in all_transactions:
        if t["date_given"]:
            month_key = t["date_given"].strftime("%b")
            monthly_data[month_key]["total"] += t["amount"]
            monthly_data[month_key]["count"] += 1
            if t["is_repaid"]:
                monthly_data[month_key]["collected"] += t["amount"]

    month_order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    monthly_pattern = []
    for month in month_order:
        if month in monthly_data:
            d = monthly_data[month]
            rate = round((d["collected"] / d["total"]) * 100) if d["total"] > 0 else 0
            monthly_pattern.append({
                "month": month,
                "collectionRate": rate,
                "totalAmount": d["total"],
                "collectedAmount": d["collected"],
                "transactions": d["count"]
            })

    danger_months = [m for m in monthly_pattern if m["collectionRate"] < 60]

    # 3. Customer trend — compare first half vs second half of repayment history
    # if someone is paying slower recently, catch it before they default completely
    customer_trends = []
    for c in customers:
        paid = sorted(
            [t for t in c.transactions if t.is_repaid and t.date_repaid and t.date_given],
            key=lambda t: t.date_given
        )
        score = calculate_score(c.transactions)
        total_due = sum(t.amount for t in c.transactions if not t.is_repaid)

        if len(paid) < 4:
            trend = "insufficient_data"
            trend_label = "New Customer"
        else:
            half = len(paid) // 2
            early = paid[:half]
            recent = paid[half:]
            early_avg = sum((t.date_repaid - t.date_given).days for t in early) / len(early)
            recent_avg = sum((t.date_repaid - t.date_given).days for t in recent) / len(recent)

            if recent_avg > early_avg * 1.5:
                trend = "deteriorating"
                trend_label = "↓ Deteriorating"
            elif recent_avg < early_avg * 0.8:
                trend = "improving"
                trend_label = "↑ Improving"
            else:
                trend = "stable"
                trend_label = "→ Stable"

        customer_trends.append({
            "id": c.id,
            "name": c.name,
            "trend": trend,
            "trend_label": trend_label,
            "aitbaar_score": score,
            "total_due": total_due
        })

    # show deteriorating customers first
    trend_order = {"deteriorating": 0, "stable": 1, "improving": 2, "insufficient_data": 3}
    customer_trends.sort(key=lambda x: trend_order.get(x["trend"], 3))

    # 4. This week forecast based on historical pattern for current week
    today = datetime.utcnow()
    current_week_num = min(4, (today.day - 1) // 7 + 1)
    current_week_label = week_labels[current_week_num]
    current_week_data = next(
        (w for w in payment_by_week if w["week"] == current_week_label), None
    )

    forecast = None
    if current_week_data and current_week_data["avgDays"] is not None:
        avg = current_week_data["avgDays"]
        if avg > 20:
            forecast = {
                "type": "warning",
                "english": f"Historically your slowest collection week. Average payment delay is {avg} days. Avoid extending new credit.",
                "action": "Focus on collecting from existing overdue customers only."
            }
        elif avg < 10:
            forecast = {
                "type": "positive",
                "english": f"Historically your best collection week. Average delay is only {avg} days.",
                "action": "Follow up aggressively on all overdue accounts now."
            }
        else:
            forecast = {
                "type": "neutral",
                "english": f"Average collection week. Expected delay around {avg} days.",
                "action": "Routine follow-ups. Monitor at-risk customers closely."
            }

    # 5. Cash flow history for the last 6 months
    cashflow_history = []
    for i in range(5, -1, -1):
        month_offset = today.month - i
        year = today.year
        if month_offset <= 0:
            month_offset += 12
            year -= 1
        label = datetime(year, month_offset, 1).strftime("%b")

        month_txns = [
            t for t in all_transactions
            if t["date_given"] and
            t["date_given"].month == month_offset and
            t["date_given"].year == year
        ]
        collected = sum(t["amount"] for t in month_txns if t["is_repaid"])
        outstanding = sum(t["amount"] for t in month_txns if not t["is_repaid"])
        cashflow_history.append({"month": label, "collected": collected, "outstanding": outstanding})

    return {
        "payment_by_week": payment_by_week,
        "monthly_pattern": monthly_pattern,
        "customer_trends": customer_trends,
        "danger_months": danger_months,
        "worst_week": worst_week,
        "best_week": best_week,
        "this_week_forecast": forecast,
        "cashflow_history": cashflow_history,
        "current_week": current_week_label,
        "total_customers": len(customers),
        "deteriorating_count": len([c for c in customer_trends if c["trend"] == "deteriorating"]),
        "improving_count": len([c for c in customer_trends if c["trend"] == "improving"])
    }
