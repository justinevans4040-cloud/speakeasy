# SpeakEasy mobile release manual (WAKE)

Goal: make `SpeakEasy` installable from `wakeforged.com`, and also publishable to Google Play + Apple App Store **without changing the original template file**.

## Source of truth (do not edit)

- Original template (never edit): `templates/originals/speakeasy_landing.html`
- Live site path: `/speakeasy/` (served from `apps/wake-site/public/speakeasy/index.html`)
- Android direct download path (from the site): `/downloads/speakeasy/SpeakEasy-Android.apk`

Rule:
- If we need changes, we edit the **live copy** and keep the original template untouched.

## Step 1 — Website install (PWA) from wakeforged.com (fastest path)

Deliverable:
- `wakeforged.com/speakeasy/` loads the SpeakEasy page.
- The page shows an “Install” CTA (PWA install on Android / Add to Home Screen instructions on iOS).

Notes:
- iOS PWA install works reliably from Safari (users often need to open in Safari).

## Step 2 — Google Play (Android)

What Google Play accepts:
- Android App Bundle (`.aab`) is the standard publishing format.
- New apps and updates must target the required Android API level (see the official Play requirements page).

Store publishing prep checklist (non-negotiable):
- Package name locked (reverse DNS, e.g. `com.wakeforged.speakeasy`)
- App icon (512x512) + feature graphic (1024x500)
- Privacy Policy URL
- Store listing copy + screenshots (phone)
- Signed release build + Play App Signing enabled

Build system:
- Wrap the web app into a native shell and ship AAB.

### What we have in this repo (Android)

- Android wrapper project (Capacitor): `apps/speakeasy-mobile/`
- Build outputs (local, after running builds):
  - AAB: `apps/speakeasy-mobile/android/app/build/outputs/bundle/release/app-release.aab`
  - APK: `apps/speakeasy-mobile/android/app/build/outputs/apk/release/app-release.apk`
- Files published for download from the website:
  - `apps/wake-site/public/downloads/speakeasy/SpeakEasy-Android.apk`
  - `apps/wake-site/public/downloads/speakeasy/SpeakEasy-Android.aab` (for Play Console upload; not for sideload installs)

### Signing (upload key) — local only (not committed)

- Keystore file (ignored by git): `apps/speakeasy-mobile/android/keystore/speakeasy-upload.keystore`
- Signing properties (ignored by git): `apps/speakeasy-mobile/android/keystore.properties`
- Credentials drop (local): `C:\\Users\\justi\\OneDrive\\Desktop\\WAKE_KEYS\\SpeakEasy_android_upload_key.txt`

## Step 3 — Apple App Store (iOS)

Reality check:
- You can’t “direct download” iOS apps from a website for normal users. You publish via App Store Connect.
- `wakeforged.com` should link to the App Store listing once approved.

Minimum tooling requirement (as of 2026):
- App Store Connect uploads require current Xcode/SDK minimums (see Apple’s “Submitting” / “Upcoming Requirements” pages).

Publishing prep checklist:
- Apple Developer Program membership
- Bundle ID + signing (certs/profiles)
- Privacy policy + App Privacy answers in App Store Connect
- TestFlight build for device testing

## Build commands (Android)

From repo root:
- Install deps: `npm --prefix apps/speakeasy-mobile install`
- Build AAB: `npm --prefix apps/speakeasy-mobile run build:aab`
- Build APK: `npm --prefix apps/speakeasy-mobile run build:apk`


## Acceptance criteria for this page (visual / layout)

Must:
- No text-over-text collisions.
- No logo-over-text collisions.
- Mobile-first readability (phone, not desktop).
- Download section must be obvious and click-safe.

Do not:
- Replace brand marks with “new” designs.
- Inject unapproved emblems.
