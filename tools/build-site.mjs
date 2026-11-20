// Assembles the publishable site into _site/ from an explicit allowlist (WEB-04/05),
// generates sitemap.xml with lastmod taken from git history (WEB-13), and refuses
// to finish if anything outside the allowlist would be published.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "_site");
const origin = "https://groovefolio.app";

/** Files and folders that make up the public website. Nothing else is published. */
const ALLOW = [
  ".nojekyll",
  "404.html",
  "index.html",
  "robots.txt",
  "script.js",
  "styles.css",
  "privacy/index.html",
  "support/index.html",
  "support/support.js",
  "assets/branding",
  "assets/photos",
  "assets/screenshots/release",
  "assets/social",
];
/** Indexable pages, in sitemap order: [url path, source file]. */
const PAGES = [
  ["/", "index.html"],
  ["/privacy/", "privacy/index.html"],
  ["/support/", "support/index.html"],
];
const PUBLISHABLE = /\.(html|css|js|txt|xml|png|webp|jpg|svg|ico|woff2)$/;

function lastModified(file) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    if (date) return date;
  } catch {
    // Not a git checkout; fall back to the file's mtime below.
  }
  return statSync(join(root, file)).mtime.toISOString().slice(0, 10);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const entry of ALLOW) {
  const from = join(root, entry);
  if (!existsSync(from)) throw new Error(`Allowlisted path missing: ${entry}`);
  const to = join(out, entry);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

const urls = PAGES.map(
  ([path, file]) =>
    `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${lastModified(file)}</lastmod>\n  </url>`,
).join("\n");
writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

// Final guard: everything in _site must be an expected web file.
const files = walk(out).map((file) => relative(out, file).split(sep).join("/"));
const unexpected = files.filter(
  (file) => file !== ".nojekyll" && !PUBLISHABLE.test(file),
);
const forbidden = files.filter((file) =>
  /(^|\/)(\.github|tools|node_modules|brand|lib|android|ios)\/|\.(md|dart|json|yml|yaml|lock|mjs|cjs)$/.test(
    file,
  ),
);
if (unexpected.length || forbidden.length) {
  throw new Error(
    `Refusing to publish: ${[...unexpected, ...forbidden].join(", ")}`,
  );
}
console.log(`Built _site/: ${files.length} files`);
for (const file of files.sort()) console.log(`  ${file}`);
