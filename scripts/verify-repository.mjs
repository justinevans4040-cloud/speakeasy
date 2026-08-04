import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const required = [
  "web/index.html",
  "web/styles.css",
  "web/app.js",
  "web/manifest.webmanifest",
  "web/sw.js",
  "web/vendor/transformers/transformers.min.js",
  "electron/index.js",
  "electron/package.json",
  "web/assets/speakeasy-emblem.png",
  "web/assets/icon-192.png",
  "web/assets/icon-512.png",
  "web/assets/icon-maskable.png",
  "web/assets/store-icon-300.png",
];

for (const relative of required) {
  if (!existsSync(resolve(root, relative))) failures.push(`Missing required file: ${relative}`);
}

const git = spawnSync("git", ["ls-files"], { cwd: root, encoding: "utf8" });
if (git.status !== 0) failures.push(`git ls-files failed: ${git.stderr.trim()}`);
const tracked = git.stdout.split(/\r?\n/).filter(Boolean);

const activeTracked = tracked.filter((file) => !file.startsWith("archive/"));

const forbiddenPrefixes = ["android/", "mobile/", "dist/", "electron/dist/", "electron/build/", "templates/"];
for (const file of activeTracked) {
  if (forbiddenPrefixes.some((prefix) => file.startsWith(prefix))) {
    failures.push(`Forbidden generated or legacy path is tracked in active tree: ${file}`);
  }
}

const forbiddenNames = ["release.keystore", "keystore.properties", "local.properties", "speakeasy.html", "landing.html"];
for (const file of activeTracked) {
  if (forbiddenNames.some((name) => file.endsWith(name))) {
    failures.push(`Forbidden legacy or local file is tracked in active tree: ${file}`);
  }
}

const signingSecretPattern = /(storePassword|keyPassword)\s*[=:]\s*["'][^"']+["']/i;
for (const file of tracked.filter((name) => /\.(gradle|properties|json|js|mjs|ts|md)$/i.test(name))) {
  const content = readFileSync(resolve(root, file), "utf8");
  if (signingSecretPattern.test(content)) failures.push(`Possible embedded signing secret: ${file}`);
}

if (existsSync(resolve(root, "web/index.html"))) {
  const html = readFileSync(resolve(root, "web/index.html"), "utf8");
  if (!html.includes("Content-Security-Policy")) failures.push("web/index.html has no Content Security Policy.");
  if (!html.includes("huggingface.co")) failures.push("CSP does not permit HuggingFace model downloads.");
  if (html.includes("landing.html")) failures.push("web/index.html still links to the obsolete marketing page.");
  if (html.includes("wake-emblem-original")) failures.push("web/index.html still references the incorrect WAKE emblem.");
  if (html.includes("style=\"")) failures.push("web/index.html contains inline styling instead of the canonical stylesheet.");
}

if (existsSync(resolve(root, "electron/package.json"))) {
  const electronPackage = JSON.parse(readFileSync(resolve(root, "electron/package.json"), "utf8"));
  const appx = electronPackage.build?.appx ?? {};
  const expected = {
    identityName: "ForgeFrontSystems.SpeakEasybyForgeFront",
    publisher: "CN=8E906094-1F36-496B-A889-858E25A1FCB3",
    publisherDisplayName: "ForgeFront Systems",
    applicationId: "SpeakEasy",
  };
  for (const [key, value] of Object.entries(expected)) {
    if (appx[key] !== value) failures.push(`Microsoft package identity mismatch for appx.${key}.`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Repository verification passed (${tracked.length} total tracked files, ${activeTracked.length} active).`);
