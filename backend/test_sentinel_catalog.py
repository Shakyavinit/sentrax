import asyncio
from app.ingestion.sentinel_catalog import fetch_sentinel_catalog

async def main():
    print("Testing Sentinel Catalog probe...")
    result = await fetch_sentinel_catalog()
    print("Probe result:", result)
    assert result["source"] in ("OFFICIAL_SENTINEL_LIVE", "LOCAL_VALIDATION_SOURCE")
    print("TEST PASSED: Resilient catalog response received.")

asyncio.run(main())
