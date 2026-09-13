# Main Controller Action Plan

Cycle: 01
Date: 2026-09-13
Status: ACTIVE

## Top 3 Approved Improvements (P0/P1)

### 1. Evidence Event Metadata JSON Archiving with Provenance (REC-002)
- Priority: P1 | Classification: Class-A (Safe Auto-Integrate)
- Target: `backend/app/ai/pipeline.py`
- Objective: For every detected event, write `_meta.json` recording timestamp, camera ID, source (`OFFICIAL_SENTINEL_LIVE` vs `LOCAL_VALIDATION_SOURCE`), vehicle bounding box, plate bounding box, confidence scores, and SHA-256 integrity hash.
- Verification: Assert JSON written to `/media/metadata/` with valid schema.

### 2. Precise Plate Cropping with YOLO Plate Detector (REC-001)
- Priority: P1 | Classification: Class-B (Test First)
- Target: `backend/app/ai/anpr.py`
- Objective: Load `/app/models/plate_detector.pt` within `ANPRPipeline`. Run inference on vehicle crop to detect true plate polygon instead of heuristic 40% vertical crop. Fall back gracefully to heuristic if plate detector returns no box.
- Verification: Run isolated experiment on sample vehicle crops. Measure crop accuracy and latency (< 40ms).

### 3. Sentinel Live Catalogue Connector with Auth Fallback (REC-003)
- Priority: P1 | Classification: Class-B (Test First)
- Target: `backend/app/ingestion/sentinel_catalog.py`
- Objective: Connect to `https://cctv.corp8.cloud/cameras.json` using session token/cookie if provided; gracefully default to local 10-camera grid if unauthenticated (HTTP 302).
- Verification: Unit test with mock 302 and mock 200 responses.
