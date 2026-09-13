from typing import Tuple, Optional
import numpy as np

class VehicleTracker:
    def __init__(self):
        self.next_id = 1
        self.tracks = {}

    def update(self, bbox: Tuple[int, int, int, int], conf: float, frame: np.ndarray) -> int:
        # Simple robust centroid / IoU track ID generator
        x, y, w, h = bbox
        cx, cy = x + w // 2, y + h // 2

        best_id = None
        min_dist = 80.0 # Pixel threshold
        for tid, pos in list(self.tracks.items()):
            px, py = pos
            dist = ((cx - px)**2 + (cy - py)**2)**0.5
            if dist < min_dist:
                min_dist = dist
                best_id = tid

        if best_id is not None:
            self.tracks[best_id] = (cx, cy)
            return best_id
        else:
            assigned = self.next_id
            self.next_id += 1
            self.tracks[assigned] = (cx, cy)
            if len(self.tracks) > 500:
                self.tracks.clear()
            return assigned

tracker = VehicleTracker()
