# SENTRAX — High-Level Design (HLD) Document
**System**: SENTRAX (AI-Powered CCTV Intelligence & Digital Forensics Platform)  
**Team**: CipherNetra  
**Hackathon**: Gujarat Sentinel Hackathon / SIH  
**Version**: 1.0.0  
**Classification**: Public Law Enforcement Technical Specification  

---

## 1. System Overview & Problem Statement

Urban traffic security across major junctions in Gujarat (e.g. Ahmedabad, Gandhinagar, Surat) is challenged by massive, heterogeneous CCTV stream volumes. Conventional systems suffer from:
1. **Siloed Camera Streams**: Disconnected RTSP feeds lacking cross-camera correlation.
2. **Delayed Plate Recognition**: Processing bottlenecks during peak traffic rush hours.
3. **Forensic Inadmissibility**: Surveillance footage exported without cryptographic hashes or Section 65B electronic evidence certification.
4. **False Positive Alert Fatigue**: Repetitive alerts flooding operators without debouncing.

**SENTRAX** resolves this with an end-to-end asynchronous architecture:
- Low-latency RTSP/HLS stream ingestion with OpenCV and hardware-accelerated decoders.
- Multi-frame ANPR consensus voting to filter camera blur, glare, and optical distortion.
- Distributed background operations via **Celery & Redis** enforcing strict throttling (`ACTIVE_AI_CAMERA_LIMIT`).
- Cross-camera spatio-temporal trajectory reconstruction using **PostGIS** geospatial indexing.
- Forensic Evidence Vault guaranteeing byte-level **SHA-256 chain-of-custody** and automated Indian Evidence Act **Section 65B Certificates**.

---

## 2. High-Level Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    GUJARAT CCTV SURVEILLANCE GRID                                   |
|   [CAM01: MG Road]      [CAM02: Sardar Bridge]      [CAM04: SG Highway]      [CAM06: GIFT City]    |
+-------------------+-------------------+--------------------+--------------------+------------------+
                    |                   |                    |                    |
                    v                   v                    v                    v
+----------------------------------------------------------------------------------------------------+
|                                      INGESTION & STREAM GATEWAY                                     |
|  - RTSP / HLS Pull Probes     - OpenCV VideoCapture Workers       - Stream Health Heartbeats       |
|  - Active Stream Throttling (`ACTIVE_AI_CAMERA_LIMIT` = 4 Concurrent Active AI Ingestion Streams)   |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                     REDIS 7 DISTRIBUTED BROKER                                      |
|  - Queue: `celery`          - Queue: `frames`             - Queue: `evidence`    - Pub/Sub Channels|
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                  CELERY PREFORK WORKER ENGINE (x4)                                  |
|                                                                                                    |
|  [1. Camera Health Worker]           Probes RTSP/HLS streams, measures latency, updates uptime     |
|  [2. AI Processing Worker]           Vehicle & Plate detection via YOLOv8, bounded queue sampling  |
|  [3. Multi-Frame ANPR Consensus]     Sharpness filter + positional character frequency voting      |
|  [4. Watchlist Correlation Worker]   Plate matching with 10-min debounce deduplication window       |
|  [5. Cross-Camera Correlation]       Reconstructs journey requiring >= 2 distinct camera IDs       |
|  [6. Evidence Integrity Worker]      Raw byte SHA-256 calculation, tamper audit against DB hash    |
|  [7. Research & Improvement Worker]  Autonomous scout running in agent_ops (read-only prod access) |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
+--------------------------------------------------+  +----------------------------------------------+
|       POSTGRESQL 15 + POSTGIS SPATIAL DATABASE   |  |          IMMUTABLE FORENSIC STORAGE          |
|  - `cameras`: Geolocation (lat/long) & RTSP URI  |  |  - Raw Full Frame JPEG Files                 |
|  - `sightings`: Timestamps, vehicle class, plate |  |  - Crop JPEG (Vehicle & Plate)               |
|  - `correlations`: ST_MakeLine Spatial Trajectory|  |  - Evidence Manifest JSON                    |
|  - `watchlist`: Wanted plates & alert priorities |  |  - Section 65B Forensic Certificate (PDF/ZIP)|
|  - `audit_log`: Immutable chain-of-custody logs  |  |  - Cryptographic Verification Engine         |
+------------------------+-------------------------+  +----------------------+-----------------------+
                         |                                                   |
                         +------------------------+--------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                       FASTAPI ASYNC REST API                                       |
