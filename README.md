# Purrminders (Android)

Your cat office reminders as an Android app. Every push to `main` builds a signed APK
(Actions tab → latest "Build Purrminders APK" run → Artifacts → Purrminders-apk).

- `web/` — the app itself (same as the web version, with Kathleen's voice)
- `scripts/` — bundles three.js and the speech runtime for offline use, patches the Android project
- `android-res/` — app icons and the white paw status-bar icon
- The signing key is in `signing/` (this repo is private). For extra safety you can move it to the
  repo secrets `PURR_KEYSTORE_B64` / `PURR_KEYSTORE_PASSWORD` and delete the folder; the build uses
  secrets first. Updates must be signed with the same key, so keep a backup.
