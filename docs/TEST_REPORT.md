# SpeakEasy 1.1.0 Verification Report

This report distinguishes checks completed against the current source from Windows and hardware checks that still require the package candidate.

## Completed automated checks

| Check | Result | Evidence |
|---|---:|---|
| Repository structure and Microsoft identity configuration | PASS | `npm run verify` |
| JavaScript syntax | PASS | `node --check web/app.js`, Electron and build scripts |
| Root dependency audit at high threshold | PASS | `found 0 vulnerabilities` |
| Icon generation | PASS | 192×192, 300×300, and 512×512 outputs inspected |
| Production web build | PASS | `npm run build` |
| Electron staging | PASS | `npm run stage:windows` |
| Incorrect WAKE emblem absent from active UI | PASS | repository verification rule and source inspection |
| Inline presentation code removed from active HTML | PASS | repository verification rule |

## Windows package checks

| ID | Test | Status |
|---|---|---:|
| WIN-01 | Build exactly one SpeakEasy 1.1.0 AppX on `windows-latest` | PENDING CI |
| WIN-02 | Extract AppxManifest.xml and verify Name, Publisher, and PublisherDisplayName | PENDING CI |
| WIN-03 | Generate and retain AppX SHA-256 checksum | PENDING CI |
| WIN-04 | Confirm Electron fuse readback during packaging | PENDING CI |
| WIN-05 | Install package and launch from Windows Start menu | NOT TESTED |
| WIN-06 | Run Windows App Certification Kit and retain report | NOT TESTED |

## Manual functional checks

| ID | Test | Status |
|---|---|---:|
| HD-01 | Allow microphone permission and begin dictation | NOT TESTED |
| HD-02 | Deny microphone permission and verify clear recovery message | NOT TESTED |
| HD-03 | Launch with no microphone attached | NOT TESTED |
| HD-04 | Complete first-run model download | NOT TESTED |
| HD-05 | Interrupt the first-run download and retry | NOT TESTED |
| HD-06 | Attempt first launch while offline | NOT TESTED |
| HD-07 | Launch offline after the model is cached | NOT TESTED |
| HD-08 | Repeatedly start and stop dictation | NOT TESTED |
| HD-09 | Dictate continuously for 5 minutes | NOT TESTED |
| HD-10 | Dictate continuously for 30 minutes | NOT TESTED |
| HD-11 | Dictate through long pauses and quiet speech | NOT TESTED |
| HD-12 | Dictate with background noise | NOT TESTED |
| HD-13 | Edit transcript while dictation is active | NOT TESTED |
| HD-14 | Copy transcript to clipboard | NOT TESTED |
| HD-15 | Export UTF-8 TXT file | NOT TESTED |
| HD-16 | Restore a local draft after restart | NOT TESTED |
| HD-17 | Delete local draft and cached-model marker | NOT TESTED |
| HD-18 | Check layout at 100%, 125%, 150%, and 200% scaling | NOT TESTED |
| HD-19 | Close application and confirm audio/process cleanup | NOT TESTED |

## Release decision

Current source verification passes. Microsoft package generation, Windows installation, WACK, and the manual hardware matrix remain mandatory before this build can be called Store-ready or submitted.
