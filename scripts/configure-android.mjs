import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const manifestPath = resolve("android/app/src/main/AndroidManifest.xml");
if (!existsSync(manifestPath)) {
  throw new Error("AndroidManifest.xml was not generated. Run `npx cap add android` first.");
}

let manifest = readFileSync(manifestPath, "utf8");
const permissions = [
  '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
  '<uses-permission android:name="android.permission.INTERNET" />',
];

for (const permission of permissions) {
  if (!manifest.includes(permission)) {
    manifest = manifest.replace(/<manifest([^>]*)>/, `<manifest$1>\n    ${permission}`);
  }
}

writeFileSync(manifestPath, manifest);
console.log("Configured Android manifest for SpeakEasy microphone and network access.");
