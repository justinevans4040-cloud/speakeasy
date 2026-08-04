# SpeakEasy

SpeakEasy by ForgeFront Systems is a private, on-device voice-to-text desktop application with a Prohibition-era black-and-gold interface.

## Canonical source

- Repository: `justinevans4040-cloud/speakeasy`
- Canonical branch: `main`
- Current application line: `1.2.x`
- Microsoft Store product ID: `9NN1J22323MG`
- Microsoft Store listing: https://apps.microsoft.com/detail/9NN1J22323MG
- Microsoft Store monthly add-on product ID: `speakeasy_monthly` (`$3.99/month`)
- Microsoft Store lifetime add-on product ID: `speakeasy_lifetime` (`$14.99 one time`, future updates included)

The repository is the authoritative source. Compiled packages are valid only when produced from the latest passing `main` workflow. Historical material remains under `archive/legacy/` for provenance and is not part of the active application or build.

There is no public package download declared here until a verified package is attached to the current official release or accepted by Microsoft. Do not distribute a package copied from an older commit, local folder, or archived path.

## Active application

- `web/` — canonical HTML, CSS, JavaScript, AudioWorklet, local model runtime, and approved SpeakEasy artwork.
- `electron/` — hardened Electron wrapper and Microsoft AppX configuration.
- `.github/workflows/verify.yml` — Windows verification, AppX packaging, identity inspection, checksum generation, and build-artifact upload.

## Microsoft package identity

| Manifest field | Required value |
|---|---|
| Package/Identity/Name | `ForgeFrontSystems.SpeakEasybyForgeFront` |
| Package/Identity/Publisher | `CN=8E906094-1F36-496B-A889-858E25A1FCB3` |
| Package/Properties/PublisherDisplayName | `ForgeFront Systems` |
| Package family name | `ForgeFrontSystems.SpeakEasybyForgeFront_bx20qhkpd5t86` |

The repository verification and Windows workflow fail when the configured identity differs from these values.

## Build and verification

```bash
npm ci
npm --prefix electron ci
npm run verify
npm run build
npm run build:windows
```

`npm run build:windows` requires Windows. GitHub Actions produces a `SpeakEasy-Microsoft-Store-Candidate` artifact containing the AppX and its SHA-256 checksum. That artifact is a submission candidate, not proof of Microsoft certification. WACK and Partner Center submission remain release gates.

## Microsoft Store licensing

Version 1.2.0 launches in demonstration mode until Microsoft Store reports an active `speakeasy_monthly` subscription or an owned `speakeasy_lifetime` durable add-on. Demonstration mode leaves the interface and settings pages available to explore while blocking dictation, transcript editing, copying, saving, exporting, microphone testing, and saved-setting changes.

The Electron main process runs the bundled `store-license.ps1` bridge inside the packaged Windows app. The bridge uses `Windows.Services.Store.StoreContext` to discover the two associated add-ons by their Partner Center in-app offer tokens and verifies ownership against Microsoft Store. No payment information or SpeakEasy account is created or stored. Purchase buttons open the matching Microsoft Store add-on listing; **Restore purchase** rechecks the current Microsoft account.
