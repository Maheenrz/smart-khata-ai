def calculate_score(transactions):
    if not transactions:
        return 50  # neutral score for new customers

    total = len(transactions)
    repaid = [t for t in transactions if t.is_repaid]
    unpaid = [t for t in transactions if not t.is_repaid]

    if total == 0:
        return 50

    repayment_rate = len(repaid) / total

    # Calculate average delay in days
    delays = []
    for t in repaid:
        if t.date_repaid and t.date_given:
            delay = (t.date_repaid - t.date_given).days
            delays.append(delay)

    avg_delay = sum(delays) / len(delays) if delays else 30

    # Score formula
    score = (repayment_rate * 60)  # 60 points for repayment rate
    if avg_delay <= 7:
        score += 40
    elif avg_delay <= 14:
        score += 30
    elif avg_delay <= 30:
        score += 15
    else:
        score += 0

    return round(min(max(score, 0), 100))  # clamp between 0-100