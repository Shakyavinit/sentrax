# SENTRAX — End-to-End System Workflow
**System**: SENTRAX (AI-Powered CCTV Intelligence & Digital Forensics Platform)  
**Team**: CipherNetra  
**Hackathon**: Gujarat Sentinel Hackathon / SIH  
**Version**: 1.0.0  

---

## 1. End-to-End Operational Flowchart

```mermaid
flowchart TD
    subgraph INGESTION ["1. CCTV Stream Ingestion Layer"]
        C1["CCTV Camera 1<br>(MG Road)"] -->|RTSP / HLS| IGW["Ingestion Gateway<br>(OpenCV / Stream Pull)"]
        C2["CCTV Camera 2<br>(Sardar Bridge)"] -->|RTSP / HLS| IGW
        C3["CCTV Camera 3<br>(SG Highway)"] -->|RTSP / HLS| IGW
        C4["CCTV Camera N<br>(Urban Grid)"] -->|RTSP / HLS| IGW
        IGW -->|Check Active Limit| LIM{"Active Cameras<br><= 4 Limit?"}
        LIM -->|Yes| SMAP["Frame Extraction &<br>Sampling"]
        LIM -->|No| QUE["Queue / Delay Sample"]
    end

    subgraph REDIS ["2. Distributed Broker (Redis 7)"]
        SMAP -->|Publish Task| R_CELERY["celery default queue"]
        SMAP -->|Publish Task| R_FRAMES["frames queue"]
    end

    subgraph WORKERS ["3. Distributed Celery Workers (4 Prefork Processes)"]
        R_CELERY --> W1["Worker 1: Camera Health<br>- Ping & Latency<br>- Credential Redaction"]
        R_CELERY --> W2["Worker 2: AI Processing<br>- YOLOv8 Vehicle Detection<br>- Plate Region Cropping"]
        R_CELERY --> W3["Worker 3: ANPR Consensus<br>- Multi-Frame OCR Voting<br>- Sharpness & Confidence Filter"]
        R_CELERY --> W4["Worker 4: Watchlist Correlation<br>- Exact & Fuzzy Match<br>- 10-Min Debounce Deduplication"]
        R_CELERY --> W5["Worker 5: Cross-Camera Correlation<br>- Requires >= 2 Distinct Cams<br>- Speed Feasibility Filter"]
        R_CELERY --> W6["Worker 6: Evidence Integrity<br>- Real Byte SHA-256 Recalculation<br>- Tamper Detection Flag"]
        R_CELERY --> W7["Worker 7: Research Scout<br>- Governed by agent_ops<br>- Read-Only Prod Access"]
    end

    subgraph STORAGE ["4. Core Storage & Spatial Intelligence"]
        W2 -->|Insert Sighting| DB_PG[("PostgreSQL 15 + PostGIS<br>- cameras<br>- sightings<br>- correlations<br>- watchlist<br>- audit_log")]
        W3 -->|Update Confidence| DB_PG
        W4 -->|Insert Deduplicated Alert| DB_PG
        W5 -->|Generate LineString Trajectory| DB_PG
        W6 -->|Store Byte SHA-256 Hashes| DB_PG
        W6 -->|Save Media Packages| FS[("Forensic Vault Storage<br>- Frame JPEG<br>- Vehicle Crop<br>- Plate Crop<br>- Section 65B Cert")]
    end

    subgraph REALTIME ["5. Alert Broadcasting & Real-Time Events"]
        W4 -->|Publish Alert Event| R_PUB["Redis Pub/Sub Channel<br>('alerts_channel')"]
        R_PUB -->|SSE / WebSockets| API_STREAM["FastAPI Event Stream Gateway"]
    end

    subgraph SOC ["6. Investigator Command Center (Frontend)"]
        API_STREAM --> UI_ALERTS["Live Alert Feed & Sound Notifications"]
        DB_PG -->|REST API Queries| UI_MAP["Interactive Journey Reconstruction Map"]
        DB_PG -->|REST API Queries| UI_STATUS["Background Operations Telemetry Widget"]
        FS -->|ZIP Download| UI_EVIDENCE["Section 65B Evidence Vault Modal"]
        DB_PG -->|Vector & Relational Context| COPILOT["Forensic AI Copilot (LLM Chat)"]
    end
```

---

## 2. Detailed Subsystem Sequence Workflows

