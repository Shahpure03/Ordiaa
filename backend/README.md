# Ordia Backend

FastAPI backend with SQLAlchemy, Alembic, and Neon (PostgreSQL).

## Setup

1.  **Environment Variables**:
    Create a `.env` file in the `backend` directory and add your Neon connection string:
    ```env
    DATABASE_URL=postgresql://user:password@hostname/dbname?sslmode=require
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run Migrations**:
    ```bash
    # Generate initial migration
    alembic revision --autogenerate -m "Initial migration"

    # Apply migrations
    alembic upgrade head
    ```

4.  **Run the application**:
    ```bash
    uvicorn app.main:app --reload
    ```

## Testing Functionality

- **Health Check**: Visit `http://localhost:8000/health`
- **Database Test**: Visit `http://localhost:8000/test-db` (Checks if the app can connect to Neon)
- **API Docs**: Visit `http://localhost:8000/docs`
