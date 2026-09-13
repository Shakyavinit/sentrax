from typing import NamedTuple, Optional
import numpy as np

class PlateResult(NamedTuple):
    text: str
    raw_text: str
    confidence: float
    crop: Optional[np.ndarray]
    is_valid_format: bool
