# SENTRAX — COMPLETE IMPROVEMENT PROMPT
## Antigravity ke liye — Deep Research Based, Gujarat Sentinel Hackathon

---

## CONTEXT (pehle yeh padho)

Maine competitor repos deeply analyze kiye hain:
- `iamritikarsh/SIH-2026` — SIH 2026 ka ANPR trajectory tracking platform (React + Vite + FastAPI)
- `Nileshpar835/gujarat-Police` — Gujarat CCTV Hackathon ka production-grade submission (React + Leaflet + FastAPI + MediaMTX)
- `prathmeshnanda2007-sudo/ANPR_TRAJECTORY_TRACKING` — Real-time ANPR with Leaflet dark maps

Is research ke basis pe yeh improvements MANDATORY hain. **Competitors isse better kar rahe hain — hum unhe beat karna chahte hain.**

---

## PART 1: CRITICAL ISSUES TO FIX (jo competitors ne already solve ki hain)

### 1.1 — Real Leaflet Map with CartoDB Dark Tiles (NOT a CSS grid placeholder)

**Problem:** Hamare paas map mein sirf ek dot-grid CSS placeholder hai. Competitors real Leaflet maps use kar rahe hain dark CartoDB tiles ke saath.

**Fix — Add to `index.html` head:**
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

**Fix — Replace every `.map-box` div with a real Leaflet map:**
```javascript
function initLeafletMap(containerId, options = {}) {
  const map = L.map(containerId, {
    center: options.center || [23.0225, 72.5714], // Ahmedabad
    zoom: options.zoom || 12,
    zoomControl: true,
    attributionControl: false
  });

  // CartoDB Dark Matter tiles — same as competitor SIH-2026
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  return map;
}

// Custom camera pin icon
const camIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#0E7FE0;
         box-shadow:0 0 0 3px rgba(14,127,224,0.3),0 0 12px #0E7FE0;"></div>`,
  iconSize: [12, 12]
});

const alertCamIcon = L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#FF3B3B;
         box-shadow:0 0 0 3px rgba(255,59,59,0.3),0 0 12px #FF3B3B;
         animation:pulse-dot 1s infinite;"></div>`,
  iconSize: [12, 12]
});

const sightingIcon = (number) => L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#0E7FE0;
         color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;
         justify-content:center;font-family:monospace;border:2px solid #1A9FFF;
         box-shadow:0 0 12px rgba(14,127,224,0.6);">${number}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});
```

**Investigation Map — real implementation:**
```javascript
let investigationMap = null;

function initInvestigationMap() {
  if (investigationMap) { investigationMap.remove(); }
  investigationMap = initLeafletMap('investigation-map', { zoom: 11 });
}

