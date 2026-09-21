with open("com/files/index.html", "r", encoding="utf-8") as f:
    html = f.read()

evidence_engine_js = """
// ═════════════════════════════════════════════════════════════════════
// COMPREHENSIVE FORENSIC EVIDENCE VAULT ENGINE
// ═════════════════════════════════════════════════════════════════════

const EVIDENCE_DATA = [
  {
    id: "EV-2026-001",
    caseId: "CASE-2026-GJ-4401",
    plate: "GJ01AB1234",
    camId: "CAM04",
    camName: "SG Highway Toll Plaza",
    location: "SG Highway Corridor, Ahmedabad",
    time: "2026-09-14 14:26:17.482 IST",
    confidence: 98.6,
    watchlist: true,
    verified: true,
    vehicle: "Hyundai Creta / White Sedan · Gujarat RTO",
    speed: "64 km/h",
    lane: "Lane 02 (Northbound)",
    officer: "Insp. V. Sharma (Badge #SO-4082)",
    hash: "f3e6080cc720608a3b5d854700ebc2cec7e6783ab061c2c6088343917cf1d5d1",
    crop: "images/crop_gj01ab1234.jpg",
    raw: "images/cam_sg_highway_thumb.jpg",
    plateImg: "images/plate_gj01ab1234.png",
    certId: "CERT-65B-2026-004401"
  },
  {
    id: "EV-2026-002",
    caseId: "CASE-2026-UP-8821",
    plate: "UP32PQ6677",
    camId: "CAM02",
    camName: "Sardar Bridge Junction",
    location: "Sardar Patel Ring Road, Ellisbridge",
    time: "2026-09-14 14:21:05.119 IST",
    confidence: 97.4,
    watchlist: true,
    verified: true,
    vehicle: "Mahindra Scorpio / Black SUV · UP RTO",
    speed: "78 km/h",
    lane: "Lane 01 (Fast Track)",
    officer: "SI R. Meena (Badge #SO-5120)",
    hash: "9a21b44c8e102f90a12e87654321fedcba0987654321fedcba0987654321fedc",
    crop: "images/vehicle_scorpio_crop.jpg",
    raw: "images/cam_sardar_bridge_thumb.jpg",
    plateImg: "images/plate_up32pq6677.png",
    certId: "CERT-65B-2026-008821"
  },
  {
    id: "EV-2026-003",
    caseId: "CASE-2026-GJ-5678",
    plate: "GJ05CD5678",
    camId: "CAM01",
    camName: "Vastrapur Lake Approach",
    location: "AlphaOne Junction, Vastrapur",
    time: "2026-09-14 14:15:32.890 IST",
    confidence: 96.8,
    watchlist: false,
    verified: true,
    vehicle: "Maruti Suzuki Swift / Silver · Surat RTO",
    speed: "42 km/h",
    lane: "Lane 03 (Inner Ring)",
    officer: "Insp. V. Sharma (Badge #SO-4082)",
    hash: "7d44e31a89bc21e045f9102837465abcde1234567890abcdef1234567890abcd",
    crop: "images/crop_gj05cd5678.jpg",
    raw: "images/cam_vastrapur_thumb.jpg",
    plateImg: "images/plate_gj05cd5678.png",
    certId: "CERT-65B-2026-005678"
  },
  {
    id: "EV-2026-004",
    caseId: "CASE-2026-DL-9042",
    plate: "DL10XY9090",
    camId: "CAM05",
    camName: "MG Road Junction",
    location: "Central Business Corridor, Ahmedabad",
    time: "2026-09-14 14:08:44.215 IST",
    confidence: 99.1,
    watchlist: false,
    verified: true,
    vehicle: "Toyota Fortuner / Pearl White SUV · Delhi RTO",
    speed: "55 km/h",
    lane: "Lane 02 (Main Flyover)",
    officer: "Insp. D. Patel (Badge #SO-3091)",
    hash: "4e9102837465abcd7d44e31a89bc21e045f9de1234567890abcdef1234567890",
    crop: "images/crop_dl10xy9090.jpg",
    raw: "images/cam_mg_road_thumb.jpg",
    plateImg: "images/plate_dl10xy9090.png",
    certId: "CERT-65B-2026-009042"
  },
  {
    id: "EV-2026-005",
    caseId: "CASE-2026-RJ-3456",
    plate: "RJ14GH3456",
    camId: "CAM12",
    camName: "GIFT City Gate Entry",
    location: "GIFT City Access Highway, Gandhinagar",
    time: "2026-09-14 13:58:19.740 IST",
    confidence: 98.2,
    watchlist: true,
    verified: true,
    vehicle: "Honda City / Silver Sedan · Jaipur RTO",
    speed: "50 km/h",
    lane: "Lane 01 (Security Checkpoint)",
    officer: "SI R. Meena (Badge #SO-5120)",
    hash: "c2cec7e6783ab061c2c6088343917cf1d5d1f3e6080cc720608a3b5d854700eb",
    crop: "images/crop_rj14gh3456.jpg",
    raw: "images/cam_gift_city_thumb.jpg",
    plateImg: "images/plate_rj14gh3456.png",
    certId: "CERT-65B-2026-003456"
  },
  {
    id: "EV-2026-006",
    caseId: "CASE-2026-GJ-7788",
    plate: "GJ07SB7788",
    camId: "CAM07",
    camName: "Sabarmati Riverfront Promenade",
    location: "East Bank Riverside Corridor",
    time: "2026-09-14 13:42:01.332 IST",
    confidence: 97.8,
    watchlist: false,
    verified: true,
    vehicle: "Tata Nexon / Blue Compact SUV · Gujarat RTO",
    speed: "38 km/h",
    lane: "Lane 01 (Promenade Bypass)",
    officer: "Insp. V. Sharma (Badge #SO-4082)",
    hash: "3b5d854700ebc2cec7e6783ab061c2c6088343917cf1d5d1f3e6080cc720608a",
    crop: "images/cam07_sabarmati_feed.jpg",
    raw: "images/cam_sabarmati_thumb.jpg",
    plateImg: "images/plate_gj01ab1234.png",
    certId: "CERT-65B-2026-007788"
  },
  {
    id: "EV-2026-007",
    caseId: "CASE-2026-GJ-1890",
    plate: "GJ18IJ7890",
    camId: "CAM09",
    camName: "GNLU Gate Outer Corridor",
    location: "Knowledge Corridor, Gandhinagar",
    time: "2026-09-14 13:30:11.905 IST",
    confidence: 96.5,
    watchlist: false,
    verified: true,
    vehicle: "Hyundai Venue / Grey SUV · Gandhinagar RTO",
    speed: "45 km/h",
    lane: "Lane 02 (Outer Ring)",
    officer: "Insp. D. Patel (Badge #SO-3091)",
    hash: "1234567890abcdef1234567890abcd7d44e31a89bc21e045f9102837465abcde",
    crop: "images/evidence_gnlu_large.jpg",
    raw: "images/cam_gnlu_gate_thumb.jpg",
    plateImg: "images/plate_gj05cd5678.png",
    certId: "CERT-65B-2026-001890"
  },
  {
    id: "EV-2026-008",
    caseId: "CASE-2026-MH-9012",
    plate: "MH12EF9012",
    camId: "CAM04",
    camName: "SG Highway Toll Plaza",
    location: "SG Highway Intercity Entry",
    time: "2026-09-14 13:14:50.418 IST",
    confidence: 98.9,
    watchlist: true,
    verified: true,
    vehicle: "Mahindra Thar / Red 4x4 · Pune RTO",
    speed: "72 km/h",
    lane: "Lane 03 (Expressway Ingress)",
    officer: "Insp. V. Sharma (Badge #SO-4082)",
    hash: "bc21e045f9102837465abcde1234567890abcdef1234567890abcd7d44e31a89",
    crop: "images/hit_scorpio_clean.jpg",
    raw: "images/cam_sg_highway_thumb.jpg",
    plateImg: "images/plate_rj14gh3456.png",
    certId: "CERT-65B-2026-009012"
  },
  {
    id: "EV-2026-009",
    caseId: "CASE-2026-GJ-2233",
    plate: "GJ01XY9988",
    camId: "CAM01",
    camName: "Vastrapur Lake Approach",
    location: "Vastrapur Central Ring, Ahmedabad",
    time: "2026-09-14 12:55:03.210 IST",
    confidence: 97.1,
    watchlist: true,
    verified: true,
    vehicle: "Kia Seltos / Gravity Grey SUV · Ahmedabad RTO",
    speed: "48 km/h",
    lane: "Lane 01 (Lake Perimeter)",
    officer: "SI R. Meena (Badge #SO-5120)",
    hash: "e5e6e8e58f2be4c5e39a3f2b48e64c519d0e2e9c1c5b8e90a2b25b6224ec7a53",
    crop: "images/crop_gj01ab1234.jpg",
    raw: "images/cam_vastrapur_thumb.jpg",
    plateImg: "images/plate_gj01ab1234.png",
    certId: "CERT-65B-2026-002233"
  },
  {
    id: "EV-2026-010",
    caseId: "CASE-2026-KA-4411",
    plate: "KA03MN7890",
    camId: "CAM05",
    camName: "MG Road Junction",
    location: "MG Road Commercial Corridor",
    time: "2026-09-14 12:38:22.615 IST",
    confidence: 96.0,
    watchlist: false,
    verified: true,
    vehicle: "Skoda Kushaq / Tornado Red SUV · Bangalore RTO",
    speed: "35 km/h",
    lane: "Lane 02 (Junction Left)",
    officer: "Insp. D. Patel (Badge #SO-3091)",
    hash: "8e64c519d0e2e9c1c5b8e90a2b25b6224ec7a53e5e6e8e58f2be4c5e39a3f2b4",
    crop: "images/hit_swift_clean.jpg",
    raw: "images/cam_mg_road_thumb.jpg",
    plateImg: "images/plate_dl10xy9090.png",
    certId: "CERT-65B-2026-004411"
  },
  {
    id: "EV-2026-011",
    caseId: "CASE-2026-GJ-6610",
    plate: "GJ06GH7788",
    camId: "CAM12",
    camName: "GIFT City Gate Entry",
    location: "GIFT Boulevard Checkpoint",
    time: "2026-09-14 12:12:47.884 IST",
    confidence: 99.4,
    watchlist: false,
    verified: true,
    vehicle: "Volkswagen Virtus / Wild Cherry Red Sedan",
    speed: "58 km/h",
    lane: "Lane 02 (Visitor Gate)",
    officer: "Insp. V. Sharma (Badge #SO-4082)",
    hash: "d0e2e9c1c5b8e90a2b25b6224ec7a53e5e6e8e58f2be4c5e39a3f2b48e64c519",
    crop: "images/crop_rj14gh3456.jpg",
    raw: "images/cam_gift_city_thumb.jpg",
    plateImg: "images/plate_rj14gh3456.png",
    certId: "CERT-65B-2026-006610"
  },
  {
    id: "EV-2026-012",
    caseId: "CASE-2026-RJ-9900",
    plate: "RJ02CD9876",
    camId: "CAM02",
    camName: "Sardar Bridge Junction",
    location: "Sabarmati East Flank Bypass",
    time: "2026-09-14 11:45:10.102 IST",
    confidence: 95.9,
    watchlist: false,
    verified: true,
    vehicle: "Mahindra Bolero / White Utility · Alwar RTO",
    speed: "62 km/h",
    lane: "Lane 03 (Commercial Track)",
    officer: "SI R. Meena (Badge #SO-5120)",
    hash: "a53e5e6e8e58f2be4c5e39a3f2b48e64c519d0e2e9c1c5b8e90a2b25b6224ec7",
    crop: "images/vehicle_scorpio_crop.jpg",
    raw: "images/cam_sardar_bridge_thumb.jpg",
    plateImg: "images/plate_up32pq6677.png",
    certId: "CERT-65B-2026-009900"
  }
];

let currentEvidenceSearch = '';
let currentEvidenceCam = 'all';
let currentEvidenceTag = 'all';
let currentEvidenceSort = 'newest';
let currentEvidenceView = 'grid';
let selectedEvidenceIds = new Set();
let currentInspectedEvidence = EVIDENCE_DATA[0];

function getFilteredEvidence() {
  let list = [...EVIDENCE_DATA];

  // Tag filter
  if (currentEvidenceTag === 'verified') {
    list = list.filter(e => e.verified);
  } else if (currentEvidenceTag === 'watchlist') {
    list = list.filter(e => e.watchlist);
  } else if (currentEvidenceTag === 'highconf') {
    list = list.filter(e => e.confidence >= 97.0);
  }

  // Camera filter
  if (currentEvidenceCam !== 'all') {
    list = list.filter(e => e.camId === currentEvidenceCam);
  }

  // Keyword search
  if (currentEvidenceSearch.trim()) {
    const q = currentEvidenceSearch.trim().toLowerCase();
    list = list.filter(e =>
      e.plate.toLowerCase().includes(q) ||
      e.caseId.toLowerCase().includes(q) ||
      e.camName.toLowerCase().includes(q) ||
      e.camId.toLowerCase().includes(q) ||
      e.vehicle.toLowerCase().includes(q) ||
      e.hash.toLowerCase().includes(q)
    );
  }

  // Sort
  list.sort((a, b) => {
    if (currentEvidenceSort === 'newest') return b.time.localeCompare(a.time);
    if (currentEvidenceSort === 'oldest') return a.time.localeCompare(b.time);
    if (currentEvidenceSort === 'confidence') return b.confidence - a.confidence;
    if (currentEvidenceSort === 'plate') return a.plate.localeCompare(b.plate);
    return 0;
  });

  return list;
}

function renderEvidence() {
  const list = getFilteredEvidence();

  // Update KPI counters
  const totalKpi = document.getElementById('evidence-kpi-total');
  const alertKpi = document.getElementById('evidence-kpi-alerts');
  if (totalKpi) totalKpi.textContent = '1,284';
  if (alertKpi) alertKpi.textContent = EVIDENCE_DATA.filter(e => e.watchlist).length;

  // Update selection count badge
  const selCount = document.getElementById('evidence-selected-count');
  const batchBtn = document.getElementById('btn-batch-export');
  if (selCount) selCount.textContent = `${selectedEvidenceIds.size} selected`;
  if (batchBtn) batchBtn.style.display = selectedEvidenceIds.size > 0 ? 'inline-flex' : 'none';

  // Render Grid View
  const grid = document.getElementById('evidence-grid');
  if (grid) {
    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--text-3);font-family:var(--font-mono);border:1px dashed var(--border);border-radius:var(--r)">
          <div style="font-size:24px;margin-bottom:8px">🔍</div>
          <div style="font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:4px">No forensic evidence found</div>
          <div style="font-size:11px">Adjust search query or active filter tags.</div>
        </div>
      `;
    } else {
      grid.innerHTML = list.map(e => {
        const isSelected = selectedEvidenceIds.has(e.id);
        const shortHash = e.hash.slice(0, 10) + '...';
        return `
          <div class="evidence-card ${isSelected ? 'selected' : ''}" onclick="openEvidenceModalById('${e.id}')">
            <div class="evidence-img-container">
              <img src="${e.crop}" alt="${e.plate}" onerror="this.src='${e.raw}'" />
              <div class="evidence-hud-corner evidence-hud-tl"></div>
              <div class="evidence-hud-corner evidence-hud-tr"></div>
              <div class="evidence-hud-corner evidence-hud-bl"></div>
              <div class="evidence-hud-corner evidence-hud-br"></div>

              <!-- Top Overlay HUD -->
              <div style="position:absolute;top:6px;left:6px;display:flex;align-items:center;gap:6px;z-index:2">
                <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="toggleEvidenceSelect('${e.id}', event)" style="accent-color:var(--accent);cursor:pointer;width:14px;height:14px" title="Select for batch action" />
                <span class="badge badge-muted" style="font-size:9px;padding:2px 5px;background:rgba(8,12,20,0.85)">#${e.caseId.split('-').pop()}</span>
              </div>

              <div style="position:absolute;top:6px;right:6px;display:flex;gap:4px;z-index:2">
                ${e.watchlist ? `<span class="badge badge-red" style="font-size:9px;padding:2px 6px">ALERT</span>` : `<span class="badge badge-muted" style="font-size:9px;padding:2px 5px">CLEAN</span>`}
                <span class="badge badge-green" style="font-size:9px;padding:2px 5px">✓ SEC 65B</span>
              </div>

              <!-- Bottom Overlay HUD -->
              <div style="position:absolute;bottom:6px;left:6px;background:rgba(8,12,20,0.88);border:1px solid rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px;display:flex;align-items:center;gap:6px">
                <span class="plate" style="font-size:10px;padding:1px 5px">${e.plate}</span>
                <span style="font-size:9.5px;font-family:var(--font-mono);color:var(--accent);font-weight:600">${e.confidence.toFixed(1)}%</span>
              </div>
              <div style="position:absolute;bottom:6px;right:6px;background:rgba(8,12,20,0.88);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:var(--text-3)">
                ${e.camId}
              </div>
            </div>

            <div class="evidence-body">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
                <div>
                  <div style="font-size:11.5px;font-weight:700;color:var(--text-1);line-height:1.3">${e.camName}</div>
                  <div style="font-size:10px;color:var(--text-3);margin-top:2px">${e.vehicle}</div>
                </div>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-family:var(--font-mono);color:var(--text-3);margin-top:2px">
                <span>${e.time.split(' ')[1]} IST</span>
                <span style="color:var(--text-2)">${e.speed}</span>
              </div>

              <div class="evidence-hash" onclick="event.stopPropagation();copyHash('${e.hash}', 'Evidence SHA-256 Seal')">
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${shortHash}</span>
                <span style="color:var(--green);margin-left:4px;flex-shrink:0" title="Click to copy full SHA-256 hash">📋 Copy</span>
              </div>

              <div style="display:flex;gap:5px;margin-top:6px">
                <button class="btn btn-ghost btn-sm" style="flex:1;font-size:10.5px;padding:4px 6px;font-family:var(--font-mono)" onclick="event.stopPropagation();openEvidenceModalById('${e.id}')">
                  🔍 Inspect
                </button>
                <button class="btn btn-ghost btn-sm" style="font-size:10.5px;padding:4px 8px;font-family:var(--font-mono);color:var(--green)" onclick="event.stopPropagation();openSec65bCertModal('${e.id}')" title="Generate Section 65B Certificate">
                  📜 65B
                </button>
                <button class="btn btn-ghost btn-sm" style="font-size:10.5px;padding:4px 8px;font-family:var(--font-mono)" onclick="event.stopPropagation();downloadSingleEvidenceZip('${e.id}')" title="Download ZIP Archive">
                  ↓
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render Table View
  const tbody = document.getElementById('evidence-table-body');
  if (tbody) {
    tbody.innerHTML = list.map(e => {
      const isSelected = selectedEvidenceIds.has(e.id);
      return `
        <tr class="${isSelected ? 'selected' : ''}" style="cursor:pointer" onclick="openEvidenceModalById('${e.id}')">
          <td onclick="event.stopPropagation()">
            <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="toggleEvidenceSelect('${e.id}', event)" style="accent-color:var(--accent);cursor:pointer" />
          </td>
          <td>
            <span class="mono" style="font-weight:700;color:var(--accent)">${e.caseId}</span>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="plate" style="font-size:10px;padding:1px 6px">${e.plate}</span>
              <span style="font-size:11px;color:var(--text-2)">${e.vehicle.split('·')[0]}</span>
            </div>
          </td>
          <td>
            <span style="font-size:11px;font-weight:600;color:var(--text-1)">${e.camId}</span> · <span style="font-size:10.5px;color:var(--text-3)">${e.camName}</span>
          </td>
          <td class="mono" style="font-size:10.5px;color:var(--text-2)">
            ${e.time}
          </td>
          <td>
            <span class="badge ${e.confidence >= 98 ? 'badge-green' : 'badge-blue'}" style="font-size:9.5px">${e.confidence.toFixed(1)}%</span>
          </td>
          <td class="mono" style="font-size:10px;color:var(--green)">
            <span style="cursor:pointer" onclick="event.stopPropagation();copyHash('${e.hash}', 'SHA-256 Seal')">${e.hash.slice(0, 16)}... 📋</span>
          </td>
          <td>
            ${e.watchlist ? `<span class="badge badge-red">WATCHLIST HIT</span>` : `<span class="badge badge-green">✓ VERIFIED</span>`}
          </td>
          <td style="text-align:right" onclick="event.stopPropagation()">
            <div style="display:inline-flex;gap:4px">
              <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:3px 8px" onclick="openEvidenceModalById('${e.id}')">Inspect</button>
              <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:3px 8px;color:var(--green)" onclick="openSec65bCertModal('${e.id}')">65B</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function setEvidenceView(mode) {
  currentEvidenceView = mode;
  const btnGrid = document.getElementById('btn-view-grid');
  const btnTable = document.getElementById('btn-view-table');
  const gridEl = document.getElementById('evidence-grid');
  const tableEl = document.getElementById('evidence-table-container');

  if (mode === 'grid') {
    if (btnGrid) btnGrid.classList.add('active');
    if (btnTable) btnTable.classList.remove('active');
    if (gridEl) gridEl.style.display = 'grid';
    if (tableEl) tableEl.style.display = 'none';
  } else {
    if (btnGrid) btnGrid.classList.remove('active');
    if (btnTable) btnTable.classList.add('active');
    if (gridEl) gridEl.style.display = 'none';
    if (tableEl) tableEl.style.display = 'block';
  }
}

function setEvidenceTagFilter(tag) {
  currentEvidenceTag = tag;
  document.querySelectorAll('.evidence-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById('pill-filter-' + tag);
  if (activePill) activePill.classList.add('active');
  renderEvidence();
}

function onEvidenceSearchInput() {
  const inp = document.getElementById('evidence-search-input');
  currentEvidenceSearch = inp ? inp.value : '';
  renderEvidence();
}

function onEvidenceFilterChange() {
  const cam = document.getElementById('evidence-cam-filter');
  const sort = document.getElementById('evidence-sort-select');
  if (cam) currentEvidenceCam = cam.value;
  if (sort) currentEvidenceSort = sort.value;
  renderEvidence();
}

function toggleEvidenceSelect(id, event) {
  if (event) event.stopPropagation();
  if (selectedEvidenceIds.has(id)) {
    selectedEvidenceIds.delete(id);
  } else {
    selectedEvidenceIds.add(id);
  }
  renderEvidence();
}

function toggleSelectAllEvidence(checked) {
  const visible = getFilteredEvidence();
  if (checked) {
    visible.forEach(e => selectedEvidenceIds.add(e.id));
  } else {
    selectedEvidenceIds.clear();
  }
  renderEvidence();
}

function verifyAllEvidenceHashes() {
  showToast('Auditing SHA-256 cryptographic signatures against ledger...', 'info');
  setTimeout(() => {
    showToast('✓ 16/16 Evidence Packages 100% Intact · Zero Tampering Detected', 'success');
  }, 900);
}

function openEvidenceModalById(id) {
  const ev = EVIDENCE_DATA.find(e => e.id === id) || EVIDENCE_DATA[0];
  currentInspectedEvidence = ev;
  openEvidenceModal(ev.plate, `${ev.camId} — ${ev.camName}`, ev.time, `${ev.confidence.toFixed(1)}%`, ev.id);
}

function openSec65bCertModal(id) {
  const ev = (id ? EVIDENCE_DATA.find(e => e.id === id) : currentInspectedEvidence) || currentInspectedEvidence;
  if (!ev) return;

  const refEl = document.getElementById('cert-ref-no');
  const caseEl = document.getElementById('cert-case-id');
  const plateEl = document.getElementById('cert-plate');
  const vehEl = document.getElementById('cert-vehicle');
  const nodeEl = document.getElementById('cert-node');
  const coordsEl = document.getElementById('cert-coords');
  const timeEl = document.getElementById('cert-timestamp');
  const hashEl = document.getElementById('cert-hash');
  const offEl = document.getElementById('cert-officer');
  const dateEl = document.getElementById('cert-date');

  if (refEl) refEl.textContent = ev.certId;
  if (caseEl) caseEl.textContent = `#${ev.caseId}`;
  if (plateEl) plateEl.textContent = ev.plate;
  if (vehEl) vehEl.textContent = ev.vehicle;
  if (nodeEl) nodeEl.textContent = `Node ${ev.camId} — ${ev.camName} (${ev.lane})`;
  if (coordsEl) coordsEl.textContent = ev.location;
  if (timeEl) timeEl.textContent = ev.time;
  if (hashEl) hashEl.textContent = ev.hash;
  if (offEl) offEl.textContent = ev.officer;
  if (dateEl) dateEl.textContent = new Date().toLocaleString() + ' IST';

  openModal('modal-sec65b-cert');
}

function openSec65bFromEvidenceModal() {
  closeModal('modal-evidence');
  setTimeout(() => {
    openSec65bCertModal(currentInspectedEvidence.id);
  }, 120);
}

function printSec65bCert() {
  window.print();
}

function copyCertText() {
  const container = document.getElementById('sec65b-cert-printable');
  if (container) {
    navigator.clipboard.writeText(container.innerText).then(() => {
      showToast('Section 65B Certificate text copied to clipboard', 'success');
    });
  }
}

async function batchExportEvidenceZip() {
  if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
    showToast('Export library loading, try again in a moment', 'info');
    return;
  }

  const itemsToExport = selectedEvidenceIds.size > 0 
    ? EVIDENCE_DATA.filter(e => selectedEvidenceIds.has(e.id))
    : getFilteredEvidence();

  if (itemsToExport.length === 0) {
    showToast('No evidence records selected for export', 'info');
    return;
  }

  showToast(`Generating forensic export bundle for ${itemsToExport.length} packages...`, 'info');

  const zip = new JSZip();
  const root = zip.folder(`SENTRAX_EVIDENCE_BUNDLE_${Date.now()}`);

  const manifest = {
    exported_at: new Date().toISOString(),
    certifying_authority: "Gujarat Police Digital Forensics & Surveillance Cell",
    legal_standard: "Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam 2023",
    total_packages: itemsToExport.length,
    packages: itemsToExport.map(e => ({
      evidence_id: e.id,
      case_reference: e.caseId,
      vehicle_plate: e.plate,
      camera_node: e.camId,
      camera_name: e.camName,
      capture_timestamp: e.time,
      ai_anpr_confidence: e.confidence,
      cryptographic_sha256_seal: e.hash,
      chain_of_custody_officer: e.officer
    }))
  };

  root.file("FORENSIC_CHAIN_OF_CUSTODY_MANIFEST.json", JSON.stringify(manifest, null, 2));

  // Add individual package folders with legal cert text
  itemsToExport.forEach(e => {
    const pkgFolder = root.folder(`${e.caseId}_${e.plate}`);
    const certText = `
================================================================================
GOVERNMENT OF GUJARAT · POLICE FORENSICS DIVISION
CERTIFICATE UNDER SECTION 65B(4) INDIAN EVIDENCE ACT, 1872
================================================================================
Certificate ID: ${e.certId}
Case Reference: #${e.caseId}
Target Plate: ${e.plate}
Vehicle: ${e.vehicle}
Capture Location: ${e.location} (Node ${e.camId})
Capture Timestamp: ${e.time}
Speed / Lane: ${e.speed} / ${e.lane}
SHA-256 Digital Seal: ${e.hash}
Certifying Officer: ${e.officer}
Legal Validation: Valid pursuant to Sec 65B(4) IEA & Sec 63 BSA 2023.
================================================================================
`;
    pkgFolder.file("SECTION_65B_LEGAL_CERTIFICATE.txt", certText.trim());
  });

  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `SENTRAX_FORENSIC_EVIDENCE_BUNDLE_${Date.now()}.zip`);
    showToast(`Successfully exported ${itemsToExport.length} evidence packages (.ZIP)`, 'success');
  } catch (err) {
    showToast('Failed to generate ZIP: ' + err.message, 'error');
  }
}

function downloadSingleEvidenceZip(id) {
  selectedEvidenceIds.clear();
  selectedEvidenceIds.add(id);
  batchExportEvidenceZip();
}

function exportCurrentEvidencePackage() {
  if (currentInspectedEvidence) {
    downloadSingleEvidenceZip(currentInspectedEvidence.id);
  }
}
"""

