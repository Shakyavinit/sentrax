import { Alert, Camera, Evidence, Sighting, WatchlistEntry, AuditLogEntry } from "../types";
import { assetUrl } from "../utils/demo";

const KEY = "sentrax-demo-v1";

// 15 Real Surveillance Camera locations in Ahmedabad & Gandhinagar with congestion levels
const locations: [string, string, number, number, string, "LOW" | "MEDIUM" | "HIGH"][] = [
  ["MG Road Junction", "Ahmedabad", 23.0225, 72.5714, "mg_road", "LOW"],
  ["Sardar Bridge Entry", "Ahmedabad", 23.0152, 72.5794, "sardar_bridge", "LOW"],
  ["Vastrapur Lake Gate", "Ahmedabad", 23.0436, 72.5283, "vastrapur", "MEDIUM"],
  ["SG Highway Toll", "Ahmedabad", 23.0732, 72.5038, "sg_highway_toll", "HIGH"],
  ["Gandhinagar Sector 15", "Gandhinagar", 23.2156, 72.6394, "sector15", "LOW"],
  ["GIFT City Entry", "Gandhinagar", 23.1573, 72.6787, "gift_city", "MEDIUM"],
  ["Sabarmati Riverfront", "Ahmedabad", 23.0395, 72.5878, "sabarmati", "LOW"],
  ["GNLU Gate", "Gandhinagar", 23.1891, 72.6542, "gnlu_gate", "LOW"],
  ["Chiloda Circle", "Gandhinagar", 23.2743, 72.6122, "chiloda_circle", "HIGH"],
  ["Kudasan Junction", "Gandhinagar", 23.2264, 72.6511, "kudasan", "MEDIUM"],
  ["Bopal Crossroads", "Ahmedabad", 23.0000, 72.4700, "traffic_cctv_real", "HIGH"],
  ["Science City Gate", "Ahmedabad", 23.0760, 72.5950, "vastrapur", "LOW"],
  ["Naroda Highway", "Ahmedabad", 23.0890, 72.6420, "traffic_city_junction", "MEDIUM"],
  ["Chandkheda Circle", "Ahmedabad", 23.1100, 72.5990, "sabarmati", "HIGH"],
  ["Sector 7 Gate", "Gandhinagar", 23.2220, 72.6450, "sector15", "LOW"],
];

export const SAMPLE_PLATES = ["GJ01AB1234", "UP32PQ6677", "GJ05CD5678", "DL10XY9090", "RJ14GH3456"];

export const CAMERAS: Camera[] = locations.map(([name, location_name, latitude, longitude, video, congestion], i) => {
  const isOffline = [9, 11, 13, 14].includes(i);
  return {
    id: `cam-${String(i + 1).padStart(2, "0")}`,
    camera_id: `CAM${String(i + 1).padStart(2, "0")}`,
    name,
    location_name,
    latitude,
    longitude,
    rtsp_url: `rtsp://stream.sentrax.internal:8554/live/cam${String(i + 1).padStart(2, "0")}`,
    hls_url: video.startsWith("traffic_") ? assetUrl(`videos/${video}.mp4`) : assetUrl(`videos/cam_${video}.mp4`),
    protocol: "hls",
    status: isOffline ? "offline" : "online",
    congestion,
    fps: 25,
    resolution: "1920×1080",
    metadata: {
      demo: true,
      error_code: isOffline ? "504 Gateway Timeout" : undefined,
      rtsp_error: isOffline ? "ERR_RTSP_CONNECTION_TIMED_OUT" : undefined,
      packet_loss: isOffline ? "100%" : "0.02%",
      last_ping: isOffline ? "42m ago" : "Just now",
    },
    recent_sightings_count: isOffline ? 0 : 5 + (i % 4) * 3,
  };
});

// Route stops: CAM02 (Sardar Bridge) -> CAM01 (MG Road) -> CAM07 (Sabarmati) -> CAM04 (SG Highway Toll) -> CAM06 (GIFT City)
const routeCamIndices = [1, 0, 6, 3, 5];

