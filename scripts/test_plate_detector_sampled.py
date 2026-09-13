import time
import cv2
import numpy as np

# Simulate heuristic crop (instant)
def heuristic_crop(vehicle_crop):
    t0 = time.time()
    vh, vw = vehicle_crop.shape[:2]
    py1 = int(vh * 0.60)
    py2 = int(vh * 0.95)
    px1 = int(vw * 0.20)
    px2 = int(vw * 0.80)
    crop = vehicle_crop[py1:py2, px1:px2]
    lat = (time.time() - t0) * 1000.0
    return crop, lat

crop = np.zeros((240, 320, 3), dtype=np.uint8)
_, lat = heuristic_crop(crop)
print(f"Heuristic crop latency: {lat:.3f}ms")