# Replace old renderEvidence function
old_render_evidence = """function renderEvidence(){
  const grid=document.getElementById('evidence-grid');
  if(!grid)return;
  const items=Array.from({length:12},(_,i)=>{
    const p=PLATES[i%PLATES.length];
    const cam=CAMERAS[i%CAMERAS.length];
    const conf=parseFloat(randomConf());
    const hash='a3f9e2b1c847...'+Math.random().toString(16).slice(2,10);
    const hrs=i*2;
    return `
      <div class="evidence-card" onclick="openEvidenceModal('${p.plate}', '${cam.id} — ${cam.name}', '2026-09-14 10:${String(30-i).padStart(2,'0')}:04 UTC', '${conf.toFixed(1)}%')">
        <div class="evidence-img">
          <div class="cam-dots" style="opacity:0.4"></div>
          <div style="z-index:1;text-align:center">
            <div class="plate" style="font-size:11px;margin-bottom:6px">${p.plate}</div>
            <div class="evidence-img-text">${cam.id}</div>
          </div>
          ${p.watchlist?`<div style="position:absolute;top:8px;right:8px"><span class="badge badge-red">ALERT</span></div>`:''}
          <div style="position:absolute;top:8px;left:8px"><span class="badge badge-green">✓ VERIFIED</span></div>
        </div>
        <div class="evidence-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:11px;font-weight:600;color:var(--text-primary)">${cam.name}</span>
            ${confBadge(conf)}
          </div>
          <div class="mono" style="color:var(--text-muted);font-size:10px">10:${String(30-i).padStart(2,'0')}:04 UTC</div>
          <div class="evidence-hash">SHA-256: ${hash}</div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="event.stopPropagation();openEvidenceModal('${p.plate}', '${cam.id} — ${cam.name}', '2026-09-14 10:${String(30-i).padStart(2,'0')}:04 UTC', '${conf.toFixed(1)}%')">View</button>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();showToast('Evidence exported','success')">↓</button>
          </div>
        </div>
      </div>
    `;
  });
  grid.innerHTML=items.join('');
}"""

if old_render_evidence in html:
    html = html.replace(old_render_evidence, evidence_engine_js)
    print("Replaced renderEvidence successfully!")
else:
    # Find renderEvidence start and end
    start_idx = html.find("function renderEvidence(){")
    end_idx = html.find("function renderCameras(){", start_idx)
    if start_idx != -1 and end_idx != -1:
        html = html[:start_idx] + evidence_engine_js + "\n\n" + html[end_idx:]
        print("Replaced renderEvidence by indices successfully!")
    else:
        print("Could not find renderEvidence function in index.html!")

with open("com/files/index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Updated com/files/index.html with full evidence engine!")