function updateInvestigationMap(sightings) {
  if (!investigationMap) return;

  // Clear existing layers
  investigationMap.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      investigationMap.removeLayer(layer);
    }
  });

  const coords = [];

  sightings.forEach((s, i) => {
    const cam = CAMERAS.find(c => c.id === s.cam);
    const latLng = [cam.lat, cam.lng];
    coords.push(latLng);

    L.marker(latLng, { icon: sightingIcon(i + 1) })
      .bindPopup(`
        <div style="background:#0D1520;color:#E8EFF7;padding:10px;border-radius:6px;min-width:180px">
          <div style="font-size:10px;color:#4D6B85;margin-bottom:4px">${s.cam} · ${s.time}</div>
          <div style="font-family:monospace;font-weight:700;font-size:13px">${s.plate||'GJ01AB1234'}</div>
          <div style="font-size:11px;color:#8FA8C0;margin-top:4px">${cam.name}</div>
        </div>
      `, { className: 'dark-popup' })
      .addTo(investigationMap);
  });

  // Draw animated dashed journey path
  if (coords.length >= 2) {
    L.polyline(coords, {
      color: '#0E7FE0',
      weight: 2,
      opacity: 0.8,
      dashArray: '8, 6',
    }).addTo(investigationMap);

    // Fit map to show all sightings
    investigationMap.fitBounds(L.latLngBounds(coords).pad(0.3));
  }
}
```

**Add CSS for dark Leaflet popup:**
```css
.dark-popup .leaflet-popup-content-wrapper {
  background: #0D1520 !important;
  border: 1px solid #233A52 !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6) !important;
  color: #E8EFF7 !important;
}
.dark-popup .leaflet-popup-tip {
  background: #0D1520 !important;
}
.dark-popup .leaflet-popup-close-button {
  color: #4D6B85 !important;
}
```

---

### 1.2 — Camera Coordinates Add Karo (Map ke liye)

**CAMERAS array mein lat/lng add karo:**
```javascript
const CAMERAS = [
  {id:'CAM01', name:'MG Road Junction',       lat:23.0225, lng:72.5714, ...},
  {id:'CAM02', name:'Sardar Bridge Entry',     lat:23.0152, lng:72.5794, ...},
  {id:'CAM03', name:'Vastrapur Lake Gate',     lat:23.0436, lng:72.5283, ...},
  {id:'CAM04', name:'SG Highway Toll',         lat:23.0732, lng:72.5038, ...},
  {id:'CAM05', name:'Gandhinagar Sector 15',   lat:23.2156, lng:72.6394, ...},
  {id:'CAM06', name:'GIFT City Entry',         lat:23.1573, lng:72.6787, ...},
  {id:'CAM07', name:'Sabarmati Riverfront',    lat:23.0395, lng:72.5878, ...},
  {id:'CAM08', name:'GNLU Gate',               lat:23.1891, lng:72.6542, ...},
  {id:'CAM09', name:'Chiloda Circle',          lat:23.2743, lng:72.6122, ...},
  {id:'CAM10', name:'Kudasan Junction',        lat:23.2264, lng:72.6511, ...},
  {id:'CAM11', name:'Bopal Crossroads',        lat:23.0000, lng:72.4700, ...},
  {id:'CAM12', name:'Science City Gate',       lat:23.0760, lng:72.5950, ...},
  {id:'CAM13', name:'Naroda Highway',          lat:23.0890, lng:72.6420, ...},
  {id:'CAM14', name:'Chandkheda Circle',       lat:23.1100, lng:72.5990, ...},
  {id:'CAM15', name:'Sector 7 Gate',           lat:23.2220, lng:72.6450, ...},
];
```

---

### 1.3 — Cinematic Vehicle Journey Replay (Competitor ka winning feature)

**Competitor SIH-2026 mein yeh feature tha — animated vehicle icon real map pe move karta hai.**

Journey page pe add karo:

```javascript
let journeyMap = null;
let journeyMarker = null;
let journeyPath = null;
let journeyAnimFrame = null;
let journeyPlaying = false;
let journeyStep = 0;

const JOURNEY_COORDS = [
  { lat: 23.0152, lng: 72.5794, cam: 'CAM02', time: '08:45:12', label: 'Sardar Bridge Entry' },
  { lat: 23.0225, lng: 72.5714, cam: 'CAM01', time: '09:12:34', label: 'MG Road Junction' },
  { lat: 23.0732, lng: 72.5038, cam: 'CAM04', time: '10:01:47', label: 'SG Highway Toll' },
  { lat: 23.1573, lng: 72.6787, cam: 'CAM06', time: '10:32:04', label: 'GIFT City Entry' },
];

