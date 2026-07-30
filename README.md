# SpeakEasy

WakeForged SpeakEasy — web PWA + Android Capacitor shell.

**Live site:** https://www.wakeforged.com/speakeasy/  
**Android package:** `com.wakeforged.speakeasy`

## Layout

| Path | What |
|------|------|
| `web/` | PWA (`index.html`, `sw.js`, `manifest.webmanifest`) — live copy served at `/speakeasy/` |
| `mobile/` | Capacitor Android wrapper; loads the live site URL |
| `templates/speakeasy_landing.html` | Original template — do not edit |
| `docs/SPEAKEASY_MOBILE_RELEASE_MANUAL.md` | Release / Play Store notes |

## Mobile shell

The Android app is a remote-first wrapper. It loads:

`https://www.wakeforged.com/speakeasy/`

```bash
cd mobile
npm install
npm run sync
npm run build:apk   # or build:aab
```

## Signing (local only)

Upload keystore and `keystore.properties` stay **off** this repo. Keep them on the Lenovo under the mobile Android tree / `WAKE_KEYS` as documented in the release manual.

## Origin

Extracted from `justinevans4040-cloud/wakecodex` so SpeakEasy has its own public home.
