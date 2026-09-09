import logging
from typing import Optional
from ai.interfaces import BaseDetector, BasePlateOCR, BasePipeline
from ai.ingestion.stream_reader import VideoStreamReader, StreamSourceType

logger = logging.getLogger(__name__)


class SentraxIntelligencePipeline(BasePipeline):
    """
    Core Modular Video Processing Pipeline stub for SENTRAX.
    Plugs in YOLO Vehicle Detector and PaddleOCR in Milestone 2.
    """
    def __init__(self, detector: Optional[BaseDetector] = None, ocr_engine: Optional[BasePlateOCR] = None):
        self.detector = detector
        self.ocr_engine = ocr_engine
        logger.info("Sentrax Intelligence Pipeline interface initialized.")

    def set_detector(self, detector: BaseDetector):
        self.detector = detector

    def set_ocr_engine(self, ocr_engine: BasePlateOCR):
        self.ocr_engine = ocr_engine

    def process_stream(self, stream_source: str, camera_id: str, source_type: StreamSourceType = StreamSourceType.RTSP_FEED):
        """
        Milestone 1 contract stub.
        In Milestone 2, this will decode frames with VideoStreamReader,
        run self.detector.detect(), crop vehicle plates, run self.ocr_engine.read_plate(),
        and post sightings to POST /api/v1/sightings.
        """
        logger.info(f"Pipeline initialized for camera {camera_id} at {stream_source}. Awaiting Milestone 2 model weights.")
        reader = VideoStreamReader(stream_source, source_type, camera_id)
        return reader