const sightings: Sighting[] = SAMPLE_PLATES.flatMap((plate, p) =>
  routeCamIndices.map((c, i) => ({
    id: `sample-${p}-${i}`,
    plate_text: plate,
    plate_raw: plate,
    plate_conf: [0.97, 0.91, 0.64, 0.88, 0.96][i],
    vehicle_class: p === 4 ? "truck" : "car",
    vehicle_conf: 0.94,
    track_id: p * 10 + i,
    camera_id: CAMERAS[c].id,
    camera_identifier: CAMERAS[c].camera_id,
    camera_name: CAMERAS[c].name,
    location_name: CAMERAS[c].location_name,
    latitude: CAMERAS[c].latitude,
    longitude: CAMERAS[c].longitude,
    frame_ts: `2026-09-13T${String(9 + p).padStart(2, "0")}:${String(i * 12).padStart(2, "0")}:00+05:30`,
    frame_path: assetUrl(`images/feed_cam${String((c % 3) + 1).padStart(2, "0")}.jpg`),
    crop_path: assetUrl("images/hit_swift_clean.jpg"),
    metadata: { demo: true, review_required: i === 2 },
  }))
);

export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  { id: 1, user_id: "usr-1", username: "Inspector V. Sharma", action: "viewed_evidence", target_type: "evidence", target_id: "GJ01AB1234 · CAM04", detail: { notes: "Reviewed CCTV frame timestamp 10:01:47" }, ip_address: "192.168.1.10", created_at: "2026-09-14T10:32:06Z" },
  { id: 2, user_id: "usr-1", username: "Inspector V. Sharma", action: "ack_alert", target_type: "alert", target_id: "Alert #3 · CAM12", detail: { reason: "Verified plate mismatch on trailer hitch" }, ip_address: "192.168.1.10", created_at: "2026-09-14T09:17:45Z" },
  { id: 3, user_id: "usr-1", username: "Inspector V. Sharma", action: "add_watchlist", target_type: "watchlist", target_id: "RJ14GH3456", detail: { priority: "medium", reason: "Commercial transit monitoring" }, ip_address: "192.168.1.10", created_at: "2026-09-14T08:30:11Z" },
  { id: 4, user_id: "system", username: "Sentinel AI Core", action: "alert_generated", target_type: "alert", target_id: "UP32PQ6677 · CAM04", detail: { confidence: 0.96, model: "YOLOv8-ANPR-v2" }, ip_address: "system", created_at: "2026-09-14T10:32:04Z" },
  { id: 5, user_id: "usr-1", username: "Inspector V. Sharma", action: "export_evidence", target_type: "evidence", target_id: "Case #2026-003", detail: { format: "ZIP manifest", files: 4 }, ip_address: "192.168.1.10", created_at: "2026-09-14T11:15:01Z" },
];

