import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = "/home/mrx/.gemini/antigravity/brain/5399a33c-2bff-4c02-9962-617d3de6361d"
HTML_PATH = "file:///home/mrx/Pictures/sentrax/com/files/index.html"

def run_research_verification():
    print("Starting Autonomous AI Research Agent verification...")
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

        # 1. Navigate to Research Page
        print("1. Navigating to AI Research Agent page...")
        page.evaluate("""() => {
            navigate('research');
        }""")
        page.wait_for_timeout(1000)

        is_active = page.evaluate("() => document.getElementById('page-research').classList.contains('active')")
        print(f"Research page active: {is_active}")
        assert is_active, "Research page failed to activate!"

        # 2. Check 8 Agent Cards
        agent_cards = page.locator("#agent-cards-grid .agent-card")
        card_count = agent_cards.count()
        print(f"Agent Cards Rendered: {card_count}")
        assert card_count == 8, f"Expected 8 agent cards, got {card_count}"

        # 3. Check Boss Decisions Board
        boss_items = page.locator("#boss-priority-list .boss-priority-item")
        boss_count = boss_items.count()
        print(f"Boss Priority Items Rendered: {boss_count}")
        assert boss_count >= 3, f"Expected at least 3 boss priorities, got {boss_count}"

        # 4. Check Findings count
        findings = page.locator("#findings-container .finding-card")
        findings_count = findings.count()
        print(f"Initial Findings Rendered: {findings_count}")
        assert findings_count >= 10, f"Expected at least 10 findings, got {findings_count}"

        # 5. Capture Overview Screenshot
        shot1 = os.path.join(ARTIFACT_DIR, "verified_research_overview.png")
        page.screenshot(path=shot1, full_page=False)
        print(f"Saved Overview screenshot: {shot1}")

        # 6. Test Launch All 8 Agents
        print("6. Launching All 8 Agents...")
        page.click("#btn-launch-agents")
        page.wait_for_timeout(1500)
        # Verify running class
        has_running = page.evaluate("() => document.querySelectorAll('.agent-card.running').length > 0")
        print(f"Agents actively running animation: {has_running}")
        # Wait for completion (takes ~3.5s)
        page.wait_for_timeout(2500)

        # 7. Test Boss Decision Actions
        print("7. Testing Boss Decision Actions...")
        # Click Add on item 0
        page.evaluate("() => setBossDecision('bp-1', 'added')")
        page.wait_for_timeout(300)
        tally_added = page.locator("#tally-added").inner_text()
        print(f"Tally Added after action: {tally_added}")
        assert "1 added" in tally_added.lower(), f"Expected '1 Added', got {tally_added}"

        # Click Save on item 1
        page.evaluate("() => setBossDecision('bp-2', 'saved')")
        page.wait_for_timeout(300)
        tally_saved = page.locator("#tally-saved").inner_text()
        print(f"Tally Saved after action: {tally_saved}")
        assert "1 saved" in tally_saved.lower(), f"Expected '1 Saved', got {tally_saved}"

        # 8. Check API Config Modal
        print("8. Checking API Config Modal...")
        page.evaluate("() => openApiConfigModal()")
        page.wait_for_timeout(500)

        acc_val = page.locator("#cfg-account-name").input_value()
        token_val = page.locator("#cfg-token-value").input_value()
        print(f"API Modal Values: Account={acc_val}, Token length={len(token_val)}")
        assert acc_val == "lifoyi9042", f"Expected 'lifoyi9042', got {acc_val}"
        assert len(token_val) > 20, "Token value is empty or too short"

        # Capture Modal Screenshot
        shot2 = os.path.join(ARTIFACT_DIR, "verified_research_api_modal.png")
        page.screenshot(path=shot2, full_page=False)
        print(f"Saved API Modal screenshot: {shot2}")

        page.evaluate("() => closeModal('modal-api-config')")
        page.wait_for_timeout(300)

        # 9. Test Finding Tabs filter
        print("9. Testing Finding Tabs filter...")
        page.evaluate("() => selectAgentTab('github')")
        page.wait_for_timeout(300)
        github_findings = page.locator("#findings-container .finding-card").count()
        print(f"Filtered GitHub findings: {github_findings}")
        assert github_findings == 6, f"Expected 6 GitHub findings, got {github_findings}"

        # Filter by search
        page.fill("#finding-search-input", "PaddleOCR")
        page.wait_for_timeout(300)
        searched_findings = page.locator("#findings-container .finding-card").count()
        print(f"Search results for 'PaddleOCR': {searched_findings}")
        assert searched_findings == 1, f"Expected 1 finding for PaddleOCR, got {searched_findings}"

        # Capture Boss & Findings screenshot
        shot3 = os.path.join(ARTIFACT_DIR, "verified_research_boss_board.png")
        page.screenshot(path=shot3, full_page=False)
        print(f"Saved Boss Board screenshot: {shot3}")

        # Check for critical errors (excluding offline CDN network fetch failures)
        critical_errors = [e for e in console_logs if "[PAGE ERROR]" in e or ("Error:" in e and "net::ERR_" not in e)]
        if critical_errors:
            print("WARNING: Critical JS errors found:")
            for err in critical_errors:
                print(" ", err)
            raise AssertionError(f"JS Errors occurred: {critical_errors}")

        print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")
        browser.close()

if __name__ == "__main__":
    run_research_verification()
