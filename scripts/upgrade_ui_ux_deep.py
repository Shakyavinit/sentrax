import re
import os

FILE_PATH = "/home/mrx/Pictures/sentrax/com/files/index.html"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. UPGRADE ROOT DESIGN TOKENS (UI UX Pro Max Standards)
old_root = """:root {
  --void: #05080F;
  --surface: #090E18;
  --elevated: #0D1521;
  --overlay: #111C2B;
  --subtle: #162234;
  --border-dim: #162234;
  --border: #1E3248;
  --border-bright: #284560;
  --text-1: #E2EDF8;
  --text-2: #7B9DBE;
  --text-3: #3D5C78;
  --accent: #006FD6;
  --accent-hi: #0A84FF;
  --accent-glow: rgba(0,111,214,0.14);
  --green: #00B87A;
  --green-dim: rgba(0,184,122,0.1);
  --red: #E84040;
  --red-dim: rgba(232,64,64,0.1);
  --amber: #D97706;
  --amber-dim: rgba(217,119,6,0.1);
  --purple: #7C3AED;
  --purple-dim: rgba(124,58,237,0.1);
  --font: 'Inter', system-ui, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;
  --r: 6px;
  --r-lg: 10px;
  --r-xl: 14px;
  --sidebar: 220px;
  --topbar: 52px;
  --ease: cubic-bezier(0.16,1,0.3,1);"""

new_root = """:root {
  /* UI UX PRO MAX — ULTRA HIGH-CONTRAST OLED DARK & TACTICAL HUD TOKENS */
  --void: #05080F;
  --surface: #0A101A;
  --elevated: #0F1826;
  --overlay: #152234;
  --subtle: #1A2A40;
  --border-dim: #162438;
  --border: #1E344D;
  --border-bright: #2B4C72;
  --text-1: #F0F6FC;
  --text-2: #8FA8C0;
  --text-3: #4D6B85;
  --accent: #0E7FE0;
  --accent-hi: #1A9FFF;
  --accent-glow: rgba(14,127,224,0.22);
  --hud-cyan: #00F0FF;
  --hud-cyan-dim: rgba(0,240,255,0.12);
  --green: #00C875;
  --green-dim: rgba(0,200,117,0.12);
  --green-glow: rgba(0,200,117,0.25);
  --red: #FF3B3B;
  --red-dim: rgba(255,59,59,0.14);
  --red-glow: rgba(255,59,59,0.28);
  --amber: #F59E0B;
  --amber-dim: rgba(245,158,11,0.12);
  --purple: #8B5CF6;
  --purple-dim: rgba(139,92,246,0.12);
  --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;
  --r: 6px;
  --r-lg: 10px;
  --r-xl: 14px;
  --sidebar: 224px;
  --topbar: 52px;
  --ease: cubic-bezier(0.16,1,0.3,1);
  --glass-bg: rgba(10, 16, 26, 0.82);
  --glass-border: rgba(43, 76, 114, 0.4);
  --glass-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);"""

if old_root in content:
    content = content.replace(old_root, new_root, 1)
    print("Updated root tokens")
else:
    print("Root tokens already updated or not matched")

