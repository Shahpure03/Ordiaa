from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine
from app.core.config import settings
import sys
import os

# Add current directory to path for local execution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers import auth, users, habits, todos, daily_logs

from fastapi.responses import JSONResponse
import traceback

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ordiaa.vercel.app",
        "*" # Keep wildcard for now to be sure
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "traceback": traceback.format_exc(),
            "message": "Internal Server Error Catch-all"
        },
        headers={
            "Access-Control-Allow-Origin": "*",
        }
    )

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(habits.router, prefix="/habits", tags=["habits"])
app.include_router(todos.router, prefix="/todos", tags=["todos"])
app.include_router(daily_logs.router, prefix="/logs", tags=["logs"])

@app.get("/")
async def root():
    return {"message": "Welcome to Ordia API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test-db")
async def test_db(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query to check connection
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection is working!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )

