#!/usr/bin/env node

/**
 * site-shooter: Automated website screenshot and visual discovery crawler
 * Powered by Playwright
 */

const path = require('path');
const { chromium } = require('playwright');
const {
  sanitizeName,
  formatSeq,
  getOutputDirName,
  ensureDirs,
  safeWait
} = require('./lib/utils');
const { discoverTargets } = require('./lib/discover');
const { captureView } = require('./lib/capture');
const { generateReport } = require('./lib/report');

// CLI Arguments Parser
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node crawl.js <url> [options]

Arguments:
  <url>               Target website URL (e.g. https://example.com)

Options:
  --max-pages <num>   Maximum number of pages/sections to crawl (default: 40)
  --depth <num>       Crawl depth for discovered links (default: 1)
  --help, -h          Show this help message

Examples:
  node crawl.js https://shakyavinit.github.io/sentrax/
  node crawl.js https://example.com --max-pages 25 --depth 2
`);
    process.exit(0);
  }

  let rawUrl = null;
  let maxPages = 40;
  let depth = 1;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--max-pages' && args[i + 1]) {
      maxPages = parseInt(args[++i], 10) || 40;
    } else if (arg.startsWith('--max-pages=')) {
      maxPages = parseInt(arg.split('=')[1], 10) || 40;
    } else if (arg === '--depth' && args[i + 1]) {
      depth = parseInt(args[++i], 10) || 1;
    } else if (arg.startsWith('--depth=')) {
      depth = parseInt(arg.split('=')[1], 10) || 1;
    } else if (!arg.startsWith('-') && !rawUrl) {
      rawUrl = arg;
    }
  }

  if (!rawUrl) {
    console.error('Error: Please provide a valid target URL.');
    process.exit(1);
  }

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl;
  }

  return { targetUrl: rawUrl, maxPages, depth };
}

async function main() {
  const { targetUrl, maxPages, depth } = parseArgs();
  const startTime = Date.now();

  console.log(`=======================================================`);
  console.log(`🚀 SITE-SHOOTER: Starting crawl`);
  console.log(`Target:     ${targetUrl}`);
  console.log(`Max Pages:  ${maxPages}`);
  console.log(`Depth:      ${depth}`);
  console.log(`=======================================================\n`);

  // Setup output directory
  const outputDirName = getOutputDirName(targetUrl);
  const outputDir = path.resolve(process.cwd(), outputDirName);
  ensureDirs(outputDir);
  console.log(`📁 Output Directory: ${outputDir}\n`);

  // Launch Playwright Headless Chromium
  console.log(`🌐 Launching headless browser (Playwright Chromium)...`);
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const viewReports = [];
  const visitedLabels = new Set();
  const visitedUrls = new Set();
  const queuedLabels = new Set();
  const targetsQueue = [];
  let seq = 1;
  let totalDiscovered = 0;
  let totalCaptured = 0;
  let totalFailed = 0;

  try {
    // ----------------------------------------------------
    // PHASE 1: Load Target URL & Capture Initial View
    // ----------------------------------------------------
    console.log(`\n[1/2] Loading primary page: ${targetUrl}...`);
    visitedUrls.add(targetUrl);

    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await safeWait(1000); // Allow dynamic rendering, counters, maps to settle
    } catch (err) {
      console.error(`[ERROR] Failed to load initial page ${targetUrl}: ${err.message}`);
      await browser.close();
      process.exit(1);
    }

    // Determine initial view label
    const initialLabel = await page.evaluate(() => {
      const activeNav = document.querySelector('.nav-item.is-active, .nav-item.active, [aria-current="page"], [data-page].active');
      if (activeNav) {
        const text = activeNav.textContent.replace(/\s+/g, ' ').trim();
        if (text) return text;
      }
      const h1 = document.querySelector('h1, #page-title, .page-header');
      if (h1 && h1.textContent.trim()) {
        return h1.textContent.trim();
      }
      return 'Home';
    });

    const sanitizedInit = sanitizeName(initialLabel);
    visitedLabels.add(sanitizedInit);
    queuedLabels.add(sanitizedInit);

    console.log(`📸 Capturing View [${formatSeq(seq)}]: "${initialLabel}"...`);
    const initCapture = await captureView(page, outputDir, seq, sanitizedInit);
    totalCaptured += initCapture.count;

    viewReports.push({
      label: initialLabel,
      url: page.url(),
      type: 'initial-view',
      screenshotCount: initCapture.count,
      screenshots: initCapture,
      timestamp: new Date().toISOString()
    });

    // ----------------------------------------------------
    // PHASE 2: Discovery & Exploration Queue
    // ----------------------------------------------------
    console.log(`\n[2/2] Discovering navigation targets and routes...`);
    const initDiscovery = await discoverTargets(page, targetUrl);

    for (const t of initDiscovery.spaTargets) {
      const s = sanitizeName(t.label);
      if (!queuedLabels.has(s) && !visitedLabels.has(s)) {
        queuedLabels.add(s);
        targetsQueue.push(t);
        totalDiscovered++;
      }
    }

    console.log(`Found ${targetsQueue.length} navigation target(s) on initial view.`);

    // Process targets in queue
    while (targetsQueue.length > 0 && viewReports.length < maxPages) {
      const target = targetsQueue.shift();
      const targetSanitized = sanitizeName(target.label);

      if (visitedLabels.has(targetSanitized)) {
        continue;
      }

      console.log(`\n👉 Navigating to: "${target.label}"...`);
      let clicked = false;

      // Click Attempt 1: Target by shooterId
      try {
        const locator = page.locator(`[data-shooter-id="${target.shooterId}"]`);
        if (await locator.count() > 0 && await locator.first().isVisible()) {
          await locator.first().click({ timeout: 5000 });
          clicked = true;
        }
      } catch {
        // Continue to fallback
      }

      // Click Attempt 2: Text matching nav elements
      if (!clicked) {
        try {
          const textLocators = [
            page.locator('.nav-item, nav a, .sidebar a, [role="tab"]').filter({ hasText: target.label }).first(),
            page.locator('button, a').filter({ hasText: target.label }).first()
          ];

          for (const loc of textLocators) {
            if (await loc.count() > 0 && await loc.isVisible()) {
              await loc.click({ timeout: 4000 });
              clicked = true;
              break;
            }
          }
        } catch {
          // Continue to fallback
        }
      }

      // Click Attempt 3: Onclick or Href
      if (!clicked) {
        try {
          if (target.onclick) {
            await page.evaluate((code) => {
              try { new Function(code)(); } catch(e) {}
            }, target.onclick);
            clicked = true;
          } else if (target.href) {
            const hrefLocator = page.locator(`a[href="${target.href}"]`).first();
            if (await hrefLocator.count() > 0) {
              await hrefLocator.click({ timeout: 4000 });
              clicked = true;
            } else {
              const fullUrl = new URL(target.href, page.url()).href;
              await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
              clicked = true;
            }
          }
        } catch (err) {
          console.warn(`  [WARN] Failed to navigate to "${target.label}": ${err.message}`);
          totalFailed++;
          continue;
        }
      }

      if (!clicked) {
        console.warn(`  [WARN] Could not click or navigate to target "${target.label}"`);
        totalFailed++;
        continue;
      }

      // Settle wait
      await safeWait(400);
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      await page.waitForSelector('.nav-item, nav, h1', { timeout: 2000 }).catch(() => {});
      await safeWait(300);

      // Determine active page label
      const activeLabel = await page.evaluate((fallback) => {
        const activeNav = document.querySelector('.nav-item.is-active, .nav-item.active, [aria-current="page"]');
        if (activeNav) {
          const clone = activeNav.cloneNode(true);
          clone.querySelectorAll('.badge, svg, i').forEach(b => b.remove());
          const text = clone.textContent.replace(/\s+/g, ' ').trim();
          if (text) return text;
        }
        const h1 = document.querySelector('h1, #page-title, .page-header');
        if (h1 && h1.textContent.trim()) {
          return h1.textContent.trim();
        }
        return fallback;
      }, target.label);

      const effectiveSanitized = sanitizeName(activeLabel);
      if (visitedLabels.has(effectiveSanitized) || visitedLabels.has(targetSanitized)) {
        continue;
      }
      visitedLabels.add(effectiveSanitized);
      visitedLabels.add(targetSanitized);

      seq++;
      console.log(`📸 Capturing View [${formatSeq(seq)}]: "${activeLabel}"...`);
      const captureResult = await captureView(page, outputDir, seq, effectiveSanitized);
      totalCaptured += captureResult.count;

      viewReports.push({
        label: activeLabel,
        url: page.url(),
        type: 'page',
        screenshotCount: captureResult.count,
        screenshots: captureResult,
        timestamp: new Date().toISOString()
      });

      // Discover new targets revealed on this new page (e.g. sidebar tabs once inside app)
      const freshDiscovery = await discoverTargets(page, targetUrl);
      for (const t of freshDiscovery.spaTargets) {
        const s = sanitizeName(t.label);
        if (!queuedLabels.has(s) && !visitedLabels.has(s)) {
          queuedLabels.add(s);
          targetsQueue.push(t);
          totalDiscovered++;
        }
      }
    }

    // Process Discovered Internal Links if depth > 1
    if (depth > 1) {
      const { links } = await discoverTargets(page, targetUrl);
      for (const link of links) {
        if (viewReports.length >= maxPages) break;
        if (visitedUrls.has(link)) continue;
        visitedUrls.add(link);

        try {
          console.log(`\n🔗 Visiting Link [${formatSeq(seq + 1)}]: ${link}...`);
          await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => {});
          await safeWait(500);

          const pageTitle = await page.title() || 'Page';
          const sanitizedLinkName = sanitizeName(pageTitle);

          if (visitedLabels.has(sanitizedLinkName)) continue;
          visitedLabels.add(sanitizedLinkName);

          seq++;
          console.log(`📸 Capturing View [${formatSeq(seq)}]: "${pageTitle}"...`);
          const linkCapture = await captureView(page, outputDir, seq, sanitizedLinkName);
          totalCaptured += linkCapture.count;

          viewReports.push({
            label: pageTitle,
            url: link,
            type: 'page-link',
            screenshotCount: linkCapture.count,
            screenshots: linkCapture,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.warn(`  [WARN] Failed to process link ${link}: ${err.message}`);
          totalFailed++;
        }
      }
    }

  } catch (err) {
    console.error(`[FATAL] Crawler error: ${err.message}`);
  } finally {
    await browser.close();
  }

  // ----------------------------------------------------
  // PHASE 3: Generate report.json and index.html Gallery
  // ----------------------------------------------------
  console.log(`\n📄 Generating report.json and index.html gallery...`);
  generateReport(outputDir, targetUrl, viewReports);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n=======================================================`);
  console.log(`🎉 CRAWL COMPLETE`);
  console.log(`=======================================================`);
  console.log(`Discovered Targets:   ${totalDiscovered}`);
  console.log(`Views Captured:       ${viewReports.length}`);
  console.log(`Total Screenshots:    ${totalCaptured}`);
  console.log(`Failed Navigations:   ${totalFailed}`);
  console.log(`Duration:             ${durationSec}s`);
  console.log(`Output Directory:     ${outputDir}`);
  console.log(`Gallery Preview:      ${path.join(outputDir, 'index.html')}`);
  console.log(`Report JSON:          ${path.join(outputDir, 'report.json')}`);
  console.log(`=======================================================\n`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
