from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DailyLogBase(BaseModel):
    date: datetime
    content: str
    mood: Optional[str] = None

class DailyLogCreate(DailyLogBase):
    pass

class DailyLogUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None

class DailyLog(DailyLogBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
