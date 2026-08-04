# SpeakEasy (Canonical Repository)

> **Repository Status:** CANONICAL  
> **Current Branch:** `main`  
> **Target Commit:** `27e30c8`  
> **Version:** `1.0.0`  
> **Latest Official Release:** [v1.0.0 GitHub Release](https://github.com/justinevans4040-cloud/speakeasy/releases/tag/v1.0.0)  
> **Direct Package Download:** [SpeakEasy.by.ForgeFront.1.0.0.appx](https://github.com/justinevans4040-cloud/speakeasy/releases/download/v1.0.0/SpeakEasy.by.ForgeFront.1.0.0.appx)  
> **Package Size:** `165,324,882` bytes  
> **Package SHA-256:** `AD8877E4EF5B492092267AD7FCFF5BF763DC85C54059C1817C65F81A3F39E9E9`  
> **Signing Status:** Unsigned (Windows Store pre-submission AppX container)  

---

## Overview

SpeakEasy by ForgeFront is a premium, on-device voice-to-text dictation application featuring local Whisper speech recognition and Prohibition-era Art Deco workspace design.

The application is structured into two canonical parts:
1. **Web Core (`web/`):** Standard web application using HTML, CSS, JavaScript, AudioWorklet, and on-device WebAssembly Whisper models (`@xenova/transformers`).
2. **Desktop Shell (`electron/`):** Hardened Electron container configured with origin permission enforcement (`requestingUrl.startsWith('file://')`) and `@electron/fuses`.

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

### Build Official Microsoft AppX Package
```bash
npm run build:windows
```

### Repository Integrity Check
```bash
npm run verify
```
