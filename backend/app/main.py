from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models # it registers the models in db (neon pg here)
from app.database import engine,Base
from app.routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Khata AI")

app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['https://localhost:5173'],
    allow_headers=['*'],
    allow_methods=['*'],
    allow_credentials=True
)

@app.get("/")
def root():
    return {"message": "welcome to Smart khata AI"}


from app.database import engine

@app.get("/test-db")
def test_db():
    with engine.connect() as conn:
        return {"status": "PostgreSQL connected successfully"}