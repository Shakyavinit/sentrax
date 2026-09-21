with open("com/files/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update #page-evidence markup
page_evidence_old_start = '<!-- ═════════════════ EVIDENCE ═════════════════ -->'
page_evidence_old_end = '<!-- ═════════════════ CAMERAS ═════════════════ -->'

idx_p_start = html.find(page_evidence_old_start)
idx_p_end = html.find(page_evidence_old_end)

if idx_p_start == -1 or idx_p_end == -1:
    print("Could not locate #page-evidence boundaries!")
    exit(1)

new_page_evidence = """<!-- ═════════════════ EVIDENCE VAULT ═════════════════ -->
      <div class="page" id="page-evidence">
        <div class="page-header">
          <div>
            <div class="page-title">Evidence Vault</div>
            <div class="page-sub">Tamper-evident digital forensics archive · Section 65B Indian Evidence Act certified</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-ghost btn-sm" onclick="verifyAllEvidenceHashes()">
              <i data-lucide="shield-check" style="width:13px;height:13px;color:var(--green)"></i> Verify All Hashes
            </button>
            <button class="btn btn-primary btn-sm" onclick="batchExportEvidenceZip()">
              <i data-lucide="download" style="width:13px;height:13px"></i> Bulk Export (.ZIP)
            </button>
          </div>
        </div>

        <!-- KPI Metrics Strip -->
        <div class="stat-grid" style="margin-bottom:18px">
          <div class="stat-card" style="padding:12px 16px">
            <div class="stat-icon"><i data-lucide="archive"></i></div>
            <div class="stat-value" id="evidence-kpi-total">1,284</div>
            <div class="stat-label">Total Forensic Assets</div>
            <div class="stat-delta up">✓ 16 Live In View</div>
          </div>
          <div class="stat-card" style="padding:12px 16px">
            <div class="stat-icon" style="color:var(--green)"><i data-lucide="lock"></i></div>
            <div class="stat-value" style="color:var(--green)">100<span style="font-size:16px;color:var(--text-3)">%</span></div>
            <div class="stat-label">Cryptographic Integrity</div>
            <div class="stat-delta up">✓ SHA-256 Validated</div>
          </div>
          <div class="stat-card" style="padding:12px 16px">
            <div class="stat-icon" style="color:var(--accent)"><i data-lucide="file-check-2"></i></div>
            <div class="stat-value" style="font-size:18px;font-family:var(--font-mono);letter-spacing:0.04em">SEC 65B</div>
            <div class="stat-label">Evidence Certification</div>
            <div class="stat-delta up">✓ BSA 2023 Sec 63 Valid</div>
          </div>
          <div class="stat-card" style="padding:12px 16px">
            <div class="stat-icon" style="color:var(--red)"><i data-lucide="shield-alert"></i></div>
            <div class="stat-value" id="evidence-kpi-alerts" style="color:var(--red)">5</div>
            <div class="stat-label">Watchlist Matches</div>
            <div class="stat-delta warn">⚠ Priority Intercepts</div>
          </div>
        </div>

        <!-- Advanced Filter & Search Toolbar -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:space-between">
            <div style="display:flex;gap:8px;align-items:center;flex:1;min-width:260px">
              <div style="position:relative;flex:1">
                <i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--text-3)"></i>
                <input class="input" id="evidence-search-input" placeholder="Search by Plate, Case ID, Camera, Hash, Vehicle..." style="padding-left:32px;height:34px;width:100%" oninput="onEvidenceSearchInput()" />
              </div>
              <select class="input select-input" id="evidence-cam-filter" style="width:160px;height:34px" onchange="onEvidenceFilterChange()">
                <option value="all">All Camera Nodes</option>
                <option value="CAM01">CAM01 — Vastrapur Lake</option>
                <option value="CAM02">CAM02 — Sardar Bridge</option>
                <option value="CAM04">CAM04 — SG Highway Toll</option>
                <option value="CAM05">CAM05 — MG Road Junction</option>
                <option value="CAM07">CAM07 — Sabarmati Riverfront</option>
                <option value="CAM09">CAM09 — GNLU Gate Outer</option>
                <option value="CAM12">CAM12 — GIFT City Entry</option>
              </select>
            </div>

            <!-- View Switcher & Sorter -->
            <div style="display:flex;gap:8px;align-items:center">
              <select class="input select-input" id="evidence-sort-select" style="width:140px;height:34px" onchange="onEvidenceFilterChange()">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="confidence">Highest Conf</option>
                <option value="plate">Plate (A–Z)</option>
              </select>

              <div style="display:inline-flex;border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
                <button class="evidence-view-btn active" id="btn-view-grid" onclick="setEvidenceView('grid')" title="Grid View">
                  <i data-lucide="layout-grid" style="width:13px;height:13px"></i> Grid
                </button>
                <button class="evidence-view-btn" id="btn-view-table" onclick="setEvidenceView('table')" title="Table View">
                  <i data-lucide="table" style="width:13px;height:13px"></i> Table
                </button>
              </div>
            </div>
          </div>

          <!-- Filter Pills & Batch Selection Strip -->
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-top:6px;border-top:1px solid var(--border-dim)">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <span style="font-size:11px;font-family:var(--font-mono);color:var(--text-3);margin-right:2px">Filter:</span>
              <button class="btn btn-ghost btn-sm evidence-pill active" id="pill-filter-all" onclick="setEvidenceTagFilter('all')">All Records</button>
              <button class="btn btn-ghost btn-sm evidence-pill" id="pill-filter-verified" onclick="setEvidenceTagFilter('verified')">✓ Verified Only</button>
              <button class="btn btn-ghost btn-sm evidence-pill" id="pill-filter-watchlist" onclick="setEvidenceTagFilter('watchlist')">⚠ Watchlist Alerts</button>
              <button class="btn btn-ghost btn-sm evidence-pill" id="pill-filter-highconf" onclick="setEvidenceTagFilter('highconf')">⭐ High Conf (>97%)</button>
            </div>

            <div style="display:flex;align-items:center;gap:10px;font-size:11px;font-family:var(--font-mono)">
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;color:var(--text-2)">
                <input type="checkbox" id="evidence-select-all" onchange="toggleSelectAllEvidence(this.checked)" style="accent-color:var(--accent);cursor:pointer"/>
                <span>Select All</span>
              </label>
              <span id="evidence-selected-count" style="color:var(--accent);font-weight:600">0 selected</span>
              <button class="btn btn-primary btn-sm" id="btn-batch-export" style="display:none;font-size:10.5px;padding:3px 10px" onclick="batchExportEvidenceZip()">
                ↓ Export Selected (.ZIP)
              </button>
            </div>
          </div>
        </div>

        <!-- Evidence Grid View -->
        <div id="evidence-grid" class="evidence-grid"></div>

        <!-- Evidence Table View -->
        <div id="evidence-table-container" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
          <div class="table-wrap">
            <table class="evidence-table">
              <thead>
                <tr>
                  <th style="width:36px"><input type="checkbox" onchange="toggleSelectAllEvidence(this.checked)" style="accent-color:var(--accent)"/></th>
                  <th>Case ID</th>
                  <th>Vehicle & Plate</th>
                  <th>Camera Node</th>
                  <th>Timestamp</th>
                  <th>AI Conf</th>
                  <th>Cryptographic SHA-256 Hash</th>
                  <th>Legal Status</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody id="evidence-table-body"></tbody>
            </table>
          </div>
        </div>
      </div>
      
      """

html = html[:idx_p_start] + new_page_evidence + html[idx_p_end:]

# 2. Update #modal-evidence images and add Section 65B Cert Modal
old_modal_start = '<div class="modal-backdrop" id="modal-evidence">'
old_modal_end = '<div class="modal-backdrop" id="modal-evidence-lightbox"'

idx_m_start = html.find(old_modal_start)
idx_m_end = html.find(old_modal_end)

if idx_m_start != -1 and idx_m_end != -1:
    upgraded_modal = """<div class="modal-backdrop" id="modal-evidence">
  <div class="modal" style="max-width:880px;border-color:var(--border-bright);box-shadow:0 24px 70px rgba(0,0,0,0.9);max-height:92vh;overflow-y:auto">
    <div class="modal-header" style="border-bottom:1px solid var(--border-dim);padding-bottom:12px;position:sticky;top:0;background:var(--elevated);z-index:10">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="color:var(--green);font-size:16px">🛡️</span>
        <div class="modal-title" id="evidence-modal-title" style="font-family:var(--font-mono);font-size:13px;letter-spacing:0.04em;font-weight:700">FORENSIC EVIDENCE PACKAGE — #CASE-2026-GJ-4401</div>
        <span class="badge badge-green" style="font-size:9px;padding:2px 6px">SEC 65B COMPLIANT</span>
      </div>
      <button class="modal-close" onclick="closeModal('modal-evidence')">✕</button>
    </div>

    <!-- Top Metadata Bar -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);padding:10px 14px;border-radius:var(--r);border:1px solid var(--border-dim);margin:14px 0 16px;flex-wrap:wrap;gap:10px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="plate" id="evidence-modal-plate" style="font-size:13px;font-weight:700">GJ01AB1234</div>
        <div>
          <div id="evidence-modal-loc" style="font-weight:600;color:var(--text-1);font-size:12px">SG Highway Toll Plaza · Node CAM04</div>
          <div id="evidence-modal-meta" style="font-size:10px;color:var(--text-3);font-family:var(--font-mono);margin-top:2px">2026-09-14 14:26:17 IST · <span style="color:var(--green);font-weight:600">98.6% AI Confidence</span></div>
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" onclick="openSec65bFromEvidenceModal()">🛡️ Sec 65B Cert</button>
        <button class="btn btn-primary btn-sm" onclick="exportCurrentEvidencePackage()">↓ Export ZIP</button>
      </div>
    </div>

    <!-- 3-Panel Multi-Resolution Inspection Grid (with real images) -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">
      <!-- 1. Raw CCTV Frame -->
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-family:var(--font-mono)">
          <span style="color:var(--text-1);font-weight:700">1. RAW CCTV FRAME</span>
          <span style="color:var(--text-3)">1920×1080</span>
        </div>
        <div style="position:relative;width:100%;height:110px;border-radius:4px;overflow:hidden;border:1px solid #1C2E42;background:#000;cursor:pointer" onclick="zoomEvidenceImage('RAW CCTV FRAME', document.getElementById('evidence-img-raw').src, 'Full Native 1920×1080 Node Feed')">
          <img id="evidence-img-raw" src="images/cam_sg_highway_thumb.jpg" style="width:100%;height:100%;object-fit:cover" />
          <div style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:var(--accent)" id="evidence-cam-badge">CAM04</div>
          <div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:#fff">🔍 Zoom</div>
        </div>
        <div style="font-size:10px;color:var(--text-3);font-family:var(--font-mono);background:var(--surface);padding:6px 8px;border-radius:var(--r);border:1px solid var(--border-dim)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>SHA-256:</span>
            <span style="color:var(--green);cursor:pointer" id="evidence-hash-raw" onclick="copyHash(this.dataset.hash || 'f3e6080cc720608a3b5d854700ebc2cec7e6783ab061c2c6088343917cf1d5d1', 'Raw Frame Hash')" title="Click to copy full hash">f3e6080c... 📋</span>
          </div>
        </div>
      </div>

      <!-- 2. Vehicle Crop (ROI) -->
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-family:var(--font-mono)">
          <span style="color:var(--text-1);font-weight:700">2. VEHICLE CROP (ROI)</span>
          <span style="color:var(--accent);font-weight:700">YOLOv8</span>
        </div>
        <div style="position:relative;width:100%;height:110px;border-radius:4px;overflow:hidden;border:1px solid #1C2E42;background:#000;cursor:pointer" onclick="zoomEvidenceImage('VEHICLE CROP (ROI)', document.getElementById('evidence-img-vehicle').src, 'YOLOv8 Bounding Box Inspection')">
          <img id="evidence-img-vehicle" src="images/crop_gj01ab1234.jpg" style="width:100%;height:100%;object-fit:cover" />
          <div style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:var(--green)" id="evidence-vehicle-conf">ROI: 98.6%</div>
          <div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:#fff">🔍 Zoom</div>
        </div>
        <div style="font-size:10px;color:var(--text-3);font-family:var(--font-mono);background:var(--surface);padding:6px 8px;border-radius:var(--r);border:1px solid var(--border-dim)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>ROI HASH:</span>
            <span style="color:var(--accent);cursor:pointer" id="evidence-hash-vehicle" onclick="copyHash(this.dataset.hash || '2b25b6224ec7a53e5e6e8e58f2be4c5e39a3f2b48e64c519d0e2e9c1c5b8e90a', 'Vehicle ROI Hash')" title="Click to copy full hash">2b25b622... 📋</span>
          </div>
        </div>
      </div>

      <!-- 3. License Plate Crop (OCR) -->
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-family:var(--font-mono)">
          <span style="color:var(--text-1);font-weight:700">3. PLATE CROP (OCR)</span>
          <span style="color:var(--amber);font-weight:700">LPRNet</span>
        </div>
        <div style="position:relative;width:100%;height:110px;border-radius:4px;overflow:hidden;border:1px solid #1C2E42;background:#06080F;display:flex;align-items:center;justify-content:center;padding:8px;cursor:pointer" onclick="zoomEvidenceImage('PLATE CROP (OCR)', document.getElementById('evidence-img-plate').src, 'LPRNet Optical Recognition')">
          <img id="evidence-img-plate" src="images/plate_gj01ab1234.png" style="max-width:100%;max-height:80px;object-fit:contain" />
          <div style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:var(--amber)" id="evidence-plate-ocr">GJ01AB1234</div>
          <div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.7);padding:2px 6px;border-radius:3px;font-size:9px;font-family:var(--font-mono);color:#fff">🔍 Zoom</div>
        </div>
        <div style="font-size:10px;color:var(--text-3);font-family:var(--font-mono);background:var(--surface);padding:6px 8px;border-radius:var(--r);border:1px solid var(--border-dim)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>OCR HASH:</span>
            <span style="color:var(--amber);cursor:pointer" id="evidence-hash-plate" onclick="copyHash(this.dataset.hash || '8f12c34a9b21d56e7f80123456789abcdef0123456789abcdef0123456789abc', 'Plate Crop Hash')" title="Click to copy full hash">8f12c34a... 📋</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Forensic Chain of Custody Table -->
    <div style="background:var(--surface);border:1px solid var(--border-dim);border-radius:var(--r);padding:12px;margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:var(--text-1);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <span>CHAIN OF CUSTODY & TECHNICAL RECORD</span>
        <span class="badge badge-green" style="font-size:9px">AUDIT LOG CERTIFIED</span>
      </div>
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        <tr style="border-bottom:1px solid var(--border-dim)"><td style="padding:6px 0;color:var(--text-3);width:160px">Camera Node ID:</td><td class="mono" style="color:var(--text-1)" id="evidence-table-node">CAM04 — SG Highway Toll Plaza</td></tr>
        <tr style="border-bottom:1px solid var(--border-dim)"><td style="padding:6px 0;color:var(--text-3)">Timestamp:</td><td class="mono" style="color:var(--text-1)" id="evidence-table-time">2026-09-14 14:26:17.482 IST</td></tr>
        <tr style="border-bottom:1px solid var(--border-dim)"><td style="padding:6px 0;color:var(--text-3)">Vehicle Classification:</td><td style="color:var(--text-1)" id="evidence-table-vehicle">Hyundai Creta / White Sedan · Gujarat RTO</td></tr>
        <tr style="border-bottom:1px solid var(--border-dim)"><td style="padding:6px 0;color:var(--text-3)">Speed & Corridor:</td><td class="mono" style="color:var(--text-1)" id="evidence-table-speed">64 km/h · Lane 02 (Northbound)</td></tr>
        <tr style="border-bottom:1px solid var(--border-dim)"><td style="padding:6px 0;color:var(--text-3)">Custody Officer:</td><td style="color:var(--text-1)" id="evidence-table-officer">Inspector V. Sharma (Badge #SO-4082)</td></tr>
        <tr><td style="padding:6px 0;color:var(--text-3)">Legal Compliance:</td><td><span class="badge badge-green">✓ SEC 65B INDIAN EVIDENCE ACT / SEC 63 BSA 2023 VALIDATED</span></td></tr>
      </table>
    </div>

    <!-- Modal Footer Actions -->
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:var(--text-3);font-family:var(--font-mono)">Digital seal verified against Master Forensic Ledger</span>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="closeModal('modal-evidence')">Close</button>
        <button class="btn btn-primary btn-sm" onclick="openSec65bFromEvidenceModal()">View Sec 65B Certificate ↗</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Section 65B Legal Certificate -->
<div class="modal-backdrop" id="modal-sec65b-cert" onclick="closeModal('modal-sec65b-cert')">
  <div class="modal" style="max-width:820px;width:95%;background:#080C14;border:1px solid #1C2E42;box-shadow:0 0 60px rgba(0,200,117,0.2);padding:24px;border-radius:12px;max-height:92vh;overflow-y:auto" onclick="event.stopPropagation()">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1C2E42;padding-bottom:12px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:22px">🏛️</span>
        <div>
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--text-1);letter-spacing:0.04em">CERTIFICATE UNDER SECTION 65B(4) INDIAN EVIDENCE ACT, 1872</div>
          <div style="font-size:10.5px;color:var(--text-3);font-family:var(--font-mono)">Read with Section 63 of Bharatiya Sakshya Adhiniyam (BSA), 2023 · Court Admissible Record</div>
        </div>
      </div>
      <button class="modal-close" onclick="closeModal('modal-sec65b-cert')">✕</button>
    </div>

    <!-- Official Certificate Body -->
    <div style="background:#0D1520;border:1px solid #1C2E42;border-radius:8px;padding:20px;font-family:var(--font-mono);font-size:11.5px;line-height:1.7;color:#D1DCE5" id="sec65b-cert-printable">
      <div style="text-align:center;border-bottom:1px dashed #1C2E42;padding-bottom:14px;margin-bottom:16px">
        <div style="font-size:14px;font-weight:700;color:#F0F6FC;letter-spacing:0.06em">CENTRAL DIGITAL SURVEILLANCE & INVESTIGATION CELL</div>
        <div style="font-size:11px;color:#8FA8C0">CYBER & CRIME FORENSICS DIVISION · AHMEDABAD COMMAND CENTER</div>
        <div style="font-size:10px;color:var(--green);font-weight:600;margin-top:4px">● SHA-256 TAMPER-EVIDENT FORENSIC ARCHIVE</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#06090F;padding:12px;border-radius:6px;border:1px solid #1C2E42;margin-bottom:16px">
        <div><strong>Certificate Ref:</strong> <span id="cert-ref-no" style="color:var(--accent)">CERT-65B-2026-004401</span></div>
        <div><strong>Case / FIR Docket:</strong> <span id="cert-case-id" style="color:#F0F6FC">#CASE-2026-GJ-4401</span></div>
        <div><strong>Identified Plate:</strong> <span id="cert-plate" class="plate" style="font-size:11px;padding:1px 6px">GJ01AB1234</span></div>
        <div><strong>Vehicle Description:</strong> <span id="cert-vehicle">Hyundai Creta (White Sedan)</span></div>
        <div><strong>Recording Node:</strong> <span id="cert-node">Node CAM04 — SG Highway Toll Plaza</span></div>
        <div><strong>Geo Coordinates:</strong> <span id="cert-coords">23.116° N, 72.538° E</span></div>
        <div><strong>Exact Time of Capture:</strong> <span id="cert-timestamp">2026-09-14 14:26:17.482 IST</span></div>
        <div><strong>Optical Sensor Specs:</strong> <span>Sony STARVIS 4K IP · 30 FPS · H.264 High Profile</span></div>
      </div>

      <div style="margin-bottom:16px">
        <div style="font-weight:700;color:var(--text-1);margin-bottom:6px">CRYPTOGRAPHIC INTEGRITY DIGEST:</div>
        <div style="background:#06090F;padding:8px 10px;border-radius:4px;border:1px solid #1C2E42;word-break:break-all;color:var(--green);font-size:11px" id="cert-hash">
          e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        </div>
      </div>

      <div style="background:#06090F;padding:12px;border-radius:6px;border:1px solid #1C2E42;font-size:11px;color:#8FA8C0;margin-bottom:16px">
        <p style="margin:0 0 8px">
          <strong>LEGAL STATEMENT OF AUTHENTICITY PURSUANT TO SEC. 65B(4):</strong><br>
          I hereby certify that the optical surveillance electronic records produced herein were generated automatically by the SENTRAX Automated License Plate Recognition (ANPR) & CCTV forensic recording system during the ordinary course of regular operations. Throughout the recording period, the optical capture device and data ingestion server were functioning accurately and without malfunction, and cryptographic checksums verify zero bit-level tampering.
        </p>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px dashed #1C2E42;padding-top:14px">
        <div>
          <div style="font-size:10px;color:var(--text-3);text-transform:uppercase">Issued By Certifying Officer</div>
          <div style="font-size:12px;font-weight:700;color:#F0F6FC" id="cert-officer">Inspector V. Sharma (Badge #SO-4082)</div>
          <div style="font-size:10.5px;color:var(--text-3)">Digital Forensics & Surveillance Operations Cell</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:var(--text-3)">Digitally Certified</div>
          <div style="font-size:11px;color:var(--green);font-weight:600">✓ Cryptographically Signed</div>
          <div style="font-size:10px;color:var(--text-3)" id="cert-date">2026-09-17 07:40:00 IST</div>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
      <span style="font-size:11px;color:var(--text-3);font-family:var(--font-mono)">Document formatted for Section 65B judicial admissibility</span>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="copyCertText()">📋 Copy Text</button>
        <button class="btn btn-primary btn-sm" onclick="printSec65bCert()">🖨️ Print / Save PDF</button>
      </div>
    </div>
  </div>
</div>

"""

    html = html[:idx_m_start] + upgraded_modal + html[idx_m_end:]
    print("Modals upgraded successfully!")

with open("com/files/index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Page evidence and modals written successfully!")
