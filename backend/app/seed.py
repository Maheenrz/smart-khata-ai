from app.database import SessionLocal
from app import models
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.User).first():
        print("Already seeded, skipping.")
        db.close()
        return

    # Create shopkeeper user
    user = models.User(
        name="Ahmed Khan",
        shop_name="Khan General Store",
        email="ahmed@test.com",
        city="Lahore",
        hashed_password=pwd_context.hash("test@123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Fake customers
    customers_data = [
        {"name": "Imran Butt", "phone": "03001234567"},
        {"name": "Tariq Mehmood", "phone": "03011234567"},
        {"name": "Salman Raza", "phone": "03021234567"},
        {"name": "Usman Ali", "phone": "03031234567"},
        {"name": "Bilal Sheikh", "phone": "03041234567"},
        {"name": "Kamran Iqbal", "phone": "03051234567"},
        {"name": "Zeeshan Malik", "phone": "03061234567"},
        {"name": "Farhan Siddiqui", "phone": "03071234567"},
        {"name": "Hassan Nawaz", "phone": "03081234567"},
        {"name": "Asif Javed", "phone": "03091234567"},
        {"name": "Rizwan Chaudhry", "phone": "03101234567"},
        {"name": "Naveed Ahmed", "phone": "03111234567"},
        {"name": "Shakeel Baig", "phone": "03121234567"},
        {"name": "Waseem Akram", "phone": "03131234567"},
        {"name": "Junaid Khan", "phone": "03141234567"},
    ]

    # Different repayment behaviors for varied Aitbaar scores
    behaviors = [
        {"delay": 2,  "default_chance": 0.0},   # excellent
        {"delay": 5,  "default_chance": 0.1},   # good
        {"delay": 10, "default_chance": 0.2},   # average
        {"delay": 20, "default_chance": 0.4},   # risky
        {"delay": 30, "default_chance": 0.6},   # bad
    ]

    for i, c in enumerate(customers_data):
        customer = models.Customer(
            name=c["name"],
            phone=c["phone"],
            owner_id=user.id
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        behavior = behaviors[i % len(behaviors)]

        # Add 8 past transactions per customer
        for j in range(8):
            date_given = datetime.utcnow() - timedelta(days=random.randint(5, 90))
            is_repaid = random.random() > behavior["default_chance"]
            delay_days = behavior["delay"] + random.randint(-2, 5)
            date_repaid = date_given + timedelta(days=delay_days) if is_repaid else None

            txn = models.Transaction(
                customer_id=customer.id,
                amount=random.choice([500, 800, 1000, 1500, 2000, 2500, 3000]),
                type="credit",
                date_given=date_given,
                date_repaid=date_repaid,
                is_repaid=is_repaid
            )
            db.add(txn)

        db.commit()

    print("✅ Seed complete — 15 customers, 120 transactions added.")
    db.close()

if __name__ == "__main__":
    seed()