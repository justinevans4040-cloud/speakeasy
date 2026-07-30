# SpeakEasy

Standalone voice → text app. No wakeforged.com / Netlify required.

**Android package:** `com.wakeforged.speakeasy`

## What opens where

| File | What it is |
|------|------------|
| `web/index.html` | **The SpeakEasy app** (mic + live transcript) |
| `web/landing.html` | Old marketing page (kept for reference) |
| `templates/speakeasy_landing.html` | Original landing template — do not edit |

## Run

```bash
# Browser (needs http:// — Speech API blocks file://)
python -m http.server 8787 --directory web
# open http://127.0.0.1:8787/

# Android
cd mobile
npm install
npm run sync
npm run android
```

Engine: browser **Web Speech API** (Chrome / Edge / Android WebView). Mic permission required.