export const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: "ev-01",
    sighting_id: "sighting-scorpio-01",
    alert_id: "alert-01",
    case_id: "CR/2026/0418",
    plate_text: "GJ01AB1234",
    camera_id: "cam-04",
    camera_name: "SG Highway Toll",
    camera_identifier: "CAM04",
    location_name: "SG Highway Toll Plaza, Ahmedabad",
    frame_ts: "2026-09-14T14:26:17+05:30",
    frame_path: assetUrl("images/feed_cam04.jpg"),
    vehicle_crop_path: assetUrl("images/vehicle_scorpio_crop.jpg"),
    plate_crop_path: assetUrl("images/hit_scorpio_clean.jpg"),
    frame_hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    vehicle_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    plate_hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    metadata_hash: "3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855c",
    metadata_json: JSON.stringify({
      case: "CR/2026/0418",
      sections: "Sec 364A, 386, 120B IPC / BNS",
      investigator: "ACP Digvijay Singh Jadeja",
      station: "Navrangpura Police Station",
      seal_authority: "Gujarat Forensic Science Directorate",
      legal_basis: "Section 65B Indian Evidence Act / Section 63 BSA 2023",
      vehicle: { make: "Mahindra", model: "Scorpio-N Z8L 4x4", color: "Everest White", year: 2024 }
    }),
    ai_confidence: 0.986,
    ai_model_version: "YOLOv8x-ANPR-v4.2-LPRNet",
    exported: false,
    created_at: "2026-09-14T14:27:00+05:30",
  },
  {
    id: "ev-02",
    sighting_id: "sighting-fortuner-02",
    alert_id: "alert-02",
    case_id: "CR/2026/0891",
    plate_text: "UP32PQ6677",
    camera_id: "cam-02",
    camera_name: "Sardar Bridge Entry",
    camera_identifier: "CAM02",
    location_name: "Sardar Patel Bridge, Ahmedabad",
    frame_ts: "2026-09-14T14:24:02+05:30",
    frame_path: assetUrl("images/feed_cam02.jpg"),
    vehicle_crop_path: assetUrl("images/hit_fortuner_clean.jpg"),
    plate_crop_path: assetUrl("images/car_mh12ef9012.jpg"),
    frame_hash: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    vehicle_hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    plate_hash: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    metadata_hash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    metadata_json: JSON.stringify({
      case: "CR/2026/0891",
      sections: "Sec 302, 307 IPC / BNS - Non-Bailable Warrant",
      investigator: "Inspector R. K. Varma",
      station: "Paldi Police Station",
      seal_authority: "Gujarat Forensic Science Directorate",
      legal_basis: "Section 65B Indian Evidence Act",
      vehicle: { make: "Toyota", model: "Fortuner 4x4", color: "Phantom Black", year: 2023 }
    }),
    ai_confidence: 0.972,
    ai_model_version: "YOLOv8x-ANPR-v4.2-LPRNet",
    exported: true,
    created_at: "2026-09-14T14:25:10+05:30",
  },
  {
    id: "ev-03",
    sighting_id: "sighting-city-03",
    alert_id: "alert-03",
    case_id: "TR/2026/1102",
    plate_text: "GJ05CD5678",
    camera_id: "cam-03",
    camera_name: "Vastrapur Lake Gate",
    camera_identifier: "CAM03",
    location_name: "Vastrapur Ring Road, Ahmedabad",
    frame_ts: "2026-09-14T14:21:49+05:30",
    frame_path: assetUrl("images/feed_cam03.jpg"),
    vehicle_crop_path: assetUrl("images/car_gj18ij7890.jpg"),
    plate_crop_path: assetUrl("images/hit_swift_clean.jpg"),
    frame_hash: "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
    vehicle_hash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    plate_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    metadata_hash: "7d793037a0760186574b0282f2f435e7b1e507746909277cfed96986c050213b",
    metadata_json: JSON.stringify({
      case: "TR/2026/1102",
      sections: "Motor Vehicles Act Sec 183 - High Speed Violation (112 km/h in 50 km/h zone)",
      investigator: "Sub-Inspector S. Mehta",
      station: "Ahmedabad Traffic Branch",
      seal_authority: "Gujarat Forensic Science Directorate",
      legal_basis: "Section 65B Indian Evidence Act",
      vehicle: { make: "Honda", model: "City ZX", color: "Radiant Red", year: 2022 }
    }),
    ai_confidence: 0.958,
    ai_model_version: "YOLOv8x-ANPR-v4.2-LPRNet",
    exported: false,
    created_at: "2026-09-14T14:22:30+05:30",
  },
  {
    id: "ev-04",
    sighting_id: "sighting-swift-04",
    alert_id: "alert-04",
    case_id: "CR/2026/0334",
    plate_text: "DL10XY9090",
    camera_id: "cam-01",
    camera_name: "MG Road Junction",
    camera_identifier: "CAM01",
    location_name: "MG Road & Ashram Road, Ahmedabad",
    frame_ts: "2026-09-14T14:18:33+05:30",
    frame_path: assetUrl("images/feed_cam01.jpg"),
    vehicle_crop_path: assetUrl("images/hit_swift_clean.jpg"),
    plate_crop_path: assetUrl("images/car_rj14gh3456.jpg"),
    frame_hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    vehicle_hash: "2c624232cdd221771294dfbb310aca000a0df6ec8b6602f720f1dd2ebd4099d4",
    plate_hash: "19587d40c93ad0e2d72fb056ee31b8f84db93714fa414199da250ab20e8bc179",
    metadata_hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    metadata_json: JSON.stringify({
      case: "CR/2026/0334",
      sections: "Sec 379 IPC - Stolen Vehicle Cross-Border Alert",
      investigator: "ACP Digvijay Singh Jadeja",
      station: "Ellis Bridge Police Station",
      seal_authority: "Gujarat Forensic Science Directorate",
      legal_basis: "Section 65B Indian Evidence Act",
      vehicle: { make: "Maruti Suzuki", model: "Swift ZXi", color: "Magma Grey", year: 2021 }
    }),
    ai_confidence: 0.964,
    ai_model_version: "YOLOv8x-ANPR-v4.2-LPRNet",
    exported: false,
    created_at: "2026-09-14T14:19:15+05:30",
  }
];

interface State {
  cameras: Camera[];
  watchlist: WatchlistEntry[];
  alerts: Alert[];
  evidence: Evidence[];
  audit: AuditLogEntry[];
}

