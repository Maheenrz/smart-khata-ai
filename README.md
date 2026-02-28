# Smart Khata AI

Credit intelligence platform for Pakistan's small retailers. Digitizes the traditional credit notebook and adds an AI layer that scores customers, predicts cash shortages, generates recovery messages, and shares risk signals across shopkeepers in the same area.

---

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS, Recharts
- **Backend** — FastAPI, SQLAlchemy, PostgreSQL (Neon)
- **AI** — GPT-4o via GitHub Models (primary), Groq Llama 3.1 (fallback)
- **Auth** — JWT tokens with bcrypt password hashing

---

## Core Features

**Aitbaar Score**

A credit score from 0 to 100 built entirely from a customer's real transaction history. Repayment rate contributes up to 60 points — the percentage of transactions actually paid back. Repayment speed contributes up to 40 points — paying within 7 days gives full points, within 14 days gives 30, within 30 days gives 15, beyond 30 days gives none. New customers with no history start at a neutral 50.

Score ranges: 70-100 is Acha — safe to extend credit. 40-69 is Theek — extend with caution. 0-39 is Kharab — avoid extending credit.

**Cash Flow Forecasting**

For every customer with unpaid dues, the system calculates their personal average repayment delay from past paid transactions and predicts when the oldest unpaid credit will likely be repaid. If no history exists, a conservative 30-day default is used. A customer is flagged high risk if they are more than 7 days past their expected repayment date or if their score is below 40. A cash shortage warning fires when more than 30% of total outstanding is with high-risk customers.

**AI Recovery Assistant**

Generates personalized WhatsApp reminder messages in Roman Urdu or English using GPT-4o. Takes the customer name, outstanding amount, and shop name as context to produce a natural message the shopkeeper can send in one tap.

**Community Risk Network**

Matches customers by phone number across all shopkeepers in the same area. If the same phone number appears in two or more shops with an average Aitbaar Score below 50, they are flagged as a community risk — warning shopkeepers about bad payers before extending them credit for the first time.

---

## Demo Accounts

| Email | Password | Shop |
|---|---|---|
| ahmed@test.com | test1234 | Khan General Store — Model Town |
| farhan@test.com | test1234 | Siddiqui Kiryana — Gulberg |
| naveed@test.com | test1234 | Naveed Brothers — DHA |

Imran Butt, Tariq Mehmood, and Asif Javed appear across multiple shops and trigger the Community Risk Network.

---

## Local Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

Required `.env` in `backend/`:

```
DATABASE_URL=your_neon_connection_string
SECRET_KEY=your_secret_key
GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_api_key
```

---

## Deployment

- **Frontend** — Vercel (auto-deploys from GitHub)
- **Backend** — Hugging Face Spaces (Docker)
- **Database** — Neon serverless PostgreSQL