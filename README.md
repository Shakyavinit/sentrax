# SENTRAX — Gujarat Sentinel CCTV Intelligence & Digital Forensics Platform

SENTRAX is a hybrid law-enforcement intelligence, automated ANPR tracking, and digital forensics system developed for state-level surveillance and crime prevention (Gujarat Sentinel Hackathon).

---

## 🚀 Milestone 1: Platform Foundation & Infrastructure

### Architectural Components
- **Backend**: FastAPI + Pydantic v2 + SQLAlchemy (Modular REST API + WebSocket Hub)
- **Database**: PostgreSQL 16 + PostGIS 3.4 spatial geometry
- **Security & Integrity**: JWT authentication, Role-Based Access Control (RBAC), and SHA-256 evidence integrity hashing
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS (Law Enforcement Command Center)
- **Mapping**: Leaflet + OpenStreetMap geo-spatial surveillance telemetry
- **AI Core (Milestone 1 Interfaces)**: Abstract detector, OCR, and unified multi-source video ingestion contracts (MP4 / RTSP) ready for Milestone 2 YOLO & PaddleOCR integration
- **Gateway & Single-Port Access**: Nginx proxy serving frontend and routing `/api/` and `/ws/` on port 80

---

## 🛠️ Quickstart with Docker Compose

Ensure Docker and Docker Compose are installed:

```bash
# 1. Clone or navigate to the repository
cd Police

# 2. Copy environment variables (pre-configured for local dev)
cp .env.example .env

# 3. Launch all services with a single command
docker compose up -d --build
```

---

## 🌐 Endpoints & Credentials

- **Command Center Dashboard**: [http://localhost](http://localhost) (Port 80)
- **Backend API Documentation**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health) or `http://localhost/api/v1/health`
- **WebSocket Alert Broadcast**: `ws://localhost/api/v1/ws/alerts`

### Default Root Admin Credentials
- **Email**: `command@sentrax.gujarat.gov.in`
- **Password**: `SentinelAdmin2026!`
- **Role**: `ADMIN`
- **Badge**: `GJ-HQ-001`

---

## 📁 Project Structure

```
.
├── docker-compose.yml          # One-command orchestration for DB, API, and Frontend
├── .env.example                # Canonical environment template
├── .gitignore                  # Git exclusions
├── README.md                   # System documentation
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI entrypoint, lifespan DB seed, router mounts
│       ├── core/               # Configuration, PostGIS database session, JWT security, WebSockets
│       ├── models/             # SQLAlchemy ORM (Camera, User, Watchlist, Sighting, Alert, Evidence, Audit)
│       ├── schemas/            # Pydantic validation schemas
│       └── api/v1/             # REST endpoints (auth, cameras, watchlist, sightings, alerts, evidence, audit, ws)
├── ai/
│   ├── interfaces.py           # Abstract BaseDetector, BasePlateOCR, BasePipeline
│   ├── pipeline.py             # Modular pipeline contract stub ready for YOLOv8/v11
│   └── ingestion/
│       └── stream_reader.py    # Unified frame capture for MP4 upload, local MP4, and RTSP streams
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              # Reverse proxy gateway routing UI + API + WS
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx             # Command center routing & navigation
│       ├── api/                # Authenticated Axios client
│       ├── context/            # AuthContext & WebSocketContext
│       └── pages/              # Real state views (Overview, Cameras, Live, Map, Search, Watchlist, Alerts, Vault, Audit, Admin)
└── data/
    ├── videos/                 # Ingestion storage for raw video feeds / uploads
    └── evidence/               # SHA-256 cryptographically sealed forensic evidence vault
```

---

## 🔒 Forensic Verification Model
Forensic snapshots and video segments stored in `data/evidence/` are assigned an immutable SHA-256 hash upon ingestion. At any time, court officials or investigators can invoke the `/api/v1/evidence/{uuid}/verify` endpoint to recalculate the disk binary hash against the immutable ledger and detect tampering.
