# SpeakEasy inventory (verified 2026-07-30)

Canonical public repo: https://github.com/justinevans4040-cloud/speakeasy  
Local workspace: `C:\Users\justi\speakeasy`  
Android package: `com.wakeforged.speakeasy`  
**Runtime:** bundled local `web/` → `mobile/www` (no remote host).  
Former remote URL `https://www.wakeforged.com/speakeasy/` was packaging leftover and has been removed from Capacitor.

This file maps every SpeakEasy location found on the Lenovo / Drive mirror. **No secrets are stored here.**

---

## 1. GitHub — source (done)

| Item | Location | Status |
|------|----------|--------|
| Public repo | `justinevans4040-cloud/speakeasy` | Verified public |
| PWA | `web/` (`index.html`, `sw.js`, `manifest.webmanifest`) | In repo |
| Capacitor + Android | `mobile/` | In repo (no keystore) |
| Original template | `templates/speakeasy_landing.html` | In repo — do not edit |
| Release manual | `docs/SPEAKEASY_MOBILE_RELEASE_MANUAL.md` | In repo |
| Historical nest | `justinevans4040-cloud/wakecodex` (`apps/speakeasy-mobile`, `apps/wake-site/public/speakeasy`, …) | Still exists; this repo is the dedicated home |

---

## 2. Web / PWA copies

| Path | Files | Notes |
|------|-------|-------|
| `C:\Users\justi\speakeasy\web\` | `index.html`, `sw.js`, `manifest.webmanifest` | **Canonical extract.** Matches wakecodex-pull public copy (hashes equal). |
| `C:\Users\justi\Desktop\_TEMP_PULLS\wakecodex-pull\apps\wake-site\public\speakeasy\` | same 3 files | Same bytes as canonical `web/` |
| `C:\Users\justi\GoogleDrive\wakecodex\apps\wake-site\public\speakeasy\` | `sw.js`, `manifest.webmanifest` only | **`index.html` missing.** Older `sw.js` / manifest hashes (not equal to canonical). |
| `C:\Users\justi\GoogleDrive\wakecodex\apps\wake-site\dist\speakeasy\` | `sw.js`, `manifest` only | Same older pair as GoogleDrive public |
| `C:\Users\justi\WAKE_DOCS\Documentation\WakeSite_Backup\wake-site\public\speakeasy\` | (empty / no usable files) | Backup stub only |

**Standalone Google Drive “SpeakEasy web” folder** (three shared/unshared files outside wakecodex): **not found** on this Lenovo Drive mirror. Web lives under `GoogleDrive\wakecodex\...` instead.

---

## 3. Android builds (APK / AAB)

All verified copies of the published packages are **identical** (same SHA-256):

| File | Size | SHA-256 |
|------|------|---------|
| `SpeakEasy-Android.apk` / `app-release.apk` | 2,978,207 bytes | `686D6E9C761AEB23F59E35F4E44375D45F5C394686EF11AEBA0AF33B198B8802` |
| `SpeakEasy-Android.aab` / `app-release.aab` | 2,767,361 bytes | `CF9AB08520953A2AD448DCEDC185FAEEF3026D2A3F5E737D8F3C970564CDB00A` |

| Path | Status |
|------|--------|
| `...\wakecodex-pull\apps\wake-site\public\downloads\speakeasy\SpeakEasy-Android.{apk,aab}` | Verified (mtime 2026-07-27) |
| `C:\Users\justi\GoogleDrive\wakecodex\apps\wake-site\public\downloads\speakeasy\` | Same hashes |
| `C:\Users\justi\GoogleDrive\wakecodex\apps\wake-site\dist\downloads\speakeasy\` | Same hashes |
| `C:\Users\justi\GoogleDrive\wakecodex\apps\speakeasy-mobile\android\app\build\outputs\apk\release\app-release.apk` | Same as published APK |
| `C:\Users\justi\GoogleDrive\wakecodex\apps\speakeasy-mobile\android\app\build\outputs\bundle\release\app-release.aab` | Same as published AAB |
| `wakecodex-pull\...\android\app\build\outputs\` | **Missing** (no local rebuild tree in pull) |

**Standalone Google Drive “SpeakEasy Android” folder:** **not found** as a separate folder; packages sit under wakecodex `downloads/speakeasy` and Gradle `outputs`.

Builds are **not** committed to the public GitHub repo (by design).

---

## 4. Signing / credentials (local only — never commit)

| Item | Path | Status |
|------|------|--------|
| Upload keystore | `C:\Users\justi\GoogleDrive\wakecodex\apps\speakeasy-mobile\android\keystore\speakeasy-upload.keystore` | Verified (2780 bytes, 2026-05-09) |
| `keystore.properties` | `C:\Users\justi\GoogleDrive\wakecodex\apps\speakeasy-mobile\android\keystore.properties` | Verified (156 bytes). Keys present: `storeFile`, `storePassword`, `keyAlias`, `keyPassword` |
| Credential note | `C:\Users\justi\WAKE_DOCS\Documentation\WakeSystems\consolidated\wake_systems\desktop_sweep_20260512_140911\WAKE_KEYS\SpeakEasy_android_upload_key.txt` | Verified (183 bytes, 2026-05-09) |
| Documented path in old manual | `C:\Users\justi\OneDrive\Desktop\WAKE_KEYS\SpeakEasy_android_upload_key.txt` | **Missing** on this machine — use WAKE_DOCS sweep path above |
| Keystore in `wakecodex-pull` | `...\speakeasy-mobile\android\keystore\` | **Missing** in pull copy |
| Keystore in `C:\Users\justi\speakeasy` | — | Intentionally absent |

---

## 5. Quarantined / historical

| Path | What |
|------|------|
| `C:\Users\justi\GoogleDrive\wakecodex\archive_QUARANTINED_20260422_003502\desktop-redo-20260419-092524\original\OneDriveDesktop\Speakeasy_V1_Launch\` | Old V1 layout (`web\`, `android\` with release merge intermediates / `index.html` 55090 bytes). Not the canonical tree. |

---

## 6. Gaps / follow-ups

1. **GoogleDrive public `speakeasy` is missing `index.html`** and has older `sw.js` / manifest than the GitHub `web/` extract — sync or replace from `C:\Users\justi\speakeasy\web\` if Drive is still used as a mirror.
2. **No separate Drive “web” / “Android” folders** found outside wakecodex on this PC; if those cloud folders still exist online-only, open them in Drive and confirm share state.
3. **Copy signing material to a stable Lenovo path** (optional): e.g. recreate `WAKE_KEYS` on Desktop/OneDrive and point builds at it — current live keystore is under `GoogleDrive\wakecodex\...`.
4. **Transcription engine:** no separate offline engine package found under SpeakEasy names. App UI is self-contained in `web/`; any cloud STT would be a later integration.

---

## 7. Quick map

```
GitHub public ........ justinevans4040-cloud/speakeasy   ← canonical source
Lenovo workspace ..... C:\Users\justi\speakeasy
Runtime .............. bundled web/ (no Netlify / no wakeforged.com required)
APK/AAB .............. GoogleDrive wakecodex downloads + Gradle outputs (same hashes)
Signing .............. GoogleDrive wakecodex keystore + WAKE_DOCS WAKE_KEYS note
Still inside wakecodex  GoogleDrive + Desktop\_TEMP_PULLS copies (legacy nest)
```
