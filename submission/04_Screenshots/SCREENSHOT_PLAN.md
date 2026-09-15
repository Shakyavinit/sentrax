# SENTRAX — Submission Screenshot Plan & Evaluation Guide
**System**: SENTRAX (AI-Powered CCTV Intelligence & Digital Forensics Platform)  
**Team**: CipherNetra  
**Hackathon**: Gujarat Sentinel Hackathon / SIH  
**Version**: 1.0.0  

---

## 1. Overview & Image Capture Standards

To present SENTRAX effectively to the Gujarat Sentinel / SIH evaluation panel, screenshots must adhere to the following strict technical standards:
- **Resolution**: 1920x1080 (16:9 full HD) or 2560x1440 (tactical widescreen).
- **Format**: PNG (lossless compression, crisp typography, no JPEG compression artifacts).
- **Theme**: Dark Tactical / Law Enforcement High-Contrast Theme (`#05080E` / `#0D1520` background).
- **Redaction**: All real passwords, tokens, and internal server IPs masked.

---

## 2. Screenshot Manifest & Target Focal Points

| # | Screenshot Filename | Target View / Component | Key Focal Points for Evaluators |
|---|---------------------|-------------------------|---------------------------------|
| 01 | `01_investigation_overview_dashboard.png` | Main Dashboard (`/`) | 4 KPI metric cards (Available Cameras, Unique Vehicles, Plate Sightings, Review Queue), MTTD (1.8s) and ANPR accuracy (96.2%) status bar, Ahmedabad SOC online beacon. |
| 02 | `02_background_operations_widget.png` | Background Operations Panel (`/`) | Real-time status badges for all 7 Celery workers, Redis connection badge, Celery prefork node counter, Active AI camera limit (4 streams throttled). |
| 03 | `03_live_cctv_surveillance_grid.png` | CCTV Grid Monitor (`/live`) | 4-camera concurrent multi-stream grid across Ahmedabad & Gandhinagar (CAM01 MG Road, CAM02 Sardar Bridge, CAM04 SG Highway, CAM06 GIFT City). |
| 04 | `04_anpr_detection_plate_crop.png` | Video Sighting Inspection (`/live?camera=CAM04`) | Live video player, real-time plate bounding box overlay, cropped plate preview (`GJ01AB1234`), OCR confidence score (96.2%), and timestamp. |
| 05 | `05_cross_camera_journey_map.png` | Journey Reconstruction (`/journey?plate=GJ01AB1234`) | Interactive Leaflet/OpenStreetMap geospatial route connecting $\ge 2$ distinct cameras, chronological waypoint timeline, transit speed validation, and direction arrows. |
| 06 | `06_watchlist_alert_popup.png` | Real-Time Watchlist Notification (`/alerts`) | Critical red alert drawer, high-priority badge, plate text matching wanted watchlist entry, camera junction details, and human acknowledgment button. |
| 07 | `07_forensic_evidence_vault_kpi.png` | Evidence Vault (`/evidence`) | Total evidence items (791 preserved packages), Section 65B certified items, verified tamper-free rate (100%), and filter controls. |
| 08 | `08_evidence_package_modal_sha256.png` | Evidence Detail Modal (`/evidence`) | Complete SHA-256 cryptographic hash breakdown (Full Frame Hash, Vehicle Crop Hash, Plate Crop Hash, Metadata JSON Hash), and green "Verified Tamper-Free" badge. |
| 09 | `09_section_65b_certificate.png` | Certificate Tab (`/evidence`) | Formatted Indian Evidence Act Section 65B Certificate with electronic signature, legal attestation, hash manifest, device ID, and operator details. |
| 10 | `10_forensic_ai_copilot_chat.png` | Tactical Copilot Drawer (`/copilot`) | Natural language conversational intelligence interface answering investigator queries about vehicle travel patterns and historical junction correlations. |

---

## 3. Recommended Screen Capture Workflow

1. **Dashboard & Background Operations**:
   - Navigate to `http://localhost:8080/` (or port 3002).
   - Ensure the Background Operations panel displays green "Completed" status pills for workers.
   - Capture full viewport (CMD+Shift+4 or browser screenshot tool).

2. **Cross-Camera Journey**:
   - Navigate to `/journey?plate=GJ01AB1234`.
   - Allow map tiles and the 5-waypoint route between Sardar Bridge and GIFT City to render.
   - Capture showing both the route map and the chronological stop sequence on the right.

3. **Forensic Evidence Modal**:
   - Navigate to `/evidence`.
   - Click "Inspect" on evidence record for `GJ01AB1234`.
   - Switch to the "SHA-256 Hashes" tab to display the hexadecimal cryptographic fingerprints.
