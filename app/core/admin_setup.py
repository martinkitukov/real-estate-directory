"""
Admin setup utilities for initial admin creation and management.
"""
import os
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.infrastructure.database import AsyncSessionLocal
from app.infrastructure import hash_password
from app.models import User, UserRole


async def create_initial_admin():
    """
    Create initial admin user from environment variables.
    This should be run once during deployment/setup.
    """
    admin_email = os.getenv("INITIAL_ADMIN_EMAIL")
    admin_password = os.getenv("INITIAL_ADMIN_PASSWORD")
    admin_first_name = os.getenv("INITIAL_ADMIN_FIRST_NAME", "Admin")
    admin_last_name = os.getenv("INITIAL_ADMIN_LAST_NAME", "User")
    
    if not admin_email or not admin_password:
        print("❌ INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD environment variables required")
        return False
    
    async with AsyncSessionLocal() as db:
        # Check if admin already exists
        result = await db.execute(
            select(User).where(User.email == admin_email)
        )
        existing_admin = result.scalar_one_or_none()
        
        if existing_admin:
            print(f"✅ Admin user {admin_email} already exists")
            return True
        
        # Create initial admin
        admin = User(
            email=admin_email,
            password_hash=hash_password(admin_password),
            first_name=admin_first_name,
            last_name=admin_last_name,
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        
        print(f"✅ Initial admin user created: {admin_email} (ID: {admin.id})")
        return True


async def list_admins():
    """List all admin users in the system."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == UserRole.ADMIN)
        )
        admins = result.scalars().all()
        
        print(f"\n📋 Found {len(admins)} admin user(s):")
        for admin in admins:
            status = "🟢 Active" if admin.is_active else "🔴 Inactive"
            print(f"  - {admin.email} (ID: {admin.id}) {status}")
        
        return admins


async def deactivate_admin(email: str):
    """Deactivate an admin user."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.email == email, User.role == UserRole.ADMIN)
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            print(f"❌ Admin user {email} not found")
            return False
        
        admin.is_active = False
        await db.commit()
        
        print(f"✅ Admin user {email} deactivated")
        return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python admin_setup.py [create|list|deactivate <email>]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        asyncio.run(create_initial_admin())
    elif command == "list":
        asyncio.run(list_admins())
    elif command == "deactivate" and len(sys.argv) == 3:
        email = sys.argv[2]
        asyncio.run(deactivate_admin(email))
    else:
        print("Invalid command. Use: create, list, or deactivate <email>") 