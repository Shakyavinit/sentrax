import os
import shutil
import hashlib
import logging
from typing import Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)


def get_directory_size_mb(path: str) -> float:
    if not os.path.exists(path):
        return 0.0
    total_size = 0
    for dirpath, _, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            try:
                total_size += os.path.getsize(fp)
            except OSError:
                pass
    return total_size / (1024 * 1024)


def check_and_prune_temp_storage(max_mb: Optional[int] = None) -> float:
    """
    Enforces MAX_TEMP_STORAGE_MB (default 500 MB).
    Prunes oldest temporary frames and buffer segments using FIFO.
    """
    limit = max_mb or settings.MAX_TEMP_STORAGE_MB
    temp_dir = settings.TEMP_DIR
    os.makedirs(temp_dir, exist_ok=True)

    current_size = get_directory_size_mb(temp_dir)
    if current_size <= limit:
        return current_size

    logger.warning(f"Temp storage exceeded {limit} MB (Current: {current_size:.2f} MB). Pruning oldest files...")

    # Sort files by last modification time (oldest first)
    files = []
    for dirpath, _, filenames in os.walk(temp_dir):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            try:
                files.append((fp, os.path.getmtime(fp), os.path.getsize(fp)))
            except OSError:
                pass

    files.sort(key=lambda x: x[1])

    for fp, _, size in files:
        if current_size <= limit * 0.85:  # Prune until 85% capacity
            break
        try:
            os.remove(fp)
            current_size -= (size / (1024 * 1024))
            logger.info(f"Pruned temporary buffer file: {fp}")
        except OSError as e:
            logger.warning(f"Failed to remove temp file {fp}: {e}")

    return current_size


def check_evidence_quota(max_mb: Optional[int] = None) -> bool:
    """
    Enforces MAX_EVIDENCE_STORAGE_MB (default 1000 MB).
    CRITICAL RULE: Never silently delete active case evidence.
    Returns True if quota is available, False if quota exceeded.
    """
    limit = max_mb or settings.MAX_EVIDENCE_STORAGE_MB
    evidence_dir = settings.EVIDENCE_DIR
    os.makedirs(evidence_dir, exist_ok=True)

    current_size = get_directory_size_mb(evidence_dir)
    if current_size >= limit:
        logger.error(
            f"EVIDENCE STORAGE LIMIT REACHED! ({current_size:.2f} MB >= {limit} MB). "
            "Forensic evidence must NEVER be deleted automatically without judicial authorization."
        )
        return False
    return True


def compute_sha256_hash(data_or_path) -> str:
    hasher = hashlib.sha256()
    if isinstance(data_or_path, (bytes, bytearray)):
        hasher.update(data_or_path)
    elif isinstance(data_or_path, str) and os.path.exists(data_or_path):
        with open(data_or_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
    else:
        raise ValueError("Invalid input to compute_sha256_hash: expected existing filepath or raw bytes")
    return hasher.hexdigest()
