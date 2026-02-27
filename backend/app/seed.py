from app.database import SessionLocal
from app import models
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

LAHORE_AREAS = ["Model Town", "Gulberg", "DHA", "Johar Town", "Bahria Town"]

# Customers that appear across multiple shops (these will trigger risk flags)
SHARED_RISKY_CUSTOMERS = [
    {"name": "Imran Butt",     "phone": "03001234567", "area": "Model Town"},
    {"name": "Tariq Mehmood",  "phone": "03011234567", "area": "Gulberg"},
    {"name": "Asif Javed",     "phone": "03091234567", "area": "DHA"},
]

SHOPKEEPERS = [
    {
        "name": "Ahmed Khan",
        "shop_name": "Khan General Store",
        "email": "ahmed@test.com",
        "password": "test1234",
        "city": "Lahore",
        "area": "Model Town",
        "customers": [
            {"name": "Imran Butt",     "phone": "03001234567", "area": "Model Town", "behavior": "bad"},
            {"name": "Salman Raza",    "phone": "03021234567", "area": "Model Town", "behavior": "good"},
            {"name": "Usman Ali",      "phone": "03031234567", "area": "Model Town", "behavior": "average"},
            {"name": "Bilal Sheikh",   "phone": "03041234567", "area": "Gulberg",    "behavior": "excellent"},
            {"name": "Kamran Iqbal",   "phone": "03051234567", "area": "Model Town", "behavior": "risky"},
        ]
    },
    {
        "name": "Farhan Siddiqui",
        "shop_name": "Siddiqui Kiryana",
        "email": "farhan@test.com",
        "password": "test1234",
        "city": "Lahore",
        "area": "Gulberg",
        "customers": [
            {"name": "Tariq Mehmood",  "phone": "03011234567", "area": "Gulberg",    "behavior": "bad"},
            {"name": "Imran Butt",     "phone": "03001234567", "area": "Model Town", "behavior": "bad"},
            {"name": "Zeeshan Malik",  "phone": "03061234567", "area": "Gulberg",    "behavior": "average"},
            {"name": "Hassan Nawaz",   "phone": "03081234567", "area": "DHA",        "behavior": "good"},
            {"name": "Rizwan Ch",      "phone": "03101234567", "area": "Gulberg",    "behavior": "risky"},
        ]
    },
    {
        "name": "Naveed Ahmed",
        "shop_name": "Naveed Brothers",
        "email": "naveed@test.com",
        "password": "test1234",
        "city": "Lahore",
        "area": "DHA",
        "customers": [
            {"name": "Asif Javed",     "phone": "03091234567", "area": "DHA",        "behavior": "bad"},
            {"name": "Imran Butt",     "phone": "03001234567", "area": "Model Town", "behavior": "bad"},
            {"name": "Tariq Mehmood",  "phone": "03011234567", "area": "Gulberg",    "behavior": "bad"},
            {"name": "Waseem Akram",   "phone": "03131234567", "area": "DHA",        "behavior": "excellent"},
            {"name": "Junaid Khan",    "phone": "03141234567", "area": "DHA",        "behavior": "average"},
        ]
    },
]

BEHAVIORS = {
    "excellent": {"delay": 2,  "default_chance": 0.0},
    "good":      {"delay": 5,  "default_chance": 0.1},
    "average":   {"delay": 10, "default_chance": 0.2},
    "risky":     {"delay": 20, "default_chance": 0.4},
    "bad":       {"delay": 35, "default_chance": 0.7},
}

def seed():
    db = SessionLocal()

    if db.query(models.User).first():
        print("Already seeded, skipping.")
        db.close()
        return

    for shopkeeper_data in SHOPKEEPERS:
        # Create shopkeeper
        user = models.User(
            name=shopkeeper_data["name"],
            shop_name=shopkeeper_data["shop_name"],
            email=shopkeeper_data["email"],
            city=shopkeeper_data["city"],
            hashed_password=pwd_context.hash(shopkeeper_data["password"])
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created shopkeeper: {user.name}")

        for c_data in shopkeeper_data["customers"]:
            customer = models.Customer(
                name=c_data["name"],
                phone=c_data["phone"],
                area=c_data["area"],
                owner_id=user.id
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)

            behavior = BEHAVIORS[c_data["behavior"]]

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
            print(f"   → Added customer: {customer.name} ({c_data['behavior']})")

    print("\n✅ Seed complete — 3 shopkeepers, 15 customers, 120 transactions.")
    db.close()

if __name__ == "__main__":
    seed()