function initJourneyMap() {
  if (journeyMap) return;
  journeyMap = initLeafletMap('journey-map-container', { center: [23.09, 72.62], zoom: 11 });

  // Draw static path
  const coords = JOURNEY_COORDS.map(p => [p.lat, p.lng]);
  L.polyline(coords, {
    color: '#0E7FE0', weight: 3, opacity: 0.5, dashArray: '10, 8'
  }).addTo(journeyMap);

  // Place all camera markers
  JOURNEY_COORDS.forEach((p, i) => {
    const isFirst = i === 0, isLast = i === JOURNEY_COORDS.length - 1;
    L.circleMarker([p.lat, p.lng], {
      radius: 8,
      fillColor: isFirst ? '#00C875' : isLast ? '#FF8C00' : '#0E7FE0',
      color: '#fff', weight: 2, fillOpacity: 0.9
    }).bindTooltip(`<b>${p.cam}</b><br>${p.label}<br><span style="font-family:monospace">${p.time}</span>`,
      { className: 'dark-tooltip' }).addTo(journeyMap);
  });

  // Vehicle marker (starts at first point)
  const vehicleIcon = L.divIcon({
    className: '',
    html: `<div style="font-size:18px;filter:drop-shadow(0 0 6px #0E7FE0)">🚗</div>`,
    iconSize: [20, 20], iconAnchor: [10, 10]
  });
  journeyMarker = L.marker([JOURNEY_COORDS[0].lat, JOURNEY_COORDS[0].lng], {
    icon: vehicleIcon, zIndexOffset: 1000
  }).addTo(journeyMap);
}

function playJourney() {
  journeyPlaying = true;
  journeyStep = 0;
  animateVehicle();
}

function animateVehicle() {
  if (!journeyPlaying || journeyStep >= JOURNEY_COORDS.length - 1) {
    journeyPlaying = false;
    return;
  }
  const from = JOURNEY_COORDS[journeyStep];
  const to   = JOURNEY_COORDS[journeyStep + 1];
  const steps = 60; // ~1 second animation at 60fps
  let step = 0;

  function frame() {
    if (!journeyPlaying) return;
    step++;
    const t = step / steps;
    const lat = from.lat + (to.lat - from.lat) * t;
    const lng = from.lng + (to.lng - from.lng) * t;
    journeyMarker.setLatLng([lat, lng]);
    journeyMap.panTo([lat, lng], { animate: false });

    if (step < steps) {
      journeyAnimFrame = requestAnimationFrame(frame);
    } else {
      // Highlight current timeline entry
      document.querySelectorAll('.timeline-card').forEach((c, i) => {
        c.style.borderColor = i === journeyStep + 1 ? '#0E7FE0' : '';
        c.style.background  = i === journeyStep + 1 ? 'rgba(14,127,224,0.12)' : '';
      });
      journeyStep++;
      setTimeout(animateVehicle, 600); // Pause 0.6s at each stop
    }
  }
  requestAnimationFrame(frame);
}
```

**Journey page HTML mein add karo:**
```html
<!-- Journey Map container (replace map-box div) -->
<div id="journey-map-container" style="height:400px;border-radius:8px;overflow:hidden;border:1px solid #1C2E42"></div>

<!-- Playback Controls -->
<div style="display:flex;gap:8px;margin-top:10px;align-items:center">
  <button class="btn btn-primary btn-sm" onclick="playJourney()">▶ Play Journey</button>
  <button class="btn btn-ghost btn-sm" onclick="journeyPlaying=false">⏸ Pause</button>
  <button class="btn btn-ghost btn-sm" onclick="initJourneyMap()">↺ Reset</button>
  <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono)">
    4 stops · 1h 47m · ~23.4km
  </span>
