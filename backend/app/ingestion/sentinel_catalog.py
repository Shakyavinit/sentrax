import os
import httpx
from typing import Dict, Any, List, Optional
from app.core.logging import logger

SENTINEL_CATALOG_URL = os.getenv("SENTINEL_CATALOG_URL", "https://cctv.corp8.cloud/cameras.json")

async def fetch_sentinel_catalog(session_cookie: Optional[str] = None) -> Dict[str, Any]:
    """
    Attempts to fetch official Sentinel live camera catalog.
    Handles authentication barriers (HTTP 302/401/403) and network timeouts gracefully,
    ensuring fallback to LOCAL VALIDATION SOURCE feeds without interrupting demo execution.
    """
    headers = {
        "User-Agent": "SENTRAX-Forensic-Grid/1.0",
        "Accept": "application/json"
    }
    cookie = session_cookie or os.getenv("SENTINEL_SESSION_COOKIE")
    if cookie:
        headers["Cookie"] = cookie

    try:
        async with httpx.AsyncClient(follow_redirects=False, timeout=4.0) as client:
            response = await client.get(SENTINEL_CATALOG_URL, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Successfully fetched {len(data)} cameras from Sentinel official catalogue.")
                return {
                    "status": "ONLINE",
                    "source": "OFFICIAL_SENTINEL_LIVE",
                    "cameras": data if isinstance(data, list) else data.get("cameras", []),
                    "count": len(data) if isinstance(data, list) else len(data.get("cameras", []))
                }
            elif response.status_code in (301, 302, 307, 308):
                redirect_url = response.headers.get("Location", "/auth/login")
                logger.info(f"Sentinel catalog redirected to {redirect_url}. Using LOCAL VALIDATION SOURCE.")
                return {
                    "status": "AUTH_REQUIRED",
                    "source": "LOCAL_VALIDATION_SOURCE",
                    "message": f"Endpoint redirected to {redirect_url}. Authentication session required.",
                    "cameras": []
                }
            elif response.status_code in (401, 403):
                logger.warning(f"Sentinel catalog returned HTTP {response.status_code}. Access restricted.")
                return {
                    "status": "RESTRICTED",
                    "source": "LOCAL_VALIDATION_SOURCE",
                    "message": f"HTTP {response.status_code} Unauthorized.",
                    "cameras": []
                }
            else:
                return {
                    "status": "DEGRADED",
                    "source": "LOCAL_VALIDATION_SOURCE",
                    "message": f"HTTP {response.status_code}",
                    "cameras": []
                }
    except Exception as e:
        logger.info(f"Sentinel catalog probe: {e}. Defaulting to LOCAL VALIDATION SOURCE.")
        return {
            "status": "OFFLINE_FALLBACK",
            "source": "LOCAL_VALIDATION_SOURCE",
            "message": str(e),
            "cameras": []
        }
