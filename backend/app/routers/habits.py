from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.habit import Habit as HabitModel
from app.models.habit_completion import HabitCompletion as HabitCompletionModel
from app.models.user import User as UserModel
from app.schemas.habit import Habit as HabitSchema, HabitCreate, HabitCompletionSchema
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[HabitSchema])
def read_habits(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    habits = db.query(HabitModel).filter(HabitModel.user_id == current_user.id).offset(skip).limit(limit).all()
    return habits

@router.post("/", response_model=HabitSchema)
def create_habit(
    *,
    db: Session = Depends(get_db),
    habit_in: HabitCreate,
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    habit = HabitModel(**habit_in.dict(), user_id=current_user.id)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{id}", response_model=HabitSchema)
def delete_habit(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    habit = db.query(HabitModel).filter(HabitModel.id == id, HabitModel.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Also delete completions
    db.query(HabitCompletionModel).filter(HabitCompletionModel.habit_id == id).delete()
    
    db.delete(habit)
    db.commit()
    return habit

# Completion Routes
@router.post("/{id}/toggle", response_model=List[HabitCompletionSchema])
def toggle_habit_completion(
    *,
    db: Session = Depends(get_db),
    id: int,
    date: str, # ISO Format YYYY-MM-DD
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    habit = db.query(HabitModel).filter(HabitModel.id == id, HabitModel.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    target_date = datetime.strptime(date, "%Y-%m-%d").date()
    
    # Check if exists for this day
    existing = db.query(HabitCompletionModel).filter(
        HabitCompletionModel.habit_id == id,
        HabitCompletionModel.completed_at >= datetime.combine(target_date, datetime.min.time()),
        HabitCompletionModel.completed_at <= datetime.combine(target_date, datetime.max.time()),
    ).first()
    
    if existing:
        db.delete(existing)
    else:
        new_completion = HabitCompletionModel(habit_id=id, completed_at=datetime.combine(target_date, datetime.now().time()))
        db.add(new_completion)
    
    db.commit()
    
    # Return all completions for this habit to update frontend
    return db.query(HabitCompletionModel).filter(HabitCompletionModel.habit_id == id).all()

@router.get("/completions", response_model=List[HabitCompletionSchema])
def get_all_completions(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    # Get all completions for all habits of this user
    return db.query(HabitCompletionModel).join(HabitModel).filter(HabitModel.user_id == current_user.id).all()
