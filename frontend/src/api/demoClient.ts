import { Alert, Camera, Evidence, Sighting, WatchlistEntry } from '../types';
import { assetUrl } from '../utils/demo';

const KEY = 'sentrax-demo-v1';
const locations = [
  ['MG Road Junction', 'Ahmedabad', 23.0258, 72.5839, 'mg_road'],
  ['Sardar Bridge Entry', 'Ahmedabad', 23.0152, 72.5794, 'sardar_bridge'],
  ['Vastrapur Lake Gate', 'Ahmedabad', 23.0395, 72.5293, 'vastrapur'],
  ['SG Highway Toll', 'Ahmedabad', 23.071, 72.518, 'sg_highway_toll'],
  ['Sector 15 Junction', 'Gandhinagar', 23.224, 72.65, 'sector15'],
  ['GIFT City Approach', 'Gandhinagar', 23.1645, 72.6847, 'gift_city'],
  ['Sabarmati Riverfront', 'Ahmedabad', 23.045, 72.5714, 'sabarmati'],
  ['GNLU Main Gate', 'Gandhinagar', 23.1535, 72.6625, 'gnlu_gate'],
  ['Chiloda Circle', 'Gandhinagar', 23.262, 72.721, 'chiloda_circle'],
  ['Kudasan Junction', 'Gandhinagar', 23.185, 72.636, 'kudasan'],
] as const;
export const SAMPLE_PLATES = ['GJ01AB1234', 'UP32PQ6677', 'GJ05CD5678', 'DL10XY9090', 'RJ14GH3456'];
const cameras: Camera[] = locations.map(([name, location_name, latitude, longitude, video], i) => ({
  id: `cam-${String(i + 1).padStart(2, '0')}`, camera_id: `CAM${String(i + 1).padStart(2, '0')}`,
  name, location_name, latitude, longitude, rtsp_url: '', hls_url: assetUrl(`videos/cam_${video}.mp4`),
  protocol: 'hls', status: i === 9 ? 'offline' : 'online', fps: 25, resolution: '1920×1080',
  metadata: { demo: true }, recent_sightings_count: 5,
}));
const sightings: Sighting[] = SAMPLE_PLATES.flatMap((plate, p) => [0, 6, 3, 7, 5].map((c, i) => ({
  id: `sample-${p}-${i}`, plate_text: plate, plate_raw: plate, plate_conf: [0.97, 0.91, 0.64, 0.88, 0.96][i],
  vehicle_class: p === 4 ? 'truck' : 'car', vehicle_conf: 0.94, track_id: p * 10 + i,
  camera_id: cameras[c].id, camera_identifier: cameras[c].camera_id, camera_name: cameras[c].name,
  location_name: cameras[c].location_name, latitude: cameras[c].latitude, longitude: cameras[c].longitude,
  frame_ts: `2026-09-13T${String(9 + p).padStart(2, '0')}:${String(i * 12).padStart(2, '0')}:00+05:30`,
  frame_path: assetUrl(`images/feed_cam${String(c + 1).padStart(2, '0')}.jpg`),
  crop_path: assetUrl('images/hit_swift_clean.jpg'), metadata: { demo: true, review_required: i === 2 },
})));
interface State { cameras: Camera[]; watchlist: WatchlistEntry[]; alerts: Alert[]; evidence: Evidence[]; }
function initial(): State {
  const watchlist: WatchlistEntry[] = [{ id: 'watch-demo-1', plate_text: 'UP32PQ6677', reason: 'Sample investigation — review required', priority: 'high', active: true, created_at: '2026-09-13T03:30:00Z' }];
  return { cameras, watchlist, evidence: [], alerts: sightings.filter(s => s.plate_text === 'UP32PQ6677').map((s, i) => ({
    id: `alert-demo-${i}`, sighting_id: s.id, watchlist_id: watchlist[0].id, plate_text: s.plate_text!,
    camera_id: s.camera_id, camera_name: s.camera_name, camera_identifier: s.camera_identifier,
    location_name: s.location_name, plate_conf: s.plate_conf, triggered_at: s.frame_ts,
    status: 'active', priority: 'high', watchlist_reason: watchlist[0].reason, frame_path: s.frame_path,
    crop_path: s.crop_path, vehicle_class: s.vehicle_class,
  })) };
}
function read(): State {
  try { const data = JSON.parse(localStorage.getItem(KEY) || 'null'); if (data?.cameras && data?.watchlist && data?.alerts && data?.evidence) return data; } catch { /* reset invalid demo data */ }
  return initial();
}
function save(state: State) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
const clean = (value: string) => value.replace(/\s/g, '').toUpperCase();
async function sha256(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
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
  return new Blob([bytes], { type: 'application/zip' });
}
export async function demoRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  const url = new URL(endpoint, 'https://demo.invalid'), path = url.pathname, q = url.searchParams;
  const method = options.method || 'GET', body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
  const state = read();
  const filtered = (rows: Sighting[]) => rows.filter(s => (!q.get('plate') || s.plate_text!.includes(clean(q.get('plate')!))) &&
    (!q.get('vehicle_class') || s.vehicle_class === q.get('vehicle_class')) && (!q.get('camera_id') || s.camera_id === q.get('camera_id')) &&
    (!q.get('from') || Date.parse(s.frame_ts) >= Date.parse(q.get('from')!)) && (!q.get('to') || Date.parse(s.frame_ts) <= Date.parse(q.get('to')!)));
  const page = (rows: Sighting[]) => ({ items: rows.slice(Number(q.get('offset') || 0), Number(q.get('offset') || 0) + Number(q.get('limit') || 100)), total: rows.length, page: 1, limit: Number(q.get('limit') || 100) });
  if (path === '/vehicles/search') return page(filtered(sightings));
  if (path.startsWith('/vehicles/sightings/')) return sightings.find(s => s.id === path.split('/').pop()) || Promise.reject(new Error('Sighting not found'));
  if (path.startsWith('/vehicles/journey/')) {
    const plate = clean(decodeURIComponent(path.split('/').pop()!)), rows = filtered(sightings.filter(s => s.plate_text === plate));
    return { plate_text: plate, total_sightings: rows.length, unique_cameras: new Set(rows.map(s => s.camera_id)).size,
      start_ts: rows[0]?.frame_ts, end_ts: rows.at(-1)?.frame_ts, total_duration_mins: rows.length ? 48 : 0, estimated_distance_km: rows.length ? 31.2 : 0,
      stops: rows.map(s => ({ ...s, sighting_id: s.id, timestamp: s.frame_ts, dwell_time_mins: 0 })),
      path_coordinates: rows.map(s => [s.latitude, s.longitude]) };
  }
  if (path.startsWith('/vehicles/dossier/')) {
    const plate = clean(decodeURIComponent(path.split('/').pop()!));
    if (!SAMPLE_PLATES.includes(plate)) throw new Error('No sample dossier exists for this plate. Official owner records are not connected.');
    return { plate_text: plate, owner: { name: 'Fictional sample owner', address: 'Not connected — no personal records', phone_masked: 'Not available', ownership_type: 'Sample only' },
      specs: { make: 'Sample', model: 'Passenger vehicle', color: 'White', fuel_type: 'Unknown', engine_number: 'Not connected', chassis_number: 'Not connected', seating_capacity: 5, emission_norm: 'Unknown' },
      registration: { registration_date: '2020-01-01', rto_office: 'Sample record', rto_code: 'DEMO', vehicle_class: 'car', rc_status: 'UNVERIFIED SAMPLE', fitness_valid_upto: '2030-01-01', insurance_company: 'Not connected', insurance_policy_no: 'Not connected', insurance_valid_upto: '2030-01-01', pucc_number: 'Not connected', pucc_valid_upto: '2030-01-01', fastag_status: 'Not connected' },
      intelligence: { is_watchlist: state.watchlist.some(w => w.active && w.plate_text === plate), threat_level: 'NORMAL', notes: 'Fictional demonstration only. No criminal identity or government database has been verified.' },
      telemetry: { total_sightings_today: 5, last_camera_name: 'GIFT City Approach', last_location: 'Gandhinagar', last_seen_timestamp: sightings.find(s => s.plate_text === plate)!.frame_ts, vehicle_crop_url: assetUrl('images/hit_swift_clean.jpg') }, digital_signature: 'DEMO — NOT AN OFFICIAL SIGNATURE' };
  }
  if (path === '/copilot/analyze') {
    const plate = clean(body.plate_text || ''), rows = sightings.filter(s => s.plate_text === plate);
    return { provider: 'Deterministic demo summary (not AI)', analysis: rows.length ? `DEMO — FICTIONAL SAMPLE DATA\n\n${plate}: ${rows.length} sample sightings across ${new Set(rows.map(s => s.camera_id)).size} cameras.\n\n${rows.map(s => `${s.camera_name}: ${s.frame_ts}, sample plate score ${Math.round((s.plate_conf || 0) * 100)}%`).join('\n')}\n\nReview low-confidence frames manually. These sightings do not prove identity, intent or a criminal association. No official records, dispatch or legal certification are connected.` : 'No sample sightings match this plate. No external AI service or official record was queried.' };
  }
  if (path === '/cameras' && method === 'GET') {
    const st = q.get('status');
    return st && st !== 'all' ? state.cameras.filter(c => c.status === st) : state.cameras;
  }
  if (path.startsWith('/cameras/') && path.endsWith('/sightings')) return page(filtered(sightings.filter(s => s.camera_id === path.split('/')[2])));
  if (path.endsWith('/test')) return { reachable: false, latency_ms: 0, status: 'demo', detail: 'Sample playback only. No live stream is being probed.' };
  if (path === '/watchlist' && method === 'GET') {
    return state.watchlist.filter(w =>
      (q.get('active_only') !== 'true' || w.active) &&
      (!q.get('priority') || w.priority === q.get('priority')) &&
      (!q.get('search') || w.plate_text.includes(clean(q.get('search')!)))
    );
  }
  if (path.startsWith('/watchlist/') && path.endsWith('/alerts')) return state.alerts.filter(a => a.watchlist_id === path.split('/')[2]);
  if (path === '/alerts') return state.alerts.filter(a => (!q.get('status') || a.status === q.get('status')) && (!q.get('priority') || a.priority === q.get('priority')) && (!q.get('plate') || a.plate_text.includes(clean(q.get('plate')!))) && (!q.get('camera_id') || a.camera_id === q.get('camera_id')));
  if (path.startsWith('/alerts/')) {
    const row = state.alerts.find(a => a.id === path.split('/')[2]);
    if (!row) throw new Error('Alert not found');
    if (method === 'PATCH') { row.status = path.endsWith('/acknowledge') ? 'acknowledged' : 'dismissed'; row.acknowledged_at = new Date().toISOString(); save(state); }
    return row;
  }
  if (path === '/evidence/preserve') {
    const s = sightings.find(s => s.id === body.sighting_id);
    if (!s) throw new Error('Select a sample sighting to preserve');
    const existing = state.evidence.find(e => e.sighting_id === s.id && e.case_id === body.case_id);
    if (existing) return existing;
    const metadata_json = JSON.stringify({ demo: true, notice: 'Fictional sample metadata; images are illustrative and not forensic evidence.', sighting: s });
    const evidence: Evidence = { id: crypto.randomUUID(), sighting_id: s.id, alert_id: body.alert_id, case_id: body.case_id || 'DEMO-CASE', plate_text: s.plate_text,
      camera_id: s.camera_id, camera_name: s.camera_name, camera_identifier: s.camera_identifier, location_name: s.location_name,
      frame_ts: s.frame_ts, frame_path: s.frame_path, vehicle_crop_path: s.crop_path, metadata_json, metadata_hash: await sha256(metadata_json),
      ai_confidence: s.plate_conf, ai_model_version: 'Sample scores (not measured)', exported: false, created_at: new Date().toISOString() };
    state.evidence.unshift(evidence); save(state); return evidence;
  }
  if (path === '/evidence') return state.evidence.filter(e => (!q.get('plate') || e.plate_text?.includes(clean(q.get('plate')!))) && (!q.get('case_id') || e.case_id === q.get('case_id')) && (!q.get('camera_id') || e.camera_id === q.get('camera_id')));
  if (path.startsWith('/evidence/')) {
    const row = state.evidence.find(e => e.id === path.split('/')[2]);
    if (path === '/evidence/bulk-export' || path.endsWith('/export')) {
      const records = row ? [row] : state.evidence.filter(e => body.evidence_ids?.includes(e.id));
      if (!records.length) throw new Error('No preserved evidence selected');
      records.forEach(e => { e.exported = true; }); save(state);
      return demoZip('DEMO_METADATA.json', JSON.stringify({ demo: true, notice: 'Metadata-only demonstration export. No original frames, official records or forensic certification.', records }, null, 2));
    }
    if (!row) throw new Error('Evidence not found');
    if (path.endsWith('/verify')) { const hash = await sha256(row.metadata_json || ''); return { evidence_id: row.id, valid: hash === row.metadata_hash, status: 'Demo metadata only; original media not verified', verified_at: new Date().toISOString(), details: { frame_valid: false, vehicle_crop_valid: false, plate_crop_valid: false, metadata_valid: hash === row.metadata_hash, stored_metadata_hash: row.metadata_hash, computed_metadata_hash: hash } }; }
    if (path.endsWith('/audit')) return [{ id: 1, username: 'Demo Officer', action: 'DEMO_METADATA_PRESERVED', created_at: row.created_at, target_type: 'evidence', target_id: row.id }];
    return row;
  }
  if ((path.startsWith('/cameras') || path.startsWith('/watchlist')) && ['POST', 'PATCH', 'DELETE'].includes(method)) {
    const isCamera = path.startsWith('/cameras'), rows: any[] = isCamera ? state.cameras : state.watchlist;
    const id = path.split('/')[2], index = rows.findIndex(r => r.id === id);
    if (method === 'POST') {
      if (!isCamera && !/^[A-Z0-9]{6,12}$/.test(clean(body.plate_text || ''))) throw new Error('Enter a valid sample plate (6–12 letters/numbers)');
      if (!isCamera && rows.some(r => r.plate_text === clean(body.plate_text))) throw new Error('This plate is already on the watchlist');
      const row = {
        ...body,
        id: crypto.randomUUID(),
        active: true,
        status: isCamera ? (body.status || 'online') : 'unknown',
        created_at: new Date().toISOString(),
        ...(isCamera
          ? {
              camera_id: body.camera_id ? clean(body.camera_id) : `CAM${String(state.cameras.length + 1).padStart(2, '0')}`,
              name: body.name || `Camera ${state.cameras.length + 1}`,
              location_name: body.location_name || 'Ahmedabad Surveillance Grid',
              latitude: Number(body.latitude) || 23.03,
              longitude: Number(body.longitude) || 72.58,
              protocol: 'hls',
              hls_url: body.hls_url || assetUrl('videos/cam_mg_road.mp4'),
              fps: 25,
              resolution: '1920×1080',
              metadata: { demo: true },
              recent_sightings_count: 0,
            }
          : { plate_text: clean(body.plate_text) }),
      };
      rows.unshift(row); save(state); return row;
    }
    if (index < 0) throw new Error('Record not found');
    if (method === 'DELETE') { rows.splice(index, 1); save(state); return { message: 'Sample record removed' }; }
    rows[index] = { ...rows[index], ...body }; save(state); return rows[index];
  }
  if (path.startsWith('/cameras/')) return state.cameras.find(c => c.id === path.split('/')[2]);
  if (path === '/analytics/summary') return { cameras_online: state.cameras.filter(c => c.status === 'online').length, cameras_total: state.cameras.length, vehicles_detected_today: SAMPLE_PLATES.length, plates_scanned: sightings.length, active_alerts: state.alerts.filter(a => a.status === 'active').length };
  if (path === '/analytics/activity') {
    const period = q.get('period');
    if (period === '7d') {
      const days = ['Mon 09/08', 'Tue 09/09', 'Wed 09/10', 'Thu 09/11', 'Fri 09/12', 'Sat 09/13', 'Sun 09/14'];
      const counts = [14, 19, 22, 18, 31, 25, 12];
      return days.map((day, i) => ({ hour: day, total: counts[i] }));
    }
    if (period === '30d') {
      const weeks = ['Week 34', 'Week 35', 'Week 36', 'Week 37'];
      const counts = [112, 145, 138, 164];
      return weeks.map((w, i) => ({ hour: w, total: counts[i] }));
    }
    return Array.from({ length: 24 }, (_, hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, total: sightings.filter(s => Number(s.frame_ts.slice(11, 13)) === hour).length }));
  }
  if (path === '/analytics/top-plates') return SAMPLE_PLATES.map(plate_text => ({ plate_text, count: 5, last_seen: sightings.find(s => s.plate_text === plate_text)!.frame_ts, last_camera: 'GIFT City Approach', is_watchlist: state.watchlist.some(w => w.plate_text === plate_text && w.active) }));
  if (path === '/analytics/camera-heatmap') return cameras.flatMap(c => Array.from({ length: 24 }, (_, hour) => ({ camera_id: c.id, camera_name: c.name, hour, count: sightings.filter(s => s.camera_id === c.id && Number(s.frame_ts.slice(11, 13)) === hour).length })));
  if (path === '/analytics/confidence-distribution') return [{ bucket: '60–70%', count: 5 }, { bucket: '80–90%', count: 5 }, { bucket: '90–100%', count: 15 }];
  throw new Error('This service requires a connected backend. The demo does not simulate this integration.');
}
