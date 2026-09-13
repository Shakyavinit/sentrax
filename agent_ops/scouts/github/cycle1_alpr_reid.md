# GitHub Scout Result

Task ID: SCOUT-GH-001
Status: PASS

Finding:
1. Identified open-source Indian ANPR implementations (yolov8-plate-detection + EasyOCR / PaddleOCR).
2. Found DeepSORT / BoT-SORT lightweight tracker for multi-frame tracklet aggregation.
3. Multi-frame plate consensus algorithms utilize character-level voting across track_id frames.
4. PyAV / OpenCV TCP RTSP reconnect wrappers prevent pipeline hanging on network drops.
5. Python hashlib + HMAC-SHA256 standards provide standard tamper-evident verification.

Why it matters:
Solves missing OCR package by pairing YOLO plate cropping with character voting.
Prevents unreadable single-frame OCR blurs.
Ensures zero RTSP freeze during hackathon presentation.

Recommended action: TEST_FIRST
Impact: 4
Effort: 2
Risk: 2
DemoValue: 5
Confidence: 4

Files/URLs:
- https://github.com/ultralytics/ultralytics (License: AGPL-3.0 / Enterprise)
- https://github.com/JaidedAI/EasyOCR (License: Apache-2.0)
- https://github.com/nwojke/deep_sort (License: GPL-3.0)

Security notes: Clean; local weights execution only.
Verification: Benchmark against /home/mrx/SENTRAX_DATASETS/anpr_benchmark/ground_truth.csv.
