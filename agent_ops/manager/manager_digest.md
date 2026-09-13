# Manager Digest

Cycle: 01 (Initial Setup & Baseline)
Date: 2026-09-13
Prepared By: Team Manager Agent

## P0 — Demo Blockers
- None. System is fully running in Docker with all 9 QA verification phases passing.

## P1 — High-Value Improvements
1. **Integrate trained `plate_detector.pt` into `backend/app/ai/anpr.py`**:
   - Replace heuristic 40% bounding box crop with YOLO inference on `vehicle_crop` to get precise plate bounding boxes.
   - Saves precise plate crop image and improves visual quality in evidence vault.
2. **Metadata JSON Event Archiving in `pipeline.py`**:
   - Save metadata JSON alongside original frame, vehicle crop, and plate crop with strict provenance tagging (`OFFICIAL_SENTINEL_LIVE` vs `LOCAL_VALIDATION_SOURCE`).
3. **Sentinel Feed Catalogue Connector with Dynamic Credential Injection**:
   - Build `backend/app/ingestion/sentinel_catalog.py` that connects to `https://cctv.corp8.cloud/cameras.json` if session cookies/tokens are supplied via env, while seamlessly defaulting to the 10-camera local grid.

## Safe Auto-Integrations
- Class-A: Metadata JSON logging alongside evidence images in `backend/app/ai/pipeline.py`.
- Class-A: Documentation of model registry and dataset registry in `docs/`.

## Needs Controller Approval
- Class-B: Swapping `anpr.py` crop logic to load and invoke `plate_detector.pt`.
- Class-B: Adding Sentinel live catalogue polling adapter.

## Research Worth Keeping
- Multi-frame OCR consensus voting across DeepSORT tracklet frames (`SCOUT-GH-001`).
- CLAHE + Bilateral image filtering for night/glare plate enhancement (`SCOUT-TOOL-001`).
- ArcGIS World Dark Gray Base map layer without watermarks (`SCOUT-API-001`).

## Backlog
- Fine-tuning YOLOv8 on full Indian ANPR dataset.
- Cloud OCR fallback API integration (Gemini Vision OCR).

## Duplicate / Rejected
- Rejected: Heavy commercial OCR services requiring ongoing billing.
- Rejected: Synthetic full CCTV video downloads (violates live frame inference policy).

## Current Risks
- RISK-001: Sentinel live URL requires login session; mitigated by local validation fallback.
- RISK-002: Missing PaddleOCR package in container; mitigated by YOLO plate detector and heuristic enhancement.

## Next 3 Actions
1. Main Controller decision on Top 3 P0/P1 items.
2. Execute experiment for `plate_detector.pt` integration in `anpr.py`.
3. Auto-integrate metadata JSON event archiving into evidence pipeline.
