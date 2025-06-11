"""update_user_role_to_enum

Revision ID: 79c4983ebe42
Revises: 001
Create Date: 2025-05-25 00:18:31.085179

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision = '79c4983ebe42'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Only keep ALTERs, index changes, or other modifications

    op.alter_column('developers', 'verification_status',
        existing_type=sa.VARCHAR(),
        type_=sa.Enum('PENDING', 'VERIFIED', 'REJECTED', name='verification_status'),
        existing_nullable=True,
        existing_server_default=sa.text("'pending'::character varying"))
    op.alter_column('users', 'role',
        existing_type=sa.VARCHAR(),
        type_=sa.Enum('BUYER', 'DEVELOPER', 'ADMIN', name='user_role'),
        existing_nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # Only drop what was created/changed in this migration
    op.alter_column('users', 'role',
        existing_type=sa.Enum('BUYER', 'DEVELOPER', 'ADMIN', name='user_role'),
        type_=sa.VARCHAR(),
        existing_nullable=False)
    op.alter_column('developers', 'verification_status',
        existing_type=sa.Enum('PENDING', 'VERIFIED', 'REJECTED', name='verification_status'),
        type_=sa.VARCHAR(),
        existing_nullable=True,
        existing_server_default=sa.text("'pending'::character varying"))
    # ### end Alembic commands ### 