</div>
```

---

### 1.4 — Camera Registry Map pe Real Leaflet

```javascript
function initCamerasMap() {
  if (document.getElementById('cameras-map-real')) return;

  const div = document.getElementById('cameras-map');
  div.id = 'cameras-map-real';
  div.style.height = '340px';
  div.innerHTML = '';

  const map = initLeafletMap('cameras-map-real', { center: [23.12, 72.6], zoom: 10 });

  CAMERAS.forEach(cam => {
    const icon = cam.status === 'online'   ? camIcon :
                 cam.status === 'warning'  ? L.divIcon({ className: '',
                   html: '<div style="width:10px;height:10px;border-radius:50%;background:#FF8C00;box-shadow:0 0 8px #FF8C00"></div>',
                   iconSize: [10, 10]}) : alertCamIcon;

    L.marker([cam.lat, cam.lng], { icon })
      .bindPopup(`<b>${cam.id}</b><br>${cam.name}<br>${cam.status.toUpperCase()}`)
      .addTo(map);
  });
}
```

---

## PART 2: UI/UX IMPROVEMENTS

### 2.1 — Dashboard Stat Card Icons (B&W default → Color on hover)

**Yeh currently kaam nahi kar raha properly. Fix:**
```css
/* Stat card icon — default grayscale, hover color */
.stat-icon {
  filter: grayscale(1) brightness(0.7);
  transition: filter 250ms ease, background 250ms ease, transform 250ms ease;
  background: var(--bg-elevated);
}
.stat-card:hover .stat-icon {
  filter: grayscale(0) brightness(1);
  background: var(--accent-glow);
  transform: scale(1.1) rotate(-3deg);
}
/* Each card gets its own accent color on hover */
.stat-card:nth-child(1):hover .stat-icon { background: rgba(14,127,224,0.15); color: var(--accent); }
.stat-card:nth-child(2):hover .stat-icon { background: rgba(0,200,117,0.12); color: var(--green); }
.stat-card:nth-child(3):hover .stat-icon { background: rgba(255,59,59,0.12); color: var(--red); }
.stat-card:nth-child(4):hover .stat-icon { background: rgba(124,58,237,0.12); color: #7C3AED; }
```

### 2.2 — Nav Item Icons (B&W default → color on hover)

```css
.nav-item .nav-icon {
  filter: grayscale(1);
  transition: filter 160ms ease;
}
.nav-item:hover .nav-icon,
.nav-item.active .nav-icon {
  filter: grayscale(0);
}
/* Specific colors per nav section */
.nav-item[onclick*="dashboard"]:hover .nav-icon,
.nav-item[onclick*="dashboard"].active .nav-icon { color: var(--accent); }
.nav-item[onclick*="monitor"]:hover .nav-icon,
.nav-item[onclick*="monitor"].active .nav-icon   { color: var(--green); }
.nav-item[onclick*="alerts"]:hover .nav-icon,
.nav-item[onclick*="alerts"].active .nav-icon    { color: var(--red); }
.nav-item[onclick*="watchlist"]:hover .nav-icon,
.nav-item[onclick*="watchlist"].active .nav-icon { color: var(--orange); }
.nav-item[onclick*="evidence"]:hover .nav-icon,
.nav-item[onclick*="evidence"].active .nav-icon  { color: #7C3AED; }
.nav-item[onclick*="journey"]:hover .nav-icon,
.nav-item[onclick*="journey"].active .nav-icon   { color: var(--accent); }
.nav-item[onclick*="cameras"]:hover .nav-icon,
.nav-item[onclick*="cameras"].active .nav-icon   { color: var(--accent); }
.nav-item[onclick*="analytics"]:hover .nav-icon,
.nav-item[onclick*="analytics"].active .nav-icon { color: var(--green); }
```

### 2.3 — Alert Flash Animation (jab naya alert aaye)

```css
@keyframes alert-flash {
  0%   { background: rgba(255,59,59,0.25); }
  50%  { background: rgba(255,59,59,0.05); }
  100% { background: linear-gradient(90deg, var(--red-dim), transparent 240px); }
}
.alert-card.new-alert {
  animation: slide-in 300ms ease, alert-flash 1.5s ease 300ms;
}
```

### 2.4 — Search Bar Global — CMD+K shortcut

```javascript
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('global-search').focus();
    document.getElementById('global-search').select();
  }
  if (e.key === 'Escape') {
    document.getElementById('global-search').blur();
  }
});
```

### 2.5 — Live Monitor — Realistic Camera Feed Simulation

**Har camera pe random interval pe bounding box update karo:**
```javascript
function simulateLiveDetections() {
  const feeds = document.querySelectorAll('.cam-feed');
  feeds.forEach((feed, i) => {
    if (Math.random() > 0.5) return; // Only some cameras active at once

    setInterval(() => {
      const bbox = feed.querySelector('.cam-bbox');
      const plateOverlay = feed.querySelector('.cam-plate-overlay');
      if (!bbox) return;

      // Random position for bounding box
      const x = 10 + Math.random() * 30;
      const y = 15 + Math.random() * 20;
      const w = 40 + Math.random() * 30;
      const h = 50 + Math.random() * 20;

      bbox.style.left   = x + '%';
      bbox.style.top    = y + '%';
      bbox.style.width  = w + '%';
      bbox.style.height = h + '%';

      // Flash detection
      bbox.style.borderColor = '#00C875';
      setTimeout(() => { bbox.style.borderColor = '#00C875'; }, 150);

      if (plateOverlay) {
        const p = PLATES[Math.floor(Math.random() * PLATES.length)];
        plateOverlay.textContent = p.plate;
        if (p.watchlist) {
          plateOverlay.style.background = 'rgba(255,59,59,0.9)';
          plateOverlay.style.border = '1px solid rgba(255,59,59,0.6)';
        } else {
          plateOverlay.style.background = 'rgba(0,0,0,0.85)';
          plateOverlay.style.border = '1px solid rgba(255,255,255,0.2)';
        }
      }
    }, 2000 + Math.random() * 3000);
  });
}
```

### 2.6 — Confidence Bar in Sighting Timeline Items

```html
<!-- Timeline card mein add karo -->
<div style="margin-top:6px">
  <div style="display:flex;justify-content:space-between;margin-bottom:2px">
    <span style="font-size:10px;color:var(--text-muted)">ANPR Confidence</span>
    <span style="font-size:10px;font-family:var(--font-mono);color:var(--green)">94.2%</span>
  </div>
  <div class="conf-bar">
    <div class="conf-fill conf-high" style="width:94.2%"></div>
  </div>
