# SENTRAX — CCTV Intelligence & Digital Forensics Platform
## MASTER SPECIFICATION FOR AUTONOMOUS BUILD

**Team:** CipherNetra  
**Hackathon:** Gujarat Sentinel Hackathon  
**Build Agent:** Antigravity  

---

## ⚠️ CRITICAL OPERATING RULES FOR ANTIGRAVITY

1. **NEVER ask for clarification** — every decision is pre-made in this document. If something seems ambiguous, follow the explicit rule written here. If a rule is not written, use the closest analogous rule in this file.
2. **NEVER stop mid-task** — complete each module fully before moving to the next.
3. **NEVER use placeholder data** — use realistic mock data where real data requires a live camera feed.
4. **NEVER deviate from the design system** — the design tokens in this file are final.
5. **NEVER install unlisted dependencies** — every dependency is listed. If you think you need something extra, check if a listed library can do it first.
6. **ALWAYS write complete files** — no `// TODO` or `// implement later` comments.
7. **ALWAYS handle errors** — every async call has try/catch, every API response is validated.
8. **BUILD ORDER is fixed** — follow the module sequence exactly. Do not skip ahead.
9. **SANDBOX CAMERA URLs** — if asked about sandbox URL, use `rtsp://demo:demo@ipvmdemo.dyndns.org:554/onvif-media/media.amp` as fallback mock. Never block on this.
10. **TOKEN EFFICIENCY** — prefer editing existing files over creating new ones where logical. Batch related changes.

---

## SECTION 1: PROJECT OVERVIEW

### 1.1 What SENTRAX Is

SENTRAX is a web-based CCTV intelligence platform that ingests live video streams from existing camera infrastructure, runs AI analysis to detect vehicles and read number plates, correlates sightings across multiple cameras, raises watchlist alerts, reconstructs vehicle journeys, and preserves tamper-evident digital evidence.

### 1.2 What SENTRAX Is NOT

