import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const appPath = resolve("dist/app.js");
if (!existsSync(appPath)) {
  throw new Error("dist/app.js is missing. Run `npm run build` first.");
}

const marker = "// SPEAKEASY_ANDROID_DEBUG_UNLOCK";
let app = readFileSync(appPath, "utf8");

if (!app.includes(marker)) {
  const bridge = `${marker}\nwindow.speakeasyStore = Object.freeze({\n  getStatus: async () => ({ access: \"full\", entitlement: \"lifetime\", products: {}, reason: \"Android debug test build\" }),\n  openPurchase: async () => ({ ok: false, message: \"Purchases are disabled in the Android test build.\" }),\n});\n\n`;
  app = bridge + app;
  writeFileSync(appPath, app);
}

console.log("Prepared fully unlocked Android debug build. Release source remains unchanged.");