</div>
```

### 2.7 — Evidence Card — Hash Verification Animation

```javascript
function verifyEvidence(btn) {
  btn.textContent = '⟳ Verifying...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Verified';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    btn.closest('.evidence-card').querySelector('.badge-green').textContent = '✓ VERIFIED';
    showToast('SHA-256 hash verified — evidence is intact', 'success');
  }, 1200);
}
```

---

## PART 3: MISSING FEATURES (competitor ke paas hain, hamare paas nahi)

### 3.1 — Speed Anomaly Detection Display

Ek alert type add karo jo speed anomaly show kare:
```javascript
const ALERT_DATA = [
  // ... existing alerts ...
  { priority:'high', plate:'GJ05CD5678', cam:'CAM04', time:'09:43:11',
    reason:'Speed anomaly: 112 km/h in 60 km/h zone', status:'active', type:'speed' },
];
```

Speed alerts badge alag dikhao:
```html
<span class="badge" style="background:rgba(255,140,0,0.15);color:#FF8C00;border-color:rgba(255,140,0,0.3)">
  ⚡ SPEED
</span>
```

### 3.2 — Congestion Status per Camera

Camera Registry table mein add karo:
```javascript
// Each camera gets a congestion level
const congestion = ['LOW', 'LOW', 'MEDIUM', 'HIGH', 'LOW', 'MEDIUM', ...];
// Table column: Congestion
`<td><span class="badge ${c==='HIGH'?'badge-red':c==='MEDIUM'?'badge-orange':'badge-green'}">${c}</span></td>`
```

### 3.3 — Alert Resolution Counter (real-time)

Dashboard stat cards ke neeche ek bar add karo:
```html
<div style="display:flex;gap:16px;padding:12px 16px;background:var(--bg-elevated);
     border-radius:8px;border:1px solid var(--border-dim);margin-top:16px;flex-wrap:wrap">
  <div style="font-size:11px;color:var(--text-muted)">
    MTTD: <span style="color:var(--green);font-family:var(--font-mono);font-weight:600">1.8s</span>
  </div>
  <div style="font-size:11px;color:var(--text-muted)">
    MTTR: <span style="color:var(--accent);font-family:var(--font-mono);font-weight:600">4.2m</span>
  </div>
  <div style="font-size:11px;color:var(--text-muted)">
    ANPR Accuracy: <span style="color:var(--green);font-family:var(--font-mono);font-weight:600">96.2%</span>
  </div>
  <div style="font-size:11px;color:var(--text-muted)">
    Cameras Up: <span style="color:var(--green);font-family:var(--font-mono);font-weight:600">12/15</span>
  </div>
  <div style="font-size:11px;color:var(--text-muted)">
    Active Watchlist: <span style="color:var(--red);font-family:var(--font-mono);font-weight:600">3 plates</span>
  </div>
