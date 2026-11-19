// Browser checks against the built _site/ (run `node tools/build-site.mjs` first).
// Covers layout, interactions, a no-JS pass, CSP violations, and a dependency-free
// accessibility pass (alt text, names, heading order, 14px minimum, WCAG AA contrast).
const { chromium } = require("playwright");
const { createServer } = require("node:http");
const { readFile, mkdir } = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");

const repo = path.resolve(__dirname, "..");
const root = path.join(repo, "_site");
const results = path.join(repo, "test-results");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

// Behaves like GitHub Pages: directory index, and 404.html for missing paths.
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.resolve(root, "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": types[".html"] }).end(await readFile(path.join(root, "404.html")));
  }
});

/** Runs in the page: returns a list of accessibility problems. */
function auditPage() {
  const problems = [];
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !el.closest("[aria-hidden='true'], dialog:not([open])");
  };
  const lum = ([r, g, b]) => {
    const c = [r, g, b].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const rgba = (str) => (str.match(/[\d.]+/g) || []).map(Number);
  const background = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const [r, g, b, a = 1] = rgba(getComputedStyle(node).backgroundColor);
      if (a >= 0.85 && getComputedStyle(node).backgroundColor !== "rgba(0, 0, 0, 0)") return [r, g, b];
    }
    return [14, 13, 12];
  };

  document.querySelectorAll("img").forEach((img) => {
    if (!img.closest("dialog") && !img.hasAttribute("alt")) problems.push(`img without alt: ${img.src}`);
  });
  document.querySelectorAll("a[href], button, input, summary").forEach((el) => {
    if (!visible(el)) return;
    const name = (el.getAttribute("aria-label") || el.textContent || el.value || el.querySelector("img")?.alt || "").trim();
    const labelled = el.id && document.querySelector(`label[for="${el.id}"]`);
    if (!name && !labelled) problems.push(`control without a name: ${el.outerHTML.slice(0, 80)}`);
    const r = el.getBoundingClientRect();
    if (el.matches("button, summary, .pill, .button") && (r.height < 24 || r.width < 24)) problems.push(`small target: ${el.textContent.trim()}`);
  });
  let last = 0;
  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
    const level = Number(h.tagName[1]);
    if (last && level > last + 1) problems.push(`heading jumps h${last} → h${level}: ${h.textContent.trim().slice(0, 40)}`);
    last = level;
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!walker.currentNode.textContent.trim() || seen.has(el) || !visible(el)) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize);
    if (size < 14) problems.push(`text under 14px (${size}px): ${el.textContent.trim().slice(0, 40)}`);
    const [r, g, b, a = 1] = rgba(s.color);
    if (a < 1) continue;
    const L1 = lum([r, g, b]);
    const L2 = lum(background(el));
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) problems.push(`contrast ${ratio.toFixed(2)}:1: ${el.textContent.trim().slice(0, 40)}`);
  }
  return problems;
}

