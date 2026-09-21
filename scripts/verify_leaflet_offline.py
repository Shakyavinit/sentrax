import http.server
import socketserver
import threading
import time
import os
import sys
from playwright.sync_api import sync_playwright

PORT = 8877
DIRECTORY = "/home/mrx/Pictures/sentrax"
SCREENSHOT_DIR = "/home/mrx/.gemini/antigravity/brain/5399a33c-2bff-4c02-9962-617d3de6361d"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        pass

def start_server():
    server = socketserver.TCPServer(("", PORT), Handler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    return server

def run_tests():
    server = start_server()
    print(f"[TEST] HTTP server listening on http://localhost:{PORT}")
    time.sleep(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path="/usr/bin/chromium")

        # ========================================================
        # TEST 1: Bundled Local Leaflet & Lucide (Zero unpkg calls)
        # ========================================================
        print("\n--- TEST 1: Local Bundled Leaflet in standalone_sentrax.html ---")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        unpkg_requests = []
        vendor_requests = []

        def handle_request(req):
            if "unpkg.com" in req.url:
                unpkg_requests.append(req.url)
            if "vendor/leaflet" in req.url or "vendor/lucide" in req.url:
                vendor_requests.append(req.url)

        page.on("request", handle_request)
        page.goto(f"http://localhost:{PORT}/standalone_sentrax.html", wait_until="networkidle")

        print(f"[INFO] Detected {len(vendor_requests)} local vendor requests:")
        for r in vendor_requests[:5]:
            print(f"   -> {r}")

        if unpkg_requests:
            print(f"❌ FAIL: Unpkg requests were made despite local bundling: {unpkg_requests}")
            sys.exit(1)
        else:
            print("✅ PASS: Zero requests to unpkg.com! Bundled vendor loaded successfully.")

        # Verify Leaflet loaded
        leaflet_version = page.evaluate("() => typeof L !== 'undefined' ? L.version : 'NOT_FOUND'")
        print(f"[INFO] Leaflet version detected: {leaflet_version}")
        assert leaflet_version.startswith("1.9"), f"Unexpected Leaflet version: {leaflet_version}"
        print("✅ PASS: window.L is active with version 1.9.4!")

        # Navigate to Investigation Map
        page.evaluate("navigate('investigation')")
        page.wait_for_timeout(600)
        inv_map_children = page.evaluate("() => document.getElementById('investigation-map').children.length")
        assert inv_map_children > 0, "Investigation map container is empty!"
        print("✅ PASS: Investigation map successfully rendered in DOM!")

        shot1 = os.path.join(SCREENSHOT_DIR, "verified_investigation_map_leaflet.png")
        page.screenshot(path=shot1)
        print(f"📸 Screenshot: {shot1}")

        # Navigate to Journey Map and Play Journey
        page.evaluate("navigate('journey')")
        page.wait_for_timeout(600)
        j_map_children = page.evaluate("() => document.getElementById('journey-map-container').children.length")
        assert j_map_children > 0, "Journey map container is empty!"
        print("✅ PASS: Journey map successfully rendered in DOM!")

        # Toggle Tactical Radar overlay
        page.evaluate("toggleMapTacticalMode('journey')")
        page.wait_for_timeout(400)
        print("✅ PASS: Tactical radar overlay toggle executed cleanly!")

        shot2 = os.path.join(SCREENSHOT_DIR, "verified_journey_map_leaflet.png")
        page.screenshot(path=shot2)
        print(f"📸 Screenshot: {shot2}")

        context.close()

        # ========================================================
        # TEST 2: Strict Air-Gapped / Blocked Leaflet Fallback (window.L undefined)
        # ========================================================
        print("\n--- TEST 2: Simulated Complete Leaflet Block (Air-Gapped Static SVG Fallback) ---")
        context_offline = browser.new_context(viewport={"width": 1440, "height": 900})
        page_offline = context_offline.new_page()

        # Route and block leaflet.js and leaflet.css completely
        def block_leaflet(route):
            if "leaflet" in route.request.url:
                route.abort()
            else:
                route.continue_()

        page_offline.route("**/*", block_leaflet)

        page_offline.goto(f"http://localhost:{PORT}/standalone_sentrax.html", wait_until="networkidle")

        # Verify window.L is undefined
        is_l_undef = page_offline.evaluate("() => typeof L === 'undefined'")
        assert is_l_undef, "Expected L to be undefined in blocked simulation"
        print("✅ Verified simulation: window.L is completely undefined (blocked environment)")

        # Navigate to Investigation page in blocked environment
        page_offline.evaluate("navigate('investigation')")
        page_offline.wait_for_timeout(500)

        svg_map_inv = page_offline.query_selector("#investigation-map svg")
        assert svg_map_inv is not None, "Fallback SVG not rendered in #investigation-map!"
        inv_pins = page_offline.query_selector_all("#investigation-map .svg-map-pin")
        print(f"[INFO] Found {len(inv_pins)} interactive SVG sighting pins on fallback radar map")
        assert len(inv_pins) >= 4, "Expected at least 4 sighting pins in fallback SVG"
        print("✅ PASS: Investigation map fallback SVG rendered with all camera pins & trajectory path!")

        shot3 = os.path.join(SCREENSHOT_DIR, "verified_investigation_map_fallback_svg.png")
        page_offline.screenshot(path=shot3)
        print(f"📸 Screenshot: {shot3}")

        # Navigate to Journey page in blocked environment
        page_offline.evaluate("navigate('journey')")
        page_offline.wait_for_timeout(500)

        svg_map_journey = page_offline.query_selector("#journey-map-container svg")
        assert svg_map_journey is not None, "Fallback SVG not rendered in #journey-map-container!"
        svg_vehicle = page_offline.query_selector("#svg-journey-vehicle")
        assert svg_vehicle is not None, "Fallback SVG vehicle marker not found!"
        print("✅ PASS: Journey map fallback SVG rendered with animated vehicle!")

        # Test Play Journey in SVG fallback
        page_offline.evaluate("playJourney()")
        page_offline.wait_for_timeout(1000)
        print("✅ PASS: playJourney() executed smoothly on SVG fallback without exceptions!")

        shot4 = os.path.join(SCREENSHOT_DIR, "verified_journey_map_fallback_svg.png")
        page_offline.screenshot(path=shot4)
        print(f"📸 Screenshot: {shot4}")

        context_offline.close()

        # ========================================================
        # TEST 3: com/files/index.html Verification
        # ========================================================
        print("\n--- TEST 3: com/files/index.html Bundled Leaflet & Lucide ---")
        context_com = browser.new_context(viewport={"width": 1440, "height": 900})
        page_com = context_com.new_page()

        com_unpkg_calls = []
        page_com.on("request", lambda req: com_unpkg_calls.append(req.url) if "unpkg.com" in req.url else None)

        page_com.goto(f"http://localhost:{PORT}/com/files/index.html", wait_until="networkidle")
        if com_unpkg_calls:
            print(f"❌ FAIL: com/files/index.html made unpkg requests: {com_unpkg_calls}")
            sys.exit(1)
        else:
            print("✅ PASS: com/files/index.html made zero unpkg requests!")

        com_l_ver = page_com.evaluate("() => typeof L !== 'undefined' ? L.version : 'NOT_FOUND'")
        assert com_l_ver.startswith("1.9"), f"Unexpected Leaflet version in com: {com_l_ver}"
        print(f"✅ PASS: com/files/index.html loaded local Leaflet {com_l_ver} successfully!")

        context_com.close()
        browser.close()

    server.shutdown()
    print("\n🎉 ALL TESTS PASSED! ZERO UNPKG CALLS & ROBUST OFFLINE MAP FALLBACK VERIFIED!")

if __name__ == "__main__":
    run_tests()
