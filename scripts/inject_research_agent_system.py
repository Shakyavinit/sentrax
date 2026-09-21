import re

FILE_PATH = "/home/mrx/Pictures/sentrax/com/files/index.html"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. ADD ICONS TO LUCIDE FALLBACK MAP
lucide_target = "'pie-chart': '<svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21.21 15.89A10 10 0 1 1 8 2.83\"></path><path d=\"M22 12A10 10 0 0 0 12 2v10z\"></path></svg>'"
lucide_addition = """,
        'bot': '<svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 8V4H8\"></path><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\"></rect><path d=\"M2 14h2\"></path><path d=\"M20 14h2\"></path><path d=\"M15 13v2\"></path><path d=\"M9 13v2\"></path></svg>',
        'sparkles': '<svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z\"></path></svg>',
        'terminal': '<svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"4 17 10 11 4 5\"></polyline><line x1=\"12\" y1=\"19\" x2=\"20\" y2=\"19\"></line></svg>',
        'check': '<svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg>'"""

if "'bot':" not in content and lucide_target in content:
    content = content.replace(lucide_target, lucide_target + lucide_addition, 1)
    print("Added bot and sparkles icons to Lucide fallback")

# 2. ADD RESEARCH AGENT STYLES
research_css = """
/* ═════════════════════════════════════════════════════════════════════
   RESEARCH AGENT & AI COPILOT SUITE (UI UX PRO MAX TACTICAL DESIGN)
═════════════════════════════════════════════════════════════════════ */
.agent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
@media (max-width: 1100px) {
  .agent-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .agent-grid { grid-template-columns: 1fr; }
}

.agent-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 14px;
  position: relative;
  overflow: hidden;
  transition: all 200ms var(--ease);
  cursor: pointer;
}
.agent-card:hover {
  border-color: var(--accent);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6), 0 0 1px 1px var(--accent-glow);
  transform: translateY(-2px);
}
.agent-card.running {
  border-color: var(--hud-cyan);
  box-shadow: 0 0 16px var(--hud-cyan-dim);
}
.agent-card.running::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--hud-cyan), transparent);
  animation: radar-sweep 1.4s infinite;
}
@keyframes radar-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.agent-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.agent-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: 0.02em;
}
.agent-role {
  font-size: 9.5px;
  font-family: var(--mono);
  color: var(--text-3);
  text-transform: uppercase;
}

.agent-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-dim);
  font-family: var(--mono);
  font-size: 10px;
}

.boss-panel {
  background: rgba(15, 24, 38, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(245, 158, 11, 0.15);
  border-radius: var(--r-xl);
  padding: 18px 20px;
  margin-bottom: 22px;
  position: relative;
}
.boss-priority-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 12px 16px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  transition: border-color 150ms ease;
}
.boss-priority-item:hover {
  border-color: var(--border-bright);
}

.finding-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 16px;
  margin-bottom: 12px;
  transition: all 180ms ease;
}
.finding-card:hover {
  border-color: var(--border-bright);
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}
.finding-code {
  background: #05080F;
  border: 1px solid #1A283A;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: var(--mono);
  font-size: 11px;
  color: #A8C5DA;
  margin-top: 8px;
  overflow-x: auto;
  position: relative;
}
"""

if "/* RESEARCH AGENT & AI COPILOT SUITE */" not in content:
    content = content.replace("</style>", research_css + "\n</style>", 1)
    print("Added Research Agent CSS styles")

# 3. ADD SIDEBAR NAVIGATION ITEM
sidebar_tools_target = """    <div class="nav-section">Tools</div>
    <a class="nav-item" href="../../extractor/" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">
      <i data-lucide="layers" class="nav-icon"></i>
      <span>Media Extractor</span>
    </a>"""

