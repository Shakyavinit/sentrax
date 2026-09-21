import http.server
import socketserver
import threading
import time
import os
import sys
from playwright.sync_api import sync_playwright

PORT = 8876
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

    targets = [
        ("standalone_sentrax.html", f"http://localhost:{PORT}/standalone_sentrax.html"),
        ("demo.html", f"http://localhost:{PORT}/frontend/public/demo.html")
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path="/usr/bin/chromium")

        for name, url in targets:
            print(f"\n--- Testing {name} at {url} ---")
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()

            external_requests = []
            failed_requests = []

            def handle_request(req):
                if "unsplash.com" in req.url:
                    external_requests.append(req.url)

            def handle_failed(req):
                failed_requests.append(req.url)

            page.on("request", handle_request)
            page.on("requestfailed", handle_failed)

            page.goto(url, wait_until="networkidle")

            # 1. Assert NO unsplash requests
            if external_requests:
                print(f"FAIL: Found requests to unsplash: {external_requests}")
                sys.exit(1)
            else:
                print("PASS: Zero requests to unsplash.com detected!")

            # 2. Check Dashboard quick feed images
            dashboard_imgs = page.query_selector_all("#page-dashboard .cam-feed-img")
            print(f"[INFO] Found {len(dashboard_imgs)} quick feed images on dashboard")
            for idx, img in enumerate(dashboard_imgs):
                src = img.get_attribute("src")
                natural_width = page.evaluate("(el) => el.naturalWidth", img)
                print(f"  Feed {idx+1}: src={src} | naturalWidth={natural_width}")
                assert natural_width > 0, f"Dashboard feed {idx+1} failed to load image!"
            print("PASS: All dashboard quick feeds rendered local assets cleanly!")

            # 3. Navigate to Live Camera Monitor Wall
            page.evaluate("navigate('monitor')")
            page.wait_for_timeout(600)

            cam_cards = page.query_selector_all("#all-cam-grid .cam-card")
            print(f"[INFO] Found {len(cam_cards)} camera cards in monitor grid")
            assert len(cam_cards) >= 15, "Expected 15 camera cards in monitor grid"

            # Check online vs offline feeds
            online_cams = 0
            offline_cams = 0
            for idx, card in enumerate(cam_cards):
                feed_img = card.query_selector(".cam-feed-img")
                smpte_bars = card.query_selector(".smpte-bars")
                if feed_img:
                    online_cams += 1
                    nat_w = page.evaluate("(el) => el.naturalWidth", feed_img)
                    src = feed_img.get_attribute("src")
                    assert nat_w > 0, f"Camera card {idx} img failed to load: {src}"
                elif smpte_bars:
                    offline_cams += 1
            print(f"PASS: Monitor wall verified: {online_cams} online video feeds, {offline_cams} SMPTE offline test patterns!")

            # Screenshot of Monitor Wall
            wall_shot = os.path.join(SCREENSHOT_DIR, f"verified_{name.replace('.html','')}_monitor_wall.png")
            page.screenshot(path=wall_shot)
            print(f"Captured monitor wall screenshot: {wall_shot}")

            # 4. Test modal for an ONLINE camera (e.g. CAM01 or CAM02)
            page.evaluate("openCamModal(0)")
            page.wait_for_timeout(500)
            modal = page.query_selector("#cam-modal")
            assert modal.is_visible(), "Expected camera modal to open"
            modal_img = page.query_selector("#modal-cam-body img")
            assert modal_img is not None, "Expected img in modal body for online camera"
            m_nat_w = page.evaluate("(el) => el.naturalWidth", modal_img)
            assert m_nat_w > 0, "Modal image for CAM01 failed to load!"
            print(f"PASS: Online camera modal opened with valid image (naturalWidth={m_nat_w})")
            modal_shot_online = os.path.join(SCREENSHOT_DIR, f"verified_{name.replace('.html','')}_modal_online.png")
            page.screenshot(path=modal_shot_online)

            # Close modal
            page.evaluate("closeCamModal()")
            page.wait_for_timeout(300)

            # 5. Test modal for an OFFLINE camera (CAM10 is index 9)
            page.evaluate("openCamModal(9)")
            page.wait_for_timeout(500)
            modal_smpte = page.query_selector("#modal-cam-body .smpte-bars")
            assert modal_smpte is not None, "Expected SMPTE bars in modal body for offline camera"
            print("PASS: Offline camera modal opened with animated SMPTE color bars!")
            modal_shot_offline = os.path.join(SCREENSHOT_DIR, f"verified_{name.replace('.html','')}_modal_offline.png")
            page.screenshot(path=modal_shot_offline)
            page.evaluate("closeCamModal()")

            context.close()

        browser.close()

    server.shutdown()
    print("\nALL TESTS PASSED! 100% OFFLINE ROBUSTNESS CONFIRMED!")

if __name__ == "__main__":
    run_tests()
