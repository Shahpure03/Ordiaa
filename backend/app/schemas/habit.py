from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None

class HabitCreate(HabitBase):
    pass

class HabitUpdate(HabitBase):
    name: Optional[str] = None

class HabitCompletionSchema(BaseModel):
    id: int
    habit_id: int
    completed_at: datetime

    class Config:
        from_attributes = True

class Habit(HabitBase):
    id: int
    user_id: int
    created_at: datetime
    # Optionally include completions
    # completions: List[HabitCompletionSchema] = []

    class Config:
        from_attributes = True
