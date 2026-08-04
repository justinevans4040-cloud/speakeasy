import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "web");
const destination = resolve(root, "dist");

if (!existsSync(resolve(source, "index.html"))) {
  throw new Error("Canonical entry point web/index.html is missing.");
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
console.log(`Built web application: ${destination}`);
