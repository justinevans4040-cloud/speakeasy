# SpeakEasy

Standalone SpeakEasy — web PWA + Android Capacitor shell.

**Android package:** `com.wakeforged.speakeasy` (Play identity; not tied to wakeforged.com hosting)

## Layout

| Path | What |
|------|------|
| `web/` | Standalone PWA (source of truth) |
| `mobile/` | Capacitor Android shell — loads **bundled** `www/` (copied from `web/`) |
| `templates/speakeasy_landing.html` | Original template — do not edit |
| `docs/SPEAKEASY_MOBILE_RELEASE_MANUAL.md` | Release notes |
| `docs/INVENTORY.md` | Where copies live on disk |

## Run locally (no Netlify / no wakeforged.com)

```bash
# Browser
start web/index.html

# Android (bundled local web)
cd mobile
npm install
npm run sync
npm run android
# or: npm run build:apk
```

Capacitor no longer points at `https://www.wakeforged.com/speakeasy/`. The app ships its own HTML.

## Origin

Extracted from `wakecodex` packaging. Hosting leftovers on wakeforged/Netlify are not required to run SpeakEasy.
