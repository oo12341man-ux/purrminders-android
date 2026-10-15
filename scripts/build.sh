#!/usr/bin/env bash
# Whole Android build in one place, so its log can be saved and read later.
set -euo pipefail
N="${GITHUB_RUN_NUMBER:-1}"
echo "== install"; npm install --no-audit --no-fund
CAP=$(node -p "require('@capacitor/core/package.json').version.split('.')[0]")
echo "== add-ons for Capacitor $CAP"
for P in @ebarooni/capacitor-calendar @capacitor/keyboard; do
  npm install --no-audit --no-fund "$P@^$CAP" || npm install --no-audit --no-fund "$P@^$((CAP-1))"
done
echo "== prepare app files"; npm run prepare-www
echo "== android project"; npx cap add android; npx cap sync android
python3 scripts/patch-android.py
{
  echo "Purrminders 1.0.$N"
  for P in @capacitor/core @capacitor/android @capacitor/cli @capacitor/local-notifications @capacitor/app @capacitor/keyboard @ebarooni/capacitor-calendar; do
    echo "$P $(node -p "require('$P/package.json').version")"; done
  grep -E "minSdkVersion|compileSdkVersion|targetSdkVersion" android/variables.gradle || true
  grep -E "versionCode|versionName" android/app/build.gradle || true
} | tee build-info.txt
echo "== gradle"; (cd android && chmod +x gradlew && ./gradlew assembleRelease --no-daemon --stacktrace)
cp android/app/build/outputs/apk/release/app-release.apk "Purrminders-1.0.$N.apk"
unzip -l "Purrminders-1.0.$N.apk" | grep -c "\.so$" | xargs -I{} echo "native libraries in APK: {}" | tee -a build-info.txt
echo "== done"
