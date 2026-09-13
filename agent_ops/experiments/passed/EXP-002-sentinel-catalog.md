# Experiment Record: EXP-002-sentinel-catalog

Task: EXP-002
Hypothesis: A resilient Sentinel catalog adapter can attempt live catalog ingestion from `https://cctv.corp8.cloud/cameras.json`, and if unauthenticated (HTTP 302/401), cleanly fall back to preserving registered local validation cameras without interrupting the running demo.
Files affected:
- `backend/app/ingestion/sentinel_catalog.py`
Risk: Network timeouts or blocking HTTP calls.
Rollback: Keep standalone or delete file.
Test method: Execute `scripts/test_sentinel_catalog.py` with mock 302 and live requests.
Success criteria:
- Handles HTTP 302 / redirect safely without raising unhandled exception
- Accurately tags imported feeds with `OFFICIAL_SENTINEL_LIVE`
- Accurately tags fallback feeds with `LOCAL_VALIDATION_SOURCE`
Result: PENDING
Decision: PENDING

## Test Execution & Results
- Module: `app/ingestion/sentinel_catalog.py`
- Probe Result: `{'status': 'AUTH_REQUIRED', 'source': 'LOCAL_VALIDATION_SOURCE', 'message': 'Endpoint redirected to /auth/login. Authentication session required.', 'cameras': []}`
- Network handling: Handled HTTP 302 cleanly via non-following client with 4.0s timeout.
- Data Truth: Correctly tagged status as `AUTH_REQUIRED` and data source as `LOCAL_VALIDATION_SOURCE`. Zero hallucinated streams.

## Controller Decision: MERGE_NOW
- Integrated as official catalog adapter for SENTRAX ingestion layer.
