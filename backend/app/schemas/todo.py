from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TodoBase(BaseModel):
    title: str
    is_completed: bool = False
    priority: str = "medium"
    status: str = "todo"
    due_date: Optional[datetime] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None

class Todo(TodoBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