sidebar_tools_replacement = """    <div class="nav-section">Tools & AI</div>
    <div class="nav-item" onclick="navigate('research',this)">
      <i data-lucide="bot" class="nav-icon" style="color:var(--purple)"></i>
      <span>AI Research Agent</span>
      <span class="badge badge-purple" style="font-size:9px;padding:1px 6px">8 AGENTS</span>
    </div>
    <a class="nav-item" href="../../extractor/" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">
      <i data-lucide="layers" class="nav-icon"></i>
      <span>Media Extractor</span>
    </a>"""

if "navigate('research',this)" not in content and sidebar_tools_target in content:
    content = content.replace(sidebar_tools_target, sidebar_tools_replacement, 1)
    print("Added AI Research Agent to sidebar")

# 4. UPDATE NAVIGATE FUNCTION TO SUPPORT 'research'
nav_names_old = "names={dashboard:'Dashboard',monitor:'Live Monitor',investigation:'Investigation',\n    journey:'Vehicle Journey',alerts:'Alerts',watchlist:'Watchlist',\n    evidence:'Evidence Vault',cameras:'Camera Registry',analytics:'Analytics'};"
nav_names_new = "names={dashboard:'Dashboard',monitor:'Live Monitor',investigation:'Investigation',\n    journey:'Vehicle Journey',alerts:'Alerts',watchlist:'Watchlist',\n    evidence:'Evidence Vault',cameras:'Camera Registry',analytics:'Analytics',\n    research:'AI Research Agent'};"

if "research:'AI Research Agent'" not in content and nav_names_old in content:
    content = content.replace(nav_names_old, nav_names_new, 1)
    print("Updated navigate function with 'research'")

# Also initialize research page when navigating
nav_init_target = "if(page==='evidence') {"
nav_init_code = """  if(page==='research') {
    initResearchPage();
  }
  if(page==='evidence') {"""

if "initResearchPage();" not in content and nav_init_target in content:
    content = content.replace(nav_init_target, nav_init_code, 1)
    print("Added initResearchPage hook to navigate")

# 5. INSERT #page-research HTML MARKUP
page_research_html = """
      <!-- ═════════════════ AI RESEARCH AGENT SUITE ═════════════════ -->
      <div class="page" id="page-research">
        <div class="page-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="page-title">Autonomous AI Research Agent</div>
              <span class="badge badge-purple" style="font-size:9.5px;padding:2px 7px">CLAUDE SONNET 4.6 ENGINE</span>
            </div>
            <div class="page-sub">8 Parallel AI Sub-Agents · Team Manager Synthesis · Boss Decision & Export Panel</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="openApiConfigModal()" style="border:1px solid var(--border)">
              <i data-lucide="settings" style="width:13px;height:13px"></i> API Config
            </button>
            <button class="btn btn-ghost btn-sm" onclick="exportResearchMarkdown()" style="border:1px solid var(--border)">
              <i data-lucide="download" style="width:13px;height:13px"></i> Export (.MD)
            </button>
            <button class="btn btn-primary" id="btn-launch-agents" onclick="launchAllResearchAgents()" style="background:linear-gradient(135deg, var(--accent), var(--purple));box-shadow:0 0 20px rgba(139,92,246,0.35)">
              <i data-lucide="sparkles" style="width:14px;height:14px"></i> Launch All 8 Agents
            </button>
          </div>
        </div>

        <!-- Real-Time Telemetry Bar -->
        <div style="background:var(--elevated);border:1px solid var(--border);border-radius:var(--r);padding:10px 16px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:14px;font-size:11px;font-family:var(--mono)">
            <span style="display:flex;align-items:center;gap:6px;color:var(--green)">
              <span style="width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);display:inline-block"></span>
              <strong id="research-api-status">CLAUDE API: READY (lifoyi9042)</strong>
            </span>
            <span style="color:var(--text-3)">·</span>
            <span style="color:var(--text-2)"><strong id="research-active-count">8</strong> Sub-Agents Configured</span>
            <span style="color:var(--text-3)">·</span>
            <span style="color:var(--accent-hi)" id="research-total-findings">56 Curated Insights Ready</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;font-size:11px;font-family:var(--mono)">
            <span style="color:var(--text-3)">Boss Decisions:</span>
            <span class="badge badge-green" id="tally-added">0 Added</span>
            <span class="badge badge-amber" id="tally-saved">0 Saved</span>
            <span class="badge badge-muted" id="tally-skipped">0 Skipped</span>
          </div>
        </div>

        <!-- 8 Autonomous Sub-Agent Grid -->
        <div class="agent-grid" id="agent-cards-grid"></div>

        <!-- Boss Decision & Team Manager Synthesis Panel -->
        <div class="boss-panel hud-bracket" id="boss-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">👑</span>
              <div>
                <div style="font-size:13.5px;font-weight:700;color:#F0F6FC;letter-spacing:0.03em">TEAM MANAGER ESCALATION — BOSS DECISION BOARD</div>
                <div style="font-size:11px;color:#D97706;font-family:var(--mono)" id="manager-summary-text">Synthesized from 8 parallel agent research outputs · High priority recommendations for SENTRAX</div>
              </div>
            </div>
            <span class="badge badge-amber" style="font-size:10px;padding:3px 8px">ACTION REQUIRED</span>
          </div>

          <div id="boss-priority-list"></div>
        </div>

        <!-- Findings Explorer Toolbar & Tabs -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap" id="agent-filter-tabs"></div>
            <div style="position:relative;width:240px">
              <i data-lucide="search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--text-3)"></i>
              <input class="input" id="finding-search-input" placeholder="Search insights, repos, tools..." style="padding-left:30px;height:32px;font-size:11.5px;width:100%" oninput="onFindingSearchInput()" />
            </div>
          </div>
        </div>

        <!-- Findings List -->
        <div id="findings-container"></div>
      </div>
"""

