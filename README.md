# Smart Khata AI

A credit intelligence platform built for Pakistan's small retailers. Most shopkeepers manage customer credit in a paper notebook — no way to know who's likely to pay back, no early warning when cash is running low, and no visibility into whether other nearby shops have had problems with the same customer.

This tries to fix that.

**Live:** https://smart-khata-ai.vercel.app  
**Demo login:** ahmed@test.com / test1234

---

## How It Works

```
Shopkeeper logs a credit transaction
        │
        ▼
PostgreSQL stores transaction history
        │
        ├──► Aitbaar Score recalculates
        │         (repayment rate + speed → 0-100 score)
        │
        ├──► Cash Flow engine updates
        │         (predicts when each customer will pay based on their history)
        │
        ├──► Intelligence layer runs
        │         (finds payment patterns by week, month, customer trend)
        │
        └──► Community Risk checks
                  (matches phone numbers across other shops in same area)
```

---

## Features

**Aitbaar Score** — A credit score (0-100) calculated purely from transaction behavior. 60 points come from repayment rate, 40 from how fast they pay. New customers start at 50. Scores update the moment a transaction is added or marked paid.

**Cash Flow Forecasting** — For each customer with unpaid dues, the system estimates when payment is expected based on their personal repayment history. Flags customers who are more than 7 days past their expected date, and fires a cash shortage warning if over 30% of outstanding is with risky customers.

**Business Intelligence** — This is the part most khata apps skip. The intelligence tab mines historical transaction data to show: which week of the month collections are fastest vs slowest, which months are historically bad, and which customers are deteriorating (paying slower over time) vs improving. Gives a weekly forecast based on real past patterns.

**AI WhatsApp Messages** — Generates a personalized payment reminder in Roman Urdu or English using GPT-4o. Takes customer name, amount owed, and shop name to make it feel personal rather than a generic template.

**Community Risk Network** — Matches customers across shops by phone number. If the same person appears in two or more shops in the same area with a low average score, they get flagged as a community risk. Basically a shared blacklist built from real data, not rumors.

---

## Aitbaar Score Formula

```
Score = (repayment_rate × 60) + speed_points

repayment_rate = paid transactions / total transactions

speed_points:
  paid within 7 days  → 40
  paid within 14 days → 30
  paid within 30 days → 15
  paid after 30 days  → 0

Final score is clamped between 0 and 100.
```

Score ranges: **70-100** = Acha (safe) · **40-69** = Theek (caution) · **0-39** = Kharab (avoid)

---

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS, Recharts
- **Backend** — FastAPI, SQLAlchemy, PostgreSQL (Neon)
- **AI** — GPT-4o via GitHub Models API (Groq Llama 3.1 as fallback)
- **Auth** — JWT with bcrypt

---

## Demo Accounts

| Email | Password | Shop |
|---|---|---|
| ahmed@test.com | test1234 | Khan General Store — Model Town |
| farhan@test.com | test1234 | Siddiqui Kiryana — Gulberg |
| naveed@test.com | test1234 | Naveed Brothers — DHA |

Imran Butt, Tariq Mehmood and Asif Javed appear across multiple shops — good for testing the Community Risk tab.

---

## Running Locally

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed        # loads demo data
python -m uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Backend runs on `localhost:8000`, frontend on `localhost:5173`.

Create `backend/.env`:

```
DATABASE_URL=your_neon_connection_string
SECRET_KEY=any_random_string
GITHUB_TOKEN=your_github_pat
GROQ_API_KEY=your_groq_key
```

---

## Deployment

- **Frontend** — Vercel, connected to GitHub (auto-deploys on push)
- **Backend** — Hugging Face Spaces (Docker container)
- **Database** — Neon serverless PostgreSQL (free tier)
