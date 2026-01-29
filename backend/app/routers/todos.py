from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.todo import Todo as TodoModel
from app.models.user import User as UserModel
from app.schemas.todo import Todo as TodoSchema, TodoCreate, TodoUpdate

router = APIRouter()

@router.get("/", response_model=List[TodoSchema])
def read_todos(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    return db.query(TodoModel).filter(TodoModel.user_id == current_user.id).all()

@router.post("/", response_model=TodoSchema)
def create_todo(
    *,
    db: Session = Depends(get_db),
    todo_in: TodoCreate,
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    todo = TodoModel(**todo_in.dict(), user_id=current_user.id)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo

@router.patch("/{id}", response_model=TodoSchema)
def update_todo(
    *,
    db: Session = Depends(get_db),
    id: int,
    todo_in: TodoUpdate,
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    todo = db.query(TodoModel).filter(TodoModel.id == id, TodoModel.user_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo

@router.delete("/{id}", response_model=TodoSchema)
def delete_todo(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    todo = db.query(TodoModel).filter(TodoModel.id == id, TodoModel.user_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
    return todo