</div>
```

### 3.4 — Audit Log Page (Evidence ke baad add karo)

Competitor ke paas full audit trail tha with filtering.
```javascript
// Nav mein add karo
{ id: 'audit', label: 'Audit Log', icon: 'shield-check' }

// Audit data
const AUDIT_LOG = [
  { user:'admin', action:'viewed_evidence', target:'GJ01AB1234 · CAM04', time:'10:32:06', ip:'192.168.1.10' },
  { user:'admin', action:'ack_alert',       target:'Alert #3 · CAM12',  time:'09:17:45', ip:'192.168.1.10' },
  { user:'admin', action:'add_watchlist',   target:'RJ14GH3456',        time:'08:30:11', ip:'192.168.1.10' },
  { user:'system', action:'alert_generated',target:'GJ01AB1234 · CAM04',time:'10:32:04', ip:'system'       },
  { user:'admin', action:'export_evidence', target:'Case #2024-003',    time:'11:15:01', ip:'192.168.1.10' },
];
```

---

## PART 4: PERFORMANCE & RESPONSIVE FIXES

### 4.1 — Tablet Layout (900px–1200px)

```css
@media (max-width:1100px) {
  /* Investigation page — stack timeline + map */
  #page-investigation .grid-2 {
    grid-template-columns: 1fr !important;
  }
  /* Camera grid — 2x2 on tablet */
  #cam-grid {
    grid-template-columns: repeat(2,1fr) !important;
  }
  /* Evidence grid — 3 columns */
  #evidence-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
```

### 4.2 — Mobile Stats (below 480px)

```css
@media (max-width:480px) {
  .stat-grid { grid-template-columns: repeat(2,1fr) !important; }
  .stat-value { font-size:20px !important; }
  .stat-delta { display:none; }
  .page { padding: 12px !important; }
  table th:nth-child(n+4),
  table td:nth-child(n+4) { display:none; } /* Hide extra columns on mobile */
}
```

### 4.3 — Chart Responsiveness Fix

```javascript
// Chart.js responsive fix — container se height lene ki bajaye explicit height do
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Resize observer add karo
const resizeObserver = new ResizeObserver(() => {
  Object.values(Chart.instances).forEach(chart => chart.resize());
});
resizeObserver.observe(document.getElementById('content'));
```

---

## PART 5: DEMO REALISM IMPROVEMENTS

### 5.1 — Realistic Timestamps (current time se relative)

```javascript
function getRelativeTime(minutesAgo) {
  const d = new Date(Date.now() - minutesAgo * 60000);
  return d.toTimeString().slice(0,8);
}

