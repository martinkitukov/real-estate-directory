from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import *
from app.infrastructure.database import Base, engine
from app.core.config import settings
from app.errors import setup_error_handlers

# Ensure the database is not missing tables
# Note: In production, use Alembic migrations instead
# Base.metadata.create_all(bind=engine)

# Create lifespan event handler for FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Real Estate API started")
    try:
        yield
    finally:
        # Shutdown logic
        print("Real Estate API shut down")

# FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for NovaDom - New Construction Real Estate Platform",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Setup error handlers
setup_error_handlers(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React frontend
        "http://127.0.0.1:3000",
        "http://localhost:8080",  # Alternative frontend port
    ] + [str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Router insertion
prefix = "/api/v1"
app.include_router(auth_router, prefix=prefix + "/auth")
app.include_router(projects_router, prefix=prefix + "/projects")
app.include_router(developers_router, prefix=prefix + "/developers")
app.include_router(admin_router, prefix=prefix + "/admin")

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": "1.0.0",
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "auth_endpoints": {
            "register_buyer": f"{prefix}/auth/register/buyer",
            "register_developer": f"{prefix}/auth/register/developer",
            "token": f"{prefix}/auth/token",
            "login": f"{prefix}/auth/login",
            "profile": f"{prefix}/auth/me"
        },
        "admin_endpoints": {
            "create_admin": f"{prefix}/admin/create-admin",
            "developers": f"{prefix}/admin/developers",
            "pending_developers": f"{prefix}/admin/developers/pending",
            "verify_developer": f"{prefix}/admin/developers/{{id}}/verify",
            "reject_developer": f"{prefix}/admin/developers/{{id}}/reject"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "app_name": settings.APP_NAME
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 