### 2.1 Multi-Frame ANPR Consensus & Watchlist Alert Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Officer as SOC Investigator
    participant Cam as CCTV Camera Feed
    participant AI as Celery AI Worker
    participant OCR as ANPR Consensus Worker
    participant WL as Watchlist Worker
    participant Redis as Redis Pub/Sub
    participant DB as PostGIS Database
    participant UI as React Frontend

    Cam->>AI: Push Frame (1080p stream)
    AI->>AI: Detect vehicle bounding box (YOLOv8)
    AI->>OCR: Pass cropped plate samples
    OCR->>OCR: Positional character frequency voting
    OCR->>DB: Save Sighting (Plate: GJ01AB1234, Conf: 96%)
    OCR->>WL: Trigger Watchlist Check (Plate: GJ01AB1234)
    WL->>DB: Query active watchlist for plate
    DB-->>WL: Match found (Wanted: Serial Offender, Priority: High)
    WL->>DB: Check if alert exists in last 10 minutes (Debounce)
    alt No Recent Alert Exists
        WL->>DB: Insert new Alert (status: active)
        WL->>Redis: Publish alert to 'alerts_channel'
        Redis-->>UI: Real-time broadcast
        UI-->>Officer: Audio-visual alert banner popup
    else Alert Created Within 10 Mins
        WL->>WL: Suppress duplicate alert (Deduplication Logged)
    end
```

### 2.2 Cross-Camera Journey & Speed Feasibility Verification

```mermaid
sequenceDiagram
    autonumber
    participant UI as React Map Component
    participant Backend as FastAPI Vehicle Service
    participant DB as PostGIS Spatial Database
    participant Worker as Cross-Camera Worker

    UI->>Backend: Request Journey (Plate: GJ01AB1234, Window: 24h)
    Backend->>Worker: Trigger Spatial Reconstruction
    Worker->>DB: Query sightings for GJ01AB1234 ordered by timestamp
    DB-->>Worker: Return [Sighting 1 (CAM01), Sighting 2 (CAM02), Sighting 3 (CAM04)]
    Worker->>Worker: Verify Invariant: Distinct Cameras count >= 2
    alt Distinct Cameras < 2
        Worker-->>Backend: Abort: Insufficient distinct cameras for trajectory
    else Distinct Cameras >= 2
        loop For each consecutive sighting pair (S_i, S_i+1)
            Worker->>Worker: Calculate Haversine distance (d)
            Worker->>Worker: Calculate transit duration (dt)
            Worker->>Worker: Compute speed v = d / dt
            alt v > 200 km/h
                Worker->>Worker: Flag anomaly (Speed violation / cloned plate)
            else v <= 200 km/h
                Worker->>Worker: Append to valid trajectory
            end
        end
        Worker->>DB: Save PostGIS LINESTRING and correlation confidence
        Worker-->>Backend: Return verified journey waypoints
        Backend-->>UI: Render interactive map polyline with timestamps & speeds
    end
```

### 2.3 Forensic Evidence Capture & Section 65B Audit Trail

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Forensic Officer
    participant UI as Evidence Vault Page
    participant Service as Evidence Service
    participant Worker as Evidence Integrity Worker
    participant Disk as Media Storage Volume
    participant DB as PostgreSQL Database

    Officer->>UI: Click "Preserve Evidence" on Sighting
    UI->>Service: POST /api/v1/evidence/preserve
    Service->>Disk: Read full frame and plate crop images
    Service->>Service: Compute SHA-256 hash on raw file bytes
    Service->>DB: Insert Evidence Record (with SHA-256 hashes)
    Service->>DB: Append immutable entry to AuditLog
    Service-->>UI: Evidence preserved with certificate manifest

    Note over Worker,Disk: Automated Periodic / On-Demand Integrity Scan
    Worker->>DB: Query stored evidence packages
    Worker->>Disk: Read file bytes from disk
    Worker->>Worker: Recalculate SHA-256 hash
    Worker->>Worker: Compare calculated hash vs DB stored hash
    alt Hash Matches
        Worker->>DB: Mark status: "Verified"
    else Hash Differs
        Worker->>DB: Mark status: "Tampered" & raise security alert
    end

    Officer->>UI: Click "Download Section 65B Package"
    UI->>Service: GET /api/v1/evidence/{id}/export-zip
    Service->>Service: Assemble ZIP (Images + Hashes + Section 65B PDF/JSON)
    Service-->>Officer: Download Court-Admissible ZIP Bundle
```
