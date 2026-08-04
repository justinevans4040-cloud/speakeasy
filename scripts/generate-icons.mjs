import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = resolve(root, "web", "assets");
const sourceIcon = resolve(assetsDir, "wake-emblem-original.png");

if (!existsSync(sourceIcon)) {
  throw new Error("Master emblem source asset missing: web/assets/wake-emblem-original.png");
}

const targets = [
  "icon-192.png",
  "icon-512.png",
  "icon-maskable.png",
  "square-logo.png",
  "store-icon-300.png",
  "app-icon.ico"
];

for (const target of targets) {
  const dest = resolve(assetsDir, target);
  copyFileSync(sourceIcon, dest);
}

console.log(`Generated icon suite in ${assetsDir}: ${targets.join(", ")}`);
