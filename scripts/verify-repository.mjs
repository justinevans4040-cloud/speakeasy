import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const required = [
  "web/index.html",
  "web/app.js",
  "web/manifest.webmanifest",
  "web/sw.js",
  "electron/index.js",
  "electron/package.json",
];

for (const relative of required) {
  if (!existsSync(resolve(root, relative))) failures.push(`Missing required file: ${relative}`);
}

const git = spawnSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
if (git.status !== 0) failures.push(`git ls-files failed: ${git.stderr.trim()}`);
const tracked = git.stdout.split(/\r?\n/).filter(Boolean);

const forbiddenPrefixes = ["android/", "mobile/", "dist/", "electron/dist/", "electron/build/", "templates/"];
for (const file of tracked) {
  if (forbiddenPrefixes.some((prefix) => file.startsWith(prefix))) {
    failures.push(`Forbidden generated or legacy path is tracked: ${file}`);
  }
}

const forbiddenNames = ["release.keystore", "keystore.properties", "local.properties", "speakeasy.html", "landing.html"];
for (const file of tracked) {
  if (forbiddenNames.some((name) => file.endsWith(name))) failures.push(`Forbidden legacy or local file is tracked: ${file}`);
}

const signingSecretPattern = /(storePassword|keyPassword)\s*[=:]\s*["'][^"']+["']/i;
for (const file of tracked.filter((name) => /\.(gradle|properties|json|js|mjs|ts|md)$/i.test(name))) {
  const content = readFileSync(resolve(root, file), "utf8");
  if (signingSecretPattern.test(content)) failures.push(`Possible embedded signing secret: ${file}`);
}

if (existsSync(resolve(root, "web/index.html"))) {
  const html = readFileSync(resolve(root, "web/index.html"), "utf8");
  if (!html.includes("Content-Security-Policy")) failures.push("web/index.html has no Content Security Policy.");
  if (!html.includes("https://cdn.jsdelivr.net")) failures.push("CSP does not permit the Transformers.js runtime source.");
  if (html.includes("landing.html")) failures.push("web/index.html still links to the obsolete marketing page.");
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Repository verification passed (${tracked.length} tracked files).`);
