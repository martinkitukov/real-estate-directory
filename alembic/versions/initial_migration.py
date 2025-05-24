"""initial migration

Revision ID: 001
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE user_role AS ENUM ('buyer', 'developer', 'admin')")
    op.execute("CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected')")
    op.execute("CREATE TYPE project_status AS ENUM ('planning', 'under_construction', 'completed')")
    op.execute("CREATE TYPE project_type AS ENUM ('apartment_building', 'house_complex')")

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=True),
        sa.Column('last_name', sa.String(), nullable=True),
        sa.Column('role', postgresql.ENUM('buyer', 'developer', 'admin', name='user_role'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create developers table
    op.create_table(
        'developers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('company_name', sa.String(), nullable=False),
        sa.Column('contact_person', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('verification_status', postgresql.ENUM('pending', 'verified', 'rejected', name='verification_status'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_developers_id'), 'developers', ['id'], unique=False)
    op.create_index(op.f('ix_developers_user_id'), 'developers', ['user_id'], unique=True)

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('developer_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location_text', sa.String(), nullable=True),
        sa.Column('location_point', Geometry('POINT', srid=4326), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('neighborhood', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('project_type', postgresql.ENUM('apartment_building', 'house_complex', name='project_type'), nullable=True),
        sa.Column('status', postgresql.ENUM('planning', 'under_construction', 'completed', name='project_status'), nullable=True),
        sa.Column('expected_completion_date', sa.DateTime(), nullable=True),
        sa.Column('cover_image_url', sa.String(), nullable=True),
        sa.Column('gallery_urls', sa.Text(), nullable=True),
        sa.Column('amenities_list', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['developer_id'], ['developers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)

    # Create saved_listings table
    op.create_table(
        'saved_listings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_saved_listings_id'), 'saved_listings', ['id'], unique=False)

    # Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price_bgn', sa.Integer(), nullable=True),
        sa.Column('price_usd', sa.Integer(), nullable=True),
        sa.Column('price_eur', sa.Integer(), nullable=True),
        sa.Column('duration_months', sa.Integer(), nullable=True),
        sa.Column('listing_limit', sa.Integer(), nullable=True),
        sa.Column('features_list', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscription_plans_id'), 'subscription_plans', ['id'], unique=False)

    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('developer_id', sa.Integer(), nullable=True),
        sa.Column('plan_id', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('payment_transaction_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['developer_id'], ['developers.id'], ),
        sa.ForeignKeyConstraint(['plan_id'], ['subscription_plans.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscriptions_id'), 'subscriptions', ['id'], unique=False)

def downgrade() -> None:
    # Drop tables
    op.drop_index(op.f('ix_subscriptions_id'), table_name='subscriptions')
    op.drop_table('subscriptions')
    op.drop_index(op.f('ix_subscription_plans_id'), table_name='subscription_plans')
    op.drop_table('subscription_plans')
    op.drop_index(op.f('ix_saved_listings_id'), table_name='saved_listings')
    op.drop_table('saved_listings')
    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_table('projects')
    op.drop_index(op.f('ix_developers_user_id'), table_name='developers')
    op.drop_index(op.f('ix_developers_id'), table_name='developers')
    op.drop_table('developers')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    # Drop enum types
    op.execute('DROP TYPE project_type')
    op.execute('DROP TYPE project_status')
    op.execute('DROP TYPE verification_status')
    op.execute('DROP TYPE user_role') 