function initial(): State {
  const watchlist: WatchlistEntry[] = [
    { id: "watch-demo-1", plate_text: "UP32PQ6677", reason: "Armed Robbery Suspect — Active Warrant", priority: "critical", active: true, created_at: "2026-09-13T03:30:00Z" },
    { id: "watch-demo-2", plate_text: "RJ14GH3456", reason: "Suspect commercial cargo transfer", priority: "medium", active: true, created_at: "2026-09-13T04:15:00Z" },
    { id: "watch-demo-3", plate_text: "DL10XY9090", reason: "Inter-state transit inspection flag", priority: "high", active: true, created_at: "2026-09-13T05:00:00Z" },
  ];

  const initialAlerts: Alert[] = [
    ...sightings.filter(s => s.plate_text === "UP32PQ6677").map((s, i) => ({
      id: `alert-demo-${i}`,
      sighting_id: s.id,
      watchlist_id: watchlist[0].id,
      plate_text: s.plate_text!,
      camera_id: s.camera_id,
      camera_name: s.camera_name,
      camera_identifier: s.camera_identifier,
      location_name: s.location_name,
      plate_conf: s.plate_conf,
      triggered_at: s.frame_ts,
      status: "active" as const,
      priority: "critical" as const,
      watchlist_reason: watchlist[0].reason,
      alert_type: "watchlist" as const,
      frame_path: s.frame_path,
      crop_path: s.crop_path,
      vehicle_class: s.vehicle_class,
    })),
    {
      id: "alert-speed-01",
      sighting_id: "sample-2-3",
      plate_text: "GJ05CD5678",
      camera_id: CAMERAS[3].id,
      camera_name: CAMERAS[3].name,
      camera_identifier: CAMERAS[3].camera_id,
      location_name: CAMERAS[3].location_name,
      plate_conf: 0.96,
      triggered_at: "2026-09-14T09:43:11+05:30",
      status: "active" as const,
      priority: "high" as const,
      watchlist_reason: "Speed anomaly: 112 km/h in 60 km/h zone",
      alert_type: "speed" as const,
      speed_kmh: 112,
      speed_limit: 60,
      frame_path: assetUrl("images/feed_cam02.jpg"),
      crop_path: assetUrl("images/hit_swift_clean.jpg"),
      vehicle_class: "car",
    },
  ];

  return {
    cameras: CAMERAS,
    watchlist,
    evidence: [...INITIAL_EVIDENCE],
    alerts: initialAlerts,
    audit: [...INITIAL_AUDIT_LOG],
  };
}

function read(): State {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (data?.cameras?.length === 15 && data?.watchlist && data?.alerts && data?.evidence) {
      if (!data.audit || !Array.isArray(data.audit)) {
        data.audit = [...INITIAL_AUDIT_LOG];
      }
      if (!data.evidence || !Array.isArray(data.evidence) || data.evidence.length === 0) {
        data.evidence = [...INITIAL_EVIDENCE];
      }
      return data;
    }
  } catch {
    /* reset invalid demo data */
  }
  return initial();
}

function save(state: State) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const clean = (value: string) => value.replace(/\s/g, "").toUpperCase();

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
}

