from pydantic import BaseModel
from typing import Optional
class UserCreate(BaseModel):
    name: str
    shop_name: str
    email: str
    password: str
    city: Optional[str] = "Lahore"

class UserLogin(BaseModel):
    email: str
    password: str    