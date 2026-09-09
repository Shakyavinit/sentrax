from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
import numpy as np


class BoundingBox:
    def __init__(self, x1: float, y1: float, x2: float, y2: float, confidence: float, class_name: str):
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
        self.confidence = confidence
        self.class_name = class_name

    def to_dict(self) -> Dict[str, Any]:
        return {
            "bbox": [self.x1, self.y1, self.x2, self.y2],
            "confidence": self.confidence,
            "class_name": self.class_name
        }


class PlateDetectionResult:
    def __init__(self, plate_text: str, confidence: float, bbox: List[float], crop_img: Optional[np.ndarray] = None):
        self.plate_text = plate_text
        self.confidence = confidence
        self.bbox = bbox
        self.crop_img = crop_img

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plate_text": self.plate_text,
            "confidence": self.confidence,
            "bbox": self.bbox
        }


class BaseDetector(ABC):
    """
    Abstract Contract for Object / Vehicle Detection (YOLOv8/v10/v11).
    Ensures modularity: replacement with TensorRT, ONNX, or any model in Milestone 2
    requires zero backend changes.
    """

    @abstractmethod
    def load_model(self, weights_path: str, device: str = "cuda") -> None:
        """Load detector weights onto designated hardware device."""
        pass

    @abstractmethod
    def detect(self, frame: np.ndarray, conf_threshold: float = 0.4) -> List[BoundingBox]:
        """Run vehicle detection inference on a raw video frame."""
        pass


class BasePlateOCR(ABC):
    """
    Abstract Contract for License Plate Localization and OCR (PaddleOCR / CRNN).
    """

    @abstractmethod
    def load_model(self, lang: str = "en") -> None:
        """Initialize OCR engine."""
        pass

    @abstractmethod
    def read_plate(self, plate_crop: np.ndarray) -> PlateDetectionResult:
        """Extract alphanumeric license text and confidence from a cropped plate region."""
        pass


class BasePipeline(ABC):
    """
    Abstract Contract for end-to-end multi-threaded CCTV processing pipeline.
    """

    @abstractmethod
    def process_stream(self, stream_source: str, camera_id: str) -> None:
        """Ingest frames, run detector, trigger OCR, and publish sightings to backend."""
        pass