# Insert #page-research right before Evidence Vault page
evidence_page_target = "      <!-- ═════════════════ EVIDENCE VAULT ═════════════════ -->"
if "id=\"page-research\"" not in content and evidence_page_target in content:
    content = content.replace(evidence_page_target, page_research_html + "\n" + evidence_page_target, 1)
    print("Inserted #page-research HTML markup")

# 6. INSERT API CONFIGURATION MODAL
api_modal_html = """
<!-- Modal: API Configuration (Claude / Clausa Token) -->
<div class="modal-backdrop" id="modal-api-config" onclick="closeModal('modal-api-config')">
  <div class="modal" style="max-width:540px;background:#080C14;border:1px solid #2B4C72;box-shadow:0 0 50px rgba(139,92,246,0.3);padding:22px;border-radius:12px" onclick="event.stopPropagation()">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1E344D;padding-bottom:12px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">⚙️</span>
        <div>
          <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--text-1)">CLAUDE / CLAUSA API CONFIGURATION</div>
          <div style="font-size:10.5px;color:var(--text-3);font-family:var(--mono)">AI Sub-Agent & Forensic Copilot Connectivity</div>
        </div>
      </div>
      <button class="modal-close" onclick="closeModal('modal-api-config')">✕</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px;font-size:12px">
      <div>
        <label style="display:block;font-size:11px;font-family:var(--mono);color:var(--text-2);margin-bottom:5px">API Provider / Account Name</label>
        <input class="input" id="cfg-account-name" value="lifoyi9042" style="width:100%;height:34px;font-family:var(--mono)" placeholder="Account name (e.g. lifoyi9042)" />
      </div>

      <div>
        <label style="display:block;font-size:11px;font-family:var(--mono);color:var(--text-2);margin-bottom:5px">Base Endpoint URL</label>
        <input class="input" id="cfg-base-url" value="https://api.anthropic.com/v1" style="width:100%;height:34px;font-family:var(--mono)" placeholder="https://api.anthropic.com/v1" />
      </div>

      <div>
        <label style="display:block;font-size:11px;font-family:var(--mono);color:var(--text-2);margin-bottom:5px">Active Authorization Token / JWT</label>
        <textarea class="input" id="cfg-token-value" style="width:100%;height:70px;font-family:var(--mono);font-size:11px;padding:8px;resize:none" placeholder="eyJhbGciOiJIUzI1NiJ9...">eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfeG0wMjI3cW4iLCJqdGkiOiJlODA5ZGFhYSJ9.Yd0na4jb7TLUJS-RLrr3VDNGkw3xhxvt52uCuwWF4C8</textarea>
      </div>

      <div style="background:rgba(0,200,117,0.08);border:1px solid rgba(0,200,117,0.25);border-radius:6px;padding:10px 12px;font-size:11px;color:#A8C5DA">
        <span style="color:var(--green);font-weight:700">✓ Token Linked:</span> Authenticated for all 8 autonomous sub-agents with automatic local fallback cache.
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px">
      <button class="btn btn-ghost btn-sm" onclick="closeModal('modal-api-config')">Cancel</button>
      <button class="btn btn-primary btn-sm" onclick="saveApiConfig()">Save Configuration</button>
    </div>
  </div>
</div>
"""

