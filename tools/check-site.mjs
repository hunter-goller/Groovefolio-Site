// Dependency-free static checks. Run with `npm run check`.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
const PAGES = ["index.html", "privacy/index.html", "support/index.html", "404.html"];
const pages = Object.fromEntries(PAGES.map((page) => [page, read(page)]));
const css = read("styles.css");

// ---- Every page: head metadata, security meta tags, links, images (WEB-07/08/14) ----
for (const [page, html] of Object.entries(pages)) {
  assert.match(html, /<html lang="en">/, `${page}: lang`);
  assert.match(
    html,
    /<meta\s+http-equiv="Content-Security-Policy"\s+content="default-src 'self';[^"]*object-src 'none'/,
    `${page}: CSP meta tag`,
  );
  assert.match(html, /<meta name="referrer" content="strict-origin-when-cross-origin"/, `${page}: referrer policy`);
  for (const property of ["og:title", "og:description", "og:url", "og:image", "twitter:card"])
    assert(html.includes(`"${property}"`), `${page}: missing ${property}`);
  if (page === "404.html") assert.match(html, /name="robots" content="noindex"/);
  else assert.match(html, /<link rel="canonical" href="https:\/\/groovefolio\.app\//, `${page}: canonical`);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${page}: exactly one h1`);
  assert(!/\sstyle="/.test(html), `${page}: inline style attributes are blocked by the CSP`);
  assert(!/<style[\s>]/.test(html), `${page}: inline <style> is blocked by the CSP`);
  assert(!/<script(?![^>]*\b(src=|type="application\/ld\+json"))/.test(html), `${page}: inline script is blocked by the CSP`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: duplicate ids`);
  for (const [, control] of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g))
    assert(ids.includes(control), `${page}: missing aria target #${control}`);

  for (const [, target] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    if (target.startsWith("#")) {
      assert(ids.includes(target.slice(1)), `${page}: missing anchor ${target}`);
      continue;
    }
    // 404.html is served for any missing path, so it must only use root-absolute URLs.
    if (page === "404.html") assert(target.startsWith("/"), `404.html: relative URL ${target}`);
    const clean = target.split(/[?#]/)[0];
    let local = clean.startsWith("/") ? join(root, clean) : resolve(dirname(resolve(root, page)), clean);
    if (existsSync(local) && statSync(local).isDirectory()) local = join(local, "index.html");
    assert(existsSync(local), `${page}: missing local file ${target}`);
  }

  for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
    if (img.includes('alt=""') && page === "index.html" && /<img alt="" \/>/.test(img)) continue; // dialog target
    assert(/\balt="[^"]+"/.test(img), `${page}: image without alt text: ${img}`);
    assert(/\bwidth="\d+"/.test(img) && /\bheight="\d+"/.test(img), `${page}: image without dimensions: ${img}`);
  }
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
    JSON.parse(json);
}

// ---- WEB-09: no text smaller than 14px anywhere in the stylesheet ----
for (const [, value] of css.matchAll(/font-size:\s*([^;]+);/g)) {
  const px = /^([\d.]+)px$/.exec(value.trim());
  const rem = /^([\d.]+)rem$/.exec(value.trim());
  const size = px ? Number(px[1]) : rem ? Number(rem[1]) * 16 : null;
  if (size !== null) assert(size >= 14, `styles.css: font-size ${value} is below 14px`);
}

// ---- Marketing accuracy guards (verified against the app and backend) ----
const home = text(pages["index.html"]);
assert(home.includes("Coming soon to Android"), "Pre-release status must be explicit");
assert(!/play\.google\.com/.test(pages["index.html"]), "No store link until the listing is real");
assert(
  home.includes("need an internet connection and a connected Discogs account"),
  "WEB-10: Discogs/barcode requirements must be stated",
);
assert(
  /Scan the barcode[^.]*Discogs/.test(home),
  "WEB-10: barcode lookup must be described as a Discogs feature",
);
assert(!/tag store|buy tags|shop/i.test(home), "WEB-16: there is no tag store in the app");
assert(home.includes("no purchase is required"), "WEB-16: tags are not sold");
assert(!/\b(cloud sync|syncs?|back(s)? up) your/i.test(home), "No sync/backup claims");
assert(home.includes("There’s no cloud backup or sync"), "Local-only caveat must stay visible");
assert(!/recommends? (new|records to buy)/i.test(home), "Discover only uses the user's own shelf");
assert(home.includes("Google ML Kit"), "Analytics claim must disclose ML Kit diagnostics");

// ---- Privacy policy disclosures that must not regress ----
const policy = text(pages["privacy/index.html"]);
for (const expected of [
  "app.groovefolio",
  "api.groovefolio.app",
  "Groovefolio does not display ads",
  "Cloudflare",
  "deleted by the minute-based cleanup",
  "does not notify the Groovefolio server",
  "Google ML Kit",
  "Discogs requests made by the app can renew it",
])
  assert(policy.includes(expected), `Missing privacy disclosure: ${expected}`);
assert(!policy.includes("retailers"), "WEB-16: no retailer links ship today");
assert(!policy.includes("The app communicates directly with Discogs over HTTPS"));

// ---- WEB-05/17: only website files in the repo; no unused assets ----
const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
for (const file of tracked)
  assert(
    !/^(lib|android|ios|linux|macos|windows|web|test)\/|(^|\/)pubspec\.|\.dart$/.test(file),
    `App source must not live in the website repo: ${file}`,
  );
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const referenced = Object.values(pages).join("\n") + css;
for (const asset of walk(join(root, "assets"))) {
  const web = "/" + asset.slice(root.length + 1).split(sep).join("/");
  assert(referenced.includes(web), `Unused published asset (WEB-17): ${web}`);
}

// ---- Image budget ----
const shots = join(root, "assets/screenshots/release");
const total = readdirSync(shots).reduce((sum, name) => sum + statSync(join(shots, name)).size, 0);
assert(total < 750_000, `Screenshot bundle exceeded 750 KB: ${total}`);
assert(statSync(join(root, "styles.css")).size < 40_000, "styles.css over 40 KB");
assert(statSync(join(root, "script.js")).size < 6_000, "script.js over 6 KB");

console.log(
  `PASS: ${PAGES.length} pages — metadata, CSP, links, images, 14px minimum, claims, policy, assets; ` +
    `${readdirSync(shots).length} screenshots / ${Math.round(total / 1024)} KB`,
);
