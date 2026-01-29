from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.daily_log import DailyLog as DailyLogModel
from app.models.user import User as UserModel
from app.schemas.daily_log import DailyLog as DailyLogSchema, DailyLogCreate, DailyLogUpdate
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[DailyLogSchema])
def read_logs(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    return db.query(DailyLogModel).filter(DailyLogModel.user_id == current_user.id).all()

@router.get("/{date}", response_model=Optional[DailyLogSchema])
def get_log_by_date(
    date: str, # ISO Format YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    target_date = datetime.strptime(date, "%Y-%m-%d").date()
    log = db.query(DailyLogModel).filter(
        DailyLogModel.user_id == current_user.id,
        DailyLogModel.date >= datetime.combine(target_date, datetime.min.time()),
        DailyLogModel.date <= datetime.combine(target_date, datetime.max.time()),
    ).first()
    return log

@router.post("/", response_model=DailyLogSchema)
def create_or_update_log(
    *,
    db: Session = Depends(get_db),
    log_in: DailyLogCreate,
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    target_date = log_in.date.date()
    
    # Check if exists
    existing = db.query(DailyLogModel).filter(
        DailyLogModel.user_id == current_user.id,
        DailyLogModel.date >= datetime.combine(target_date, datetime.min.time()),
        DailyLogModel.date <= datetime.combine(target_date, datetime.max.time()),
    ).first()
    
    if existing:
        existing.content = log_in.content
        existing.mood = log_in.mood
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        log = DailyLogModel(**log_in.dict(), user_id=current_user.id)
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
