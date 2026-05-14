import os
from dotenv import load_dotenv
from sqlmodel import create_engine, SQLModel, Session

# Load environment variables from the .env file
load_dotenv()

# Get the Supabase database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy requires 'postgresql://' instead of 'postgres://' which Supabase sometimes provides
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create the database engine. If no URL is found, fallback to a local SQLite file for testing.
if DATABASE_URL:
    engine = create_engine(DATABASE_URL, echo=True)
else:
    print("⚠️ DATABASE_URL not found. Falling back to local SQLite database.")
    sqlite_url = "sqlite:///./mvp_fallback.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def init_db():
    """
    Creates the tables in the database if they don't already exist.
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Dependency function to yield a database session for FastAPI routes.
    """
    with Session(engine) as session:
        yield session