# SpeakEasy Handoff

> **Repository:** `justinevans4040-cloud/speakeasy`
> **Canonical destination:** `main`
> **Application version:** `1.1.0`
> **Microsoft package status:** Build pipeline configured; fresh Windows AppX artifact pending CI execution
> **Certification status:** WACK and Partner Center submission not yet completed

## What is now active

- Approved SpeakEasy black-and-gold microphone/fedora emblem with the small line `by ForgeFront Systems`.
- Rebuilt responsive dictation workspace in `web/index.html` and `web/styles.css`.
- Existing local dictation, editing, draft recovery, copy, TXT export, cache deletion, and keyboard shortcut behavior preserved in `web/app.js`.
- Incorrect WAKE emblem and invalid PNG-disguised-as-ICO retained only under `archive/legacy/assets/`; neither is used by the active build.
- Exact-size PWA and Microsoft package icon assets generated from `web/assets/speakeasy-emblem.png`.
- Root dependency audit passes with zero known vulnerabilities.
- Windows GitHub Actions workflow builds one AppX, validates its manifest identity, generates SHA-256, and uploads one named candidate artifact.

## Microsoft Partner Center identity

| Field | Value |
|---|---|
| Reserved product name | SpeakEasy by ForgeFront |
| Store ID | `9NN1J22323MG` |
| Package/Identity/Name | `ForgeFrontSystems.SpeakEasybyForgeFront` |
| Package/Identity/Publisher | `CN=8E906094-1F36-496B-A889-858E25A1FCB3` |
| Publisher display name | `ForgeFront Systems` |
| Package family name | `ForgeFrontSystems.SpeakEasybyForgeFront_bx20qhkpd5t86` |

## Verified locally

```bash
npm audit --audit-level=high
npm run icons
npm run verify
npm run build
npm run stage:windows
```

## Remaining release gates

1. Run the Windows workflow and download `SpeakEasy-Microsoft-Store-Candidate`.
2. Confirm `scripts/verify-appx.ps1` passes against the generated AppX.
3. Install and complete all manual microphone, offline, draft, export, and display-scaling tests in `docs/TEST_REPORT.md`.
4. Run the Windows App Certification Kit and retain its report.
5. Submit the verified AppX through Partner Center. Submission has not been performed by this work.

No older package should be linked or described as current. The old 1.0.0 checksum is preserved under `archive/legacy/` only.