# 2. INJECT ENHANCED GLOBAL STYLES, HUD BRACKETS, TABULAR NUMERALS & REDUCED MOTION
hud_styles = """
/* ═════════════════════════════════════════════════════════════════════
   UI UX PRO MAX — DEEP INTERACTION & HUD SYSTEM
═════════════════════════════════════════════════════════════════════ */
body {
  background: radial-gradient(circle at 50% 0%, #0B1626 0%, #05080F 75%);
}

/* Tabular Numerals for Forensic Alignment */
.stat-value, .mono, .plate, table td, .evidence-hash, .badge, .hero-stat-value {
  font-feature-settings: "tnum" 1, "zero" 1;
}

/* Tactile Button Feedback */
button:active, .btn:active, .nav-item:active {
  transform: scale(0.975);
}

/* Tactical HUD Corner Brackets */
.hud-bracket {
  position: relative;
}
.hud-bracket::before, .hud-bracket::after {
  content: "";
  position: absolute;
  width: 9px;
  height: 9px;
  pointer-events: none;
  border-color: var(--accent);
  opacity: 0.65;
  transition: all 200ms var(--ease);
}
.hud-bracket::before {
  top: -1px; left: -1px;
  border-top: 2px solid; border-left: 2px solid;
}
.hud-bracket::after {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid; border-right: 2px solid;
}
.hud-bracket:hover::before, .hud-bracket:hover::after {
  border-color: var(--hud-cyan);
  opacity: 1;
  box-shadow: 0 0 8px var(--hud-cyan);
}

/* Card Hover Elevation */
.card, .stat-card, .evidence-card {
  transition: transform 200ms var(--ease), border-color 200ms var(--ease), box-shadow 200ms var(--ease) !important;
}
.card:hover, .stat-card:hover {
  border-color: var(--border-bright) !important;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6), 0 0 1px 1px var(--border-bright) !important;
}

/* Custom Tactical Scrollbars */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: rgba(5,8,15,0.6); }
::-webkit-scrollbar-thumb { 
  background: var(--border); 
  border-radius: 3px; 
  border: 1px solid var(--void);
}
::-webkit-scrollbar-thumb:hover { 
  background: var(--accent); 
  box-shadow: 0 0 6px var(--accent-hi);
}

/* Accessibility: Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

/* Topbar Radar Telemetry Component */
.topbar-telemetry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--elevated);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 20px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-2);
}
.telemetry-radar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse-dot 1.2s infinite;
}
.telemetry-status {
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: 0.04em;
}
.telemetry-pill {
  background: rgba(14,127,224,0.15);
  color: var(--accent-hi);
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 9.5px;
}
.telemetry-time {
  color: var(--text-3);
  font-weight: 500;
  border-left: 1px solid var(--border);
  padding-left: 8px;
}

/* High-Contrast Interactive Table Rows */
table tbody tr {
  transition: background 140ms ease;
}
table tbody tr:hover {
  background: rgba(14, 127, 224, 0.05) !important;
}

/* Empty State Styling */
.hud-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--r-lg);
  margin: 16px 0;
}
.hud-empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--elevated);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
  color: var(--text-3);
}
"""

focus_target = """:focus-visible {
  outline: 2px solid var(--accent) !important;
  outline-offset: 2px !important;
}"""

if "/* UI UX PRO MAX — DEEP INTERACTION & HUD SYSTEM */" not in content and focus_target in content:
    content = content.replace(focus_target, focus_target + "\n" + hud_styles, 1)
    print("Injected HUD styles and micro-interactions")

# 3. ADD RADAR TELEMETRY WIDGET TO TOPBAR
old_topbar = """      <div class="breadcrumb" id="breadcrumb">
        <span>Dashboard</span>
      </div>"""

new_topbar = """      <div class="breadcrumb" id="breadcrumb">
        <span>Dashboard</span>
      </div>
      <div class="topbar-telemetry hide-mobile">
        <span class="telemetry-radar-dot"></span>
        <span class="telemetry-status">SOC RADAR ONLINE</span>
        <span class="telemetry-pill">15 NODES LIVE</span>
        <span class="telemetry-time" id="topbar-live-clock">14:26:17 IST</span>
      </div>"""

if "topbar-telemetry" not in content and old_topbar in content:
    content = content.replace(old_topbar, new_topbar, 1)
    print("Added topbar telemetry widget")

# 4. ADD TOPBAR CLOCK TICKER IN JAVASCRIPT
clock_script = """
// ─── REAL-TIME TOPBAR CLOCK TICKER ───
function updateTopbarClock() {
  const clock = document.getElementById('topbar-live-clock');
  if (!clock) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  clock.textContent = `${h}:${m}:${s} IST`;
}
setInterval(updateTopbarClock, 1000);
updateTopbarClock();
"""

dom_target = "document.addEventListener('DOMContentLoaded', () => {"
if "updateTopbarClock()" not in content and dom_target in content:
    content = content.replace(dom_target, clock_script + "\n" + dom_target, 1)
    print("Added clock ticker script")

# 5. UPGRADE LANDING HERO WITH GLASSMORPHISM & ACCENT GRADIENTS
old_landing_hero = """.landing-hero {
  max-width: 580px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0,0,0,0.8);
  position: relative;
}"""

new_landing_hero = """.landing-hero {
  max-width: 600px;
  margin: 0 auto;
  background: var(--glass-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--glass-border);
  border-radius: var(--r-xl);
  padding: 38px 32px;
  text-align: center;
  box-shadow: var(--glass-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
}
.landing-hero::before, .landing-hero::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
  border-color: var(--accent);
  opacity: 0.6;
}
.landing-hero::before {
  top: -1px; left: -1px;
  border-top: 2px solid; border-left: 2px solid; border-top-left-radius: var(--r-xl);
}
.landing-hero::after {
  bottom: -1px; right: -1px;
  border-bottom: 2px solid; border-right: 2px solid; border-bottom-right-radius: var(--r-xl);
}"""

if old_landing_hero in content:
    content = content.replace(old_landing_hero, new_landing_hero, 1)
    print("Updated landing-hero glassmorphism")

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: UI UX Pro Max deep design system upgrades completed!")
