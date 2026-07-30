# SpeakEasy mobile release manual

Goal: ship SpeakEasy as a **standalone** web PWA + Android/iOS shells. It is **not** a wakeforged.com / Netlify site build.

## Source of truth

- Live web source: `web/` (edit this)
- Capacitor copies `web/` → `mobile/www` via `npm run sync`
- Original template (never edit): `templates/speakeasy_landing.html`

## Android

- Package name: `com.wakeforged.speakeasy` (locked for Play identity)
- Capacitor loads **bundled local assets**, not a remote URL
- Build:

```bash
npm --prefix mobile install
npm --prefix mobile run build:apk
npm --prefix mobile run build:aab
```

### Signing (upload key) — local only (not committed)

- Expected local paths (not in git): `mobile/android/keystore/speakeasy-upload.keystore`, `mobile/android/keystore.properties`
- Live keystore on this Lenovo: `C:\Users\justi\GoogleDrive\wakecodex\apps\speakeasy-mobile\android\keystore\` + `keystore.properties`
- Credentials note (verified): `C:\Users\justi\WAKE_DOCS\Documentation\WakeSystems\consolidated\wake_systems\desktop_sweep_20260512_140911\WAKE_KEYS\SpeakEasy_android_upload_key.txt`
- Old documented path (missing here): `C:\Users\justi\OneDrive\Desktop\WAKE_KEYS\SpeakEasy_android_upload_key.txt`
- Full map: `docs/INVENTORY.md`

## Hosting note

Netlify / wakeforged.com are optional and currently unavailable (billing). SpeakEasy runs from this repo without them.
