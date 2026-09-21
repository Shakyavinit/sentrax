import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/home/mrx/.gemini/antigravity/brain/5399a33c-2bff-4c02-9962-617d3de6361d"
STANDALONE_PATH = "file:///home/mrx/Pictures/sentrax/standalone_sentrax.html"
COM_PATH = "file:///home/mrx/Pictures/sentrax/com/files/index.html"

def test_mobile_standalone(p):
    print("\n--- Testing standalone_sentrax.html on Mobile ---")
    browser = p.chromium.launch(
        executable_path="/usr/bin/chromium",
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    )
    
    # 1. Desktop check (1280x800)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(STANDALONE_PATH)
    page.wait_for_timeout(500)
    toggle_visible_desktop = page.is_visible("#mobile-toggle")
    print(f"Desktop (1280px): #mobile-toggle visible = {toggle_visible_desktop} (Expected: False)")
    assert not toggle_visible_desktop, "On desktop, #mobile-toggle should not be visible!"
    page.close()

    # 2. Mobile check (375x667)
    page = browser.new_page(viewport={"width": 375, "height": 667})
    page.goto(STANDALONE_PATH)
    page.wait_for_timeout(500)

    # Verify #mobile-toggle is visible on mobile
    toggle_visible_mobile = page.is_visible("#mobile-toggle")
    print(f"Mobile (375px): #mobile-toggle visible = {toggle_visible_mobile} (Expected: True)")
    assert toggle_visible_mobile, "On mobile, #mobile-toggle must be visible!"

    # Verify sidebar is initially closed
    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('open')")
    print(f"Mobile: Sidebar open initially = {sidebar_is_open} (Expected: False)")
    assert not sidebar_is_open, "Sidebar should not be open initially on mobile!"

    shot1 = os.path.join(ARTIFACT_DIR, "mobile_standalone_closed.png")
    page.screenshot(path=shot1)
    print(f"Saved: {shot1}")

    # Click #mobile-toggle to open sidebar
    print("Clicking #mobile-toggle...")
    page.click("#mobile-toggle")
    page.wait_for_timeout(300)

    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('open')")
    backdrop_is_open = page.evaluate("() => document.getElementById('sidebar-backdrop').classList.contains('open')")
    print(f"Mobile: Sidebar open after toggle = {sidebar_is_open}, Backdrop open = {backdrop_is_open}")
    assert sidebar_is_open, "Sidebar failed to open after clicking #mobile-toggle!"
    assert backdrop_is_open, "Backdrop failed to show after opening sidebar!"

    shot2 = os.path.join(ARTIFACT_DIR, "mobile_standalone_sidebar_open.png")
    page.screenshot(path=shot2)
    print(f"Saved: {shot2}")

    # Click backdrop to close
    print("Clicking backdrop to close...")
    page.click("#sidebar-backdrop", position={"x": 300, "y": 200})
    page.wait_for_timeout(300)

    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('open')")
    print(f"Mobile: Sidebar open after backdrop click = {sidebar_is_open} (Expected: False)")
    assert not sidebar_is_open, "Sidebar failed to close on backdrop click!"

    # Open again, click nav item
    page.click("#mobile-toggle")
    page.wait_for_timeout(300)
    print("Clicking nav item 'Camera Monitor'...")
    page.click("[data-page='monitor']")
    page.wait_for_timeout(300)

    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('open')")
    page_title = page.locator("#topbar-current-page").inner_text()
    print(f"Mobile: Sidebar closed after nav = {not sidebar_is_open}, Page title = '{page_title}'")
    assert not sidebar_is_open, "Sidebar failed to auto-close after mobile navigation!"

    browser.close()
    print("✓ standalone_sentrax.html mobile tests passed!")

def test_mobile_com(p):
    print("\n--- Testing com/files/index.html on Mobile ---")
    browser = p.chromium.launch(
        executable_path="/usr/bin/chromium",
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    )
    
    # 1. Desktop check (1280x800)
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(COM_PATH)
    page.wait_for_timeout(500)
    # Dismiss landing
    page.evaluate("() => navigate('dashboard')")
    page.wait_for_timeout(300)
    toggle_visible_desktop = page.is_visible("#mobile-toggle")
    print(f"Desktop (1280px): #mobile-toggle visible = {toggle_visible_desktop} (Expected: False)")
    assert not toggle_visible_desktop, "On desktop, #mobile-toggle should not be visible!"
    page.close()

    # 2. Mobile check (375x667)
    page = browser.new_page(viewport={"width": 375, "height": 667})
    page.goto(COM_PATH)
    page.wait_for_timeout(500)
    # Enter workspace from landing
    page.evaluate("() => navigate('dashboard')")
    page.wait_for_timeout(300)

    # Verify #mobile-toggle is visible on mobile
    toggle_visible_mobile = page.is_visible("#mobile-toggle")
    print(f"Mobile (375px): #mobile-toggle visible = {toggle_visible_mobile} (Expected: True)")
    assert toggle_visible_mobile, "On mobile, #mobile-toggle must be visible!"

    # Verify sidebar is initially closed
    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('mobile-open')")
    print(f"Mobile: Sidebar open initially = {sidebar_is_open} (Expected: False)")
    assert not sidebar_is_open, "Sidebar should not be open initially on mobile!"

    shot3 = os.path.join(ARTIFACT_DIR, "mobile_com_closed.png")
    page.screenshot(path=shot3)
    print(f"Saved: {shot3}")

    # Click #mobile-toggle to open sidebar
    print("Clicking #mobile-toggle...")
    page.click("#mobile-toggle")
    page.wait_for_timeout(300)

    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('mobile-open')")
    overlay_is_visible = page.evaluate("() => document.getElementById('sidebar-overlay').classList.contains('visible')")
    print(f"Mobile: Sidebar open after toggle = {sidebar_is_open}, Overlay visible = {overlay_is_visible}")
    assert sidebar_is_open, "Sidebar failed to open after clicking #mobile-toggle!"
    assert overlay_is_visible, "Overlay failed to show after opening sidebar!"

    shot4 = os.path.join(ARTIFACT_DIR, "mobile_com_sidebar_open.png")
    page.screenshot(path=shot4)
    print(f"Saved: {shot4}")

    # Click overlay to close
    print("Clicking overlay to close...")
    page.click("#sidebar-overlay", position={"x": 300, "y": 200})
    page.wait_for_timeout(300)

    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('mobile-open')")
    print(f"Mobile: Sidebar open after overlay click = {sidebar_is_open} (Expected: False)")
    assert not sidebar_is_open, "Sidebar failed to close on overlay click!"

    # Open again, click nav item
    page.click("#mobile-toggle")
    page.wait_for_timeout(300)
    print("Clicking nav item 'Evidence Vault'...")
    page.evaluate("() => navigate('evidence')")
    page.wait_for_timeout(300)

    sidebar_is_open = page.evaluate("() => document.getElementById('sidebar').classList.contains('mobile-open')")
    print(f"Mobile: Sidebar closed after nav = {not sidebar_is_open}")
    assert not sidebar_is_open, "Sidebar failed to auto-close after mobile navigation!"

    browser.close()
    print("✓ com/files/index.html mobile tests passed!")

if __name__ == "__main__":
    with sync_playwright() as p:
        test_mobile_standalone(p)
        test_mobile_com(p)
    print("\n>>> ALL MOBILE VERIFICATION TESTS PASSED SUCCESSFULLY! <<<")
