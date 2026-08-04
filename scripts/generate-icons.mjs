import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = resolve(root, "web", "assets");
const sourceIcon = resolve(assetsDir, "speakeasy-emblem.png");

if (!existsSync(sourceIcon)) {
  throw new Error("Master emblem source asset missing: web/assets/speakeasy-emblem.png");
}

const standardTargets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["square-logo.png", 512],
  ["store-icon-300.png", 300],
];

await Promise.all(
  standardTargets.map(([name, size]) =>
    sharp(sourceIcon)
      .resize(size, size, { fit: "cover" })
      .png({ compressionLevel: 9, palette: true, quality: 85, effort: 10 })
      .toFile(resolve(assetsDir, name)),
  ),
);

await sharp(sourceIcon)
  .resize(384, 384, { fit: "contain", background: "#080806" })
  .extend({ top: 64, bottom: 64, left: 64, right: 64, background: "#080806" })
  .png({ compressionLevel: 9, palette: true, quality: 85, effort: 10 })
  .toFile(resolve(assetsDir, "icon-maskable.png"));

console.log(`Generated Microsoft and PWA icon suite from ${sourceIcon}.`);
