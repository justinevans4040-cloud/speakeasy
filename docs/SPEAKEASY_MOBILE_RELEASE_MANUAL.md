# SpeakEasy mobile release manual

Goal: make SpeakEasy installable from `wakeforged.com`, and publishable to Google Play + Apple App Store **without changing the original template file**.

## Source of truth (do not edit)

- Original template (never edit): `templates/speakeasy_landing.html`
- Live site path: `/speakeasy/` (this repo’s `web/index.html`; also deployed from wakeforged/wakecodex until cutover)
- Android direct download path (from the site): `/downloads/speakeasy/SpeakEasy-Android.apk`

Rule:
- If we need changes, we edit the **live copy** (`web/`) and keep the original template untouched.

## Step 1 — Website install (PWA)

Deliverable:
- `wakeforged.com/speakeasy/` loads the SpeakEasy page.
- The page shows an “Install” CTA (PWA on Android / Add to Home Screen on iOS).

Notes:
- iOS PWA install works reliably from Safari.

## Step 2 — Google Play (Android)

- Format: Android App Bundle (`.aab`)
- Package name: `com.wakeforged.speakeasy` (locked)
- Need: icon 512×512, feature graphic 1024×500, privacy policy URL, listing copy, screenshots, signed release + Play App Signing

### In this repo

- Capacitor wrapper: `mobile/`
- Local build outputs (not committed):
  - AAB: `mobile/android/app/build/outputs/bundle/release/app-release.aab`
  - APK: `mobile/android/app/build/outputs/apk/release/app-release.apk`

### Signing (upload key) — local only (not committed)

- Keystore: `mobile/android/keystore/speakeasy-upload.keystore`
- Properties: `mobile/android/keystore.properties`
- Credentials note (local, verified): `C:\Users\justi\WAKE_DOCS\Documentation\WakeSystems\consolidated\wake_systems\desktop_sweep_20260512_140911\WAKE_KEYS\SpeakEasy_android_upload_key.txt`
- Old documented path (missing on Lenovo): `C:\Users\justi\OneDrive\Desktop\WAKE_KEYS\SpeakEasy_android_upload_key.txt`
- Live keystore on this machine: `C:\Users\justi\GoogleDrive\wakecodex\apps\speakeasy-mobile\android\keystore\` + `keystore.properties`
- Full location map: `docs/INVENTORY.md`

## Step 3 — Apple App Store (iOS)

iOS requires App Store Connect (no normal website sideload). Link the listing from `wakeforged.com` once approved.

## Build commands (Android)

```bash
npm --prefix mobile install
npm --prefix mobile run build:aab
npm --prefix mobile run build:apk
```

## Acceptance criteria (visual / layout)

Must:
- No text-over-text collisions
- No logo-over-text collisions
- Mobile-first readability
- Download section obvious and click-safe

Do not:
- Replace brand marks with unapproved designs
- Inject unapproved emblems
