# SpeakEasy

> **CANONICAL SOURCE:** This repository and its default `main` branch are the only approved SpeakEasy source. Generated packages and build output are never committed.

SpeakEasy is a voice-to-text application built around on-device Whisper transcription. Its name and final visual identity intentionally combine effortless dictation ("speak easy") with Prohibition-era speakeasy styling.

## Current release state

- Status: **pre-release; not approved for Store submission**
- Current source version: `0.1.0`
- Canonical web entry point: `web/index.html`
- Canonical application logic: `web/app.js`
- Windows wrapper: `electron/`
- Android: intentionally absent; the two conflicting historical Android projects were removed during repository cleanup
- Microsoft package: not generated; Partner Center identity must be supplied before an MSIX/PWA submission package is built

## Repository layout

| Path | Purpose |
|---|---|
| `web/` | Single editable application source |
| `electron/` | Hardened Windows desktop wrapper |
| `scripts/` | Reproducible build and repository verification scripts |
| `dist/` | Generated web output; ignored by Git |
| `electron/dist/` | Generated Windows staging output; ignored by Git |
| `electron/build/` | Generated Windows installer output; ignored by Git |

## Commands

Requires Node.js 20 or newer.

```powershell
npm install
npm run verify
npm run build

# Local Windows installer for testing only; this is not a Microsoft Store package.
npm --prefix electron install
npm run build:windows
```

## Release rules

1. Never commit APK, AAB, EXE, MSIX, keystore, signing password, `dist/`, or generated platform directories.
2. Never create a second Android or Windows source tree.
3. Never call a package Store-ready until the exact artifact has been installed, function-tested, signature-inspected, and matched to the Store identity.
4. Do not submit the current interface. A separate approved UI redesign must be completed first.
5. Publish releases only through GitHub Releases with a version, source commit, checksum, test record, and clear **Latest** designation.

## Known pre-release requirements

- Redesign the current teal interface around the approved black-and-gold SpeakEasy identity.
- Verify Whisper engine and model downloads under the production Content Security Policy.
- Test microphone permission, long dictation, stopping, editing, copy, clear, word count, and TXT export on Windows.
- Add transcript recovery/persistence and decide whether an offline model is bundled or downloaded on first use.
- Obtain the reserved Microsoft Partner Center identity and build the correct Microsoft submission format.
- Prepare privacy, support, screenshots, descriptions, and certification disclosures.
