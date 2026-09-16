# 📸 site-shooter

A standalone, high-performance Node.js command-line crawler powered by **Playwright**. It automatically explores websites—including JavaScript-heavy Single Page Applications (SPAs)—captures full-page screenshots across multiple viewports and key UI components, and compiles everything into a self-contained, offline HTML visual gallery and JSON report.

---

## ⚡ Features

- **Real Headless Chromium Engine**: Executes client-side JavaScript, React/Vue/Angular routing, DOM mutations, and animations just like a real user.
- **Bypasses robots.txt**: Operates as a direct browser automation tool without search engine advisory restrictions.
- **Smart SPA & Navigation Discovery**:
  - Automatically identifies in-page navigation targets (`.nav-item`, `[data-page]`, `[data-route]`, `[role="tab"]`, `[onclick*="navigate"]`).
  - Detects workspace entry and gate actions (`Open demo workspace`, `Enter`, `Get Started`) to crawl gated application views.
  - Dynamically discovers newly revealed sub-navigation and tabs as it navigates.
- **Multi-Viewport Full-Page Screenshots**:
  - **Desktop**: 1920 × 1080
  - **Tablet**: 768 × 1024
  - **Mobile**: 390 × 844 (iPhone 14)
- **Key Component Cropping**: Automatically locates and crops up to 3 instances per view of:
  - Modals (`.modal.open`, `[role="dialog"]`, `.dialog`)
  - Cards (`.card`, `[class*="card"]`, `.panel`)
  - Headers (`header`, `.header`, `.topbar`)
  - Navigation bars (`nav`, `.nav`, `.navbar`)
  - Sidebars (`.sidebar`, `aside`)
- **Zero Paid APIs**: Powered entirely by Playwright and local headless Chromium.
- **Offline HTML Visual Gallery**: Includes a standalone, dark-themed responsive gallery (`index.html`) with category filters and click-to-zoom modal lightbox.
- **Structured Metadata**: Emits `report.json` with timestamps, URLs, element types, and screenshot filepaths.

---

## 🚀 Installation

```bash
cd site-shooter
npm install
npx playwright install chromium
```

---

## 💻 Usage

```bash
# Basic usage
node crawl.js <url>

# Custom page limits and crawl depth
node crawl.js <url> --max-pages 40 --depth 1

# Example: Crawling Sentrax
node crawl.js https://shakyavinit.github.io/sentrax/
```

### CLI Arguments

| Argument / Option | Default | Description |
| :--- | :--- | :--- |
| `<url>` | *Required* | Target website or application URL |
| `--max-pages <N>` | `40` | Maximum number of views/sections to capture |
| `--depth <N>` | `1` | Depth of same-domain hyperlink crawling |
| `--help`, `-h` | — | Display help message and options |

---

## 📁 Output Directory Structure

For any crawled website, `site-shooter` creates an organized directory named `<site-name>-<YYYY-MM-DD>`:

```text
sentrax-2026-09-16/
├── desktop/
│   ├── 01-investigate-the-connections-desktop.png
│   ├── 02-investigation-overview-desktop.png
│   ├── 03-camera-monitor-desktop.png
│   └── ...
├── tablet/
│   ├── 01-investigate-the-connections-tablet.png
│   ├── 02-investigation-overview-tablet.png
│   └── ...
├── mobile/
│   ├── 01-investigate-the-connections-mobile.png
│   ├── 02-investigation-overview-mobile.png
│   └── ...
├── elements/
│   ├── 02-investigation-overview-header-01.png
│   ├── 02-investigation-overview-nav-01.png
│   ├── 02-investigation-overview-sidebar-01.png
│   ├── 02-investigation-overview-card-01.png
│   └── ...
├── index.html       <-- Offline interactive visual gallery
└── report.json      <-- Machine-readable JSON summary
```

---

## 📊 Sample `report.json`

```json
[
  {
    "label": "Camera monitor",
    "url": "https://shakyavinit.github.io/sentrax/live",
    "type": "page",
    "screenshotCount": 6,
    "screenshots": {
      "desktop": "desktop/03-camera-monitor-desktop.png",
      "tablet": "tablet/03-camera-monitor-tablet.png",
      "mobile": "mobile/03-camera-monitor-mobile.png",
      "elements": [
        "elements/03-camera-monitor-header-01.png",
        "elements/03-camera-monitor-nav-01.png",
        "elements/03-camera-monitor-sidebar-01.png"
      ]
    },
    "timestamp": "2026-09-16T06:21:00.000Z"
  }
]
```

---

## 🖼️ Opening the Gallery

Double-click or open `index.html` in any browser:
```bash
# Linux
xdg-open sentrax-2026-09-16/index.html

# macOS
open sentrax-2026-09-16/index.html

# Windows
start sentrax-2026-09-16/index.html
```
