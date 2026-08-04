# SpeakEasy (Canonical Repository)

> **Repository Status:** CANONICAL  
> **Current Branch:** `main`  
> **Current Commit:** `ffbaf41`  
> **Version:** `1.0.0`  
> **Package Output:** `electron/build/SpeakEasy by ForgeFront 1.0.0.appx`  
> **Package SHA-256:** `592DD0C4B49C8A9DEAFAA8A50AA60BE853047EEFFFC9FF9A96FD65A4C2D9529B`  
> **Store Readiness:** Verified Microsoft AppX package with exact Partner Center identity.

---

## Overview

SpeakEasy by ForgeFront is a premium, on-device voice-to-text dictation application featuring local Whisper speech recognition and Prohibition-era Art Deco workspace design.

The application is structured into two canonical parts:
1. **Web Core (`web/`):** Standard web application using HTML, CSS, JavaScript, AudioWorklet, and on-device WebAssembly Whisper models (`@xenova/transformers`).
2. **Desktop Shell (`electron/`):** Hardened Electron container configured with origin permission enforcement and `@electron/fuses`.

---

## Repository Policy & Security Notices

- **Canonical Location:** This repository (`justinevans4040-cloud/speakeasy`) is the single authoritative source for SpeakEasy.
- **Historical Material:** Legacy mobile scaffolds and previous release assets are archived strictly for provenance in `archive/legacy/` and are **not** active downloads.
- **No Tracked Binaries or Secrets:** Keystores, passwords, and compiled output (`dist/`, `electron/dist/`, `electron/build/`) are strictly untracked.

---

## Development & Verification

### Build Web Core
```bash
npm run build
```

### Stage Windows Desktop Shell
```bash
npm run stage:windows
```

### Build Official Microsoft AppX/MSIX Package
```bash
npm run build:windows
```

### Repository Integrity Check
```bash
npm run verify
```
