# Experiment Record: EXP-001-plate-detector

Task: EXP-001
Hypothesis: Using the trained Ultralytics YOLO plate detector (`plate_detector.pt`) on vehicle crops will yield precise plate bounding boxes, eliminating background bumper/road clutter and producing clean plate crops for the evidence vault and OCR.
Current behavior: Heuristic vertical crop (bottom 40% of vehicle box, horizontal center 60%) often captures headlights, grill, or asphalt.
Proposed change: Load `YOLO("/app/models/plate_detector.pt")` in `ANPRPipeline`. If plate detection score >= 0.25, crop the exact detected bounding box with a 5% margin. Fall back to heuristic crop if no plate is detected.
Files affected:
- `backend/app/ai/anpr.py`
Risk: Latency increase on CPU per frame.
Rollback: Revert `anpr.py` to heuristic-only mode.
Test method: Run `scripts/benchmark_plate_detector.py` on 10 sample vehicle crops inside the container.
Success criteria:
- Inference latency < 60ms on CPU
- Detection confidence > 0.60 on clear plates
- Seamless fallback to heuristic crop on unreadable frames
Result: PENDING
Decision: PENDING

## Benchmark Execution & Results
- Hardware: CPU (Intel/AMD x86_64, Dockerized)
- Target model: `/app/models/plate_detector.pt` (22.5 MB)
- Classes: `{0: 'license_plate'}`
- Accuracy: 0.86 confidence on test vehicle plate region `[120, 199, 280, 247]`
- Latency (imgsz=640): ~1250ms (CPU bottleneck)
- Latency (imgsz=192): ~425ms (CPU bottleneck)
- Fast Geometric Heuristic Latency: 0.013ms

## Controller Decision: MERGE_WITH_SAMPLING
- Integrate `plate_detector.pt` optionally/lazily with `imgsz=192` and confidence threshold 0.35.
- Preserve fast geometric heuristic as default primary fast path for real-time live video streams to guarantee zero lag at 15-30 FPS.
- Provide explicit deep detector invocation for high-confidence/watchlist verification and forensic zoom.
