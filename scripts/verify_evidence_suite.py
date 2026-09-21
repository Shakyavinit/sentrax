import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/home/mrx/.gemini/antigravity/brain/5399a33c-2bff-4c02-9962-617d3de6361d"
HTML_PATH = "file:///home/mrx/Pictures/sentrax/com/files/index.html"

def run_verification():
    print("Starting Evidence Vault comprehensive verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/chromium",
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[PAGE ERROR] {err}"))

        page.goto(HTML_PATH)
        page.wait_for_timeout(1000)

        # 1. Dismiss Landing & Navigate to Evidence Vault
        print("1. Opening workspace and navigating to Evidence Vault...")
        page.evaluate("""() => {
            navigate('evidence');
        }""")
        page.wait_for_timeout(1200)

        is_active = page.evaluate("() => document.getElementById('page-evidence').classList.contains('active')")
        print(f"Evidence page active: {is_active}")
        assert is_active, "Evidence page failed to activate!"

        # 2. Verify KPI Metric Cards
        total_kpi = page.locator("#evidence-kpi-total").inner_text()
        alert_kpi = page.locator("#evidence-kpi-alerts").inner_text()
        print(f"KPI Metrics: Total={total_kpi}, Alerts={alert_kpi}")

        # 3. Verify Grid Cards Count
        grid_cards = page.locator("#evidence-grid .evidence-card")
        card_count = grid_cards.count()
        print(f"Initial Grid Cards rendered: {card_count}")
        assert card_count >= 10, f"Expected at least 10 evidence cards, found {card_count}"

        # Capture Grid Screenshot
        grid_screenshot_path = os.path.join(ARTIFACT_DIR, "verified_evidence_vault_grid.png")
        page.screenshot(path=grid_screenshot_path, full_page=False)
        print(f"Saved Grid screenshot: {grid_screenshot_path}")

        # 4. Test Live Instant Search
        print("4. Testing Live Search (query: 'Scorpio')...")
        page.fill("#evidence-search-input", "Scorpio")
        page.wait_for_timeout(300)
        filtered_count = page.locator("#evidence-grid .evidence-card").count()
        print(f"Filtered Cards for 'Scorpio': {filtered_count}")
        assert filtered_count >= 1, "Search for 'Scorpio' returned 0 results"

        # Clear search
        page.fill("#evidence-search-input", "")
        page.wait_for_timeout(300)
        reset_count = page.locator("#evidence-grid .evidence-card").count()
        print(f"Cards count after search clear: {reset_count}")
        assert reset_count == card_count, "Reset count mismatch"

        # 5. Test Filter Pills
        print("5. Testing Filter Pills...")
        # Watchlist
        page.click("#pill-filter-watchlist")
        page.wait_for_timeout(300)
        watchlist_count = page.locator("#evidence-grid .evidence-card").count()
        print(f"Watchlist filter count: {watchlist_count}")
        assert 0 < watchlist_count < card_count, "Watchlist filter failed"

        # High Conf
        page.click("#pill-filter-highconf")
        page.wait_for_timeout(300)
        highconf_count = page.locator("#evidence-grid .evidence-card").count()
        print(f"High Conf filter count: {highconf_count}")
        assert highconf_count > 0, "High conf filter failed"

        # Reset to All
        page.click("#pill-filter-all")
        page.wait_for_timeout(300)
        print(f"Reset to All count: {page.locator('#evidence-grid .evidence-card').count()}")

        # 6. Test Table View
        print("6. Testing Table View...")
        page.click("#btn-view-table")
        page.wait_for_timeout(500)
        table_container_visible = page.locator("#evidence-table-container").is_visible()
        grid_visible = page.locator("#evidence-grid").is_visible()
        table_rows = page.locator("#evidence-table-body tr").count()
        print(f"Table visible: {table_container_visible}, Grid visible: {grid_visible}, Table rows: {table_rows}")
        assert table_container_visible and not grid_visible, "Table view toggle failed"
        assert table_rows >= 10, "Table rows count too low"

        # Capture Table Screenshot
        table_screenshot_path = os.path.join(ARTIFACT_DIR, "verified_evidence_vault_table.png")
        page.screenshot(path=table_screenshot_path, full_page=False)
        print(f"Saved Table screenshot: {table_screenshot_path}")

        # Switch back to Grid View
        page.click("#btn-view-grid")
        page.wait_for_timeout(300)

        # 7. Test Evidence Inspection Modal
        print("7. Testing Forensic Inspection Modal...")
        first_card = page.locator("#evidence-grid .evidence-card").first
        first_card.click()
        page.wait_for_timeout(500)

        modal_evidence_visible = page.locator("#modal-evidence").is_visible()
        print(f"Forensic Detail Modal visible: {modal_evidence_visible}")
        assert modal_evidence_visible, "Forensic Detail Modal failed to open"

        # Check images inside modal
        modal_plate = page.locator("#evidence-modal-plate").inner_text()
        print(f"Modal Plate Title: {modal_plate}")

        # Capture Modal Detail Screenshot
        modal_screenshot_path = os.path.join(ARTIFACT_DIR, "verified_evidence_modal_detail.png")
        page.screenshot(path=modal_screenshot_path, full_page=False)
        print(f"Saved Modal Detail screenshot: {modal_screenshot_path}")

        # 8. Test Section 65B Certificate Modal
        print("8. Testing Section 65B Legal Certificate Modal...")
        page.evaluate("() => openSec65bFromEvidenceModal()")
        page.wait_for_timeout(600)

        modal_sec65b_visible = page.locator("#modal-sec65b-cert").is_visible()
        print(f"Section 65B Modal visible: {modal_sec65b_visible}")
        assert modal_sec65b_visible, "Section 65B Certificate Modal failed to open"

        # Verify cert content
        modal_text = page.locator("#modal-sec65b-cert").inner_text()
        print(f"Certificate modal text length: {len(modal_text)} chars")
        modal_text_upper = modal_text.upper()
        assert "SECTION 65B" in modal_text_upper or "SEC. 65B" in modal_text_upper, "Cert text missing key legal statute"
        assert "BHARATIYA SAKSHYA ADHINIYAM" in modal_text_upper or "BSA" in modal_text_upper, "Cert text missing BSA 2023 statute"

        # Capture Certificate Screenshot
        cert_screenshot_path = os.path.join(ARTIFACT_DIR, "verified_evidence_sec65b_cert.png")
        page.screenshot(path=cert_screenshot_path, full_page=False)
        print(f"Saved Certificate screenshot: {cert_screenshot_path}")

        # Close Certificate Modal
        page.evaluate("() => closeModal('modal-sec65b-cert')")
        page.wait_for_timeout(300)

        # 9. Test Batch Selection Checkboxes
        print("9. Testing Batch Selection...")
        page.evaluate("() => closeModal('modal-evidence')")
        page.wait_for_timeout(300)

        page.click("#evidence-select-all")
        page.wait_for_timeout(300)
        selected_text = page.locator("#evidence-selected-count").inner_text()
        batch_export_visible = page.locator("#btn-batch-export").is_visible()
        print(f"Selection status: {selected_text}, Batch Export Button visible: {batch_export_visible}")
        assert batch_export_visible, "Batch export button should be visible when items are selected"

        # Check console errors
        print("\n--- Console Logs ---")
        critical_errors = [
            l for l in console_logs 
            if ("[error]" in l.lower() or "[page error]" in l.lower()) 
            and "net::err_" not in l.lower()
        ]
        for l in console_logs:
            if "error" in l.lower() or "warn" in l.lower():
                print(" ", l)

        assert len(critical_errors) == 0, f"Encountered {len(critical_errors)} console errors: {critical_errors}"

        browser.close()
        print("\n>>> ALL EVIDENCE VAULT VERIFICATION TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_verification()
