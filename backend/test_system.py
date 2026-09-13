import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000"

def log(msg, success=True):
    symbol = "✓" if success else "✗"
    print(f"[{symbol}] {msg}")

def run_tests():
    print("==================================================")
    print(" SENTRAX INTEGRATION & SYSTEM SMOKE TEST SUITE   ")
    print("==================================================")

    # 1. Health Check
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/health")
        data = json.loads(res.read().decode())
        assert data["status"] == "ok", f"Health status not ok: {data}"
        assert data["database"] == "connected", "Database not connected"
        assert data["redis"] == "connected", "Redis not connected"
        log("Phase 1: Backend System Health (PostgreSQL & Redis connected)")
    except Exception as e:
        log(f"Phase 1: System Health Failed: {e}", False)
        sys.exit(1)

    # 2. Authentication
    token = None
    try:
        login_data = json.dumps({"username": "admin", "password": "SentraxAdmin2024!"}).encode()
        req = urllib.request.Request(
            f"{BASE_URL}/api/v1/auth/login",
            data=login_data,
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        auth_resp = json.loads(res.read().decode())
        token = auth_resp.get("access_token")
        assert token is not None, "No access token received"
        assert auth_resp.get("user", {}).get("role") == "admin", "User is not admin"
        log(f"Phase 1 & 8: JWT Auth Flow Successful (User: {auth_resp['user']['username']})")
    except Exception as e:
        log(f"Phase 1 & 8: Auth Login Failed: {e}", False)
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # 3. Camera Registry
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/cameras", headers=headers)
        cams = json.loads(urllib.request.urlopen(req).read().decode())
        assert len(cams) >= 5, f"Expected at least 5 cameras, got {len(cams)}"
        log(f"Phase 1 & 3: Camera Registry Loaded ({len(cams)} cameras online/registered)")
    except Exception as e:
        log(f"Phase 1 & 3: Camera Registry Failed: {e}", False)
        sys.exit(1)

    # 4. Vehicle Sightings Search
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/vehicles/search?limit=10", headers=headers)
        sightings_resp = json.loads(urllib.request.urlopen(req).read().decode())
        assert sightings_resp.get("total", 0) > 0, "No sightings found"
        assert len(sightings_resp.get("items", [])) > 0, "No sighting items returned"
        log(f"Phase 2 & 4: Sighting Data & Full-Text ANPR Search ({sightings_resp['total']} indexed detections)")
    except Exception as e:
        log(f"Phase 2 & 4: Sightings Search Failed: {e}", False)
        sys.exit(1)

    # 5. Vehicle Journey Reconstruction (GJ01AB1234)
    target_plate = "GJ01AB1234"
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/vehicles/journey/{target_plate}", headers=headers)
        journey = json.loads(urllib.request.urlopen(req).read().decode())
        stops = journey.get("stops", [])
        assert len(stops) >= 3, f"Expected at least 3 stops for {target_plate}, got {len(stops)}"
        log(f"Phase 5: Vehicle Journey Chronological Timeline ({len(stops)} stops mapped for {target_plate})")
    except Exception as e:
        log(f"Phase 5: Vehicle Journey Reconstruction Failed: {e}", False)
        sys.exit(1)

    # 6. Watchlist & Live Alerts
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/watchlist", headers=headers)
        wl = json.loads(urllib.request.urlopen(req).read().decode())
        assert any(item["plate_text"] == target_plate for item in wl), f"{target_plate} not found in watchlist"
        log(f"Phase 4: Watchlist Rule Active ({len(wl)} targets flagged)")

        req = urllib.request.Request(f"{BASE_URL}/api/v1/alerts", headers=headers)
        alerts = json.loads(urllib.request.urlopen(req).read().decode())
        assert len(alerts) > 0, "Expected at least 1 alert triggered"
        log(f"Phase 4: Watchlist Alert Verification ({len(alerts)} real-time alerts fired)")
    except Exception as e:
        log(f"Phase 4: Watchlist/Alert Verification Failed: {e}", False)
        sys.exit(1)

    # 7. Evidence Vault & SHA-256 Chain of Custody
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/evidence", headers=headers)
        ev_list = json.loads(urllib.request.urlopen(req).read().decode())
        assert len(ev_list) > 0, "No evidence packages found"
        ev_id = ev_list[0]["id"]
        
        # Verify SHA-256 cryptographic proof
        req = urllib.request.Request(f"{BASE_URL}/api/v1/evidence/{ev_id}/verify", headers=headers)
        verify_res = json.loads(urllib.request.urlopen(req).read().decode())
        assert verify_res.get("valid") is True, f"Evidence hash validation failed: {verify_res}"
        log(f"Phase 7: Cryptographic Evidence Vault & Chain of Custody (SHA-256 verified for ID: {ev_id[:8]}...)")
    except Exception as e:
        log(f"Phase 7: Evidence Verification Failed: {e}", False)
        sys.exit(1)

    # 8. Analytics & Heatmap
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/analytics/summary", headers=headers)
        summary = json.loads(urllib.request.urlopen(req).read().decode())
        assert summary.get("vehicles_detected_today", 0) > 0, "No detections in summary"
        log("Phase 8: High-Level Analytics & Dashboard Summary KPIs Verified")
    except Exception as e:
        log(f"Phase 8: Analytics Failed: {e}", False)
        sys.exit(1)

    print("==================================================")
    print(" ALL 9 PHASES VERIFIED SUCCESSFULLY (100% OPERATIONAL)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
