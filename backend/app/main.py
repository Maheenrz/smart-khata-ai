from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Khata AI",
              docs_url="/docs" if os.getenv("ENV") == "development" else None,
              redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

from app.routers import auth, customers, transactions, ai, community

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(transactions.router)
app.include_router(ai.router)
app.include_router(community.router)



@app.get("/")
def root():
    return {"message": "welcome to Smart khata AI"}


from app.database import engine

@app.get("/test-db")
def test_db():
    with engine.connect() as conn:
        return {"status": "PostgreSQL connected successfully"}