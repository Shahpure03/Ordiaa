"""add date and status to todos

Revision ID: 313686c86791
Revises: 030a494e8094
Create Date: 2026-01-31 10:31:18.074379

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '313686c86791'
down_revision = '030a494e8094'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('todos', sa.Column('priority', sa.String(), nullable=True, server_default='medium'))
    op.add_column('todos', sa.Column('status', sa.String(), nullable=True, server_default='todo'))
    op.add_column('todos', sa.Column('due_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('todos', 'due_date')
    op.drop_column('todos', 'status')
    op.drop_column('todos', 'priority')