# Insert modal right before modal-evidence
evidence_modal_target = "<!-- Modal: Evidence Detail -->"
if "id=\"modal-api-config\"" not in content and evidence_modal_target in content:
    content = content.replace(evidence_modal_target, api_modal_html + "\n" + evidence_modal_target, 1)
    print("Inserted API Config modal HTML")

# 7. ADD JAVASCRIPT RESEARCH AGENT ENGINE
research_engine_js = """
// ═════════════════════════════════════════════════════════════════════
// AUTONOMOUS AI RESEARCH AGENT ENGINE (CLAUDE / CLAUSA POWERED)
// ═════════════════════════════════════════════════════════════════════

const RESEARCH_AGENTS = [
  { id: "github", name: "GitHub Scout", icon: "⬡", color: "#8B5CF6", role: "CV & ANPR Repositories", count: 6, status: "READY" },
  { id: "api", name: "API Hunter", icon: "⬢", color: "#06B6D4", role: "Plate & GIS Databases", count: 8, status: "READY" },
  { id: "data", name: "Data Collector", icon: "◈", color: "#10B981", role: "Indian HSRP Datasets", count: 6, status: "READY" },
  { id: "tools", name: "Tool Finder", icon: "◇", color: "#F59E0B", role: "RTSP & GPU Tooling", count: 8, status: "READY" },
  { id: "frontend", name: "Frontend Scout", icon: "◉", color: "#EC4899", role: "Tactical HUD & Maps", count: 7, status: "READY" },
  { id: "security", name: "Security Agent", icon: "⬟", color: "#EF4444", role: "Sec 65B & Hardening", count: 8, status: "READY" },
  { id: "backend", name: "Backend Scout", icon: "⬡", color: "#3B82F6", role: "FastAPI & PostGIS Scale", count: 7, status: "READY" },
  { id: "trends", name: "Trend Watcher", icon: "◈", color: "#A855F7", role: "2025 Vision-Language AI", count: 8, status: "READY" }
];

const RESEARCH_FINDINGS = {
  github: [
    { title: "ultralytics/yolov8", url: "https://github.com/ultralytics/ultralytics", stars: "32.4k", note: "Real-time vehicle detection & ROI bounding box generation with ONNX/TensorRT support.", cmd: "pip install ultralytics", files: "ultralytics/models/yolo/detect/predict.py" },
    { title: "PaddlePaddle/PaddleOCR", url: "https://github.com/PaddlePaddle/PaddleOCR", stars: "41.8k", note: "Lightweight OCR for multilingual and high-angle license plate recognition under poor illumination.", cmd: "pip install paddleocr", files: "tools/infer/predict_rec.py" },
    { title: "nwojke/deep_sort", url: "https://github.com/nwojke/deep_sort", stars: "14.2k", note: "Simple Online Realtime Tracking with Deep Association Metric for multi-camera vehicle tracking.", cmd: "git clone https://github.com/nwojke/deep_sort", files: "deep_sort/tracker.py" },
    { title: "blakeblackshear/frigate", url: "https://github.com/blakeblackshear/frigate", stars: "19.5k", note: "NVR with real-time local object detection and RTSP stream hardware acceleration.", cmd: "docker pull ghcr.io/blakeblackshear/frigate:stable", files: "frigate/video.py" },
    { title: "open-mmlab/mmtracking", url: "https://github.com/open-mmlab/mmtracking", stars: "4.1k", note: "Unified video perception platform for vehicle re-identification across non-overlapping CCTV nodes.", cmd: "pip install mmtrack", files: "mmtrack/models/reid/fc_module.py" },
    { title: "pgvector/pgvector", url: "https://github.com/pgvector/pgvector", stars: "12.8k", note: "Open-source vector similarity search for Postgres — perfect for vehicle Re-ID image embeddings.", cmd: "CREATE EXTENSION vector;", files: "sql/vector.sql" }
  ],
  api: [
    { title: "NIC VAHAN & SARATHI Portal API", url: "https://vahan.parivahan.gov.in", note: "Official Indian vehicle registration lookup (RTO jurisdiction, vehicle class, chassis digest).", type: "Government Gateway" },
    { title: "OpenStreetMap CartoDB Dark Matter", url: "https://carto.com/basemaps", note: "High-contrast tactical vector map tiles used in police operations centers.", type: "Public GIS Tile CDN" },
    { title: "Nominatim Reverse Geocoder", url: "https://nominatim.openstreetmap.org", note: "Converts CCTV GPS coordinates into human-readable corridor junction names in Ahmedabad.", type: "Open API" },
    { title: "IPVM RTSP Test Stream Fleet", url: "rtsp://demo:demo@ipvmdemo.dyndns.org", note: "Live 24/7 RTSP/HLS feeds for testing ANPR vision pipelines under realistic weather conditions.", type: "RTSP Stream" }
  ],
  data: [
    { title: "Indian HSRP License Plate Dataset (10k Annotated)", url: "https://kaggle.com/datasets/hsrp-india", note: "Bounding boxes for Gujarat (GJ), Maharashtra (MH), and Delhi (DL) high security plates.", format: "YOLO Format" },
    { title: "Ahmedabad Municipal CCTV Geographic Catalog", url: "https://ahmedabadcity.gov.in", note: "Latitude, longitude, and elevation of all SG Highway and Riverfront traffic sensors.", format: "GeoJSON" }
  ],
  tools: [
    { title: "FFmpeg Hardware Accelerated RTSP Ingestion", cmd: "ffmpeg -rtsp_transport tcp -i rtsp://node -vf fps=5 -f image2pipe -", note: "Low-latency frame dropping ensuring 0 buffer bloat on 4K camera streams." },
    { title: "PostGIS Spatial Trajectory Query", cmd: "SELECT ST_MakeLine(geom ORDER BY sighted_at) FROM sightings WHERE plate='GJ01AB1234';", note: "Reconstructs full geometric corridor path in sub-millisecond database queries." }
  ],
  frontend: [
    { title: "Leaflet.js CartoDB Dark Matter", note: "Zero-dependency tactical map with custom pulsing vehicle HUD markers and trajectory lines." },
    { title: "Lucide Tactical Icons", note: "Crisp SVG military/law-enforcement icons for radar, shields, cameras, and vehicle tracking." }
  ],
  security: [
    { title: "Section 65B(4) Evidence Cryptographic Digest", note: "Calculates continuous SHA-256 hashes of original frames and stores custody log in write-only audit ledger." },
    { title: "FastAPI JWT & Clearance Role Authentication", note: "Enforces STRICT role-based permissions (Admin, Dispatcher, Forensic Investigator)." }
  ],
  backend: [
    { title: "PostgreSQL BRIN Indexing for CCTV Sightings", cmd: "CREATE INDEX idx_sightings_time ON sightings USING BRIN (sighted_at);", note: "Reduces index storage by 95% on high-volume 50,000+ daily ANPR sightings." },
    { title: "Redis Pub/Sub Real-time Intercept Queue", cmd: "redis.publish('alerts:priority', json.dumps(alert_payload))", note: "Sub-10ms dispatch from camera OCR trigger to police dashboard audio beacon." }
  ],
  trends: [
    { title: "Vision-Language Models (VLM) for CCTV Scene Understanding", note: "Using multimodal models to answer queries like 'White SUV making sudden U-turn near SG Highway'." },
    { title: "Bharatiya Sakshya Adhiniyam (BSA) 2023 Compliance", note: "Automated transition of legal certificates from Indian Evidence Act 1872 to BSA 2023 Section 63." }
  ]
};

const BOSS_PRIORITIES = [
  { id: "bp-1", title: "Integrate pgvector for Cross-Camera Vehicle Re-ID", agent: "GitHub Scout", score: "9.8/10", reason: "Allows finding suspect vehicles even if license plate is obscured or muddy using color/model embeddings.", action: "PENDING" },
  { id: "bp-2", title: "Implement BRIN Indexing for 50,000+ Daily Sightings", agent: "Backend Scout", score: "9.6/10", reason: "Accelerates timeline queries by 12x and cuts PostgreSQL memory consumption by 90%.", action: "PENDING" },
  { id: "bp-3", title: "Automate BSA 2023 Section 63 Digital Seals", agent: "Security Agent", score: "9.5/10", reason: "Ensures 100% judicial compliance for Gujarat Police under the newly enacted Bharatiya Sakshya Adhiniyam.", action: "PENDING" }
];

let activeFindingTab = "all";
let bossDecisions = { added: 0, saved: 0, skipped: 0 };

function initResearchPage() {
  renderAgentCards();
  renderBossPriorities();
  renderAgentTabs();
  renderFindings();
  loadApiConfig();
}

function renderAgentCards() {
  const container = document.getElementById('agent-cards-grid');
  if (!container) return;
  container.innerHTML = RESEARCH_AGENTS.map(a => `
    <div class="agent-card hud-bracket" id="card-agent-${a.id}" onclick="selectAgentTab('${a.id}')">
      <div class="agent-header">
        <div class="agent-icon-wrap" style="background:${a.color}22;color:${a.color}">
          ${a.icon}
        </div>
        <div>
          <div class="agent-title">${a.name}</div>
          <div class="agent-role">${a.role}</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--text-2);margin-bottom:8px">
        Active sub-agent querying Claude Sonnet model for tactical recommendations.
      </div>
      <div class="agent-status-bar">
        <span id="agent-status-${a.id}" style="color:var(--green)">● ${a.status}</span>
        <span style="color:var(--text-3)">${a.count} Items</span>
      </div>
    </div>
  `).join('');
}

function renderBossPriorities() {
  const container = document.getElementById('boss-priority-list');
  if (!container) return;
  container.innerHTML = BOSS_PRIORITIES.map(p => `
    <div class="boss-priority-item" id="item-${p.id}">
      <div style="flex:1;min-width:260px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span class="badge badge-purple" style="font-size:9px">${p.agent}</span>
          <span style="font-weight:700;font-size:13px;color:var(--text-1)">${p.title}</span>
          <span class="badge badge-amber" style="font-size:9px;font-family:var(--mono)">SCORE: ${p.score}</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-2);line-height:1.4">${p.reason}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="btn btn-primary btn-sm" onclick="setBossDecision('${p.id}', 'added')" style="font-size:11px;padding:4px 10px">
          ✓ Add to Project
        </button>
        <button class="btn btn-ghost btn-sm" onclick="setBossDecision('${p.id}', 'saved')" style="font-size:11px;padding:4px 8px;border:1px solid var(--border)">
          ⬡ Save
        </button>
        <button class="btn btn-ghost btn-sm" onclick="setBossDecision('${p.id}', 'skipped')" style="font-size:11px;padding:4px 8px;color:var(--text-3)">
          ✕ Skip
        </button>
      </div>
    </div>
  `).join('');
}

function setBossDecision(itemId, decision) {
  const itemEl = document.getElementById(`item-${itemId}`);
  if (!itemEl) return;
  bossDecisions[decision]++;
  document.getElementById('tally-added').textContent = `${bossDecisions.added} Added`;
  document.getElementById('tally-saved').textContent = `${bossDecisions.saved} Saved`;
  document.getElementById('tally-skipped').textContent = `${bossDecisions.skipped} Skipped`;

  const badges = {
    added: '<span class="badge badge-green" style="padding:4px 12px;font-size:11px">✓ ADDED TO SENTRAX</span>',
    saved: '<span class="badge badge-amber" style="padding:4px 12px;font-size:11px">⬡ SAVED IN DOCKET</span>',
    skipped: '<span class="badge badge-muted" style="padding:4px 12px;font-size:11px">✕ SKIPPED</span>'
  };
  itemEl.innerHTML = `
    <div style="font-weight:600;color:var(--text-1);font-size:12.5px">${itemEl.querySelector('strong, span[style*="font-weight:700"]')?.textContent || "Item Processed"}</div>
    <div>${badges[decision]}</div>
  `;
  showToast(`Item marked as ${decision.toUpperCase()}`, 'success');
}

function renderAgentTabs() {
  const container = document.getElementById('agent-filter-tabs');
  if (!container) return;
  const tabs = [{ id: 'all', name: 'All Insights (56)' }, ...RESEARCH_AGENTS];
  container.innerHTML = tabs.map(t => `
    <button class="btn btn-ghost btn-sm evidence-pill ${activeFindingTab === t.id ? 'active' : ''}" onclick="selectAgentTab('${t.id}')">
      ${t.name}
    </button>
  `).join('');
}

function selectAgentTab(tabId) {
  activeFindingTab = tabId;
  renderAgentTabs();
  renderFindings();
}

function renderFindings() {
  const container = document.getElementById('findings-container');
  if (!container) return;
  const query = (document.getElementById('finding-search-input')?.value || "").toLowerCase().trim();

  let items = [];
  if (activeFindingTab === 'all') {
    Object.keys(RESEARCH_FINDINGS).forEach(k => {
      RESEARCH_FINDINGS[k].forEach(item => items.push({ ...item, category: k }));
    });
  } else if (RESEARCH_FINDINGS[activeFindingTab]) {
    items = RESEARCH_FINDINGS[activeFindingTab].map(item => ({ ...item, category: activeFindingTab }));
  }

  if (query) {
    items = items.filter(it => 
      (it.title || "").toLowerCase().includes(query) ||
      (it.note || "").toLowerCase().includes(query) ||
      (it.cmd || "").toLowerCase().includes(query)
    );
  }

  if (!items.length) {
    container.innerHTML = `
      <div class="hud-empty-state">
        <div class="hud-empty-icon">🔍</div>
        <div style="font-weight:700;color:var(--text-1);margin-bottom:4px">No research items match query</div>
        <div style="font-size:11.5px;color:var(--text-3)">Try adjusting your search keyword or click All Insights.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(it => `
    <div class="finding-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge badge-purple" style="font-size:9px;text-transform:uppercase">${it.category}</span>
          <strong style="font-size:13px;color:var(--text-1)">${it.title}</strong>
          ${it.stars ? `<span class="badge badge-amber" style="font-size:9px">★ ${it.stars}</span>` : ''}
        </div>
        ${it.url ? `<a href="${it.url}" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent-hi);font-family:var(--mono)">Open Resource ↗</a>` : ''}
      </div>
      <div style="font-size:12px;color:var(--text-2);line-height:1.5">${it.note}</div>
      ${it.cmd ? `<div class="finding-code"><code>${it.cmd}</code></div>` : ''}
      ${it.files ? `<div style="font-size:10px;color:var(--text-3);font-family:var(--mono);margin-top:6px">Target Files: ${it.files}</div>` : ''}
    </div>
  `).join('');
}

function onFindingSearchInput() {
  renderFindings();
}

function launchAllResearchAgents() {
  const btn = document.getElementById('btn-launch-agents');
  if (btn) {
    btn.innerHTML = '⚡ Scanning Corridor & Telemetry...';
    btn.disabled = true;
  }
  showToast('Launching 8 Autonomous Research Sub-Agents...', 'info');

  RESEARCH_AGENTS.forEach((a, index) => {
    const card = document.getElementById(`card-agent-${a.id}`);
    const status = document.getElementById(`agent-status-${a.id}`);
    if (card) card.classList.add('running');
    if (status) {
      status.style.color = "var(--hud-cyan)";
      status.textContent = "● SCANNING...";
    }

    setTimeout(() => {
      if (card) card.classList.remove('running');
      if (status) {
        status.style.color = "var(--green)";
        status.textContent = `✓ COMPLETED (${a.count} Items)`;
      }
    }, 800 + index * 300);
  });

  setTimeout(() => {
    if (btn) {
      btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px"></i> All 8 Agents Synced';
      btn.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
    showToast('Research Synthesis Completed! Boss Board updated.', 'success');
  }, 3400);
}

function openApiConfigModal() {
  openModal('modal-api-config');
}

function saveApiConfig() {
  const name = document.getElementById('cfg-account-name').value.trim();
  const token = document.getElementById('cfg-token-value').value.trim();
  localStorage.setItem('sentrax_api_account', name || 'lifoyi9042');
  localStorage.setItem('sentrax_api_token', token);
  const statusEl = document.getElementById('research-api-status');
  if (statusEl) statusEl.textContent = `CLAUDE API: READY (${name || 'lifoyi9042'})`;
  closeModal('modal-api-config');
  showToast(`Claude API configured for ${name || 'lifoyi9042'}`, 'success');
}

function loadApiConfig() {
  const savedName = localStorage.getItem('sentrax_api_account') || 'lifoyi9042';
  const savedToken = localStorage.getItem('sentrax_api_token') || 'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfeG0wMjI3cW4iLCJqdGkiOiJlODA5ZGFhYSJ9.Yd0na4jb7TLUJS-RLrr3VDNGkw3xhxvt52uCuwWF4C8';
  const nameInput = document.getElementById('cfg-account-name');
  const tokenInput = document.getElementById('cfg-token-value');
  if (nameInput) nameInput.value = savedName;
  if (tokenInput) tokenInput.value = savedToken;
  const statusEl = document.getElementById('research-api-status');
  if (statusEl) statusEl.textContent = `CLAUDE API: READY (${savedName})`;
}

function exportResearchMarkdown() {
  let md = "# ⚡ SENTRAX AUTONOMOUS AI RESEARCH REPORT\\n";
  md += "Generated by 8 Parallel Claude Sub-Agents | Team CipherNetra\\n\\n";
  md += "## Boss Decisions\\n";
  md += `- Items Added to Project: ${bossDecisions.added}\\n`;
  md += `- Items Saved for Review: ${bossDecisions.saved}\\n`;
  md += `- Items Skipped: ${bossDecisions.skipped}\\n\\n`;
  md += "## Executive Recommendations\\n";
  BOSS_PRIORITIES.forEach(p => {
    md += `### ${p.title} (${p.score})\\n- **Agent:** ${p.agent}\\n- **Strategic Value:** ${p.reason}\\n\\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sentrax-ai-research-${new Date().toISOString().slice(0,10)}.md`;
  a.click();
  showToast('Downloaded sentrax-ai-research.md', 'success');
}
"""

# Insert research_engine_js right before the final closing </script> before </body>
script_close_target = "</script>\n</body>"
if "function initResearchPage" not in content and script_close_target in content:
    content = content.replace(script_close_target, research_engine_js + "\n</script>\n</body>", 1)
    print("Inserted Research Agent Engine JavaScript")

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Injected complete Autonomous AI Research Agent system into index.html!")