// Alert times ko dynamic banao
ALERT_DATA.forEach((a, i) => {
  a.time = getRelativeTime(i * 12 + 5);
});
```

### 5.2 — Live Counter Smooth Animation

```javascript
function animateCounter(id, target, duration = 1500) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    el.textContent = Math.floor(start + (target - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// On page load:
animateCounter('stat-vehicles', 2847);
animateCounter('stat-plates', 1924);
```

### 5.3 — SIH Demo Mode Button

Dashboard pe ek special button add karo:
```html
<button class="btn btn-ghost btn-sm" style="border-color:var(--orange);color:var(--orange)"
  onclick="startDemoMode()">▶ Demo Mode</button>
```

```javascript
function startDemoMode() {
  showToast('Demo mode started — simulating live detections', 'info');

  // Simulate a watchlist match after 5 seconds
  setTimeout(() => {
    showToast('🚨 ALERT: GJ01AB1234 detected on CAM04', 'error');
    document.getElementById('stat-alerts').textContent = '4';
    document.getElementById('stat-alerts').style.animation = 'badge-pulse 0.5s ease 3';

    const alertList = document.getElementById('live-alerts-list');
    const newAlert = document.createElement('div');
    newAlert.className = 'alert-card new-alert';
    newAlert.innerHTML = `
      <div>
        <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${timeNow()} · CAM04</div>
        <div class="plate" style="font-size:12px">GJ01AB1234</div>
        <div style="font-size:11px;color:var(--red);margin-top:3px;font-weight:600">⚠ ROBBERY SUSPECT VEHICLE</div>
      </div>
      <div style="margin-left:auto">
        <span class="badge badge-red">CRITICAL</span>
      </div>
    `;
    alertList.insertBefore(newAlert, alertList.firstChild);
  }, 5000);

  // Simulate investigation result after 10 seconds
  setTimeout(() => {
    document.getElementById('search-plate').value = 'GJ01AB1234';
    navigate('investigation', null);
    setTimeout(() => runSearch(), 500);
  }, 10000);
}
```

---

## PART 6: INIT ORDER FIX

**Page load sequence sahi karo — maps tabhi initialize hon jab page visible ho:**

```javascript
// navigate() function mein add karo:
function navigate(page, el) {
  // ... existing code ...

  // Page-specific init (ONLY when page becomes visible)
  const initMap = {
    'investigation': initInvestigationMap,
    'journey':       () => { initJourneyMap(); initJourney(); },
    'cameras':       initCamerasMap,
  };
  if (initMap[page]) setTimeout(initMap[page], 50); // Small delay for DOM to render
}
```

---

## SUMMARY — Kya kya karna hai (priority order):

### Priority 1 — Demo Breaking Issues
1. ✅ Real Leaflet map add karo (investigation + journey + cameras)
2. ✅ Camera coordinates add karo CAMERAS array mein
3. ✅ B&W → Color icon transitions fix karo (stat cards + nav items)

### Priority 2 — Competitor Beat Karne wale Features
4. ✅ Cinematic Journey Replay (animated vehicle icon on real map)
5. ✅ Demo Mode button (auto-plays the full scenario for judges)
6. ✅ MTTD/MTTR/Accuracy bar on dashboard

### Priority 3 — Polish
7. ✅ Live bounding box simulation on camera feeds
8. ✅ Smooth counter animation on page load
9. ✅ CMD+K global search shortcut
10. ✅ Tablet/mobile responsive fixes
11. ✅ Audit Log page
12. ✅ Speed anomaly alert type

---

## FINAL INSTRUCTIONS FOR ANTIGRAVITY:

1. Open `index.html` (the single file from the previous build)
2. Add Leaflet CDN links in `<head>`
3. Replace all CSS map placeholder divs with real Leaflet containers
4. Add camera lat/lng to CAMERAS array
5. Implement all JavaScript functions above (add after existing JS)
6. Add all CSS fixes in `<style>` block
7. Fix `navigate()` function to init maps on page change
8. Test all 9 pages work without overlap or broken layouts
9. Ensure mobile hamburger menu works correctly
10. Add Demo Mode button on dashboard

**GOAL:** When judge clicks "Demo Mode" button, the system automatically:
- Shows alert for GJ01AB1234
- Jumps to investigation
- Runs search
- Shows 4 sightings on real Leaflet dark map
- Button to view Journey shows animated vehicle driving across Ahmedabad on real map

Yeh sab karo aur ek single updated `index.html` produce karo.