- NOT a camera management system (we don't configure cameras)
- NOT a DVR/NVR replacement
- NOT a general surveillance tool (vehicle-focused only)
- NOT a cloud service (on-premise deployment)

### 1.3 User Personas

**Primary: Investigator**
- Searches for a specific vehicle plate across all cameras
- Wants to see where a vehicle has been
- Needs to export evidence for a case file
- Works during active investigation sessions

**Secondary: Operator / Watch Officer**
- Monitors live feeds and real-time alerts
- Manages the watchlist
- Responds to alerts as they arrive

**Tertiary: Administrator**
- Manages camera registry
- User management
- System health

---

## SECTION 2: TECH STACK (FIXED — DO NOT CHANGE)

### 2.1 Frontend
```
Framework:     React 18 + Vite
Language:      TypeScript (strict mode)
Routing:       React Router v6
State:         Zustand (global) + React Query v5 (server state)
Styling:       Tailwind CSS v3 + custom CSS variables (design tokens below)
Icons:         Lucide React
Charts:        Recharts
Maps:          Leaflet + react-leaflet
Video:         HLS.js (for HLS streams in browser)
Tables:        TanStack Table v8
Notifications: Sonner (toasts)
Dates:         date-fns
Forms:         React Hook Form + Zod
WebSockets:    Native WebSocket API (no library)
```

### 2.2 Backend
```
Framework:     FastAPI (Python 3.11+)
ASGI Server:   Uvicorn
Database:      PostgreSQL 15 + PostGIS extension
ORM:           SQLAlchemy 2.0 (async) + Alembic migrations
Cache/PubSub:  Redis 7
Task Queue:    Celery + Redis broker
Auth:          JWT (python-jose) + bcrypt
RTSP Ingestion: FFmpeg (subprocess) + OpenCV
AI/ML:         YOLOv8 (ultralytics), PaddleOCR, deep_sort_realtime
Evidence Hash: hashlib (SHA-256)
Streaming API: Server-Sent Events (SSE) for alerts
WebSockets:    FastAPI WebSocket
```

### 2.3 Infrastructure
```
Containerization: Docker + Docker Compose
Reverse Proxy:    Nginx (in docker compose)
Database GUI:     pgAdmin (optional, dev only)
```

### 2.4 File Structure (complete)
```
sentrax/
├── frontend/
│   ├── src/
│   │   ├── api/                    # All API client functions
│   │   │   ├── cameras.ts
│   │   │   ├── vehicles.ts
│   │   │   ├── watchlist.ts
│   │   │   ├── evidence.ts
│   │   │   ├── alerts.ts
│   │   │   ├── analytics.ts
│   │   │   └── auth.ts
│   │   ├── components/
│   │   │   ├── ui/                 # Primitive components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── StatusDot.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx    # Main layout wrapper
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── PageHeader.tsx
│   │   │   ├── cameras/
│   │   │   │   ├── CameraGrid.tsx
│   │   │   │   ├── CameraCard.tsx
│   │   │   │   ├── CameraFeed.tsx  # HLS/RTSP viewer
│   │   │   │   ├── CameraMap.tsx
│   │   │   │   └── CameraStatusBadge.tsx
│   │   │   ├── vehicles/
│   │   │   │   ├── VehicleSearch.tsx
│   │   │   │   ├── VehicleTimeline.tsx
│   │   │   │   ├── VehicleSightingCard.tsx
│   │   │   │   ├── JourneyMap.tsx
│   │   │   │   └── VehicleDetailPanel.tsx
│   │   │   ├── alerts/
│   │   │   │   ├── AlertFeed.tsx
│   │   │   │   ├── AlertCard.tsx
│   │   │   │   └── AlertBadge.tsx
│   │   │   ├── evidence/
│   │   │   │   ├── EvidenceVault.tsx
│   │   │   │   ├── EvidenceCard.tsx
│   │   │   │   ├── EvidenceExportModal.tsx
│   │   │   │   └── ChainOfCustody.tsx
│   │   │   ├── watchlist/
│   │   │   │   ├── WatchlistPanel.tsx
│   │   │   │   └── WatchlistForm.tsx
│   │   │   └── analytics/
│   │   │       ├── HeatmapChart.tsx
│   │   │       ├── ActivityChart.tsx
│   │   │       └── StatCard.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LiveMonitor.tsx
│   │   │   ├── Investigation.tsx
│   │   │   ├── VehicleJourney.tsx
│   │   │   ├── EvidenceVaultPage.tsx
│   │   │   ├── WatchlistPage.tsx
│   │   │   ├── CameraRegistry.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Login.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── alertStore.ts
│   │   │   └── uiStore.ts
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useAlerts.ts
│   │   │   ├── useCameras.ts
│   │   │   └── useVehicleSearch.ts
│   │   ├── types/
│   │   │   └── index.ts            # All TypeScript types
│   │   ├── utils/
│   │   │   ├── format.ts           # Date, plate, confidence formatters
│   │   │   ├── hash.ts             # SHA-256 client-side verify
│   │   │   └── constants.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               # CSS variables + global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── cameras.py
│   │   │   │   ├── vehicles.py
│   │   │   │   ├── watchlist.py
│   │   │   │   ├── evidence.py
│   │   │   │   ├── alerts.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── auth.py
│   │   │   │   └── stream.py       # SSE + WebSocket endpoints
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py           # Settings from env
│   │   │   ├── database.py         # Async SQLAlchemy engine
│   │   │   ├── redis.py
│   │   │   ├── security.py         # JWT + password hashing
│   │   │   └── logging.py
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── camera.py
│   │   │   ├── vehicle.py
│   │   │   ├── sighting.py
│   │   │   ├── watchlist.py
│   │   │   ├── alert.py
│   │   │   ├── evidence.py
│   │   │   ├── audit.py
│   │   │   └── user.py
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   │   ├── camera.py
│   │   │   ├── vehicle.py
│   │   │   ├── watchlist.py
│   │   │   ├── evidence.py
│   │   │   ├── alert.py
│   │   │   └── auth.py
│   │   ├── services/               # Business logic
│   │   │   ├── camera_service.py
│   │   │   ├── vehicle_service.py
│   │   │   ├── watchlist_service.py
│   │   │   ├── evidence_service.py
│   │   │   ├── alert_service.py
│   │   │   └── correlation_service.py  # Cross-camera logic
│   │   ├── ai/                     # AI pipeline
│   │   │   ├── detector.py         # YOLO vehicle detection
│   │   │   ├── anpr.py             # Number plate recognition
│   │   │   ├── tracker.py          # DeepSORT tracking
│   │   │   ├── reid.py             # Vehicle Re-ID
│   │   │   └── pipeline.py         # Orchestrates all AI
│   │   ├── ingestion/              # Stream ingestion
│   │   │   ├── stream_manager.py   # Manages all camera streams
│   │   │   ├── rtsp_reader.py      # RTSP frame reader
│   │   │   └── frame_processor.py  # Per-frame processing queue
│   │   ├── tasks/                  # Celery tasks
│   │   │   ├── process_frame.py
│   │   │   ├── generate_evidence.py
│   │   │   └── send_alert.py
│   │   └── main.py                 # FastAPI app entry point
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

---

## SECTION 3: DESIGN SYSTEM (MANDATORY — EVERY PIXEL)

### 3.1 Design Concept

SENTRAX is a law enforcement intelligence tool. The visual identity draws from:
- **Tactical operations centers** — dark environment, high-contrast data
- **Forensic lab interfaces** — precision, clinical cleanliness, grid-based
- **Aviation instrument panels** — at-a-glance readability, color-coded status

This is NOT a SaaS dashboard. It is an intelligence operations platform. Every design choice reflects that.

### 3.2 Color Palette (CSS Variables — index.css)

```css
:root {
  /* === BASE === */
  --bg-void:        #080C12;   /* deepest background — main canvas */
  --bg-surface:     #0D1520;   /* panels, cards, sidebar */
  --bg-elevated:    #121E2E;   /* input fields, dropdowns, hover states */
  --bg-overlay:     #1A2A3D;   /* modals, popovers */
  --bg-subtle:      #1F3050;   /* selected states, row highlights */

  /* === BORDERS === */
  --border-dim:     #1C2E42;   /* subtle separators */
  --border-default: #233A52;   /* card borders, input borders */
  --border-bright:  #2E4E70;   /* active/focused borders */
  --border-accent:  #0E6FBF;   /* accent-colored borders */

  /* === TEXT === */
  --text-primary:   #E8EFF7;   /* main content */
  --text-secondary: #8FA8C0;   /* labels, captions */
  --text-muted:     #4D6B85;   /* placeholders, disabled */
  --text-inverse:   #080C12;   /* text on bright backgrounds */

  /* === ACCENT — Sentinel Blue === */
  --accent-primary:   #0E7FE0;  /* primary actions, active states */
  --accent-bright:    #1A9FFF;  /* hover on primary */
  --accent-dim:       #0A4F8C;  /* pressed, muted accent */
  --accent-glow:      rgba(14, 127, 224, 0.15); /* glow behind accent elements */

  /* === STATUS COLORS === */
  --status-alert:     #FF3B3B;  /* active watchlist match, critical alert */
  --status-alert-dim: rgba(255, 59, 59, 0.12);
  --status-warn:      #FF8C00;  /* stream warning, degraded */
  --status-warn-dim:  rgba(255, 140, 0, 0.12);
  --status-ok:        #00C875;  /* online, confirmed, verified */
  --status-ok-dim:    rgba(0, 200, 117, 0.10);
  --status-info:      #40A9FF;  /* general info, timestamps */
  --status-neutral:   #4D6B85;  /* offline, unknown */

  /* === CONFIDENCE GRADIENT (AI score) === */
  --conf-high:    #00C875;   /* 85%+ */
  --conf-med:     #FF8C00;   /* 60–84% */
  --conf-low:     #FF3B3B;   /* <60% */

  /* === TYPOGRAPHY === */
  --font-sans:   'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace;
  --font-data:   'JetBrains Mono', monospace; /* plates, timestamps, hashes */

  /* === SPACING SCALE === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* === RADIUS === */
  --radius-sm:  3px;
  --radius-md:  6px;
  --radius-lg:  10px;
  --radius-xl:  16px;

  /* === SHADOWS === */
  --shadow-card:   0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px var(--border-dim);
  --shadow-modal:  0 24px 48px rgba(0,0,0,0.7);
  --shadow-accent: 0 0 12px var(--accent-glow);
  --shadow-alert:  0 0 16px rgba(255,59,59,0.2);

  /* === TRANSITIONS === */
  --ease-default: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --ease-bounce:  350ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 3.3 Typography Rules

**Typefaces to load (Google Fonts):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Type Scale:**
| Role | Size | Weight | Font | Color |
|------|------|--------|------|-------|
| Page title | 22px | 600 | Inter | --text-primary |
| Section heading | 16px | 600 | Inter | --text-primary |
| Card title | 14px | 500 | Inter | --text-primary |
| Body | 13px | 400 | Inter | --text-primary |
| Caption / label | 11px | 500 | Inter | --text-secondary |
| Plate number | 15px | 500 | JetBrains Mono | --text-primary |
| Timestamp | 11px | 400 | JetBrains Mono | --text-secondary |
| Hash / fingerprint | 10px | 400 | JetBrains Mono | --text-muted |
| Alert headline | 13px | 600 | Inter | --status-alert |

**NEVER use:**
- Text transform uppercase anywhere except badge labels
- Letter-spacing on body text
- Font sizes below 10px

### 3.4 Component Visual Specifications

#### Sidebar
```
Width: 220px (collapsed: 56px)
Background: --bg-surface
Right border: 1px solid --border-dim
Top: SENTRAX logo + wordmark
Items: 40px tall, 12px horizontal padding
Active item: --bg-subtle, left border 2px --accent-primary, text --text-primary
Inactive: text --text-secondary
Icons: 16px Lucide icons
Section labels: 10px --text-muted, uppercase, letter-spacing 0.08em
Bottom: User info + settings
```

#### Top Bar
```
Height: 52px
Background: --bg-surface
Bottom border: 1px solid --border-dim
Left: Breadcrumb navigation (current page path)
Center: Global search (plate search shortcut)
Right: Alert bell (pulsing red dot if active) + user avatar
```

#### Cards
```
Background: --bg-surface
Border: 1px solid --border-dim
Border radius: --radius-md (6px)
Shadow: --shadow-card
Padding: 16px
No decorative gradients on card backgrounds
Header: 14px 500 Inter with a bottom border-dim separator
```

#### Camera Feed Card
```
Aspect ratio: 16:9 forced
Background: #000 (video fills this)
Overlay (bottom): gradient from transparent to rgba(8,12,18,0.9)
Overlay shows: Camera name (top-left), status dot, timestamp (bottom-right), detection boxes
Detection boxes: 2px solid --status-ok, label tag above box
ANPR overlay: bold white text on #000000CC background, license plate font
No-signal state: dark grey with "NO SIGNAL" centered in --text-muted + antenna icon
```

#### Status Dot
```
Online:    8px circle, --status-ok, box-shadow: 0 0 6px --status-ok
Warning:   8px circle, --status-warn, pulsing animation
Alert:     8px circle, --status-alert, fast pulse animation  
Offline:   8px circle, --status-neutral, no glow
```

#### Alert Card
```
Left border: 3px solid --status-alert
Background: gradient from --status-alert-dim to transparent (left to right, 200px)
Header: Camera ID + timestamp
Body: Plate number in --font-data at 16px
Footer: Confidence score + "View Evidence" button
New alerts slide in from right with 300ms ease
```

#### Confidence Badge
```
85%+: background --status-ok-dim, text --status-ok, border 1px solid rgba(0,200,117,0.3)
60-84%: background --status-warn-dim, text --status-warn, border 1px solid rgba(255,140,0,0.3)  
<60%: background --status-alert-dim, text --status-alert, border 1px solid rgba(255,59,59,0.3)
Font: --font-mono, 11px
Format: "94.3%"
```

#### License Plate Display
```
Background: #FFFFFF
Text: --text-inverse (#080C12)
Font: JetBrains Mono, 14px, weight 600
Padding: 3px 8px
Border-radius: 2px
Border: 1px solid #CCCCCC
Shadow: 0 1px 4px rgba(0,0,0,0.4)
(Mimics a real Indian number plate appearance — white rectangle)
```

#### Buttons
```
Primary: bg --accent-primary, hover --accent-bright, text white, radius --radius-sm
Danger: bg --status-alert, hover darker, text white
Ghost: bg transparent, hover --bg-elevated, border --border-default
Size sm: height 28px, padding 8px 12px, font 12px
Size md: height 36px, padding 12px 18px, font 13px
Size lg: height 44px, padding 16px 24px, font 14px
```

#### Tables
```
Header: --bg-overlay, text --text-secondary 11px 500, border-bottom --border-default
Row: 44px height, border-bottom --border-dim
Row hover: --bg-elevated
Selected: --bg-subtle, left indicator 2px --accent-primary
Monospace cells (plates, hashes, timestamps): --font-mono
```

### 3.5 Animations (ONLY these — no others)

```css
/* Status dot pulse */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
  50% { opacity: 0.8; box-shadow: 0 0 0 4px transparent; }
}

/* Alert slide in */
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* Scanning line on live feed */
@keyframes scan-line {
  0%   { top: 0%; }
  100% { top: 100%; }
}

/* Alert badge bounce */
@keyframes badge-bounce {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.15); }
}
```

---

## SECTION 4: DATABASE SCHEMA (PostgreSQL)

### 4.1 Complete SQL DDL

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(64) UNIQUE NOT NULL,
  email         VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  role          VARCHAR(32) NOT NULL DEFAULT 'investigator', -- 'admin', 'operator', 'investigator'
  is_active     BOOLEAN DEFAULT true,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Cameras
CREATE TABLE cameras (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camera_id      VARCHAR(32) UNIQUE NOT NULL,  -- e.g. "CAM04"
  name           VARCHAR(128) NOT NULL,
  location_name  VARCHAR(256),
  location_geo   GEOGRAPHY(POINT, 4326),       -- PostGIS lat/lng
  rtsp_url       TEXT NOT NULL,
  hls_url        TEXT,
  protocol       VARCHAR(16) DEFAULT 'rtsp',   -- rtsp, hls, webrtc
  codec          VARCHAR(16),                  -- h264, h265
  resolution     VARCHAR(16),                  -- 1920x1080
  fps            INTEGER DEFAULT 25,
  status         VARCHAR(16) DEFAULT 'unknown',-- online, offline, warning
  last_seen      TIMESTAMPTZ,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle sightings
CREATE TABLE sightings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camera_id      UUID REFERENCES cameras(id) ON DELETE SET NULL,
  plate_text     VARCHAR(32),                  -- Cleaned plate string
  plate_raw      VARCHAR(64),                  -- Raw OCR output
  plate_conf     FLOAT,                        -- ANPR confidence 0-1
  vehicle_class  VARCHAR(32),                  -- car, truck, bike, bus
  vehicle_conf   FLOAT,                        -- Detection confidence
  track_id       INTEGER,                      -- DeepSORT track ID
  frame_ts       TIMESTAMPTZ NOT NULL,         -- Actual frame timestamp
  bbox_x         INTEGER,                      -- Bounding box pixels
  bbox_y         INTEGER,
  bbox_w         INTEGER,
  bbox_h         INTEGER,
  frame_path     TEXT,                         -- Path to raw frame file
  crop_path      TEXT,                         -- Path to vehicle crop
  plate_crop_path TEXT,                        -- Path to plate crop
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sightings_plate ON sightings(plate_text);
CREATE INDEX idx_sightings_camera ON sightings(camera_id);
CREATE INDEX idx_sightings_ts ON sightings(frame_ts DESC);
CREATE INDEX idx_sightings_plate_ts ON sightings(plate_text, frame_ts DESC);

-- Cross-camera correlations
CREATE TABLE correlations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_text      VARCHAR(32) NOT NULL,
  sighting_ids    UUID[] NOT NULL,             -- Array of sighting UUIDs
  camera_ids      UUID[] NOT NULL,             -- Ordered camera sequence
  start_ts        TIMESTAMPTZ NOT NULL,
  end_ts          TIMESTAMPTZ NOT NULL,
  duration_mins   FLOAT,
  correlation_method VARCHAR(32),             -- 'plate_match', 'reid', 'combined'
  confidence      FLOAT,
  path_wkt        TEXT,                        -- WKT linestring for map display
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_correlations_plate ON correlations(plate_text);

-- Watchlist
CREATE TABLE watchlist (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_text     VARCHAR(32) UNIQUE NOT NULL,
  reason         TEXT NOT NULL,
  priority       VARCHAR(16) DEFAULT 'medium', -- low, medium, high, critical
  added_by       UUID REFERENCES users(id),
  active         BOOLEAN DEFAULT true,
  expires_at     TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_watchlist_plate ON watchlist(plate_text) WHERE active = true;

-- Alerts
CREATE TABLE alerts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id   UUID REFERENCES watchlist(id),
  sighting_id    UUID REFERENCES sightings(id),
  plate_text     VARCHAR(32) NOT NULL,
  camera_id      UUID REFERENCES cameras(id),
  triggered_at   TIMESTAMPTZ DEFAULT NOW(),
  status         VARCHAR(16) DEFAULT 'active', -- active, acknowledged, dismissed
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  priority       VARCHAR(16) DEFAULT 'medium'
);
CREATE INDEX idx_alerts_status ON alerts(status, triggered_at DESC);
CREATE INDEX idx_alerts_plate ON alerts(plate_text);

-- Evidence
CREATE TABLE evidence (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         VARCHAR(64),                 -- Optional investigator case ref
  sighting_id     UUID REFERENCES sightings(id),
  alert_id        UUID REFERENCES alerts(id),
  plate_text      VARCHAR(32),
  camera_id       UUID REFERENCES cameras(id),
  frame_ts        TIMESTAMPTZ,
  frame_path      TEXT,
  vehicle_crop_path TEXT,
  plate_crop_path TEXT,
  frame_hash      CHAR(64),                    -- SHA-256 hex of raw frame
  vehicle_hash    CHAR(64),
  plate_hash      CHAR(64),
  metadata_json   TEXT,                        -- Full metadata as JSON string
  metadata_hash   CHAR(64),                    -- SHA-256 of metadata JSON
  ai_confidence   FLOAT,
  ai_model_version VARCHAR(32),
  exported        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_evidence_plate ON evidence(plate_text);
CREATE INDEX idx_evidence_case ON evidence(case_id);

-- Audit / Chain of Custody
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(64) NOT NULL,           -- 'viewed_evidence', 'exported', 'added_watchlist', etc.
  target_type VARCHAR(32),                    -- 'evidence', 'sighting', 'watchlist'
  target_id   UUID,
  detail      JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_target ON audit_log(target_type, target_id);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
```

---

## SECTION 5: BACKEND API SPECIFICATION

### 5.1 Authentication

**POST /api/v1/auth/login**
```json
Request:  { "username": "string", "password": "string" }
Response: { "access_token": "string", "token_type": "bearer", "user": { "id", "username", "role" } }
```

**POST /api/v1/auth/refresh**
**GET  /api/v1/auth/me**

All protected routes: `Authorization: Bearer <token>` header required.

### 5.2 Cameras

**GET  /api/v1/cameras**
Returns: list of cameras with status, last_seen, stream URLs.

**GET  /api/v1/cameras/:id**
Returns: full camera detail including recent sightings count.

**POST /api/v1/cameras**
Create camera (admin only). Body: camera fields.

**PATCH /api/v1/cameras/:id**
Update camera. Partial body.

**DELETE /api/v1/cameras/:id**
Deactivate camera (admin only).

**GET /api/v1/cameras/:id/sightings**
Query params: `?from=ISO&to=ISO&limit=50&offset=0`

**POST /api/v1/cameras/:id/test**
Test RTSP connection. Returns: `{ "reachable": bool, "latency_ms": int }`

### 5.3 Vehicles / Sightings

**GET /api/v1/vehicles/search**
Query params: `?plate=MH12AB1234&from=ISO&to=ISO&camera_id=UUID&limit=50&offset=0`
Returns: paginated sightings with camera info.

**GET /api/v1/vehicles/journey/:plate**
Query params: `?from=ISO&to=ISO`
Returns: ordered list of sightings + correlations forming journey.

**GET /api/v1/vehicles/sightings/:id**
Returns: full sighting detail with file URLs.

### 5.4 Watchlist

**GET  /api/v1/watchlist**
Returns: all active watchlist entries.

**POST /api/v1/watchlist**
Body: `{ "plate_text", "reason", "priority", "expires_at?", "notes?" }`

**PATCH /api/v1/watchlist/:id**
Update entry.

**DELETE /api/v1/watchlist/:id**
Deactivate (not hard delete).

**GET /api/v1/watchlist/:id/alerts**
Returns: all alerts generated for this watchlist entry.

### 5.5 Alerts

**GET /api/v1/alerts**
Query: `?status=active&priority=high&limit=50&page=1`

**GET /api/v1/alerts/:id**
Full alert detail with sighting + camera + watchlist info.

**PATCH /api/v1/alerts/:id/acknowledge**
Mark alert as acknowledged. Records user + timestamp.

**PATCH /api/v1/alerts/:id/dismiss**
Dismiss alert with optional note.

**GET /api/v1/alerts/stream**
SSE endpoint. Streams real-time alert events.
Format: `data: {"type":"alert","payload":{...}}\n\n`

### 5.6 Evidence

**GET /api/v1/evidence**
Query: `?case_id=&plate=&from=&to=&limit=50&page=1`

**GET /api/v1/evidence/:id**
Full evidence detail including hash verification status.

**GET /api/v1/evidence/:id/verify**
Re-computes file hashes and compares to stored. Returns: `{ "valid": bool, "details": {...} }`

**POST /api/v1/evidence/:id/export**
Generate exportable evidence package. Returns signed URL or triggers download.

**GET /api/v1/evidence/:id/audit**
Audit trail for this specific evidence item.

**POST /api/v1/evidence/bulk-export**
Body: `{ "evidence_ids": ["uuid",...], "case_id": "string" }`

### 5.7 Analytics

**GET /api/v1/analytics/summary**
Returns: total sightings today, active cameras, active alerts, plates scanned.

**GET /api/v1/analytics/activity**
Query: `?period=24h|7d|30d`
Returns: hourly/daily sighting counts per camera.

**GET /api/v1/analytics/top-plates**
Returns: most frequently seen plates in period.

**GET /api/v1/analytics/camera-heatmap**
Returns: per-camera sighting count for heatmap.

### 5.8 WebSocket

**WS /api/v1/ws/monitor**
Live monitoring stream. Server pushes:
```json
{ "type": "sighting",  "payload": { sighting object + camera short info } }
{ "type": "alert",     "payload": { alert object } }
{ "type": "cam_status", "payload": { "camera_id": "CAM04", "status": "offline" } }
```

---

## SECTION 6: PAGE-BY-PAGE UI SPECIFICATION

### 6.1 Login Page

**Layout:** Full-screen dark background (`--bg-void`). Centered card `480px` wide.
**Top:** SENTRAX logo (shield icon + wordmark) centered, 40px from top of card.
**Subtext:** "CipherNetra Intelligence Platform" in --text-secondary 12px.
**Form:** Username field + Password field + "Sign In" primary button full-width.
**Footer:** "Gujarat Sentinel Hackathon · CipherNetra" in --text-muted 10px.
**Background detail:** Subtle grid of dots (CSS radial-gradient) — not animated.

### 6.2 Dashboard Page

**Layout:** 3-column grid on top (stat cards), then 2-column below (activity chart + alert feed).

**Stat cards (4):**
1. "Cameras Online" — number / total (e.g. 12/15), status breakdown
2. "Vehicles Detected Today" — count with sparkline
3. "Active Alerts" — count, red if >0
4. "Plates Scanned" — total today

**Activity chart:** Line chart, 24h view, vehicles detected per hour, one line per top-3 cameras. Recharts LineChart. X-axis: hours 00–23. Y-axis: count.

**Alert feed (right column):** Latest 10 alerts, newest first. Each row: camera badge + plate + time + priority badge + acknowledge button.

**Quick search:** Prominent plate search bar at top below TopBar. Placeholder: "Search plate number..." CMD+K shortcut.

### 6.3 Live Monitor Page

**Layout:** Main area = camera grid. Right sidebar = live alert feed (280px).

**Camera grid options:** 2x2, 3x3, 4x4 (toggle buttons top-right).

**Each camera cell:**
- Video stream (HLS.js for browser, fallback to thumbnail refresh every 2s)
- Camera name label (top-left overlay)
- Status indicator (top-right, pulsing if online)
- Live detection overlay (bounding boxes drawn via canvas positioned over video)
- Bottom overlay: last plate detected + timestamp

**Right sidebar:**
- Title "Live Alerts" with badge count
- Real-time stream via WebSocket
- Each alert card: plate + camera + time + priority
- Scroll as new ones arrive; max 50 in list

**Top controls:**
- Camera selection filter (multi-select)
- Grid layout toggle
- "Full Alert View" button (navigates to Alerts page)

### 6.4 Investigation Page

**Purpose:** Search for a specific plate and investigate all sightings.

**Layout:** Top = search form. Below = results split: timeline (left) + map (right).

**Search form:**
- Plate number input (auto-format to uppercase)
- Date range picker (from / to)
- Camera filter (optional)
- Vehicle type filter (optional)
- "Search" button

**Results — Timeline (left panel, 420px):**
- Sorted by time (newest first)
- Each sighting row: Camera badge, time, plate, confidence, vehicle type, thumbnail
- Click row = highlight on map + expand detail
- Expanded detail: frame image, plate crop, all metadata, "Preserve Evidence" button

**Results — Map (right panel):**
- Leaflet map, dark tiles (CartoDB dark matter)
- Camera location markers (blue pins)
- Sighting markers (numbered in sequence order)
- Journey path drawn as polyline when 2+ sightings
- Click marker = popup with plate + time + camera info

**Journey summary bar** (shows when 2+ sightings):
- "Plate seen on N cameras over X hours"
- Start time → End time
- Estimated distance traveled
- "View Full Journey" button

### 6.5 Vehicle Journey Page

**Access:** From investigation results or correlation list.
**Purpose:** Full reconstruction of one vehicle's movement.

**Layout:** Left = vertical timeline. Right = full map.

**Timeline:**
- Each stop is a box with: camera name, location name, time, duration stopped (if parked), plate confidence
- Boxes connected by lines with travel time annotation between them
- First/last stops marked distinctly
- "Generate Evidence Report" button at bottom

**Map:**
- Animated path (dashed line animates along route on load — ONE animation, not on loop)
- All camera locations shown
- Visited cameras highlighted with sequence numbers
- Non-visited cameras shown as dim markers

### 6.6 Evidence Vault Page

**Layout:** Filters top, evidence grid below.

**Filters:** Case ID, plate text, date range, camera, verified/unverified toggle.

**Evidence grid:**
- Cards in a 4-column masonry-ish grid
- Each card: thumbnail image, plate (license plate display component), camera, timestamp, confidence badge, hash status badge (Verified / Unverified / Tampered)
- Card footer: "View" + "Export" + "Audit Trail" buttons

**Evidence detail (modal):**
- 3-panel layout: original frame | vehicle crop | plate crop
- All three images displayed
- Full metadata table (all fields listed)
- SHA-256 hash for each file (displayed in --font-mono)
- "Verify Integrity" button (calls /verify endpoint, shows result inline)
- Chain of Custody section: ordered list of all audit actions
- "Export Evidence Package" button (triggers download of ZIP with images + metadata JSON + verification report)

### 6.7 Watchlist Page

**Layout:** Table of watchlist entries (left) + "Add to Watchlist" form (right sidebar, 320px).

**Table columns:** Plate | Priority | Reason | Added By | Added At | Expires | Status | Actions.
Priority column: color-coded badge (critical=red, high=orange, medium=yellow, low=gray).

**Add form:**
- Plate number input
- Priority select (critical / high / medium / low)
- Reason textarea
- Expiry date (optional)
- Notes (optional)
- Submit button

**Actions column per row:**
- "View Alerts" (opens alert history modal)
- "Edit" (opens edit modal)
- "Deactivate" (with confirmation)

### 6.8 Alerts Page

**Layout:** Full-width table with filter bar above.

**Filters:** Status (active/acknowledged/dismissed), Priority, Camera, Date range, Plate search.

**Table columns:** Priority | Plate | Camera | Triggered At | Watchlist Reason | Status | Actions.

**Row click:** Opens alert detail panel (right drawer, 400px wide).

**Alert detail drawer:**
- Plate number large, with license plate display
- Match reason (from watchlist entry)
- Camera info + thumbnail
- Sighting detail (confidence, time, vehicle type)
- Frame image
- Action buttons: "Acknowledge", "Dismiss", "View Evidence", "View Journey"
- AI confidence breakdown

### 6.9 Camera Registry Page

**Layout:** Table + map side-by-side. Table left (60%), map right (40%).

**Table columns:** Camera ID | Name | Location | Protocol | Status | Last Seen | Sightings Today | Actions.

**Actions:** "Test Connection", "View Feed", "Edit", "Deactivate".

**Map:** All cameras plotted. Status-colored markers. Click = camera info popup.

**Add Camera button:** Opens modal with form: Camera ID, Name, RTSP URL, HLS URL, Location (geocode input), Protocol, Codec, Resolution, FPS.

### 6.10 Analytics Page

**Layout:** Dashboard-style, multiple charts.

**Row 1:** 4 stat cards (same as dashboard, but with trend arrows).

**Row 2:** 
- "Detection Activity" bar chart (7d, detections per day)
- "Camera Performance" bar chart (detections per camera, sorted)

**Row 3:**
- "Hourly Heatmap" — Recharts grid showing hour (x) vs camera (y) with cell color intensity = sighting count
- "Top Plates" table — Most seen plates with count, last seen time, watchlist status badge

**Row 4:**
- "Alert Response Time" histogram
- "ANPR Confidence Distribution" — histogram of confidence scores

---

## SECTION 7: AI PIPELINE SPECIFICATION

### 7.1 Processing Flow (per frame)
```python
# In pipeline.py
async def process_frame(frame: np.ndarray, camera_id: str, timestamp: datetime):
    # 1. Vehicle Detection (YOLOv8)
    detections = detector.detect(frame)  # Returns list of Detection objects
    
    # 2. Per-detection processing
    for det in detections:
        # 3. DeepSORT tracking (assign track ID)
        track_id = tracker.update(det.bbox, det.confidence, frame)
        
        # 4. Crop vehicle ROI
        vehicle_crop = frame[det.y:det.y+det.h, det.x:det.x+det.w]
        
        # 5. ANPR on vehicle crop
        plate_result = anpr.read_plate(vehicle_crop)
        
        # 6. Save sighting to DB
        sighting = await save_sighting(
            camera_id=camera_id,
            frame_ts=timestamp,
            bbox=det.bbox,
            vehicle_class=det.class_name,
            vehicle_conf=det.confidence,
            plate_text=plate_result.text,
            plate_conf=plate_result.confidence,
            track_id=track_id,
            frame=frame,
            vehicle_crop=vehicle_crop,
            plate_crop=plate_result.crop
        )
        
        # 7. Check watchlist
        await check_watchlist(plate_result.text, sighting)
        
        # 8. Broadcast via WebSocket
        await broadcast_sighting(sighting)
```

### 7.2 ANPR Pipeline
```
Input: Vehicle crop (numpy array)
1. Resize to standard height (240px)
2. Run license plate detector (YOLOv8-plate or CRAFT)
3. Crop plate region
4. Pre-process: grayscale, denoise, threshold
5. PaddleOCR read
6. Post-process: 
   - Convert to uppercase
   - Remove spaces
   - Apply India plate regex: [A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}
   - Flag non-matching as "unformatted"
7. Return PlateResult(text, confidence, crop)
```

### 7.3 Cross-Camera Correlation (correlation_service.py)
```python
# Run periodically (every 5 minutes) and on-demand
async def correlate_vehicle(plate_text: str, window_hours: int = 24):
    """
    Find all sightings of a plate across different cameras
    and build a journey correlation.
    """
    sightings = await get_sightings_by_plate(plate_text, window_hours)
    
    if len(sightings) < 2:
        return None  # Need minimum 2 cameras
    
    # Filter to sightings from DISTINCT cameras
    distinct_cameras = get_distinct_cameras(sightings)
    if len(distinct_cameras) < 2:
        return None
    
    # Sort by timestamp
    sightings_sorted = sorted(sightings, key=lambda s: s.frame_ts)
    
    # Validate time feasibility (vehicle can't teleport)
    valid_path = validate_journey_feasibility(sightings_sorted)
    
    # Build correlation
    correlation = Correlation(
        plate_text=plate_text,
        sighting_ids=[s.id for s in valid_path],
        camera_ids=[s.camera_id for s in valid_path],
        start_ts=valid_path[0].frame_ts,
        end_ts=valid_path[-1].frame_ts,
        correlation_method='plate_match',
        confidence=calculate_correlation_confidence(valid_path)
    )
    
    return await save_correlation(correlation)
```

### 7.4 Evidence Generation (evidence_service.py)
```python
async def preserve_evidence(sighting_id: UUID, alert_id: UUID = None, case_id: str = None):
    sighting = await get_sighting(sighting_id)
    
    # Read files
    frame_bytes = read_file(sighting.frame_path)
    vehicle_bytes = read_file(sighting.crop_path)
    plate_bytes = read_file(sighting.plate_crop_path)
    
    # Compute SHA-256 hashes
    frame_hash = sha256(frame_bytes)
    vehicle_hash = sha256(vehicle_bytes)
    plate_hash = sha256(plate_bytes)
    
    # Build metadata JSON
    metadata = {
        "case_id": case_id,
        "plate_text": sighting.plate_text,
        "camera_id": str(sighting.camera_id),
        "frame_timestamp": sighting.frame_ts.isoformat(),
        "ai_confidence": sighting.plate_conf,
        "vehicle_class": sighting.vehicle_class,
        "bbox": [sighting.bbox_x, sighting.bbox_y, sighting.bbox_w, sighting.bbox_h],
        "ai_model": "YOLOv8+PaddleOCR",
        "preserved_at": datetime.utcnow().isoformat(),
    }
    metadata_json = json.dumps(metadata, sort_keys=True)
    metadata_hash = sha256(metadata_json.encode())
    
    # Save evidence record
    evidence = Evidence(
        case_id=case_id,
        sighting_id=sighting_id,
        alert_id=alert_id,
        plate_text=sighting.plate_text,
        camera_id=sighting.camera_id,
        frame_ts=sighting.frame_ts,
        frame_path=sighting.frame_path,
        vehicle_crop_path=sighting.crop_path,
        plate_crop_path=sighting.plate_crop_path,
        frame_hash=frame_hash,
        vehicle_hash=vehicle_hash,
        plate_hash=plate_hash,
        metadata_json=metadata_json,
        metadata_hash=metadata_hash,
        ai_confidence=sighting.plate_conf,
    )
    return await save_evidence(evidence)
```

---

## SECTION 8: MOCK DATA SPECIFICATION

Use this mock data when the sandbox camera feed is unavailable. The UI must look fully functional.

### 8.1 Mock Cameras (10 cameras)
```
CAM01 - MG Road Junction, Ahmedabad (23.0258, 72.5839)
CAM02 - Sardar Bridge Entry, Ahmedabad (23.0152, 72.5794)
CAM03 - Vastrapur Lake Gate, Ahmedabad (23.0436, 72.5283)
CAM04 - SG Highway Toll, Gandhinagar (23.0732, 72.5038)
CAM05 - Gandhinagar Sector 15, Gandhinagar (23.2156, 72.6394)
CAM06 - GIFT City Entry, Gandhinagar (23.1573, 72.6787)
CAM07 - Sabarmati Riverfront, Ahmedabad (23.0395, 72.5878)
CAM08 - GNLU Gate, Gandhinagar (23.1891, 72.6542)
CAM09 - Chiloda Circle, Gandhinagar (23.2743, 72.6122)
CAM10 - Kudasan Junction (23.2264, 72.6511)
```

### 8.2 Mock Plates (realistic Indian format)
```
GJ01AB1234 - In watchlist (priority: high, reason: suspected vehicle in fraud case)
GJ05CD5678 - Clean
MH12EF9012 - Clean
RJ14GH3456 - In watchlist (priority: critical, reason: reported stolen vehicle)
GJ18IJ7890 - Clean
DL3CKL2233 - Clean
GJ01MN4455 - Clean
UP32PQ6677 - In watchlist (priority: medium)
GJ09RS8899 - Clean
HR26TU1122 - Clean
```

### 8.3 Mock Sighting Events (for live feed simulation)
Generate sightings every 3-5 seconds randomly across cameras. Use above plates.
Confidence range: 0.78 to 0.99 for regular plates, 0.65-0.85 for watchlist hits.

---

## SECTION 9: STREAM PROCESSING SPECIFICATION

### 9.1 RTSP Reader (rtsp_reader.py)
```python
class RTSPReader:
    """
    Reads frames from an RTSP stream robustly.
    Handles: connection failures, frame gaps, H.264/H.265, variable FPS.
    """
    
    def __init__(self, url: str, camera_id: str):
        self.url = url
        self.camera_id = camera_id
        self.cap = None
        self.is_running = False
        self.reconnect_delay = 5  # seconds
        self.max_reconnect = 10
        self.fps_target = 5  # Process 5 FPS regardless of source FPS
        
    async def start(self):
        self.is_running = True
        while self.is_running:
            try:
                await self._connect()
                await self._read_loop()
            except Exception as e:
                logger.error(f"[{self.camera_id}] Stream error: {e}")
                await asyncio.sleep(self.reconnect_delay)
    
    async def _connect(self):
        # Use FFmpeg subprocess for reliable RTSP
        self.cap = cv2.VideoCapture(
            self.url,
            cv2.CAP_FFMPEG
        )
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
        # Set H.264 codec preference
        if not self.cap.isOpened():
            raise ConnectionError(f"Cannot open {self.url}")
    
    async def _read_loop(self):
        frame_interval = 1.0 / self.fps_target
        last_frame_time = 0
        
        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                raise ConnectionError("Frame read failed")
            
            now = time.time()
            if now - last_frame_time >= frame_interval:
                # Use PTS timestamp if available, else wall clock
                pts = self.cap.get(cv2.CAP_PROP_POS_MSEC)
                timestamp = datetime.utcnow()  # fallback
                
                await frame_queue.put({
                    'frame': frame,
                    'camera_id': self.camera_id,
                    'timestamp': timestamp
                })
                last_frame_time = now
            
            await asyncio.sleep(0)  # yield to event loop
```

### 9.2 Stream Manager (stream_manager.py)
```python
class StreamManager:
    """Manages all active camera streams."""
    
    def __init__(self):
        self.readers: Dict[str, RTSPReader] = {}
        self.tasks: Dict[str, asyncio.Task] = {}
        self.status: Dict[str, str] = {}
    
    async def start_camera(self, camera: Camera):
        if camera.id in self.readers:
            await self.stop_camera(camera.id)
        
        reader = RTSPReader(camera.rtsp_url, camera.camera_id)
        self.readers[camera.id] = reader
        task = asyncio.create_task(reader.start())
        self.tasks[camera.id] = task
        self.status[camera.id] = 'starting'
    
    async def stop_camera(self, camera_id: str):
        if camera_id in self.readers:
            self.readers[camera_id].is_running = False
        if camera_id in self.tasks:
            self.tasks[camera_id].cancel()
    
    async def start_all(self):
        cameras = await get_all_active_cameras()
        for cam in cameras:
            await self.start_camera(cam)
    
    def get_status(self) -> Dict[str, str]:
        return self.status
```

---

## SECTION 10: DOCKER CONFIGURATION

### 10.1 docker-compose.yml
```yaml
version: '3.9'

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: sentrax
      POSTGRES_USER: sentrax
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sentrax"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  backend:
    build: ./backend
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - media_storage:/app/media
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  celery:
    build: ./backend
    env_file: .env
    depends_on:
      - backend
      - redis
    command: celery -A app.tasks worker --loglevel=info -c 4
    volumes:
      - ./backend:/app
      - media_storage:/app/media

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  media_storage:
```

### 10.2 .env.example
```
# Database
DB_PASSWORD=sentrax_secure_pass
DATABASE_URL=postgresql+asyncpg://sentrax:sentrax_secure_pass@postgres:5432/sentrax

# Redis
REDIS_URL=redis://redis:6379/0

# Auth
JWT_SECRET=change-this-to-a-long-random-secret-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

# AI Models
YOLO_MODEL_PATH=/app/models/yolov8n.pt
PLATE_MODEL_PATH=/app/models/plate_detector.pt

# Media storage
MEDIA_ROOT=/app/media
MEDIA_URL=http://localhost:8000/media

# Default admin
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=SentraxAdmin2024!

# Sandbox Camera (fallback)
SANDBOX_RTSP_URL=rtsp://demo:demo@ipvmdemo.dyndns.org:554/onvif-media/media.amp
SANDBOX_HLS_URL=https://demo.unified-streaming.com/k8s/live/scte35.isml/.m3u8
```

---

## SECTION 11: BUILD ORDER (MANDATORY SEQUENCE)

### Phase 1: Foundation
1. `docker-compose.yml` + `.env.example`
2. Backend `requirements.txt`
3. Backend `core/config.py` (reads all env vars)
4. Backend `core/database.py` (async SQLAlchemy engine)
5. Backend `core/redis.py`
6. Backend `models/` (all 8 models)
7. Alembic setup + first migration
8. Backend `core/security.py` (JWT + bcrypt)
9. Backend `api/v1/auth.py` + test login
10. Frontend Vite project init + all dependencies
11. Frontend `index.css` with all CSS variables
12. Frontend `types/index.ts` (all TypeScript interfaces)

### Phase 2: Core Backend APIs
13. Camera CRUD API + service
14. Sighting model + API
15. Watchlist API
16. Alert API
17. Evidence API
18. Analytics API

### Phase 3: Frontend Layout & Auth
19. Login page (complete, no placeholder)
20. AppShell + Sidebar + TopBar
21. All UI primitive components (Button, Badge, Card, etc.)
22. React Query setup + all API client functions

### Phase 4: Core Pages
23. Dashboard page (complete with mock data)
24. Live Monitor page (with WebSocket)
25. Investigation page (search + timeline + map)
26. Vehicle Journey page

### Phase 5: Operations Pages
27. Evidence Vault page (full detail modal)
28. Watchlist page
29. Alerts page (with drawer)
30. Camera Registry page

### Phase 6: Analytics
31. Analytics page (all charts)

### Phase 7: AI Pipeline
32. `ai/detector.py` (YOLOv8 wrapper)
33. `ai/anpr.py` (PaddleOCR wrapper)
34. `ai/tracker.py` (DeepSORT wrapper)
35. `ai/pipeline.py` (orchestrator)
36. `ingestion/rtsp_reader.py`
37. `ingestion/stream_manager.py`
38. `ingestion/frame_processor.py`

### Phase 8: Advanced Features
39. Cross-camera correlation service
40. Evidence generation + SHA-256 hashing
41. Audit logging middleware
42. WebSocket real-time broadcasting
43. SSE alert streaming

### Phase 9: Polish
44. Error handling everywhere
45. Loading states + skeletons
46. Empty states (investigative tone)
47. Mobile responsive (tablet minimum)
48. Dockerfile for backend + frontend

---

## SECTION 12: SPECIFIC IMPLEMENTATION NOTES

### 12.1 Plate Number Formatting
```typescript
// utils/format.ts
export function formatPlate(raw: string): string {
  // Remove spaces, convert to uppercase
  return raw.replace(/\s/g, '').toUpperCase();
}

export function isIndianPlate(plate: string): boolean {
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(plate);
}

export function formatTimestamp(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy HH:mm:ss');
}

export function formatConfidence(conf: number): string {
  return `${(conf * 100).toFixed(1)}%`;
}

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}
```

### 12.2 WebSocket Connection Hook
```typescript
// hooks/useWebSocket.ts
export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const handlers = useRef<Map<string, Function>>(new Map());

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);
      ws.current.onopen = () => setConnected(true);
      ws.current.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000); // Auto-reconnect after 3s
      };
      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const handler = handlers.current.get(msg.type);
        if (handler) handler(msg.payload);
      };
    };
    connect();
    return () => ws.current?.close();
  }, [url]);

  const on = useCallback((type: string, handler: Function) => {
    handlers.current.set(type, handler);
  }, []);

  return { connected, on };
}
```

### 12.3 Alert Store (Zustand)
```typescript
// store/alertStore.ts
interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 100), // Keep max 100
    unreadCount: state.unreadCount + 1,
  })),
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  clearAll: () => set({ alerts: [], unreadCount: 0 }),
}));
```

### 12.4 Evidence Export Package
The export must produce a ZIP file containing:
```
evidence_[plate]_[timestamp]/
├── MANIFEST.json          # Case info, export timestamp, user
├── frame_original.jpg     # Raw CCTV frame
├── vehicle_crop.jpg       # Detected vehicle crop
├── plate_crop.jpg         # License plate crop
├── metadata.json          # All sighting metadata
├── hashes.json            # SHA-256 for each file
├── verification_report.txt # Human-readable integrity report
└── chain_of_custody.json  # Audit trail
```

### 12.5 Empty States (copy for each page)
```
Investigation - no search yet:
  Headline: "Start your investigation"
  Sub: "Enter a vehicle plate number to trace its movement across the camera network."
  Icon: SearchIcon

