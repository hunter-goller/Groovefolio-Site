import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
for (const page of ["index.html", "privacy/index.html", "support/index.html"]) {
  const content = readFileSync(resolve(root, page), "utf8");
  const pageIds = [...content.matchAll(/\bid="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(new Set(pageIds).size, pageIds.length, `Duplicate IDs: ${page}`);
  for (const [, target] of content.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    if (target.startsWith("#")) {
      assert(
        pageIds.includes(target.slice(1)),
        `Missing anchor: ${page} ${target}`,
      );
    } else {
      let localPath = resolve(
        dirname(resolve(root, page)),
        target.split("?")[0],
      );
      if (existsSync(localPath) && statSync(localPath).isDirectory()) {
        localPath = resolve(localPath, "index.html");
      }
      assert(existsSync(localPath), `Missing local asset: ${page} ${target}`);
    }
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate HTML IDs");
for (const [, control] of html.matchAll(/aria-controls="([^"]+)"/g))
  assert(ids.includes(control), `Missing controlled element: ${control}`);
for (const feature of ["collection", "listen", "stats", "discover"])
  assert(ids.includes(`panel-${feature}`));
for (const [, json] of html.matchAll(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
))
  JSON.parse(json);
assert(
  html.includes("Coming soon to Android"),
  "Pre-release status must be explicit",
);
assert(
  !html.includes("mobile.css"),
  "Legacy mobile stylesheet should not be loaded",
);
const images = readdirSync(resolve(root, "assets/screenshots/release"));
const total = images.reduce(
  (sum, name) =>
    sum + statSync(resolve(root, "assets/screenshots/release", name)).size,
  0,
);
assert(total < 1000000, `Screenshot bundle exceeded 1 MB: ${total}`);
console.log(
  `PASS: anchors, local assets, controls, metadata, release status; ${images.length} screenshots / ${Math.round(total / 1024)} KB`,
);
