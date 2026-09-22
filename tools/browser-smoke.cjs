const { chromium } = require("playwright");
const { createServer } = require("node:http");
const { readFile, mkdir } = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const file = path.resolve(
    root,
    "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
  );
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
      })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await mkdir(path.join(root, "test-results"), { recursive: true });
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url, { waitUntil: "networkidle" });
      for (const feature of ["listen", "stats", "discover", "collection"]) {
        await page.locator(`[data-feature="${feature}"]`).click();
        assert(await page.locator(`#panel-${feature}`).isVisible());
        assert.equal(await page.locator(".feature-panel:visible").count(), 1);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        if (overflow) {
          await page.screenshot({
            path: `test-results/overflow-${width}.png`,
            fullPage: true,
          });
          console.log(
            await page.evaluate(() =>
              [...document.querySelectorAll("body *")]
                .filter((el) => {
                  const r = el.getBoundingClientRect();
                  return r.width && (r.right > innerWidth + 1 || r.left < -1);
                })
                .map((el) => [
                  el.tagName,
                  el.className,
                  el.getBoundingClientRect().width,
                ]),
            ),
          );
        }
        assert(!overflow, `Horizontal overflow at ${width}px (${feature})`);
      }
      await page.locator(".hero-phone").click();
      await page.locator("dialog[open]").waitFor();
      await page.keyboard.press("Escape");
      assert(!(await page.locator("dialog").isVisible()));
      assert(
        await page
          .locator(".hero-phone")
          .evaluate((el) => el === document.activeElement),
      );
      await page.locator("summary").first().click();
      assert.notEqual(
        await page.locator("details").first().getAttribute("open"),
        null,
      );
      await page.locator("summary").first().click();
      if (width < 761) {
        await page.locator(".menu-toggle").click();
        await page.locator('#navigation a[href="#questions"]').click();
        assert.equal(
          await page.locator(".menu-toggle").getAttribute("aria-expanded"),
          "false",
        );
      }
      await page.locator("footer").scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        [...document.images]
          .filter(
            (img) =>
              img.getBoundingClientRect().width && img.hasAttribute("src"),
          )
          .every((img) => img.complete && img.naturalWidth > 0),
      );
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `test-results/site-${width}.png`,
        fullPage: true,
      });
      console.log(
        `PASS ${width}px: layout, feature selection, dialog, focus return, FAQs, navigation`,
      );
      await page
        .getByRole("link", { name: "Privacy policy", exact: true })
        .click();
      await page.waitForURL(`${url}/privacy/`);
      assert(
        await page
          .getByRole("heading", { name: "Privacy policy", exact: true })
          .isVisible(),
      );
      assert.equal(await page.locator("article h2").count(), 11);
      assert(
        !(await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )),
      );
      await page
        .getByRole("link", { name: "8. Retention and deletion", exact: true })
        .click();
      assert.equal(new URL(page.url()).hash, "#section-8");
      assert.equal(
        await page
          .getByRole("link", { name: "Email support", exact: true })
          .getAttribute("href"),
        "../support/",
      );
      const policyText = await page.locator("main").innerText();
      assert(!policyText.includes("Draft for review"));
      assert(!policyText.includes("Publication notes"));
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `test-results/privacy-${width}.png`,
        fullPage: true,
      });
      await page
        .getByRole("link", { name: "Back to Groovefolio", exact: true })
        .click();
      await page.waitForURL(`${url}/`);
      await page
        .getByRole("link", { name: "Email support", exact: true })
        .click();
      await page.waitForURL(`${url}/support/`);
      assert.equal(
        await page.getByLabel("Support email", { exact: true }).inputValue(),
        "support.groovefolio@gmail.com",
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Open email app", exact: true })
          .getAttribute("href"),
        "mailto:support.groovefolio@gmail.com",
      );
      assert(
        !(await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )),
      );
      await page.screenshot({
        path: `test-results/support-${width}.png`,
        fullPage: true,
      });
      console.log(
        `PASS ${width}px: privacy page, deletion section, support page, return navigation`,
      );
    }
    const nojs = await browser.newPage({ javaScriptEnabled: false });
    await nojs.goto(url);
    assert.equal(await nojs.locator(".feature-panel:visible").count(), 4);
    assert(await nojs.locator("#navigation").isVisible());
    await nojs
      .getByRole("link", { name: "Privacy policy", exact: true })
      .click();
    assert.equal(await nojs.locator("article h2").count(), 11);
    await nojs
      .getByRole("link", { name: "Email support", exact: true })
      .click();
    assert.equal(
      await nojs.getByLabel("Support email", { exact: true }).inputValue(),
      "support.groovefolio@gmail.com",
    );
    assert(await nojs.locator("#copy-email").isHidden());
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value) => {
            window.copiedEmail = value;
          },
        },
      });
    });
    await page.getByRole("button", { name: "Copy email address" }).click();
    assert.equal(
      await page.evaluate(() => window.copiedEmail),
      "support.groovefolio@gmail.com",
    );
    assert(
      (await page.getByRole("status").innerText()).includes(
        "Email address copied",
      ),
    );
    for (const available of [true, false]) {
      await page.evaluate((available) => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: available
            ? {
                writeText: async () => {
                  throw new Error("Permission denied");
                },
              }
            : undefined,
        });
      }, available);
      await page.getByRole("button", { name: "Copy email address" }).click();
      assert(
        (await page.getByRole("status").innerText()).includes(
          "Automatic copying is unavailable",
        ),
      );
      assert(
        await page
          .getByLabel("Support email", { exact: true })
          .evaluate(
            (el) =>
              el.selectionStart === 0 && el.selectionEnd === el.value.length,
          ),
      );
    }
    console.log(
      "PASS: clipboard success, permission denial, missing API, and selectable no-JavaScript address",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: no-JavaScript fallback, reduced motion, no page errors or HTTP failures",
    );
  } finally {
    await browser?.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
