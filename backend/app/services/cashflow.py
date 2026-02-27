from datetime import datetime, timedelta

def calculate_cashflow(customers_with_transactions):
    total_outstanding = 0
    customers_at_risk = []
    upcoming_collections = []
    today = datetime.utcnow()

    for customer in customers_with_transactions:
        transactions = customer["transactions"]
        unpaid = [t for t in transactions if not t.is_repaid]
        
        # Skip customers with nothing owed
        if not unpaid:
            continue

        customer_due = sum(t.amount for t in unpaid)
        total_outstanding += customer_due

        # Calculate average repayment delay from actual paid history
        paid_transactions = [
            t for t in transactions
            if t.is_repaid and t.date_repaid and t.date_given
        ]

        if paid_transactions:
            # Real average delay based on actual behavior
            total_delay = sum(
                (t.date_repaid - t.date_given).days
                for t in paid_transactions
            )
            avg_delay = total_delay / len(paid_transactions)
        else:
            # No history yet — assume 30 days (conservative default)
            avg_delay = 30

        # Find the oldest unpaid transaction
        # This is the one most likely to be overdue
        oldest_unpaid = min(unpaid, key=lambda t: t.date_given)
        days_credit_has_been_outstanding = (today - oldest_unpaid.date_given).days

        # Expected payment date = when credit was given + avg delay
        expected_date = oldest_unpaid.date_given + timedelta(days=avg_delay)

        # How many days until expected payment
        # Positive = still waiting (future)
        # Negative = already past expected date (overdue)
        days_until_payment = (expected_date - today).days

        upcoming_collections.append({
            "customer_name": customer["name"],
            "customer_id": customer["id"],
            "amount_due": customer_due,
            "days_credit_outstanding": days_credit_has_been_outstanding,
            "expected_in_days": max(days_until_payment, 0),
            "expected_date": expected_date.strftime("%d %b %Y"),
            "is_overdue": days_until_payment < 0,
            "overdue_by_days": abs(min(days_until_payment, 0))
        })

        # Flag as at risk if EITHER:
        # 1. More than 7 days past expected payment date (real lateness)
        # 2. Aitbaar score is below 40 (bad payer history)
        is_overdue_seriously = days_until_payment < -7
        is_bad_score = customer["aitbaar_score"] < 40

        if is_overdue_seriously or is_bad_score:
            customers_at_risk.append({
                "customer_name": customer["name"],
                "customer_id": customer["id"],
                "amount_due": customer_due,
                "aitbaar_score": customer["aitbaar_score"],
                "overdue_by_days": abs(min(days_until_payment, 0)),
                "avg_repayment_days": round(avg_delay),
                "risk_reason": (
                    "Seriously overdue and bad score" if is_overdue_seriously and is_bad_score
                    else "Seriously overdue" if is_overdue_seriously
                    else "Poor repayment history"
                )
            })

    # Sort upcoming collections — soonest expected first
    upcoming_collections.sort(key=lambda x: x["expected_in_days"])

    # Sort at risk — highest amount first
    customers_at_risk.sort(key=lambda x: x["amount_due"], reverse=True)

    # Cash shortage warning:
    # Triggered when at-risk amount is more than 30% of total outstanding
    at_risk_amount = sum(c["amount_due"] for c in customers_at_risk)
    shortage_warning = (
        at_risk_amount > (total_outstanding * 0.3)
        if total_outstanding > 0 else False
    )

    return {
        "total_outstanding": total_outstanding,
        "at_risk_amount": at_risk_amount,
        "shortage_warning": shortage_warning,
        "customers_at_risk": customers_at_risk,
        "upcoming_collections": upcoming_collections[:5]
    }