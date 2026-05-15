from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router

app = FastAPI(
    title="Mini SaaS MVP API",
    description="Backend for EXIF metadata manipulation",
    version="1.0.0"
)

# Configure CORS so the React frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Vite's default React port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "healthy", "message": "API is running"}