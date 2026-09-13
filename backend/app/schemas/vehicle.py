import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class SightingBase(BaseModel):
    camera_id: Optional[uuid.UUID] = None
    plate_text: Optional[str] = None
    plate_raw: Optional[str] = None
    plate_conf: Optional[float] = None
    vehicle_class: Optional[str] = None
    vehicle_conf: Optional[float] = None
    track_id: Optional[int] = None
    frame_ts: datetime
    bbox_x: Optional[int] = None
    bbox_y: Optional[int] = None
    bbox_w: Optional[int] = None
    bbox_h: Optional[int] = None
    frame_path: Optional[str] = None
    crop_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class SightingCreate(SightingBase):
    pass

class SightingResponse(SightingBase):
    id: uuid.UUID
    created_at: Optional[datetime] = None
    camera_name: Optional[str] = None
    camera_identifier: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, validation_alias="extra_metadata")

    class Config:
        from_attributes = True
        populate_by_name = True

class VehicleSearchResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[SightingResponse]

class JourneyStop(BaseModel):
    sighting_id: uuid.UUID
    camera_id: uuid.UUID
    camera_name: str
    camera_identifier: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime
    plate_text: str
    plate_conf: Optional[float] = None
    vehicle_class: Optional[str] = None
    crop_path: Optional[str] = None
    plate_crop_path: Optional[str] = None
    dwell_time_mins: Optional[float] = 0.0

class VehicleJourneyResponse(BaseModel):
    plate_text: str
    total_sightings: int
    unique_cameras: int
    start_ts: Optional[datetime] = None
    end_ts: Optional[datetime] = None
    total_duration_mins: Optional[float] = 0.0
    estimated_distance_km: Optional[float] = 0.0
    stops: List[JourneyStop]
    path_coordinates: List[List[float]] = Field(default_factory=list) # [[lat, lng], ...]

class OwnerDetails(BaseModel):
    name: str
    father_name: Optional[str] = None
    address: str
    phone_masked: str
    aadhaar_masked: Optional[str] = None
    ownership_type: str = "1st Owner (Individual)"

class TechnicalSpecs(BaseModel):
    make: str
    model: str
    variant: Optional[str] = None
    color: str
    fuel_type: str
    engine_number: str
    chassis_number: str
    seating_capacity: int = 5
    cubic_capacity: Optional[str] = "1997 cc"
    emission_norm: str = "BS-VI (OBD-II)"

class RegistrationInfo(BaseModel):
    registration_date: str
    rto_office: str
    rto_code: str
    vehicle_class: str
    rc_status: str = "ACTIVE / VALID"
    fitness_valid_upto: str
    insurance_company: str
    insurance_policy_no: str
    insurance_valid_upto: str
    pucc_number: str
    pucc_valid_upto: str
    fastag_status: str = "ACTIVE (ICICI Bank RFID)"

class PoliceIntelligence(BaseModel):
    is_watchlist: bool = False
    threat_level: str = "NORMAL"  # NORMAL, MEDIUM, HIGH, CRITICAL
    alert_type: Optional[str] = None
    case_number: Optional[str] = None
    sections_applied: Optional[str] = None
    police_station: Optional[str] = None
    investigating_officer: Optional[str] = None
    warrant_status: Optional[str] = None
    notes: Optional[str] = None

class LiveTelemetrySummary(BaseModel):
    last_camera_id: Optional[str] = None
    last_camera_name: Optional[str] = None
    last_location: Optional[str] = None
    last_seen_timestamp: Optional[datetime] = None
    last_speed_kmh: Optional[int] = None
    total_sightings_today: int = 0
    plate_crop_url: Optional[str] = None
    vehicle_crop_url: Optional[str] = None

class VehicleDossierResponse(BaseModel):
    plate_text: str
    owner: OwnerDetails
    specs: TechnicalSpecs
    registration: RegistrationInfo
    intelligence: PoliceIntelligence
    telemetry: LiveTelemetrySummary
    digital_signature: str

