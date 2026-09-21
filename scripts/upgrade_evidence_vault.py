import re

with open("com/files/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update CSS for Evidence Vault
new_evidence_css = """
/* ═════════════════════════════════════════════════════════════════════
   STEP 12 — EVIDENCE VAULT PAGE (TACTICAL FORENSICS UPGRADE)
═════════════════════════════════════════════ */
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.evidence-card {
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: all 200ms var(--ease);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}
.evidence-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 15px rgba(14,127,224,0.15);
}
.evidence-card.selected {
  border-color: var(--accent);
  background: rgba(14,127,224,0.05);
  box-shadow: 0 0 0 1px var(--accent);
}

.evidence-img-container {
  height: 125px;
  background: #05080E;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.evidence-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.evidence-card:hover .evidence-img-container img {
  transform: scale(1.04);
}
.evidence-hud-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  pointer-events: none;
  border-color: var(--accent);
}
.evidence-hud-tl { top: 6px; left: 6px; border-top: 2px solid; border-left: 2px solid; }
.evidence-hud-tr { top: 6px; right: 6px; border-top: 2px solid; border-right: 2px solid; }
.evidence-hud-bl { bottom: 6px; left: 6px; border-bottom: 2px solid; border-left: 2px solid; }
.evidence-hud-br { bottom: 6px; right: 6px; border-bottom: 2px solid; border-right: 2px solid; }

.evidence-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.evidence-hash {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--text-3);
  background: #06090F;
  border: 1px solid var(--border-dim);
  padding: 4px 6px;
  border-radius: var(--r);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.evidence-hash:hover {
  border-color: var(--accent);
  color: var(--text-2);
}

.evidence-view-btn {
  padding: 6px 12px;
  font-size: 11px;
  font-family: var(--font-mono);
  border: none;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 120ms ease;
}
.evidence-view-btn.active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.evidence-pill {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-family: var(--font-mono);
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border-dim);
  cursor: pointer;
  transition: all 140ms ease;
}
.evidence-pill:hover {
  border-color: var(--border-bright);
  color: var(--text-1);
}
.evidence-pill.active {
  background: var(--accent-glow);
  color: var(--accent-hi);
  border-color: var(--accent);
}

.evidence-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}
.evidence-table th {
  background: #090E17;
  padding: 10px 12px;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--text-2);
  border-bottom: 1px solid var(--border);
  letter-spacing: 0.05em;
}
.evidence-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-dim);
  vertical-align: middle;
}
.evidence-table tr:hover td {
  background: rgba(14,127,224,0.04);
}
"""

# Replace old evidence CSS
css_pattern = r"/\* ═+\s+STEP 12 — EVIDENCE VAULT PAGE\s+═+\s*\*/[\s\S]*?(?=/\* ═+\s+STEP 15 — MODALS)"
html = re.sub(css_pattern, new_evidence_css.strip() + "\n\n", html)

print("CSS updated successfully!")
with open("com/files/index.html", "w", encoding="utf-8") as f:
    f.write(html)
