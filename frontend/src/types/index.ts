export type UserRole = 'admin' | 'operator' | 'investigator';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

export type CameraStatus = 'online' | 'offline' | 'warning' | 'unknown';
export type StreamProtocol = 'rtsp' | 'hls' | 'webrtc';

export interface Camera {
  id: string;
  camera_id: string;
  name: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  rtsp_url: string;
  hls_url?: string;
  protocol: StreamProtocol;
  codec?: string;
  resolution?: string;
  fps?: number;
  status: CameraStatus;
  last_seen?: string;
  created_at?: string;
  updated_at?: string;
  recent_sightings_count?: number;
  metadata?: Record<string, any>;
  congestion?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Sighting {
  id: string;
  camera_id?: string;
  plate_text?: string;
  plate_raw?: string;
  plate_conf?: number;
  vehicle_class?: string;
  vehicle_conf?: number;
  track_id?: number;
  frame_ts: string;
  bbox_x?: number;
  bbox_y?: number;
  bbox_w?: number;
  bbox_h?: number;
  frame_path?: string;
  crop_path?: string;
  plate_crop_path?: string;
  camera_name?: string;
  camera_identifier?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, any>;
}

export interface VehicleSearchResponse {
  total: number;
  page: number;
  limit: number;
  items: Sighting[];
}

export interface JourneyStop {
  sighting_id: string;
  camera_id: string;
  camera_name: string;
  camera_identifier: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  plate_text: string;
  plate_conf?: number;
  vehicle_class?: string;
  crop_path?: string;
  plate_crop_path?: string;
  dwell_time_mins?: number;
  speed_kmh?: number;
}

export interface VehicleJourney {
  plate_text: string;
  total_sightings: number;
  unique_cameras: number;
  start_ts?: string;
  end_ts?: string;
  total_duration_mins?: number;
  estimated_distance_km?: number;
  stops: JourneyStop[];
  path_coordinates: [number, number][];
}

export interface VehicleOwner {
  name: string;
  father_name?: string;
  address: string;
  phone_masked: string;
  aadhaar_masked?: string;
  ownership_type: string;
}

export interface VehicleSpecs {
  make: string;
  model: string;
  variant?: string;
  color: string;
  fuel_type: string;
  engine_number: string;
  chassis_number: string;
  seating_capacity: number;
  cubic_capacity?: string;
  emission_norm: string;
}

export interface VehicleRegistration {
  registration_date: string;
  rto_office: string;
  rto_code: string;
  vehicle_class: string;
  rc_status: string;
  fitness_valid_upto: string;
  insurance_company: string;
  insurance_policy_no: string;
  insurance_valid_upto: string;
  pucc_number: string;
  pucc_valid_upto: string;
  fastag_status: string;
}

export interface VehiclePoliceIntelligence {
  is_watchlist: boolean;
  threat_level: 'NORMAL' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alert_type?: string;
  case_number?: string;
  sections_applied?: string;
  police_station?: string;
  investigating_officer?: string;
  warrant_status?: string;
  notes?: string;
}

export interface VehicleLiveTelemetry {
  last_camera_id?: string;
  last_camera_name?: string;
  last_location?: string;
  last_seen_timestamp?: string;
  last_speed_kmh?: number;
  total_sightings_today: number;
  plate_crop_url?: string;
  vehicle_crop_url?: string;
}

export interface VehicleDossier {
  plate_text: string;
  owner: VehicleOwner;
  specs: VehicleSpecs;
  registration: VehicleRegistration;
  intelligence: VehiclePoliceIntelligence;
  telemetry: VehicleLiveTelemetry;
  digital_signature: string;
}

export type WatchlistPriority = 'low' | 'medium' | 'high' | 'critical';

export interface WatchlistEntry {
  id: string;
  plate_text: string;
  reason: string;
  priority: WatchlistPriority;
  added_by?: string;
  added_by_username?: string;
  active: boolean;
  expires_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  alert_count?: number;
}

export type AlertStatus = 'active' | 'acknowledged' | 'dismissed';

export interface Alert {
  id: string;
  watchlist_id?: string;
  sighting_id?: string;
  plate_text: string;
  camera_id?: string;
  triggered_at: string;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_by_username?: string;
  acknowledged_at?: string;
  priority: WatchlistPriority;
  camera_name?: string;
  camera_identifier?: string;
  location_name?: string;
  watchlist_reason?: string;
  plate_conf?: number;
  vehicle_class?: string;
  frame_path?: string;
  crop_path?: string;
  plate_crop_path?: string;
  alert_type?: 'watchlist' | 'speed' | 'anomaly';
  speed_kmh?: number;
  speed_limit?: number;
}

export interface Evidence {
  id: string;
  case_id?: string;
  sighting_id?: string;
  alert_id?: string;
  plate_text?: string;
  camera_id?: string;
  frame_ts?: string;
  frame_path?: string;
  vehicle_crop_path?: string;
  plate_crop_path?: string;
  frame_hash?: string;
  vehicle_hash?: string;
  plate_hash?: string;
  metadata_json?: string;
  metadata_hash?: string;
  ai_confidence?: number;
  ai_model_version?: string;
  exported: boolean;
  created_at?: string;
  camera_name?: string;
  camera_identifier?: string;
  location_name?: string;
}

export interface EvidenceVerificationDetails {
  frame_valid: boolean;
  vehicle_crop_valid: boolean;
  plate_crop_valid: boolean;
  metadata_valid: boolean;
  stored_frame_hash?: string;
  computed_frame_hash?: string;
  stored_metadata_hash?: string;
  computed_metadata_hash?: string;
}

export interface EvidenceVerifyResult {
  evidence_id: string;
  valid: boolean;
  status: string;
  verified_at: string;
  details: EvidenceVerificationDetails;
}

export interface AuditLogEntry {
  id: number;
  user_id?: string;
  username?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  detail?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface SummaryAnalytics {
  cameras_online: number;
  cameras_total: number;
  vehicles_detected_today: number;
  active_alerts: number;
  plates_scanned: number;
  detections_trend_pct?: number;
}

export interface ActivityDataPoint {
  hour: string;
  total: number;
  camera_counts?: Record<string, number>;
}

export interface TopPlateRecord {
  plate_text: string;
  count: number;
  last_seen: string;
  last_camera: string;
  is_watchlist: boolean;
  priority?: string;
}

export interface CameraHeatmapData {
  camera_id: string;
  camera_name: string;
  hour: number;
  count: number;
}

export interface ConfidenceBucket {
  bucket: string;
  count: number;
}