Investigation - no results:
  Headline: "No sightings found"
  Sub: "This plate was not detected in the selected time window. Try expanding the date range or check if all cameras are online."

Evidence Vault - empty:
  Headline: "No preserved evidence"
  Sub: "Evidence is automatically preserved when a watchlist alert is acknowledged, or can be manually preserved from any sighting."

Alerts - no active alerts:
  Headline: "All clear"
  Sub: "No active watchlist alerts. The system is monitoring all registered cameras."

Live Monitor - no cameras:
  Headline: "No cameras configured"
  Sub: "Add cameras in the Camera Registry to begin live monitoring."
```

### 12.6 SENTRAX Logo (SVG — inline)
```svg
<svg viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Shield icon -->
  <path d="M8 4L16 2L24 4V14C24 19.5228 20 24 16 26C12 24 8 19.5228 8 14V4Z" 
        fill="none" stroke="#0E7FE0" stroke-width="1.5"/>
  <path d="M12 13L15 16L20 11" stroke="#0E7FE0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Wordmark -->
  <text x="30" y="21" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#E8EFF7" letter-spacing="0.05em">SENTRAX</text>
</svg>
```

---

## SECTION 13: ERROR HANDLING RULES

### 13.1 Frontend Error Handling
Every API call MUST have:
```typescript
try {
  const data = await apiCall();
  // handle success
} catch (error) {
  if (error.status === 401) {
    // redirect to login
  } else if (error.status === 404) {
    // show "not found" state inline
  } else {
    toast.error('Operation failed. Please try again.');
    console.error(error);
  }
}
```

### 13.2 Backend Error Handling
All exceptions must be caught and return proper HTTPException:
```python
@router.get("/cameras/{id}")
async def get_camera(id: UUID, db: AsyncSession = Depends(get_db)):
    try:
        camera = await camera_service.get_by_id(db, id)
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        return camera
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get camera {id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### 13.3 Stream Error Handling
If an RTSP stream fails:
1. Update camera status to "warning" in DB
2. Broadcast `cam_status` event via WebSocket
3. Retry connection every 5 seconds
4. After 10 failed retries, set status to "offline"
5. Camera card in UI shows "NO SIGNAL" state

---

## SECTION 14: PERFORMANCE REQUIREMENTS

- Page load (initial): <2 seconds
- Search results: <500ms (uses PostgreSQL index on plate_text)
- Live feed latency: <3 seconds (HLS buffer)
- WebSocket message delivery: <100ms
- Evidence export: <5 seconds for single item
- Alert generation after plate match: <2 seconds

---

## SECTION 15: ACCESSIBILITY & RESPONSIVE RULES

- Minimum supported width: 1024px (this is a desktop/tablet professional tool)
- All interactive elements: keyboard focusable
- Focus visible: 2px solid --accent-primary outline
- Status colors are NEVER the only differentiator (always + icon or text)
- `aria-label` on all icon-only buttons
- All images have `alt` text

---

## ✅ COMPLETION CHECKLIST

Before marking any module complete, verify:
- [ ] No TypeScript errors (strict mode)
- [ ] No `console.error` unhandled in production paths
- [ ] All API calls have loading + error states in UI
- [ ] All forms validate before submit
- [ ] All database queries use parameterized inputs (no SQL injection)
- [ ] All file paths use `os.path.join` (no string concatenation)
- [ ] JWT token verified on every protected endpoint
- [ ] All SHA-256 hashes stored as lowercase hex
- [ ] Camera credentials not logged
- [ ] Evidence files not publicly accessible without auth

---

*Document version: 1.0 — Gujarat Sentinel Hackathon — CipherNetra / SENTRAX*
*This document is self-contained. Build from this document alone.*
