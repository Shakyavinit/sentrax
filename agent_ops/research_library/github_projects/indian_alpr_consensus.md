# Indian ALPR Multi-Frame Consensus

Name: Indian ALPR Multi-Frame Consensus
Repository: Local Integration / Ultralytics YOLOv8 Plate Detector
Purpose: Detect high-resolution plate bounding boxes and aggregate characters across track frames.
License: AGPL-3.0 / Apache-2.0
Last active: 2026
Why useful: High precision bounding box on Indian high-aspect-ratio plates prevents background clutter from ruining OCR.
Where it fits: `backend/app/ai/anpr.py`
Integration effort: Low (weights already present in `backend/models/plate_detector.pt`).
Dependencies: Ultralytics (already installed), OpenCV (already installed), PyTorch (already installed).
Risks: CPU inference latency must remain < 50ms per frame.
Recommendation: MERGE_NOW for plate detector; TEST_FIRST for multi-frame voting.
