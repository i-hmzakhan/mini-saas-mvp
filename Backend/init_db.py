from db.connection import init_db
# We must import the models here so SQLModel knows they exist before creating tables
from db.models import User, ImageRecord 

if __name__ == "__main__":
    print("⏳ Connecting to Supabase and creating tables...")
    init_db()
    print("✅ Database tables created successfully!")