(async () => {
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}`;
  await mkdir(results, { recursive: true });
  const browser = await chromium.launch();
  const failures = [];
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && !response.url().includes("/does-not-exist")) errors.push(`${response.status()} ${response.url()}`);
    });

    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const audit = async (label) => {
      const problems = await page.evaluate(auditPage);
      if (problems.length) failures.push(`${label}:\n  ${problems.join("\n  ")}`);
    };

    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });

      // Home
      await page.goto(url + "/", { waitUntil: "networkidle" });
      assert(!(await overflow()), `Horizontal overflow on / at ${width}px`);
      for (const id of ["shelf", "spin", "memory", "rediscover", "yours", "release"])
        assert(await page.locator(`#${id}`).isVisible(), `#${id} visible at ${width}px`);
      await page.locator(".hero-stage .device").click();
      await page.locator("dialog[open]").waitFor();
      await page.keyboard.press("Escape");
      assert(!(await page.locator("dialog").isVisible()), "dialog closes on Escape");
      assert(await page.locator(".hero-stage .device").evaluate((el) => el === document.activeElement), "focus returns to opener");
      const faq = page.locator(".faq details").first();
      await faq.locator("summary").click();
      assert.notEqual(await faq.getAttribute("open"), null, "FAQ opens");
      await faq.locator("summary").click();
      if (width < 900) {
        const toggle = page.locator(".menu-toggle");
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        await page.locator('#nav-links a[href="#yours"]').click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "false", "menu closes after navigation");
      } else {
        assert(await page.locator('#nav-links a[href="#shelf"]').isVisible(), "desktop nav visible");
      }
      if (width === 1440 || width === 390) await audit(`/ at ${width}px`);
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await page.waitForFunction(() => [...document.images].filter((i) => i.getAttribute("src")).every((i) => i.complete && i.naturalWidth > 0));
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: path.join(results, `home-${width}.png`), fullPage: true });

      // Privacy
      await page.goto(url + "/privacy/", { waitUntil: "networkidle" });
      assert.equal(await page.locator("article h2").count(), 11, "privacy has 11 sections");
      assert(!(await overflow()), `Horizontal overflow on /privacy/ at ${width}px`);
      await page.getByRole("link", { name: "8. Retention and deletion", exact: true }).click();
      assert.equal(new URL(page.url()).hash, "#section-8");
      if (width === 1440 || width === 390) await audit(`/privacy/ at ${width}px`);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: path.join(results, `privacy-${width}.png`), fullPage: true });

      // Support
      await page.goto(url + "/support/", { waitUntil: "networkidle" });
      assert.equal(await page.getByLabel("Support email", { exact: true }).inputValue(), "support.groovefolio@gmail.com");
      assert.equal(await page.getByRole("link", { name: "Open email app" }).getAttribute("href"), "mailto:support.groovefolio@gmail.com");
      assert(await page.locator("#copy-email").isVisible(), "copy button shown with JS");
      assert(!(await overflow()), `Horizontal overflow on /support/ at ${width}px`);
      if (width === 1440 || width === 390) await audit(`/support/ at ${width}px`);
      await page.screenshot({ path: path.join(results, `support-${width}.png`), fullPage: true });

      // 404 at a nested path: assets must still load (WEB-08)
      const missing = await page.goto(url + "/does-not-exist/deeper/", { waitUntil: "networkidle" });
      assert.equal(missing.status(), 404);
      assert(await page.getByRole("heading", { name: /This groove/ }).isVisible());
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgba(0, 0, 0, 0)", "404 stylesheet loads from a nested path");
      if (width === 390) await audit(`404 at ${width}px`);

      console.log(`PASS ${width}px: layout, dialog + focus, FAQ, navigation, privacy, support, 404`);
    }

    // Sitemap generated with real dates
    await page.goto(url + "/sitemap.xml");
    const sitemap = await page.content();
    assert((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length === 3, "sitemap lastmod for 3 pages");

    // Without JavaScript every section and the navigation stay usable.
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noJs.newPage();
    await plain.setViewportSize({ width: 390, height: 900 });
    await plain.goto(url + "/", { waitUntil: "networkidle" });
    for (const id of ["shelf", "spin", "memory", "rediscover", "yours", "release"])
      assert(await plain.locator(`#${id} h2`).isVisible(), `no-JS: #${id} heading visible`);
    assert(await plain.locator('#nav-links a[href="#shelf"]').isVisible(), "no-JS: nav links visible");
    assert(!(await plain.evaluate(() => document.documentElement.scrollWidth > innerWidth)), "no-JS overflow");
    await plain.screenshot({ path: path.join(results, "home-nojs-390.png"), fullPage: true });
    await noJs.close();

    const csp = errors.filter((e) => /Content Security Policy|Refused to/.test(e));
    assert.deepEqual(csp, [], "CSP violations");
    assert.deepEqual(errors, [], "Page errors or failed requests");
    if (failures.length) {
      console.error("Accessibility problems:\n" + failures.join("\n"));
      process.exitCode = 1;
    } else {
      console.log("PASS accessibility: alt text, names, headings, 14px minimum, AA contrast (1440 + 390px)");
    }
    console.log("PASS no-JS, sitemap, no CSP violations, no failed requests");
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
