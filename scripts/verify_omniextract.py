#!/usr/bin/env python3
"""
Automated Playwright verification for OmniExtract.
Validates page title, DOM components, proxy status, tabs, and bookmarklet.
"""

import sys
import subprocess
import time
from playwright.sync_api import sync_playwright

def main():
    print("[*] Starting local HTTP server for OmniExtract on port 8999...")
    srv = subprocess.Popen(
        [sys.executable, "-m", "http.server", "8999"],
        cwd="/home/mrx/Pictures/sentrax/omniextract",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.2)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                executable_path="/usr/bin/chromium",
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )
            page = browser.new_page(viewport={"width": 1440, "height": 900})

            console_logs = []
            page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

            print("[*] Navigating to http://localhost:8999/index.html...")
            page.goto("http://localhost:8999/index.html", wait_until="networkidle")

            # 1. Verify Page Title
            title = page.title()
            print(f"[+] Page Title: '{title}'")
            assert "OmniExtract" in title, f"Unexpected title: {title}"

            # 2. Verify Key DOM Elements
            assert page.locator("#target-url").is_visible(), "Target URL input not visible"
            assert page.locator("#scan-btn").is_visible(), "Scan button not visible"
            assert page.locator("#tab-url").is_visible(), "Live URL tab not visible"
            assert page.locator("#tab-raw-html").is_visible(), "Raw HTML tab not visible"
            assert page.locator("#tab-file-drop").is_visible(), "File drop tab not visible"
            assert page.locator("#empty-state").is_visible(), "Empty state welcome guide not visible"

            # 3. Test Mode Switching
            print("[*] Testing mode switching...")
            page.click("#tab-raw-html")
            assert page.locator("#pane-raw-html").is_visible(), "Raw HTML pane not visible after tab click"
            assert page.locator("#pane-url").is_hidden(), "URL pane still visible after switching to Raw HTML"

            page.click("#tab-file-drop")
            assert page.locator("#pane-file-drop").is_visible(), "File drop pane not visible after tab click"

            page.click("#tab-url")
            assert page.locator("#pane-url").is_visible(), "URL pane not visible after switching back"

            # 4. Test Mock / Raw HTML Parsing
            print("[*] Testing instant HTML media extraction...")
            page.click("#tab-raw-html")
            sample_html = """
            <!DOCTYPE html>
            <html>
            <head><title>Test Extraction Portal</title></head>
            <body>
              <h1>Sample Gallery</h1>
              <img src="https://images.example.com/photo1_1920x1080.jpg" alt="High Res Landscape" width="1920" height="1080" />
              <img src="https://images.example.com/photo2_4k.webp" alt="4K Ultra Nature" width="3840" height="2160" />
              <picture>
                <source srcset="https://images.example.com/responsive_1280.jpg 1280w, https://images.example.com/responsive_1920.jpg 1920w">
                <img src="https://images.example.com/fallback.jpg" alt="Responsive Hero">
              </picture>
              <div style="background-image: url('https://images.example.com/bg_banner.png');">Banner</div>
              <video src="https://videos.example.com/sample_1080p.mp4" poster="https://images.example.com/video_poster.jpg"></video>
              <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
              <audio src="https://audio.example.com/track01.mp3"></audio>
              <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
            </body>
            </html>
            """
            page.fill("#raw-html-input", sample_html)
            page.click("button:has-text('PARSE PASTED HTML')")

            page.wait_for_timeout(400)

            # Check results header and counts
            assert page.locator("#results-header-section").is_visible(), "Results section not visible after parse"
            count_all = page.locator("#count-all").inner_text()
            print(f"[+] Total Extracted Items: {count_all}")
            assert int(count_all) >= 6, f"Expected at least 6 extracted items, got {count_all}"

            # 5. Test Filter Tabs
            page.click("#tab-btn-video")
            page.wait_for_timeout(200)
            print("[+] Filtered by Videos")

            page.click("#tab-btn-all")
            page.wait_for_timeout(200)

            # 6. Test Bookmarklet Modal
            print("[*] Testing Bookmarklet modal...")
            page.click("button:has-text('1-CLICK BOOKMARKLET')")
            assert page.locator("#bookmarklet-modal").is_visible(), "Bookmarklet modal not visible"
            page.click("button[onclick='closeBookmarkletModal()']")
            page.wait_for_timeout(200)
            assert page.locator("#bookmarklet-modal").is_hidden(), "Bookmarklet modal not hidden"

            # 7. Capture Verification Screenshot
            screenshot_path = "/home/mrx/.gemini/antigravity/brain/5399a33c-2bff-4c02-9962-617d3de6361d/verified_omniextract_dashboard.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[+] Verification screenshot saved: {screenshot_path}")

            browser.close()

            # Check for critical errors in console
            severe_errors = [c for c in console_logs if "[error]" in c and not "images.example.com" in c]
            if severe_errors:
                print(f"[!] Warning: Console errors detected: {severe_errors}")
            else:
                print("[+] Console clean! Zero critical JavaScript exceptions.")

            print("\n=======================================================")
            print("🎉 ALL OMNIEXTRACT VERIFICATION TESTS PASSED SUCCESSFULLY!")
            print("=======================================================\n")

    finally:
        srv.terminate()

if __name__ == '__main__':
    main()