|  - `/api/v1/cameras`      `/api/v1/vehicles`       `/api/v1/alerts`       `/api/v1/evidence`       |
|  - `/api/v1/system/background-status` (Real-time telemetry of all 7 Celery background workers)     |
|  - `/api/v1/copilot/chat` (LLM-powered natural language tactical forensic investigator copilot)   |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                REACT 18 + TAILWIND CSS INVESTIGATOR UI                             |
|  - Real-Time CCTV Monitor  - Multi-Camera Trajectory Map  - Section 65B Evidence Vault Modal        |
|  - Background Operations Health Widget                    - Tactical AI Copilot Chat Drawer         |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Subsystem Breakdown

### 3.1 Live Stream Ingestion & Health Probing
- Ingestion operates over RTSP (`rtsp://`) and HLS (`.m3u8` / `.mp4`).
- Stream connectivity is verified via HTTP HEAD requests (for HLS/HTTP streams) and TCP socket ping probes (for RTSP).
- Credential protection: All RTSP URLs with basic authentication (`rtsp://user:pass@host`) are automatically redacted to `rtsp://user:***@host` across database storage, API responses, and logs.

### 3.2 Resource Throttling (`ACTIVE_AI_CAMERA_LIMIT`)
- High-resolution video inference is resource-intensive. SENTRAX prevents hardware starvation by enforcing a strict active camera limit (`ACTIVE_AI_CAMERA_LIMIT = 4`).
- Real-time priority scheduling dynamically allocates AI inference capacity to high-traffic junctions and active alert corridors.

### 3.3 Multi-Frame ANPR Consensus Algorithm
Single-frame OCR frequently suffers from motion blur, headlight glare, and occlusion. SENTRAX solves this by accumulating detection crops across consecutive frames:
1. **Candidate Grouping**: Crops within a 2-second window for the same vehicle track are clustered.
2. **Positional Character Voting**: Each character position $i$ in the license plate string is evaluated across all candidates:
   $$\text{Char}_i = \text{mode}\left(\bigcup_{k=1}^N \text{Candidate}_{k}[i]\right)$$
3. **Consensus Confidence**:
   - $\ge 0.85$: Confirmed High-Confidence Registration.
   - $0.60 - 0.84$: Low-Confidence Flagged for Human Review.
   - $< 0.60$: Ambiguous reading, triggers multi-angle re-evaluation.

### 3.4 Watchlist Correlation & Deduplication Engine
- Compares normalized plates against active police watchlists.
- **Debounce Window**: To eliminate alert storms when a target vehicle is stuck in traffic or moving slowly across a camera field-of-view, alerts are deduplicated:
  $$\Delta t = t_{\text{current}} - t_{\text{last\_alert}} \ge 10\text{ minutes}$$
- Unique alert records are dispatched to Redis `alerts_channel` for real-time WebSocket / SSE broadcast to the SOC command center.

### 3.5 Cross-Camera Journey Reconstruction (PostGIS)
- Connects vehicle sightings across the urban camera network.
- **Invariant**: A valid cross-camera journey strictly requires $\ge 2$ distinct physical camera IDs.
- **Physical Feasibility Validation**: Calculates Haversine distance and transit velocity between consecutive sightings:
  $$v = \frac{d_{\text{haversine}}(C_1, C_2)}{\Delta t} \le 200\text{ km/h}$$
  Sightings implying implausible speeds ($> 200\text{ km/h}$ in city traffic) are flagged as potential plate duplication / spoofing.

### 3.6 Cryptographic Forensics & Section 65B Certification
- **Byte Hashing**: Generates true SHA-256 checksums from binary file streams:
  $$H = \text{SHA-256}(\text{bytes}_{\text{frame}}) \parallel \text{SHA-256}(\text{bytes}_{\text{crop}}) \parallel \text{SHA-256}(\text{metadata})$$
- **Tamper Detection**: Verification recalculates hashes on-the-fly and compares with database fingerprints.
- **Legal Compliance**: Generates Section 65B Electronic Evidence Certificates with digital signatures, timestamp hashes, device IDs, and investigator attestation.

### 3.7 Autonomous Improvement Worker (`agent_ops`)
- Governed by the strict **Worker $\to$ Team Manager $\to$ Main Controller** lifecycle.
- Inspects system telemetry and generates optimization recommendations.
- **Safety Invariant**: Under no circumstances does the background research agent write or alter production application code. All outputs are staged in `agent_ops/manager/recommendations.json` for human controller review.

---

## 4. Scalability, Security & Privacy
- **Network Isolation**: Docker network isolates database, redis, and backend from external access.
- **Authentication**: Stateless JWT with HS256 algorithm and bcrypt password encryption.
- **CORS Protection**: Restricted whitelist for investigator frontend endpoints.
- **Disaster Recovery**: Docker Compose persistent volumes for PostgreSQL (`postgres_data`) and forensic evidence media (`media_storage`).
