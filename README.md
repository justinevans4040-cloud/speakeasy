# SpeakEasy (Canonical Repository)

> **Repository Status:** CANONICAL  
> **Current Branch:** `main`  
> **Current Commit:** `6d92685b271bcd1fc543ef9a59349324493037e4`  
> **Version:** `1.0.0`  
> **Downloadable Release Status:** Pending Phase 5-11 completion and verification.  
> **Store Readiness:** No package is Store-ready until the exact artifact passes Windows App Certification & Microsoft Partner Center validation.

---

## Overview

SpeakEasy is a premium, on-device voice-to-text dictation application featuring local Whisper speech recognition.

The application is structured into two canonical parts:
1. **Web Core (`web/`):** Standard web application using HTML, CSS, JavaScript, and on-device WebAssembly/Whisper models.
2. **Desktop Shell (`electron/`):** Hardened Electron container for desktop distribution.

---

## Repository Policy & Security Notices

- **Canonical Location:** This repository (`justinevans4040-cloud/speakeasy`) is the single authoritative source for SpeakEasy.
- **Historical Material:** Legacy mobile scaffolds and previous release assets are archived strictly for provenance in `archive/legacy/` and are **not** active downloads.
- **No Tracked Binaries or Secrets:** Keystores, passwords, and compiled output (`dist/`, `electron/dist/`) are strictly untracked.

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

### Repository Integrity Check
```bash
npm run verify
```
