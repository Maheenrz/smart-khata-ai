from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.routers.auth import get_current_user
from app.services.aitbaar_score import calculate_score
from collections import defaultdict

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/risk")
def get_community_risk(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get current shopkeeper's area
    current_customers = db.query(models.Customer).filter(
        models.Customer.owner_id == current_user.id
    ).all()

    my_areas = set(c.area for c in current_customers)

    # Find all customers in same areas across ALL shopkeepers
    all_customers_in_area = db.query(models.Customer).filter(
        models.Customer.area.in_(my_areas),
        models.Customer.owner_id != current_user.id  # exclude own customers
    ).all()

    # Group by phone number (same person across shops)
    phone_map = defaultdict(list)
    for c in all_customers_in_area:
        score = calculate_score(c.transactions)
        phone_map[c.phone].append({
            "name": c.name,
            "area": c.area,
            "aitbaar_score": score,
            "total_due": sum(t.amount for t in c.transactions if not t.is_repaid)
        })

    # Flag customers reported by 2+ shops with low scores
    community_risks = []
    for phone, reports in phone_map.items():
        avg_score = sum(r["aitbaar_score"] for r in reports) / len(reports)
        if len(reports) >= 2 and avg_score < 50:
            community_risks.append({
                "phone": phone,
                "name": reports[0]["name"],
                "area": reports[0]["area"],
                "reported_by_shops": len(reports),
                "average_aitbaar_score": round(avg_score),
                "total_due_across_shops": sum(r["total_due"] for r in reports),
                "risk_level": "High" if avg_score < 30 else "Medium"
            })

    # Sort by most reported first
    community_risks.sort(key=lambda x: x["reported_by_shops"], reverse=True)

    return {
        "your_areas": list(my_areas),
        "community_risks": community_risks,
        "total_flagged": len(community_risks)
    }