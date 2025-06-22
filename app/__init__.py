"""
NovaDom Real Estate Platform - Main Application Package
"""

from . import dependencies
from .api.v1 import auth_router, projects_router, developers_router, admin_router

__all__ = [
    "dependencies",
    "auth_router", 
    "projects_router", 
    "developers_router", 
    "admin_router"
] 