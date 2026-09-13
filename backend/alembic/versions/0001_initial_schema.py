"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis;')

    # Users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('username', sa.String(64), unique=True, nullable=False),
        sa.Column('email', sa.String(128), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(256), nullable=False),
        sa.Column('role', sa.String(32), server_default='investigator', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_email', 'users', ['email'])

    # Cameras
    op.create_table(
        'cameras',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('camera_id', sa.String(32), unique=True, nullable=False),
        sa.Column('name', sa.String(128), nullable=False),
        sa.Column('location_name', sa.String(256), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('rtsp_url', sa.Text(), nullable=False),
        sa.Column('hls_url', sa.Text(), nullable=True),
        sa.Column('protocol', sa.String(16), server_default='rtsp'),
        sa.Column('codec', sa.String(16), server_default='h264'),
        sa.Column('resolution', sa.String(16), server_default='1920x1080'),
        sa.Column('fps', sa.Integer(), server_default='25'),
        sa.Column('status', sa.String(16), server_default='unknown'),
        sa.Column('last_seen', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_cameras_camera_id', 'cameras', ['camera_id'])

    # Sightings
    op.create_table(
        'sightings',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('camera_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cameras.id', ondelete='SET NULL'), nullable=True),
        sa.Column('plate_text', sa.String(32), nullable=True),
        sa.Column('plate_raw', sa.String(64), nullable=True),
        sa.Column('plate_conf', sa.Float(), nullable=True),
        sa.Column('vehicle_class', sa.String(32), nullable=True),
        sa.Column('vehicle_conf', sa.Float(), nullable=True),
        sa.Column('track_id', sa.Integer(), nullable=True),
        sa.Column('frame_ts', sa.DateTime(timezone=True), nullable=False),
        sa.Column('bbox_x', sa.Integer(), nullable=True),
        sa.Column('bbox_y', sa.Integer(), nullable=True),
        sa.Column('bbox_w', sa.Integer(), nullable=True),
        sa.Column('bbox_h', sa.Integer(), nullable=True),
        sa.Column('frame_path', sa.Text(), nullable=True),
        sa.Column('crop_path', sa.Text(), nullable=True),
        sa.Column('plate_crop_path', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_sightings_plate', 'sightings', ['plate_text'])
    op.create_index('idx_sightings_camera', 'sightings', ['camera_id'])
    op.create_index('idx_sightings_ts', 'sightings', [sa.text('frame_ts DESC')])
    op.create_index('idx_sightings_plate_ts', 'sightings', ['plate_text', sa.text('frame_ts DESC')])

    # Correlations
    op.create_table(
        'correlations',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('plate_text', sa.String(32), nullable=False),
        sa.Column('sighting_ids', postgresql.JSONB(), nullable=False),
        sa.Column('camera_ids', postgresql.JSONB(), nullable=False),
        sa.Column('start_ts', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_ts', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_mins', sa.Float(), nullable=True),
        sa.Column('correlation_method', sa.String(32), server_default='plate_match'),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('path_wkt', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_correlations_plate', 'correlations', ['plate_text'])

    # Watchlist
    op.create_table(
        'watchlist',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('plate_text', sa.String(32), unique=True, nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(16), server_default='medium'),
        sa.Column('added_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_watchlist_plate', 'watchlist', ['plate_text'])

    # Alerts
    op.create_table(
        'alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('watchlist_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('watchlist.id'), nullable=True),
        sa.Column('sighting_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sightings.id'), nullable=True),
        sa.Column('plate_text', sa.String(32), nullable=False),
        sa.Column('camera_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cameras.id'), nullable=True),
        sa.Column('triggered_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('status', sa.String(16), server_default='active'),
        sa.Column('acknowledged_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('priority', sa.String(16), server_default='medium')
    )
    op.create_index('idx_alerts_status', 'alerts', ['status', sa.text('triggered_at DESC')])
    op.create_index('idx_alerts_plate', 'alerts', ['plate_text'])

    # Evidence
    op.create_table(
        'evidence',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), primary_key=True),
        sa.Column('case_id', sa.String(64), nullable=True),
        sa.Column('sighting_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sightings.id'), nullable=True),
        sa.Column('alert_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('alerts.id'), nullable=True),
        sa.Column('plate_text', sa.String(32), nullable=True),
        sa.Column('camera_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cameras.id'), nullable=True),
        sa.Column('frame_ts', sa.DateTime(timezone=True), nullable=True),
        sa.Column('frame_path', sa.Text(), nullable=True),
        sa.Column('vehicle_crop_path', sa.Text(), nullable=True),
        sa.Column('plate_crop_path', sa.Text(), nullable=True),
        sa.Column('frame_hash', sa.CHAR(64), nullable=True),
        sa.Column('vehicle_hash', sa.CHAR(64), nullable=True),
        sa.Column('plate_hash', sa.CHAR(64), nullable=True),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('metadata_hash', sa.CHAR(64), nullable=True),
        sa.Column('ai_confidence', sa.Float(), nullable=True),
        sa.Column('ai_model_version', sa.String(32), server_default='YOLOv8+PaddleOCR'),
        sa.Column('exported', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_evidence_plate', 'evidence', ['plate_text'])
    op.create_index('idx_evidence_case', 'evidence', ['case_id'])

    # Audit Log
    op.create_table(
        'audit_log',
        sa.Column('id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String(64), nullable=False),
        sa.Column('target_type', sa.String(32), nullable=True),
        sa.Column('target_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('detail', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'))
    )
    op.create_index('idx_audit_target', 'audit_log', ['target_type', 'target_id'])
    op.create_index('idx_audit_user', 'audit_log', ['user_id', sa.text('created_at DESC')])

def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('evidence')
    op.drop_table('alerts')
    op.drop_table('watchlist')
    op.drop_table('correlations')
    op.drop_table('sightings')
    op.drop_table('cameras')
    op.drop_table('users')
