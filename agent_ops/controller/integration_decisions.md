# Integration Decisions Log

## TASK-001: Initial Architecture & Agent Operations
- Change: Creation of agent_ops directory, state files, and scout baselines.
- Reason: Operating under SENTRAX_MULTI_AGENT_AUTONOMOUS_PLAYBOOK.md directives.
- Agent: Main Controller
- Files: agent_ops/*
- Tests: System test suite (all 9 phases PASS).
- Result: Operational.
- Rollback: rm -rf agent_ops/
- Status: INTEGRATED

## TASK-002: Evidence Metadata JSON Archiving
- Change: Auto-saving metadata JSON per detection in pipeline.py.
- Reason: Compliance with forensic evidence preservation standard.
- Agent: Backend Engineering Agent
- Classification: Class-A
- Status: APPROVED FOR AUTO-APPLY

## TASK-003: Sub-Pixel Plate Detector & CLAHE Preprocessing Integration (REC-001)
- Change: Upgraded `ANPRPipeline` to dynamically load `plate_detector.pt` with imgsz=192 and CLAHE bilateral filter.
- Reason: High precision plate bounding box extraction while preserving < 0.02ms fallback for real-time video streaming.
- Agent: AI/ML Agent
- Files: backend/app/ai/anpr.py
- Tests: `scripts/benchmark_plate_detector.py` and `test_system.py` (9/9 phases PASS).
- Result: Operational and Verified.
- Rollback: Revert `backend/app/ai/anpr.py` to geometric heuristic.
- Status: INTEGRATED

## TASK-004: Resilient Sentinel Catalogue Ingestion Adapter (REC-003)
- Change: Added `backend/app/ingestion/sentinel_catalog.py` with async probe and non-blocking fallback.
- Reason: Handles HTTP 302 authentication barriers without crashing and guarantees data truth labeling.
- Agent: Backend Engineering Agent
- Files: backend/app/ingestion/sentinel_catalog.py
- Tests: `scripts/test_sentinel_catalog.py` (PASS).
- Result: Operational and Verified.
- Status: INTEGRATED
