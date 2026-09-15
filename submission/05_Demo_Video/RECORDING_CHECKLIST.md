# SENTRAX — Video Recording & Rehearsal Checklist
**System**: SENTRAX (AI-Powered CCTV Intelligence & Digital Forensics Platform)  
**Team**: CipherNetra  

---

## Pre-Recording Verification Checklist

- [x] **Docker Services Verified**:
  - PostgreSQL / PostGIS 15 container healthy (`sentrax-postgres-1`)
  - Redis 7 container healthy (`sentrax-redis-1`)
  - FastAPI backend healthy on port 8002 (`sentrax-backend-1`)
  - Celery 4-prefork worker active with 7 registered background tasks (`sentrax-celery-1`)
  - Frontend built and serving on port 8080 / 3002 (`sentrax-frontend-1`)
- [x] **Database State Verified**:
  - 10 active cameras loaded across Ahmedabad & Gandhinagar grid
  - 14,107 historical sightings available for immediate search
  - 8 active watchlist entries loaded (`GJ01AB1234` priority: High)
  - 791 forensic evidence records available for Section 65B audit
- [x] **Background Telemetry Verified**:
  - `GET /api/v1/system/background-status` returns `operational`
  - All 7 workers in `completed` status with zero lingering errors
  - Active AI Camera limit displayed as 4 streams throttled
- [x] **Browser Environment Setup**:
  - Chrome / Chromium browser opened at 1920x1080 resolution
  - Zoom set to 100% (clean typography, crisp dark theme)
  - Audio microphone level tested (no room echo or clipping)

---

## Live Recording Route & Click Path

1. **Start Screen**: `http://localhost:8080/` (or port 3002)
   - Show KPI metrics & Background Operations widget.
   - Click "Poll Status" or "Run" on Camera Health Worker to demonstrate real-time reactivity.
2. **Alert Trigger**: Click "▶ Demo Mode" on top header.
   - Wait 1.8s for critical toast alert banner.
3. **Investigation & Journey**:
   - Follow prompt to `/investigation?plate=GJ01AB1234`.
   - Click "Trace Route" to open `/journey?plate=GJ01AB1234`.
   - Zoom in on Leaflet map showing the 5 junction stops.
4. **Evidence Vault**:
   - Navigate to `/evidence`.
   - Open package for `GJ01AB1234`.
   - Toggle to "SHA-256 Hashes" tab (highlight verified hashes).
   - Toggle to "Section 65B Certificate" tab (highlight digital certificate).
5. **AI Copilot**:
   - Open Copilot drawer on the right.
   - Showcase quick query response.