// Standards-compliant uncompressed ZIP: no misleading JSON file with a .zip extension.
export function demoZip(name: string, content: string): Blob {
  const data = new TextEncoder().encode(content), file = new TextEncoder().encode(name);
  let crc = 0xffffffff;
  for (const byte of data) { crc ^= byte; for (let b = 0; b < 8; b++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  crc = (crc ^ 0xffffffff) >>> 0;
  const bytes = new Uint8Array(30 + file.length + data.length + 46 + file.length + 22);
  const v = new DataView(bytes.buffer), central = 30 + file.length + data.length;
  const u16 = (at: number, n: number) => v.setUint16(at, n, true);
  const u32 = (at: number, n: number) => v.setUint32(at, n, true);
  u32(0, 0x04034b50); u16(4, 20); u32(14, crc); u32(18, data.length); u32(22, data.length); u16(26, file.length);
  bytes.set(file, 30); bytes.set(data, 30 + file.length);
  u32(central, 0x02014b50); u16(central + 4, 20); u16(central + 6, 20); u32(central + 16, crc);
  u32(central + 20, data.length); u32(central + 24, data.length); u16(central + 28, file.length); bytes.set(file, central + 46);
  const end = central + 46 + file.length;
  u32(end, 0x06054b50); u16(end + 8, 1); u16(end + 10, 1); u32(end + 12, 46 + file.length); u32(end + 16, central);
  return new Blob([bytes], { type: "application/zip" });
}

export async function demoRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const url = new URL(endpoint, "https://demo.invalid"), path = url.pathname, q = url.searchParams;
  const method = options.method || "GET", body = typeof options.body === "string" ? JSON.parse(options.body) : {};
  const state = read();

  const filtered = (rows: Sighting[]) => rows.filter(s =>
    (!q.get("plate") || s.plate_text!.includes(clean(q.get("plate")!))) &&
    (!q.get("vehicle_class") || s.vehicle_class === q.get("vehicle_class")) &&
    (!q.get("camera_id") || s.camera_id === q.get("camera_id")) &&
    (!q.get("from") || Date.parse(s.frame_ts) >= Date.parse(q.get("from")!)) &&
    (!q.get("to") || Date.parse(s.frame_ts) <= Date.parse(q.get("to")!))
  );

  const page = (rows: Sighting[]) => ({
    items: rows.slice(Number(q.get("offset") || 0), Number(q.get("offset") || 0) + Number(q.get("limit") || 100)),
    total: rows.length,
    page: 1,
    limit: Number(q.get("limit") || 100),
  });

  if (path === "/vehicles/search") return page(filtered(sightings));
  if (path.startsWith("/vehicles/sightings/")) return sightings.find(s => s.id === path.split("/").pop()) || Promise.reject(new Error("Sighting not found"));

  if (path.startsWith("/vehicles/journey/")) {
    const plate = clean(decodeURIComponent(path.split("/").pop()!));
    const rows = filtered(sightings.filter(s => s.plate_text === plate));
    return {
      plate_text: plate,
      total_sightings: rows.length,
      unique_cameras: new Set(rows.map(s => s.camera_id)).size,
      start_ts: rows[0]?.frame_ts,
      end_ts: rows.at(-1)?.frame_ts,
      total_duration_mins: rows.length ? 48 : 0,
      estimated_distance_km: rows.length ? 23.4 : 0,
      stops: rows.map(s => ({ ...s, sighting_id: s.id, timestamp: s.frame_ts, dwell_time_mins: 0 })),
      path_coordinates: rows.map(s => [s.latitude, s.longitude]),
    };
  }

  if (path.startsWith("/vehicles/dossier/")) {
    const plate = clean(decodeURIComponent(path.split("/").pop()!));
    if (!SAMPLE_PLATES.includes(plate)) throw new Error("No sample dossier exists for this plate. Official owner records are not connected.");
    return {
      plate_text: plate,
      owner: { name: "Fictional sample owner", address: "Not connected — no personal records", phone_masked: "Not available", ownership_type: "Sample only" },
      specs: { make: "Sample", model: "Passenger vehicle", color: "White", fuel_type: "Unknown", engine_number: "Not connected", chassis_number: "Not connected", seating_capacity: 5, emission_norm: "Unknown" },
      registration: { registration_date: "2020-01-01", rto_office: "Sample record", rto_code: "DEMO", vehicle_class: "car", rc_status: "UNVERIFIED SAMPLE", fitness_valid_upto: "2030-01-01", insurance_company: "Not connected", insurance_policy_no: "Not connected", insurance_valid_upto: "2030-01-01", pucc_number: "Not connected", pucc_valid_upto: "2030-01-01", fastag_status: "Not connected" },
      intelligence: { is_watchlist: state.watchlist.some(w => w.active && w.plate_text === plate), threat_level: "NORMAL", notes: "Fictional demonstration only. No criminal identity or government database has been verified." },
      telemetry: { total_sightings_today: 5, last_camera_name: "GIFT City Entry", last_location: "Gandhinagar", last_seen_timestamp: sightings.find(s => s.plate_text === plate)!.frame_ts, vehicle_crop_url: assetUrl("images/hit_swift_clean.jpg") },
      digital_signature: "DEMO — NOT AN OFFICIAL SIGNATURE",
    };
  }

  if (path === "/copilot/analyze") {
    const plate = clean(body.plate_text || ""), rows = sightings.filter(s => s.plate_text === plate);
    return {
      provider: "Deterministic demo summary (not AI)",
      analysis: rows.length
        ? `DEMO — FICTIONAL SAMPLE DATA\n\n${plate}: ${rows.length} sample sightings across ${new Set(rows.map(s => s.camera_id)).size} cameras.\n\n${rows.map(s => `${s.camera_name}: ${s.frame_ts}, sample plate score ${Math.round((s.plate_conf || 0) * 100)}%`).join("\n")}\n\nReview low-confidence frames manually. These sightings do not prove identity, intent or a criminal association. No official records, dispatch or legal certification are connected.`
        : "No sample sightings match this plate. No external AI service or official record was queried.",
    };
  }

  if (path === "/cameras" && method === "GET") {
    const st = q.get("status");
    return st && st !== "all" ? state.cameras.filter(c => c.status === st) : state.cameras;
  }

  if (path.startsWith("/cameras/") && path.endsWith("/sightings")) {
    return page(filtered(sightings.filter(s => s.camera_id === path.split("/")[2])));
  }

  if (path.endsWith("/test")) {
    return { reachable: true, latency_ms: 24, status: "online", detail: "Stream latency verified within operational thresholds (24ms)." };
  }

  if (path === "/watchlist" && method === "GET") {
    return state.watchlist.filter(w =>
      (q.get("active_only") !== "true" || w.active) &&
      (!q.get("priority") || w.priority === q.get("priority")) &&
      (!q.get("search") || w.plate_text.includes(clean(q.get("search")!)))
    );
  }

  if (path.startsWith("/watchlist/") && path.endsWith("/alerts")) {
    return state.alerts.filter(a => a.watchlist_id === path.split("/")[2]);
  }

  if (path === "/alerts") {
    return state.alerts.filter(a =>
      (!q.get("status") || a.status === q.get("status")) &&
      (!q.get("priority") || a.priority === q.get("priority")) &&
      (!q.get("plate") || a.plate_text.includes(clean(q.get("plate")!))) &&
      (!q.get("camera_id") || a.camera_id === q.get("camera_id"))
    );
  }

  if (path.startsWith("/alerts/")) {
    const row = state.alerts.find(a => a.id === path.split("/")[2]);
    if (!row) throw new Error("Alert not found");
    if (method === "PATCH") {
      row.status = path.endsWith("/acknowledge") ? "acknowledged" : "dismissed";
      row.acknowledged_at = new Date().toISOString();
      state.audit.unshift({
        id: state.audit.length + 1,
        user_id: "usr-1",
        username: "Duty Officer",
        action: "ack_alert",
        target_type: "alert",
        target_id: row.id,
        detail: { plate: row.plate_text, camera: row.camera_name },
        ip_address: "192.168.1.10",
        created_at: new Date().toISOString(),
      });
      save(state);
    }
    return row;
  }

  if (path === "/evidence/preserve") {
    const s = sightings.find(s => s.id === body.sighting_id);
    if (!s) throw new Error("Select a sample sighting to preserve");
    const existing = state.evidence.find(e => e.sighting_id === s.id && e.case_id === body.case_id);
    if (existing) return existing;
    const metadata_json = JSON.stringify({ demo: true, notice: "Fictional sample metadata; images are illustrative and not forensic evidence.", sighting: s });
    const metadata_hash = await sha256(metadata_json);
    const evidence: Evidence = {
      id: crypto.randomUUID(),
      sighting_id: s.id,
      alert_id: body.alert_id,
      case_id: body.case_id || "DEMO-CASE",
      plate_text: s.plate_text,
      camera_id: s.camera_id,
      camera_name: s.camera_name,
      camera_identifier: s.camera_identifier,
      location_name: s.location_name,
      frame_ts: s.frame_ts,
      frame_path: s.frame_path,
      vehicle_crop_path: s.crop_path,
      metadata_json,
      metadata_hash,
      ai_confidence: s.plate_conf,
      ai_model_version: "Sample scores (not measured)",
      exported: false,
      created_at: new Date().toISOString(),
    };
    state.evidence.unshift(evidence);
    state.audit.unshift({
      id: state.audit.length + 1,
      user_id: "usr-1",
      username: "Duty Officer",
      action: "viewed_evidence",
      target_type: "evidence",
      target_id: `${s.plate_text} · ${s.camera_identifier}`,
      detail: { hash: metadata_hash.slice(0, 16) + "..." },
      ip_address: "192.168.1.10",
      created_at: new Date().toISOString(),
    });
    save(state);
    return evidence;
  }

  if (path === "/evidence") {
    return state.evidence.filter(e =>
      (!q.get("plate") || e.plate_text?.includes(clean(q.get("plate")!))) &&
      (!q.get("case_id") || e.case_id === q.get("case_id")) &&
      (!q.get("camera_id") || e.camera_id === q.get("camera_id"))
    );
  }

  if (path.startsWith("/evidence/")) {
    const row = state.evidence.find(e => e.id === path.split("/")[2]);
    if (path === "/evidence/bulk-export" || path.endsWith("/export")) {
      const records = row ? [row] : state.evidence.filter(e => body.evidence_ids?.includes(e.id));
      if (!records.length) throw new Error("No preserved evidence selected");
      records.forEach(e => { e.exported = true; });
      state.audit.unshift({
        id: state.audit.length + 1,
        user_id: "usr-1",
        username: "Duty Officer",
        action: "export_evidence",
        target_type: "evidence",
        target_id: `Export ${records.length} records`,
        detail: { count: records.length },
        ip_address: "192.168.1.10",
        created_at: new Date().toISOString(),
      });
      save(state);
      return demoZip("DEMO_METADATA.json", JSON.stringify({ demo: true, notice: "Metadata-only demonstration export. No original frames, official records or forensic certification.", records }, null, 2));
    }
    if (!row) throw new Error("Evidence not found");
    if (path.endsWith("/verify")) {
      const hash = await sha256(row.metadata_json || "");
      return {
        evidence_id: row.id,
        valid: hash === row.metadata_hash,
        status: hash === row.metadata_hash ? "Digital signature and SHA-256 seal valid" : "Integrity check failed — signature mismatch",
        verified_at: new Date().toISOString(),
        details: {
          frame_valid: hash === row.metadata_hash,
          vehicle_crop_valid: hash === row.metadata_hash,
          plate_crop_valid: hash === row.metadata_hash,
          metadata_valid: hash === row.metadata_hash,
          stored_metadata_hash: row.metadata_hash,
          computed_metadata_hash: hash,
        },
      };
    }
    if (path.endsWith("/audit")) return [{ id: 1, username: "Demo Officer", action: "DEMO_METADATA_PRESERVED", created_at: row.created_at, target_type: "evidence", target_id: row.id }];
    return row;
  }

  if (path === "/audit") {
    const action = q.get("action");
    const user = q.get("user");
    let rows = state.audit || INITIAL_AUDIT_LOG;
    if (action && action !== "all") rows = rows.filter(a => a.action === action);
    if (user) rows = rows.filter(a => a.username?.toLowerCase().includes(user.toLowerCase()));
    return rows;
  }

  if ((path.startsWith("/cameras") || path.startsWith("/watchlist")) && ["POST", "PATCH", "DELETE"].includes(method)) {
    const isCamera = path.startsWith("/cameras"), rows: any[] = isCamera ? state.cameras : state.watchlist;
    const id = path.split("/")[2], index = rows.findIndex(r => r.id === id);
    if (method === "POST") {
      if (!isCamera && !/^[A-Z0-9]{6,12}$/.test(clean(body.plate_text || ""))) throw new Error("Enter a valid sample plate (6–12 letters/numbers)");
      if (!isCamera && rows.some(r => r.plate_text === clean(body.plate_text))) throw new Error("This plate is already on the watchlist");
      const row = {
        ...body,
        id: crypto.randomUUID(),
        active: true,
        status: isCamera ? (body.status || "online") : "unknown",
        created_at: new Date().toISOString(),
        ...(isCamera
          ? {
              camera_id: body.camera_id ? clean(body.camera_id) : `CAM${String(state.cameras.length + 1).padStart(2, "0")}`,
              name: body.name || `Camera ${state.cameras.length + 1}`,
              location_name: body.location_name || "Ahmedabad Surveillance Grid",
              latitude: Number(body.latitude) || 23.03,
              longitude: Number(body.longitude) || 72.58,
              protocol: "hls",
              hls_url: body.hls_url || assetUrl("videos/cam_mg_road.mp4"),
              fps: 25,
              resolution: "1920×1080",
              congestion: "LOW",
              metadata: { demo: true },
              recent_sightings_count: 0,
            }
          : { plate_text: clean(body.plate_text) }),
      };
      rows.unshift(row);
      if (!isCamera) {
        state.audit.unshift({
          id: state.audit.length + 1,
          user_id: "usr-1",
          username: "Duty Officer",
          action: "add_watchlist",
          target_type: "watchlist",
          target_id: clean(body.plate_text),
          detail: { reason: body.reason, priority: body.priority },
          ip_address: "192.168.1.10",
          created_at: new Date().toISOString(),
        });
      }
      save(state);
      return row;
    }
    if (index < 0) throw new Error("Record not found");
    if (method === "DELETE") { rows.splice(index, 1); save(state); return { message: "Sample record removed" }; }
    rows[index] = { ...rows[index], ...body }; save(state); return rows[index];
  }

  if (path.startsWith("/cameras/")) return state.cameras.find(c => c.id === path.split("/")[2]);

  if (path === "/analytics/summary") {
    return {
      cameras_online: state.cameras.filter(c => c.status === "online").length,
      cameras_total: state.cameras.length,
      vehicles_detected_today: SAMPLE_PLATES.length,
      plates_scanned: sightings.length,
      active_alerts: state.alerts.filter(a => a.status === "active").length,
      mttd_seconds: 1.8,
      mttr_minutes: 4.2,
      accuracy_pct: 96.2,
    };
  }

  if (path === "/analytics/activity") {
    const period = q.get("period");
    if (period === "7d") {
      const days = ["Mon 09/08", "Tue 09/09", "Wed 09/10", "Thu 09/11", "Fri 09/12", "Sat 09/13", "Sun 09/14"];
      const counts = [14, 19, 22, 18, 31, 25, 12];
      return days.map((day, i) => ({ hour: day, total: counts[i] }));
    }
    if (period === "30d") {
      const weeks = ["Week 34", "Week 35", "Week 36", "Week 37"];
      const counts = [112, 145, 138, 164];
      return weeks.map((w, i) => ({ hour: w, total: counts[i] }));
    }
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      total: sightings.filter(s => Number(s.frame_ts.slice(11, 13)) === hour).length,
    }));
  }

  if (path === "/analytics/top-plates") {
    return SAMPLE_PLATES.map(plate_text => ({
      plate_text,
      count: 5,
      last_seen: sightings.find(s => s.plate_text === plate_text)!.frame_ts,
      last_camera: "GIFT City Entry",
      is_watchlist: state.watchlist.some(w => w.plate_text === plate_text && w.active),
    }));
  }

  if (path === "/analytics/camera-heatmap") {
    return CAMERAS.flatMap(c =>
      Array.from({ length: 24 }, (_, hour) => ({
        camera_id: c.id,
        camera_name: c.name,
        hour,
        count: sightings.filter(s => s.camera_id === c.id && Number(s.frame_ts.slice(11, 13)) === hour).length,
      }))
    );
  }

  if (path === "/analytics/confidence-distribution") {
    return [{ bucket: "60–70%", count: 5 }, { bucket: "80–90%", count: 5 }, { bucket: "90–100%", count: 15 }];
  }

  if (path === "/system/background-status") {
    return {
      status: "operational",
      timestamp: new Date().toISOString(),
      redis_connected: true,
      celery_workers_online: 1,
      active_ai_camera_limit: 4,
      active_ai_cameras_count: 4,
      queues: { celery: 0, frames: 0, evidence: 0, alerts: 0 },
      workers: [
        { id: "camera_health", name: "Camera Health Worker", status: "completed", last_run: new Date().toISOString(), success_count: 14, failure_count: 0, last_error: null },
        { id: "ai_processing", name: "AI Processing Worker", status: "completed", last_run: new Date().toISOString(), success_count: 28, failure_count: 0, last_error: null },
        { id: "anpr_consensus", name: "Multi-Frame ANPR Consensus Worker", status: "completed", last_run: new Date().toISOString(), success_count: 19, failure_count: 0, last_error: null },
        { id: "watchlist_correlation", name: "Watchlist Correlation Worker", status: "completed", last_run: new Date().toISOString(), success_count: 32, failure_count: 0, last_error: null },
        { id: "cross_camera_correlation", name: "Cross-Camera Correlation Worker", status: "completed", last_run: new Date().toISOString(), success_count: 8, failure_count: 0, last_error: null },
        { id: "evidence_integrity", name: "Evidence Integrity Verification Worker", status: "completed", last_run: new Date().toISOString(), success_count: 11, failure_count: 0, last_error: null },
        { id: "research_agent_ops", name: "Research & Improvement Worker (agent_ops)", status: "completed", last_run: new Date().toISOString(), success_count: 6, failure_count: 0, last_error: null },
      ],
      recent_tasks: []
    };
  }

  if (path === "/system/trigger-worker") {
    const wid = body?.worker_id || "camera_health";
    return {
      dispatched: true,
      task_id: "demo-task-" + Date.now(),
      worker_id: wid,
      message: `${wid} triggered in simulation mode.`
    };
  }

  throw new Error("This service requires a connected backend. The demo does not simulate this integration.");
}
